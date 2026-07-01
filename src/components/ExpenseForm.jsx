const ExpenseForm = ({
  amount,
  setAmount,
  merchant,
  setMerchant,
  category,
  setCategory,
  type,
  setType,
  description,
  setDescription,
  editingId,
  addTransaction,
  merchantMemory,
  categories,
  setEditingId,
  resetForm
}) => {
  return (
    <>
      {/* Paste your form here */}
      {/* Add Transaction Form */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-[#5a1a1a] mb-4">
              {editingId ? "Edit Transaction" : "Add Transaction"}
            </h3>

            <div className="space-y-3">

              {/* Type */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">
                  Type
                </label>
                <div className="flex gap-2">
                  {["expense", "income"].map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        type === t
                          ? t === "expense" ? "bg-red-500 text-white" : "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {t === "expense" ? "💸 Expense" : "💰 Income"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5a1a1a]"
                />
              </div>

              {/* Merchant */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">
                  Merchant / Source
                </label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g., Swiggy, Amazon, Salary"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5a1a1a]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5a1a1a]"
                >
                  <option value="">
                    {merchantMemory[merchant.toLowerCase()] ? `✓ Auto: ${merchantMemory[merchant.toLowerCase()]}` : "Select category"}
                  </option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">
                  Notes
                </label>
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
                onClick={addTransaction}
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

        

    </>
  );
};

export default ExpenseForm;



