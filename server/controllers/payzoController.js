import PaymentConnection from "../models/PaymentConnection.js";
import PaymentTransaction from "../models/PaymentTransaction.js";
import crypto from "crypto";
import { getPublicAppUrl, sendSms } from "../services/smsService.js";

const supportedProviders = () => ([
	{
		name: "stripe",
		available: Boolean(process.env.STRIPE_SECRET_KEY),
		useCase: "cards and payment collection",
	},
	{
		name: "plaid",
		available: Boolean(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET),
		useCase: "bank account linking and transactions",
	},
	{
		name: "razorpay",
		available: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
		useCase: "UPI, cards, netbanking, and wallets",
	},
]);

const supportedBanks = () => ([
	{ name: "State Bank of India", shortName: "SBI", available: true, category: "public" },
	{ name: "HDFC Bank", shortName: "HDFC", available: true, category: "private" },
	{ name: "ICICI Bank", shortName: "ICICI", available: true, category: "private" },
	{ name: "Axis Bank", shortName: "AXIS", available: true, category: "private" },
	{ name: "Kotak Mahindra Bank", shortName: "KOTAK", available: true, category: "private" },
	{ name: "Punjab National Bank", shortName: "PNB", available: true, category: "public" },
	{ name: "Bank of Baroda", shortName: "BOB", available: true, category: "public" },
	{ name: "Canara Bank", shortName: "CANARA", available: true, category: "public" },
	{ name: "Union Bank of India", shortName: "UNION", available: true, category: "public" },
	{ name: "IndusInd Bank", shortName: "INDUSIND", available: true, category: "private" },
]);

const buildInviteMessage = ({ name, relation, phone, inviteUrl }) => {
	const safeName = name || "there";
	const relationText = relation ? ` as your ${relation}` : "";

	return `Pocket Planner connection request from Dhruviibh${relationText}. ${safeName}, your phone ${phone} was added for family finance sharing. Open this link to accept: ${inviteUrl}`;
};

export const getPaymentStatus = async (req, res) => {
	const [connections, pendingTransactions] = await Promise.all([
		PaymentConnection.countDocuments({ user: req.user._id }),
		PaymentTransaction.countDocuments({ user: req.user._id, status: "pending" }),
	]);

	res.json({
		success: true,
		providers: supportedProviders(),
		banks: supportedBanks(),
		summary: {
			connections,
			pendingTransactions,
			canLinkBanks: Boolean(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET),
			canAcceptCards: Boolean(process.env.STRIPE_SECRET_KEY || process.env.RAZORPAY_KEY_ID),
		},
	});
};

export const getConnections = async (req, res) => {
	const connections = await PaymentConnection.find({ user: req.user._id }).sort({ createdAt: -1 });

	res.json({
		success: true,
		count: connections.length,
		connections,
	});
};

export const createConnection = async (req, res) => {
	const {
		provider = "sms",
		connectionType = "family",
		displayName,
		name = displayName,
		phone,
		relation = "parent",
		institutionName = "",
		last4 = "",
		externalId = "",
		metadata = {},
		status = "pending",
	} = req.body;

		if (!displayName || !phone) {
		return res.status(400).json({
			success: false,
				message: "displayName and phone are required.",
		});
	}

	const inviteToken = crypto.randomUUID();
	const inviteUrl = `${getPublicAppUrl()}/api/payzo/invite/${inviteToken}/accept`;
	const inviteMessage = buildInviteMessage({ name, relation, phone, inviteUrl });

	let smsResult = {
		delivered: false,
		provider: "disabled",
		message: "SMS provider not configured",
	};

	try {
		smsResult = await sendSms({
			to: phone,
			body: inviteMessage,
		});
	} catch (error) {
		smsResult = {
			delivered: false,
			provider: "twilio",
			message: error.message,
		};
	}

	const connection = await PaymentConnection.create({
		user: req.user._id,
		provider,
		connectionType,
		displayName,
		name,
		phone,
		relation,
		verified: false,
		permissionStatus: "sent",
		inviteToken,
		inviteMessage,
		smsStatus: smsResult.delivered ? "sent" : smsResult.provider === "disabled" ? "queued" : "failed",
		invitedAt: new Date(),
		institutionName,
		last4,
		externalId,
		metadata,
		status,
	});

	res.status(201).json({
		success: true,
		message: smsResult.delivered
			? "Connection request sent by SMS."
			: "Connection request saved and queued.",
		connection,
		inviteUrl,
		smsResult,
	});
};

export const acceptConnectionInvite = async (req, res) => {
	const connection = await PaymentConnection.findOne({
		inviteToken: req.params.token,
	});

	if (!connection) {
		return res.status(404).json({
			success: false,
			message: "Invite not found.",
		});
	}

	connection.verified = true;
	connection.permissionStatus = "approved";
	connection.acceptedAt = new Date();
	connection.smsStatus = connection.smsStatus === "failed" ? "failed" : "sent";
	await connection.save();

	res.json({
		success: true,
		message: "Connection accepted.",
		connection,
	});
};

export const resendConnectionInvite = async (req, res) => {
	const connection = await PaymentConnection.findOne({
		_id: req.params.id,
		user: req.user._id,
	});

	if (!connection) {
		return res.status(404).json({
			success: false,
			message: "Payment connection not found.",
		});
	}

	const inviteUrl = `${getPublicAppUrl()}/api/payzo/invite/${connection.inviteToken}/accept`;
	const inviteMessage = buildInviteMessage({
		name: connection.name || connection.displayName,
		relation: connection.relation,
		phone: connection.phone,
		inviteUrl,
	});

	const smsResult = await sendSms({
		to: connection.phone,
		body: inviteMessage,
	});

	connection.inviteMessage = inviteMessage;
	connection.smsStatus = smsResult.delivered ? "sent" : "queued";
	connection.invitedAt = new Date();
	await connection.save();

	res.json({
		success: true,
		message: "Invitation resent.",
		smsResult,
		connection,
	});
};

export const deleteConnection = async (req, res) => {
	const connection = await PaymentConnection.findOneAndDelete({
		_id: req.params.id,
		user: req.user._id,
	});

	if (!connection) {
		return res.status(404).json({
			success: false,
			message: "Payment connection not found.",
		});
	}

	await PaymentTransaction.updateMany(
		{ user: req.user._id, connection: connection._id },
		{ $set: { connection: null } }
	);

	res.json({
		success: true,
		message: "Payment connection removed.",
	});
};

export const getTransactions = async (req, res) => {
	const transactions = await PaymentTransaction.find({ user: req.user._id })
		.populate("connection", "provider connectionType displayName institutionName last4 status")
		.sort({ createdAt: -1 });

	res.json({
		success: true,
		count: transactions.length,
		transactions,
	});
};

export const createTransaction = async (req, res) => {
	const {
		connectionId = null,
		provider,
		amount,
		currency = "INR",
		direction = "debit",
		description = "",
		status = "pending",
		externalId = "",
		metadata = {},
	} = req.body;

	if (!provider || amount === undefined || amount === null) {
		return res.status(400).json({
			success: false,
			message: "provider and amount are required.",
		});
	}

	const transaction = await PaymentTransaction.create({
		user: req.user._id,
		connection: connectionId || null,
		provider,
		amount,
		currency,
		direction,
		description,
		status,
		externalId,
		metadata,
	});

	res.status(201).json({
		success: true,
		message: "Payment transaction saved.",
		transaction,
	});
};
