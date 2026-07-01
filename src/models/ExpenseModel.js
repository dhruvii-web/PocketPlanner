export const createExpense = ({
  title,
  amount,
  category,
  paymentMethod,
  date,
  notes = "",
}) => ({
  id: Date.now(),
  title,
  amount: Number(amount),
  category,
  paymentMethod,
  date,
  notes,
  createdAt: new Date().toISOString(),
});