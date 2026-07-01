import api from "./api";

// Get all expenses
export const getExpenses = async () => {
  const { data } = await api.get("/expenses");
  return data.expenses;
};

// Add expense
export const addExpense = async (expense) => {
  const { data } = await api.post("/expenses", expense);
  return data.expense;
};

// Update expense
export const updateExpense = async (id, expense) => {
  const { data } = await api.put(`/expenses/${id}`, expense);
  return data.expense;
};

// Delete expense
export const deleteExpense = async (id) => {
  await api.delete(`/expenses/${id}`);
};