const ExpenseSummary = ({
  totalIncome,
  totalExpenses,
  balance,
  unconfirmedCount,
}) => {
  return (
    <>
      {/* Summary Cards */}
      <div className="space-y-3">

        <div className="bg-green-100 rounded-2xl p-4">
          <p className="text-sm text-green-700 font-medium">
            Income
          </p>

          <p className="text-2xl font-bold text-green-800 mt-1">
            ₹{totalIncome.toLocaleString()}
          </p>
        </div>

        <div className="bg-red-100 rounded-2xl p-4">
          <p className="text-sm text-red-700 font-medium">
            Expenses
          </p>

          <p className="text-2xl font-bold text-red-800 mt-1">
            ₹{totalExpenses.toLocaleString()}
          </p>
        </div>

        <div
          className={`rounded-2xl p-4 ${
            balance >= 0
              ? "bg-blue-100"
              : "bg-orange-100"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              balance >= 0
                ? "text-blue-700"
                : "text-orange-700"
            }`}
          >
            Balance
          </p>

          <p
            className={`text-2xl font-bold mt-1 ${
              balance >= 0
                ? "text-blue-800"
                : "text-orange-800"
            }`}
          >
            ₹{balance.toLocaleString()}
          </p>
        </div>
      </div>

      {unconfirmedCount > 0 && (
        <div className="bg-yellow-100 rounded-2xl p-4 border-l-4 border-yellow-600">
          <p className="text-sm font-semibold text-yellow-800">
            ⚠️ {unconfirmedCount} unconfirmed transaction
            {unconfirmedCount !== 1 ? "s" : ""}
          </p>

          <p className="text-xs text-yellow-700 mt-1">
            Click to categorize
          </p>
        </div>
      )}
    </>
  );
};

export default ExpenseSummary;