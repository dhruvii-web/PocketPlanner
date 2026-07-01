import { useEffect, useState } from "react";
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../services/expenseService";

export default function useExpenses() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const data = await getExpenses();

      const formatted = data.map((expense) => ({
        id: expense._id,
        amount: expense.amount,
        merchant: expense.title,
        category: expense.category,
        type: expense.type.toLowerCase(),
        description: expense.notes,
        date: new Date(expense.date).toLocaleDateString(),
        time: new Date(expense.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: expense.createdAt,
        isConfirmed: true,
      }));

      setTransactions(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const createTransaction = async (transaction) => {
    const created = await addExpense({
      title: transaction.merchant,
      amount: transaction.amount,
      category: transaction.category,
      type:
        transaction.type.charAt(0).toUpperCase() +
        transaction.type.slice(1),
      paymentMethod: "UPI",
      notes: transaction.description,
    });

    setTransactions((prev) => [
      {
        id: created._id,
        amount: created.amount,
        merchant: created.title,
        category: created.category,
        type: created.type.toLowerCase(),
        description: created.notes,
        date: new Date(created.date).toLocaleDateString(),
        time: new Date(created.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: created.createdAt,
        isConfirmed: true,
      },
      ...prev,
    ]);
  };

  const updateTransaction = async (id, transaction) => {
    const updated = await updateExpense(id, {
      title: transaction.merchant,
      amount: transaction.amount,
      category: transaction.category,
      type:
        transaction.type.charAt(0).toUpperCase() +
        transaction.type.slice(1),
      notes: transaction.description,
    });

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              merchant: updated.title,
              amount: updated.amount,
              category: updated.category,
              description: updated.notes,
              type: updated.type.toLowerCase(),
            }
          : t
      )
    );
  };

  const removeTransaction = async (id) => {
    await deleteExpense(id);

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    loading,
    transactions,
    createTransaction,
    updateTransaction,
    removeTransaction,
    refresh: fetchExpenses,
  };
}