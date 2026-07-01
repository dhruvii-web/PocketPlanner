export const createTransaction = ({
  sender,
  receiver,
  amount,
  description,
  permissionLevel = "amount",
}) => ({
  id: Date.now(),

  sender,

  receiver,

  amount: Number(amount),

  description,

  permissionLevel,

  status: "Completed",

  createdAt: new Date().toISOString(),
});