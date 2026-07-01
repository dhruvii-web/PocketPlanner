import LinkedAccount from "../models/LinkedAccount.js";

const sanitizeAccountPayload = (payload) => ({
  accountType: payload.accountType,
  provider: payload.provider || "manual",
  institutionName: payload.institutionName,
  accountName: payload.accountName,
  last4: payload.last4 || "",
  currency: payload.currency || "INR",
  status: payload.status || "connected",
  isPrimary: Boolean(payload.isPrimary),
  metadata: payload.metadata || {},
});

export const getAccounts = async (req, res) => {
  const accounts = await LinkedAccount.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: accounts.length,
    accounts,
  });
};

export const createAccount = async (req, res) => {
  const { accountType, institutionName, accountName } = req.body;

  if (!accountType || !institutionName || !accountName) {
    return res.status(400).json({
      success: false,
      message: "accountType, institutionName, and accountName are required.",
    });
  }

  if (req.body.isPrimary) {
    await LinkedAccount.updateMany(
      { user: req.user._id },
      { $set: { isPrimary: false } }
    );
  }

  const account = await LinkedAccount.create({
    user: req.user._id,
    ...sanitizeAccountPayload(req.body),
  });

  res.status(201).json({
    success: true,
    message: "Linked account saved.",
    account,
  });
};

export const updateAccount = async (req, res) => {
  const account = await LinkedAccount.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!account) {
    return res.status(404).json({
      success: false,
      message: "Linked account not found.",
    });
  }

  if (req.body.isPrimary) {
    await LinkedAccount.updateMany(
      { user: req.user._id },
      { $set: { isPrimary: false } }
    );
  }

  Object.assign(account, sanitizeAccountPayload(req.body));
  await account.save();

  res.json({
    success: true,
    message: "Linked account updated.",
    account,
  });
};

export const deleteAccount = async (req, res) => {
  const account = await LinkedAccount.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!account) {
    return res.status(404).json({
      success: false,
      message: "Linked account not found.",
    });
  }

  res.json({
    success: true,
    message: "Linked account removed.",
  });
};