import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  addExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../services/expenseService";
import {
  createAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
} from "../services/accountService";

const categories = [
  "🍔 Food",
  "🛍️ Shopping",
  "🏠 Rent",
  "💡 Bills",
  "🎬 Entertainment",
  "🚗 Transport",
  "💊 Health",
  "📚 Education",
  "🎁 Gifts",
  "💼 Work",
  "Other",
];

const bankPresets = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "IndusInd Bank",
];

const accountTypeLabels = {
  bank: "Bank Account",
  credit_card: "Credit Card",
  debit_card: "Debit Card",
};

const paymentMethodForAccount = (account) => {
  if (!account) {
    return "Cash";
  }

  if (account.accountType === "credit_card") {
    return "Credit Card";
  }

  if (account.accountType === "debit_card") {
    return "Debit Card";
  }

  return "Bank Transfer";
};

const normalizeExpense = (expense) => ({
  id: expense._id,
  amount: expense.amount,
  merchant: expense.title,
  category: expense.category,
  type: expense.type.toLowerCase(),
  description: expense.notes,
  paymentMethod: expense.paymentMethod || "Cash",
  sourceAccountId: expense.sourceAccountId || "",
  sourceAccountName: expense.sourceAccountName || "",
  date: new Date(expense.date).toLocaleDateString(),
  time: new Date(expense.date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
  createdAt: expense.createdAt,
  updatedAt: expense.updatedAt,
  isConfirmed: expense.category !== "Uncategorized",
});

const normalizeAccount = (account) => ({
  ...account,
  id: account._id || account.id,
});

const IntelliTrackPage = ({ onNavigate }) => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountLoading, setAccountLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [accountForm, setAccountForm] = useState({
    accountType: "bank",
    institutionName: "State Bank of India",
    accountName: "",
    last4: "",
    provider: "manual",
    currency: "INR",
    isPrimary: false,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [expenseData, accountData] = await Promise.all([
          getExpenses(),
          getAccounts(),
        ]);

        setTransactions(expenseData.map(normalizeExpense));
        const normalizedAccounts = accountData.map(normalizeAccount);
        setAccounts(normalizedAccounts);

        const primaryAccount = normalizedAccounts.find((account) => account.isPrimary) || normalizedAccounts[0];
        if (primaryAccount) {
          setSelectedAccountId(primaryAccount.id);
        }
      } catch (error) {
        console.error(error);
        alert("Unable to load IntelliTrack data from the server.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const merchantMemory = useMemo(() => {
    const memory = {};

    transactions
      .slice()
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .forEach((transaction) => {
        const merchantKey = transaction.merchant.toLowerCase();
        if (!memory[merchantKey] && transaction.category && transaction.category !== "Uncategorized") {
          memory[merchantKey] = transaction.category;
        }
      });

    return memory;
  }, [transactions]);

  const selectedAccount = useMemo(
    () => accounts.find((account) => String(account.id) === String(selectedAccountId)) || null,
    [accounts, selectedAccountId]
  );

  const linkedAccountsCount = accounts.length;

  const totalExpenses = useMemo(
    () => transactions.filter((transaction) => transaction.type === "expense").reduce((sum, transaction) => sum + transaction.amount, 0),
    [transactions]
  );

  const totalIncome = useMemo(
    () => transactions.filter((transaction) => transaction.type === "income").reduce((sum, transaction) => sum + transaction.amount, 0),
    [transactions]
  );

  const balance = totalIncome - totalExpenses;
  const expenses = transactions.filter((transaction) => transaction.type === "expense");
  const income = transactions.filter((transaction) => transaction.type === "income");
  const unconfirmed = expenses.filter((transaction) => !transaction.isConfirmed);

  let displayTransactions = transactions;
  if (filter === "expense") {
    displayTransactions = expenses;
  } else if (filter === "income") {
    displayTransactions = income;
  } else if (filter === "unconfirmed") {
    displayTransactions = unconfirmed;
  }

  const categoryBreakdown = {};
  expenses.forEach((transaction) => {
    categoryBreakdown[transaction.category] = (categoryBreakdown[transaction.category] || 0) + transaction.amount;
  });

  const resetForm = () => {
    setEditingId(null);
    setAmount("");
    setMerchant("");
    setCategory("");
    setDescription("");
    setType("expense");
    setSelectedAccountId(accounts[0]?.id || "");
  };

  const handleAddTransaction = async () => {
    if (!amount || !merchant) {
      alert("Please enter amount and merchant name");
      return;
    }

    const account = accounts.find((item) => String(item.id) === String(selectedAccountId)) || null;
    const detectedCategory = category || merchantMemory[merchant.toLowerCase()] || "Uncategorized";
    const payload = {
      title: merchant.trim(),
      amount: parseFloat(amount),
      category: detectedCategory,
      type: type === "income" ? "Income" : "Expense",
      paymentMethod: paymentMethodForAccount(account),
      sourceAccountId: account?.id || "",
      sourceAccountName: account ? `${account.institutionName} • ${account.accountName}` : "",
      notes: description,
    };

    try {
      if (editingId) {
        const updated = await updateExpense(editingId, payload);
        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction.id === editingId ? normalizeExpense(updated) : transaction
          )
        );
      } else {
        const created = await addExpense(payload);
        setTransactions((prev) => [normalizeExpense(created), ...prev]);
      }

      resetForm();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Unable to save transaction.");
    }
  };

  const editTransaction = (transaction) => {
    setEditingId(transaction.id);
    setAmount(String(transaction.amount));
    setMerchant(transaction.merchant);
    setCategory(transaction.category);
    setType(transaction.type);
    setDescription(transaction.description || "");
    setSelectedAccountId(transaction.sourceAccountId || selectedAccountId);
  };

  const confirmCategory = async (transactionId, newCategory) => {
    const transaction = transactions.find((item) => item.id === transactionId);
    if (!transaction) {
      return;
    }

    try {
      const updated = await updateExpense(transactionId, {
        title: transaction.merchant,
        amount: transaction.amount,
        category: newCategory,
        type: transaction.type === "income" ? "Income" : "Expense",
        paymentMethod: transaction.paymentMethod,
        sourceAccountId: transaction.sourceAccountId || "",
        sourceAccountName: transaction.sourceAccountName || "",
        notes: transaction.description,
      });

      setTransactions((prev) =>
        prev.map((item) =>
          item.id === transactionId ? normalizeExpense(updated) : item
        )
      );
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Unable to confirm category.");
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await deleteExpense(id);
      setTransactions((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Unable to delete transaction.");
    }
  };

  const handleAddAccount = async () => {
    if (!accountForm.institutionName || !accountForm.accountName) {
      alert("Please enter bank/card details");
      return;
    }

    try {
      setAccountLoading(true);
      const account = await createAccount({
        ...accountForm,
        last4: accountForm.last4.trim(),
        institutionName: accountForm.institutionName.trim(),
        accountName: accountForm.accountName.trim(),
        status: "connected",
      });

      const normalized = normalizeAccount(account);
      setAccounts((prev) => [normalized, ...prev]);
      setSelectedAccountId(normalized.id);
      setShowAccountForm(false);
      setAccountForm({
        accountType: "bank",
        institutionName: "State Bank of India",
        accountName: "",
        last4: "",
        provider: "manual",
        currency: "INR",
        isPrimary: false,
      });
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Unable to save account.");
    } finally {
      setAccountLoading(false);
    }
  };

  const handleSetPrimaryAccount = async (accountId) => {
    try {
      const updated = await updateAccount(accountId, {
        isPrimary: true,
      });

      setAccounts((prev) =>
        prev.map((account) => ({
          ...account,
          isPrimary: String(account.id) === String(updated.id),
        }))
      );
      setSelectedAccountId(updated.id);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Unable to update account.");
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!confirm("Remove this linked account?")) {
      return;
    }

    try {
      await deleteAccount(accountId);
      setAccounts((prev) => prev.filter((account) => String(account.id) !== String(accountId)));
      if (String(selectedAccountId) === String(accountId)) {
        setSelectedAccountId("");
      }
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Unable to delete account.");
    }
  };

  return (
    <div className="flex h-screen bg-[#f5efe6]">
      <Sidebar onNavigate={onNavigate} currentPage="intellitrack" />

      <div className="flex-1 flex">
        <div className="w-[400px] border-r border-black/10 bg-[#f8f4ee] p-6 overflow-y-auto flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-serif text-[#5a1a1a]">IntelliTrack</h1>
            <p className="text-sm text-gray-600 mt-1">
              Bank accounts, cards, and expenses backed by MongoDB.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-100 rounded-2xl p-4">
              <p className="text-sm text-green-700 font-medium">Income</p>
              <p className="text-2xl font-bold text-green-800 mt-1">₹{totalIncome.toLocaleString()}</p>
            </div>
            <div className="bg-red-100 rounded-2xl p-4">
              <p className="text-sm text-red-700 font-medium">Expenses</p>
              <p className="text-2xl font-bold text-red-800 mt-1">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <div className={`rounded-2xl p-4 ${balance >= 0 ? "bg-blue-100" : "bg-orange-100"}`}>
              <p className={`text-sm font-medium ${balance >= 0 ? "text-blue-700" : "text-orange-700"}`}>Balance</p>
              <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? "text-blue-800" : "text-orange-800"}`}>₹{balance.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 rounded-2xl p-4">
              <p className="text-sm text-purple-700 font-medium">Linked Accounts</p>
              <p className="text-2xl font-bold text-purple-800 mt-1">{linkedAccountsCount}</p>
            </div>
          </div>

          {unconfirmed.length > 0 && (
            <div className="bg-yellow-100 rounded-2xl p-4 border-l-4 border-yellow-600">
              <p className="text-sm font-semibold text-yellow-800">
                ⚠️ {unconfirmed.length} unconfirmed transaction{unconfirmed.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-yellow-700 mt-1">Click a transaction to categorize it.</p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#5a1a1a]">Linked Bank / Card Accounts</h3>
              <button
                onClick={() => setShowAccountForm((current) => !current)}
                className="text-sm px-3 py-1.5 rounded-lg bg-[#5a1a1a] text-white hover:bg-[#471414] transition"
              >
                {showAccountForm ? "Close" : "+ Link Account"}
              </button>
            </div>

            {showAccountForm && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Account Type</label>
                  <select
                    value={accountForm.accountType}
                    onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Bank / Card Provider</label>
                  <input
                    list="bank-presets"
                    type="text"
                    value={accountForm.institutionName}
                    onChange={(e) => setAccountForm({ ...accountForm, institutionName: e.target.value })}
                    placeholder="State Bank of India"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <datalist id="bank-presets">
                    {bankPresets.map((bank) => (
                      <option key={bank} value={bank} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Account Name</label>
                  <input
                    type="text"
                    value={accountForm.accountName}
                    onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })}
                    placeholder="Primary savings account"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Last 4 Digits</label>
                    <input
                      type="text"
                      value={accountForm.last4}
                      onChange={(e) => setAccountForm({ ...accountForm, last4: e.target.value.replace(/[^0-9]/g, "").slice(0, 4) })}
                      placeholder="1234"
                      maxLength="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Provider</label>
                    <select
                      value={accountForm.provider}
                      onChange={(e) => setAccountForm({ ...accountForm, provider: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="manual">Manual</option>
                      <option value="plaid">Plaid</option>
                      <option value="razorpay">Razorpay</option>
                      <option value="stripe">Stripe</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddAccount}
                    disabled={accountLoading}
                    className="flex-1 px-4 py-2 bg-[#5a1a1a] text-white rounded-lg hover:bg-[#4a0f0f] transition font-medium text-sm disabled:opacity-60"
                  >
                    {accountLoading ? "Saving..." : "Save Account"}
                  </button>
                  <button
                    onClick={() => setShowAccountForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {accounts.length === 0 ? (
                <p className="text-sm text-gray-500">No linked accounts yet. Add your SBI account or card to start tracking real activity.</p>
              ) : (
                accounts.map((account) => (
                  <div
                    key={account.id}
                    className={`rounded-2xl border p-4 ${String(selectedAccountId) === String(account.id) ? "border-[#5a1a1a] bg-[#fffaf4]" : "border-gray-200 bg-gray-50"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{account.institutionName}</p>
                        <p className="text-sm text-gray-600">{account.accountName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {accountTypeLabels[account.accountType]}{account.last4 ? ` •••• ${account.last4}` : ""}
                        </p>
                      </div>
                      {account.isPrimary && (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Primary</span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setSelectedAccountId(account.id)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-300 hover:bg-gray-100"
                      >
                        Use for transactions
                      </button>
                      <button
                        onClick={() => handleSetPrimaryAccount(account.id)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-[#5a1a1a] text-white hover:bg-[#471414]"
                      >
                        Set primary
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-[#5a1a1a] mb-4">
              {editingId ? "Edit Transaction" : "Add Transaction"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Type</label>
                <div className="flex gap-2">
                  {["expense", "income"].map((transactionType) => (
                    <button
                      key={transactionType}
                      onClick={() => setType(transactionType)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        type === transactionType
                          ? transactionType === "expense"
                            ? "bg-red-500 text-white"
                            : "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {transactionType === "expense" ? "💸 Expense" : "💰 Income"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5a1a1a]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Merchant / Source</label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g., Swiggy, Amazon, Salary"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5a1a1a]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5a1a1a]"
                >
                  <option value="">
                    {merchantMemory[merchant.toLowerCase()] ? `✓ Auto: ${merchantMemory[merchant.toLowerCase()]}` : "Select category"}
                  </option>
                  {categories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Funding Source</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5a1a1a]"
                >
                  <option value="">Cash / Manual</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.institutionName} • {account.accountName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Notes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional details..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5a1a1a] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddTransaction}
                className="flex-1 px-4 py-2 bg-[#5a1a1a] text-white rounded-lg hover:bg-[#4a0f0f] transition font-medium text-sm"
              >
                {editingId ? "Update" : "Add"}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-black/10 bg-[#f8f4ee] p-4 flex gap-2">
            {[
              { key: "all", label: "All", icon: "📋" },
              { key: "expense", label: "Expenses", icon: "💸" },
              { key: "income", label: "Income", icon: "💰" },
              unconfirmed.length > 0 && { key: "unconfirmed", label: `Unconfirmed (${unconfirmed.length})`, icon: "⚠️" },
            ]
              .filter(Boolean)
              .map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                    filter === tab.key
                      ? "bg-[#5a1a1a] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading IntelliTrack data...</p>
              </div>
            ) : displayTransactions.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-400 text-4xl mb-2">📊</p>
                  <p className="text-gray-500">
                    No {filter === "expense" ? "expenses" : filter === "income" ? "income" : "transactions"}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {filter === "expense" && Object.keys(categoryBreakdown).length > 0 && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="font-semibold text-[#5a1a1a] mb-4">Breakdown by Category</h3>
                    <div className="space-y-3">
                      {Object.entries(categoryBreakdown)
                        .sort(([, a], [, b]) => b - a)
                        .map(([itemCategory, itemAmount]) => (
                          <div key={itemCategory} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">{itemCategory}</span>
                                <span className="text-sm font-bold text-[#5a1a1a]">₹{itemAmount.toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-[#5a1a1a] h-2 rounded-full"
                                  style={{ width: `${(itemAmount / totalExpenses) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {displayTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${transaction.type === "income" ? "border-green-500" : "border-red-500"}`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900">{transaction.merchant}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {transaction.type === "income" ? "Income" : "Expense"}
                          </span>
                          {transaction.sourceAccountName && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {transaction.sourceAccountName}
                            </span>
                          )}
                        </div>

                        <p className={`text-2xl font-bold ${transaction.type === "income" ? "text-green-700" : "text-red-700"}`}>
                          {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                        </p>

                        <div className="flex gap-3 mt-2 text-sm text-gray-500 flex-wrap">
                          <span>📅 {transaction.date}</span>
                          <span>🕒 {transaction.time}</span>
                          <span>🏷️ {transaction.category}</span>
                          <span>💳 {transaction.paymentMethod}</span>
                        </div>

                        {transaction.description && (
                          <p className="text-sm text-gray-600 mt-2">{transaction.description}</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {!transaction.isConfirmed && transaction.type === "expense" && (
                          <button
                            onClick={() => confirmCategory(transaction.id, merchantMemory[transaction.merchant.toLowerCase()] || transaction.category)}
                            className="px-3 py-2 rounded-lg bg-yellow-100 text-yellow-800 text-xs font-medium hover:bg-yellow-200"
                          >
                            Confirm
                          </button>
                        )}
                        <button
                          onClick={() => editTransaction(transaction)}
                          className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTransaction(transaction.id)}
                          className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelliTrackPage;
