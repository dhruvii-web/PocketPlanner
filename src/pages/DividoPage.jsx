import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

export default function DividoPage({ onNavigate }) {
  const [bills, setBills] = useState([]);
  const [showCreateBill, setShowCreateBill] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [viewMode, setViewMode] = useState("active"); // active, history, paymentRequests

  const [billForm, setBillForm] = useState({
    name: "",
    totalAmount: "",
    description: "",
    members: [],
  });

  const [memberForm, setMemberForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    paidBy: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("dividoBills");
    if (saved) setBills(JSON.parse(saved));

    const savedPayments = localStorage.getItem("dividoPendingPayments");
    if (savedPayments) setPendingPayments(JSON.parse(savedPayments));
  }, []);

  useEffect(() => {
    localStorage.setItem("dividoBills", JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem("dividoPendingPayments", JSON.stringify(pendingPayments));
  }, [pendingPayments]);

  const handleCreateBill = () => {
    if (!billForm.name || !billForm.totalAmount) {
      alert("Please fill required fields");
      return;
    }

    const newBill = {
      id: Date.now(),
      name: billForm.name,
      totalAmount: parseFloat(billForm.totalAmount),
      description: billForm.description,
      members: [
        { id: Date.now(), name: "You", phone: "self", settled: false },
      ],
      expenses: [],
      createdAt: new Date().toISOString(),
      status: "active",
    };

    setBills([...bills, newBill]);
    setSelectedBillId(newBill.id);
    setBillForm({ name: "", totalAmount: "", description: "", members: [] });
    setShowCreateBill(false);
  };

  const handleAddMember = (billId) => {
    if (!memberForm.name) {
      alert("Please enter member name");
      return;
    }

    setBills(
      bills.map((bill) => {
        if (bill.id === billId) {
          return {
            ...bill,
            members: [
              ...bill.members,
              {
                id: Date.now(),
                ...memberForm,
                settled: false,
              },
            ],
          };
        }
        return bill;
      })
    );

    setMemberForm({ name: "", phone: "", email: "" });
    setShowAddMember(false);
  };

  const handleAddExpense = (billId) => {
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.paidBy) {
      alert("Please fill all fields");
      return;
    }

    setBills(
      bills.map((bill) => {
        if (bill.id === billId) {
          const newExpense = {
            id: Date.now(),
            description: expenseForm.description,
            amount: parseFloat(expenseForm.amount),
            paidBy: expenseForm.paidBy,
            timestamp: new Date().toISOString(),
          };

          return {
            ...bill,
            expenses: [...bill.expenses, newExpense],
          };
        }
        return bill;
      })
    );

    setExpenseForm({ description: "", amount: "", paidBy: "" });
  };

  const handleRequestPayment = (billId, toMember, amount) => {
    const bill = bills.find((b) => b.id === billId);

    const paymentRequest = {
      id: Date.now(),
      billId,
      billName: bill.name,
      fromMember: "You",
      toMember: toMember.name,
      toPhone: toMember.phone,
      toEmail: toMember.email,
      amount,
      status: "pending",
      createdAt: new Date().toISOString(),
      message: `Payment request for ${bill.name}: ₹${amount}`,
    };

    setPendingPayments([...pendingPayments, paymentRequest]);
  };

  const handleSettlePayment = (paymentId) => {
    setPendingPayments(
      pendingPayments.map((p) =>
        p.id === paymentId ? { ...p, status: "settled" } : p
      )
    );
  };

  const calculateBalances = (bill) => {
    const perPersonShare = bill.totalAmount / bill.members.length;
    const balances = {};

    bill.members.forEach((member) => {
      balances[member.id] = {
        name: member.name,
        phone: member.phone,
        email: member.email,
        owes: perPersonShare,
      };
    });

    bill.expenses.forEach((expense) => {
      const payer = bill.members.find((m) => m.name === expense.paidBy);
      if (payer) {
        balances[payer.id].paid = (balances[payer.id].paid || 0) + expense.amount;
      }
    });

    return balances;
  };

  const calculateWhoOwesWho = (bill) => {
    const balances = calculateBalances(bill);
    const settlements = [];

    Object.values(balances).forEach((person) => {
      const balance = (person.paid || 0) - person.owes;
      if (balance > 0) {
        const creditor = person.name;
        const debt = balance;

        Object.values(balances).forEach((debtor) => {
          if (debtor.name !== creditor) {
            const owed = debtor.owes - (debtor.paid || 0);
            if (owed > 0) {
              settlements.push({
                from: debtor.name,
                to: creditor,
                amount: Math.min(owed, debt),
              });
            }
          }
        });
      }
    });

    return settlements;
  };

  const getActiveBills = () => bills.filter((b) => b.status === "active");
  const getSettledBills = () => bills.filter((b) => b.status === "settled");
  const getPendingRequests = () =>
    pendingPayments.filter((p) => p.status === "pending");

  return (
    <div className="flex h-screen bg-[#f5efe6]">
      <Sidebar currentPage="divido" onNavigate={onNavigate} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-[#f8f4ee] border-b border-[#d9c7b0] sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">👥 Divido</h1>
                <p className="text-gray-600 mt-1">
                  Split bills and settle expenses
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewMode("active")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    viewMode === "active"
                      ? "bg-[#5a1a1a] text-white"
                      : "bg-[#efe7dc] text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setViewMode("paymentRequests")}
                  className={`px-4 py-2 rounded-lg font-medium transition relative ${
                    viewMode === "paymentRequests"
                      ? "bg-[#5a1a1a] text-white"
                      : "bg-[#efe7dc] text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Requests
                  {getPendingRequests().length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {getPendingRequests().length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setViewMode("history")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    viewMode === "history"
                      ? "bg-[#5a1a1a] text-white"
                      : "bg-[#efe7dc] text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  History
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Active Bills View */}
          {viewMode === "active" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Active Bills</h2>
                <button
                  onClick={() => setShowCreateBill(!showCreateBill)}
                  className="bg-[#5a1a1a] hover:bg-[#3a0a0a] text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  {showCreateBill ? "Cancel" : "+ New Bill"}
                </button>
              </div>

              {/* Create Bill Form */}
              {showCreateBill && (
                <div className="bg-[#efe7dc]rounded-lg shadow p-6 mb-6 border border-[#d9c7b0]">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">
                    Create New Bill
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bill Name
                      </label>
                      <input
                        type="text"
                        value={billForm.name}
                        onChange={(e) =>
                          setBillForm({ ...billForm, name: e.target.value })
                        }
                        placeholder="e.g., Dinner Party"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={billForm.totalAmount}
                        onChange={(e) =>
                          setBillForm({
                            ...billForm,
                            totalAmount: e.target.value,
                          })
                        }
                        placeholder="5000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={billForm.description}
                        onChange={(e) =>
                          setBillForm({
                            ...billForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Details about this bill"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleCreateBill}
                      className="flex-1 bg-[#5a1a1a] hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                    >
                      Create Bill
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateBill(false);
                        setBillForm({
                          name: "",
                          totalAmount: "",
                          description: "",
                          members: [],
                        });
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Bills List */}
              {getActiveBills().length === 0 ? (
                <div className="text-center py-12 bg-[#f8f4ee] rounded-2xl shadow-sm border border-[#d9c7b0]">
                  <p className="text-gray-500 text-lg">
                    No active bills. Create one to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {getActiveBills().map((bill) => {
                    const settlements = calculateWhoOwesWho(bill);
                    return (
                      <div
                        key={bill.id}
                        className="bg-[#f8f4ee] rounded-2xl shadow-sm border border-[#d9c7b0] overflow-hidden"
                      >
                        <div
                          className="bg-[#5a1a1a] p-6 cursor-pointer"
                          onClick={() =>
                            setSelectedBillId(
                              selectedBillId === bill.id ? null : bill.id
                            )
                          }
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-2xl font-bold text-white">
                                {bill.name}
                              </h3>
                              {bill.description && (
                                <p className="text-purple-100 mt-1">
                                  {bill.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-4xl font-bold text-white">
                                ₹{bill.totalAmount.toLocaleString()}
                              </p>
                              <p className="text-purple-100 text-sm">
                                {bill.members.length} members
                              </p>
                            </div>
                          </div>
                        </div>

                        {selectedBillId === bill.id && (
                          <div className="p-6 border-t border-gray-200">
                            {/* Members */}
                            <div className="mb-6">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-bold text-gray-900">
                                  Members
                                </h4>
                                <button
                                  onClick={() => {
                                    setSelectedBillId(bill.id);
                                    setShowAddMember(
                                      showAddMember ? false : true
                                    );
                                  }}
                                  className="text-[#5a1a1a] hover:text-blue-800 font-medium"
                                >
                                  + Add Member
                                </button>
                              </div>

                              {showAddMember && selectedBillId === bill.id && (
                                <div className="bg-[#efe7dc] p-4 rounded-lg mb-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input
                                      type="text"
                                      value={memberForm.name}
                                      onChange={(e) =>
                                        setMemberForm({
                                          ...memberForm,
                                          name: e.target.value,
                                        })
                                      }
                                      placeholder="Name"
                                      className="px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <input
                                      type="tel"
                                      value={memberForm.phone}
                                      onChange={(e) =>
                                        setMemberForm({
                                          ...memberForm,
                                          phone: e.target.value,
                                        })
                                      }
                                      placeholder="Phone"
                                      className="px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <input
                                      type="email"
                                      value={memberForm.email}
                                      onChange={(e) =>
                                        setMemberForm({
                                          ...memberForm,
                                          email: e.target.value,
                                        })
                                      }
                                      placeholder="Email"
                                      className="px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                  </div>
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      onClick={() =>
                                        handleAddMember(bill.id)
                                      }
                                      className="flex-1 bg-[#5a1a1a] hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                                    >
                                      Add
                                    </button>
                                    <button
                                      onClick={() => {
                                        setShowAddMember(false);
                                        setMemberForm({
                                          name: "",
                                          phone: "",
                                          email: "",
                                        });
                                      }}
                                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div className="space-y-2">
                                {bill.members.map((member) => (
                                  <div
                                    key={member.id}
                                    className="flex items-center justify-between p-3 bg-[#efe7dc] rounded-lg"
                                  >
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {member.name}
                                      </p>
                                      {member.phone && member.phone !== "self" && (
                                        <p className="text-xs text-gray-600">
                                          {member.phone}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Expenses */}
                            <div className="mb-6">
                              <h4 className="text-lg font-bold text-gray-900 mb-4">
                                Expenses
                              </h4>

                              <div className="bg-[#efe7dc] p-4 rounded-lg mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                  <input
                                    type="text"
                                    value={expenseForm.description}
                                    onChange={(e) =>
                                      setExpenseForm({
                                        ...expenseForm,
                                        description: e.target.value,
                                      })
                                    }
                                    placeholder="e.g., Pizza"
                                    className="px-4 py-2 border border-gray-300 rounded-lg"
                                  />
                                  <input
                                    type="number"
                                    value={expenseForm.amount}
                                    onChange={(e) =>
                                      setExpenseForm({
                                        ...expenseForm,
                                        amount: e.target.value,
                                      })
                                    }
                                    placeholder="Amount"
                                    className="px-4 py-2 border border-gray-300 rounded-lg"
                                  />
                                  <select
                                    value={expenseForm.paidBy}
                                    onChange={(e) =>
                                      setExpenseForm({
                                        ...expenseForm,
                                        paidBy: e.target.value,
                                      })
                                    }
                                    className="px-4 py-2 border border-gray-300 rounded-lg"
                                  >
                                    <option value="">Who paid?</option>
                                    {bill.members.map((m) => (
                                      <option key={m.id} value={m.name}>
                                        {m.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <button
                                  onClick={() => handleAddExpense(bill.id)}
                                  className="w-full bg-[#5a1a1a] hover:bg-[#471414] text-white py-2 rounded-lg font-medium transition"
                                >
                                  Add Expense
                                </button>
                              </div>

                              {bill.expenses.length > 0 && (
                                <div className="space-y-2">
                                  {bill.expenses.map((expense) => (
                                    <div
                                      key={expense.id}
                                      className="flex justify-between p-3 bg-[#efe7dc] rounded-lg"
                                    >
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {expense.description}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          Paid by {expense.paidBy}
                                        </p>
                                      </div>
                                      <p className="font-bold text-gray-900">
                                        ₹{expense.amount.toLocaleString()}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Settlements */}
                            {settlements.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-lg font-bold text-gray-900 mb-4">
                                  Who Owes Who
                                </h4>
                                <div className="space-y-2">
                                  {settlements.map((settlement, idx) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between p-3 bg-[#efe7dc] rounded-lg border border-[#d9c7b0]"
                                    >
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {settlement.from} → {settlement.to}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleRequestPayment(
                                            bill.id,
                                            bill.members.find(
                                              (m) => m.name === settlement.from
                                            ),
                                            settlement.amount
                                          )
                                        }
                                        className="px-4 py-1 bg-[#5a1a1a] hover:bg-yellow-700 text-white rounded font-medium transition"
                                      >
                                        ₹{settlement.amount.toLocaleString()}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Payment Requests View */}
          {viewMode === "paymentRequests" && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Payment Requests
              </h2>

              {getPendingRequests().length === 0 ? (
                <div className="text-center py-12 bg-[#f8f4ee] rounded-2xl shadow-sm border border-[#d9c7b0]">
                  <p className="text-gray-500 text-lg">
                    No pending payment requests
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getPendingRequests().map((req) => (
                    <div
                      key={req.id}
                      className="bg-[#f8f4ee] rounded-2xl shadow-sm border border-[#d9c7b0] p-6 border-l-4 border-[#5a1a1a]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {req.billName}
                          </h3>
                          <p className="text-gray-700 mb-2">
                            {req.toMember} owes you ₹
                            {req.amount.toLocaleString()}
                          </p>
                          {req.toPhone && (
                            <p className="text-sm text-gray-600 mb-1">
                              📱 {req.toPhone}
                            </p>
                          )}
                          {req.toEmail && (
                            <p className="text-sm text-gray-600 mb-2">
                              📧 {req.toEmail}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          {req.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleSettlePayment(req.id)}
                                className="px-6 py-2 bg-[#5a1a1a] hover:bg-[#471414] text-white rounded-lg font-medium transition"
                              >
                                Mark Paid
                              </button>
                              <button
                                className="px-6 py-2 bg-[#5a1a1a] hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm"
                                title="Send payment request via message"
                              >
                                📨 Send Request
                              </button>
                            </>
                          )}
                          {req.status === "settled" && (
                            <span className="px-4 py-2 bg-green-100 text-green-800 font-semibold rounded-lg">
                              ✓ Settled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History View */}
          {viewMode === "history" && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Bill History
              </h2>

              {getSettledBills().length === 0 ? (
                <div className="text-center py-12 bg-[#f8f4ee] rounded-2xl shadow-sm border border-[#d9c7b0]">
                  <p className="text-gray-500 text-lg">
                    No settled bills yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getSettledBills().map((bill) => (
                    <div
                      key={bill.id}
                      className="bg-[#f8f4ee] rounded-2xl shadow-sm border border-[#d9c7b0] p-6 opacity-75"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {bill.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {bill.members.length} members • {bill.expenses.length}{" "}
                            expenses
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{bill.totalAmount.toLocaleString()}
                          </p>
                          <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            ✓ Settled
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
