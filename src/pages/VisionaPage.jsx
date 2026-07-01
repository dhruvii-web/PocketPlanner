import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

export default function VisionaPage({ onNavigate }) {
  const [dreams, setDreams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    frequency: "monthly",
    monthlyInvestment: "",
    reminderFrequency: "daily",
  });

  useEffect(() => {
    const saved = localStorage.getItem("dreams");
    if (saved) setDreams(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("dreams", JSON.stringify(dreams));
  }, [dreams]);

  const resetForm = () => {
    setFormData({
      name: "",
      targetAmount: "",
      frequency: "monthly",
      monthlyInvestment: "",
      reminderFrequency: "daily",
    });
    setEditingId(null);
  };

  const handleAddDream = () => {
    if (!formData.name || !formData.targetAmount || !formData.monthlyInvestment) {
      alert("Please fill all fields");
      return;
    }

    const newDream = {
      id: editingId || Date.now(),
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      frequency: formData.frequency,
      monthlyInvestment: parseFloat(formData.monthlyInvestment),
      reminderFrequency: formData.reminderFrequency,
      investedAmount: editingId
        ? dreams.find((d) => d.id === editingId)?.investedAmount || 0
        : 0,
      createdAt: editingId
        ? dreams.find((d) => d.id === editingId)?.createdAt
        : new Date().toISOString(),
      achieved: editingId
        ? dreams.find((d) => d.id === editingId)?.achieved || false
        : false,
    };

    if (editingId) {
      setDreams(dreams.map((d) => (d.id === editingId ? newDream : d)));
    } else {
      setDreams([...dreams, newDream]);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEditDream = (dream) => {
    setFormData({
      name: dream.name,
      targetAmount: dream.targetAmount.toString(),
      frequency: dream.frequency,
      monthlyInvestment: dream.monthlyInvestment.toString(),
      reminderFrequency: dream.reminderFrequency,
    });
    setEditingId(dream.id);
    setShowForm(true);
  };

  const handleDeleteDream = (id) => {
    if (confirm("Delete this dream?")) {
      setDreams(dreams.filter((d) => d.id !== id));
    }
  };

  const handleAddInvestment = (id, amount) => {
    setDreams(
      dreams.map((d) => {
        if (d.id === id) {
          const newInvested = d.investedAmount + amount;
          const isAchieved = newInvested >= d.targetAmount;
          return {
            ...d,
            investedAmount: newInvested,
            achieved: isAchieved,
          };
        }
        return d;
      })
    );
  };

  const calculateMonthsToGoal = (monthlyInvestment, remaining) => {
    return Math.ceil(remaining / monthlyInvestment);
  };

  return (
    <div className="flex h-screen bg-[#f5efe6]">
      <Sidebar currentPage="visiona" onNavigate={onNavigate} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-[#f8f4ee] border-b border-[#d9c7b0] sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">💭 Visiona</h1>
                <p className="text-gray-600 mt-1">
                  Track your dreams and investment goals
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(!showForm);
                }}
                className="bg-[#5a1a1a] hover:bg-[#471414] text-white px-6 py-2 rounded-lg font-medium transition"
              >
                {showForm ? "Cancel" : "+ New Dream"}
              </button>
            </div>
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="bg-[#efe7dc] border-b border-[#d9c7b0]">
            <div className="max-w-6xl mx-auto px-6 py-6">
              <div className="bg-[#f8f4ee] rounded-2xl shadow-sm border border-[#d9c7b0] p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-900">
                  {editingId ? "Edit Dream" : "Create New Dream"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dream Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., MacBook Pro, France Trip"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a1a1a] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.targetAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetAmount: e.target.value,
                        })
                      }
                      placeholder="100000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a1a1a] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Frequency
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) =>
                        setFormData({ ...formData, frequency: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a1a1a] focus:border-transparent"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyInvestment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthlyInvestment: e.target.value,
                        })
                      }
                      placeholder="5000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a1a1a] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reminder Frequency (for EMI/Loan)
                    </label>
                    <select
                      value={formData.reminderFrequency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reminderFrequency: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a1a1a] focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAddDream}
                    className="flex-1 bg-[#5a1a1a] hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition"
                  >
                    {editingId ? "Update Dream" : "Create Dream"}
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dreams Grid */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          {dreams.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No dreams yet. Create your first dream! 💭
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dreams.map((dream) => {
                const remaining = Math.max(
                  0,
                  dream.targetAmount - dream.investedAmount
                );
                const progress = (dream.investedAmount / dream.targetAmount) *
                  100;
                const monthsLeft = calculateMonthsToGoal(
                  dream.monthlyInvestment,
                  remaining
                );

                return (
                  <div
                    key={dream.id}
                    className={`rounded-lg shadow-md p-6 transition ${
                      dream.achieved
                        ? "bg-green-50 border-2 border-green-200"
                        : "bg-[#f8f4ee] border border-[#d9c7b0]"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {dream.name}
                        </h3>
                        {dream.achieved && (
                          <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            ✓ Goal Achieved!
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditDream(dream)}
                          className="text-blue-600 hover:text-blue-800 text-lg"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteDream(dream.id)}
                          className="text-red-600 hover:text-red-800 text-lg"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Target Amount */}
                    <div className="mb-4 p-4 bg-[#efe7dc] rounded-xl">
                      <p className="text-sm text-gray-600">Target Amount</p>
                      <p className="text-2xl font-bold text-[#5a1a1a]">
                        ₹{dream.targetAmount.toLocaleString()}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">
                          Progress
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {Math.round(progress)}%
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            dream.achieved ? "bg-green-500" : "bg-[#5a1a1a]"
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Investment Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-[#efe7dc] rounded-lg">
                      <div>
                        <p className="text-xs text-gray-600">Invested</p>
                        <p className="font-bold text-gray-900">
                          ₹{dream.investedAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Remaining</p>
                        <p className="font-bold text-red-600">
                          ₹{remaining.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">
                          {dream.frequency === "monthly"
                            ? "Monthly"
                            : dream.frequency === "quarterly"
                            ? "Quarterly"
                            : "Yearly"}{" "}
                          Rate
                        </p>
                        <p className="font-bold text-gray-900">
                          ₹{dream.monthlyInvestment.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Est. Months</p>
                        <p className="font-bold text-blue-600">{monthsLeft}</p>
                      </div>
                    </div>

                    {/* Quick Add Investment */}
                    {!dream.achieved && (
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() =>
                            handleAddInvestment(dream.id, dream.monthlyInvestment)
                          }
                          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-lg font-medium transition text-sm"
                        >
                          + Add Investment
                        </button>
                      </div>
                    )}

                    {/* Reminder Info */}
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-xs text-gray-600 mb-1">
                        EMI/Loan Reminder
                      </p>
                      <p className="text-sm font-medium text-yellow-800">
                        {dream.reminderFrequency === "daily"
                          ? "📅 Daily reminder"
                          : dream.reminderFrequency === "weekly"
                          ? "📅 Weekly reminder"
                          : "📅 Monthly reminder"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
