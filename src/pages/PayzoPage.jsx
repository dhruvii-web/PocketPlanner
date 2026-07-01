import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  createConnection as apiCreateConnection,
  createTransaction as apiCreateTransaction,
  deleteConnection as apiDeleteConnection,
  getConnections as apiGetConnections,
  getTransactions as apiGetTransactions,
} from "../services/payzoService";

export default function PayzoPage({ onNavigate }) {
  const [connections, setConnections] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [viewMode, setViewMode] = useState("overview"); // overview, connections, transactions
  const [permissionRequests, setPermissionRequests] = useState([]);

  const [connectionForm, setConnectionForm] = useState({
    name: "",
    phone: "",
    relation: "parent", // parent or child
  });

  const [transferForm, setTransferForm] = useState({
    amount: "",
    description: "",
    permissionLevel: "amount", // none, limited, full
  });

  useEffect(() => {
    const saved = localStorage.getItem("payzoConnections");
    if (saved) setConnections(JSON.parse(saved));

    const savedTxns = localStorage.getItem("payzoTransactions");
    if (savedTxns) setTransactions(JSON.parse(savedTxns));

    const savedPermissions = localStorage.getItem("payzoPermissionRequests");
    if (savedPermissions) setPermissionRequests(JSON.parse(savedPermissions));
  }, []);

  useEffect(() => {
    const loadConnections = async () => {
      try {
        const [serverConnections, serverTransactions] = await Promise.all([
          apiGetConnections(),
          apiGetTransactions(),
        ]);

        if (serverConnections.length > 0) {
          setConnections(serverConnections);
        }

        if (serverTransactions.length > 0) {
          setTransactions(serverTransactions);
        }
      } catch (error) {
        console.warn("Payzo backend sync skipped:", error.message);
      }
    };

    loadConnections();
  }, []);

  useEffect(() => {
    localStorage.setItem("payzoConnections", JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem("payzoTransactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("payzoPermissionRequests", JSON.stringify(permissionRequests));
  }, [permissionRequests]);

  const handleAddConnection = async () => {
    if (!connectionForm.name || !connectionForm.phone) {
      alert("Please fill all fields");
      return;
    }

    try {
      const { connection, smsResult } = await apiCreateConnection({
        displayName: connectionForm.name,
        name: connectionForm.name,
        phone: connectionForm.phone,
        relation: connectionForm.relation,
        provider: "sms",
        connectionType: "family",
        status: "pending",
      });

      const newConnection = {
        id: connection.id,
        ...connection,
        verified: connection.verified ?? false,
        connectedAt: connection.createdAt || new Date().toISOString(),
        permissionStatus: connection.permissionStatus || "sent",
      };

      setConnections([newConnection, ...connections.filter((c) => String(c.id) !== String(newConnection.id))]);
      alert(
        smsResult?.delivered
          ? `Connection request sent to ${connectionForm.name}`
          : `Connection saved. SMS is not configured yet, so the invite is queued for ${connectionForm.name}.`
      );
    } catch (error) {
      alert(error.message || "Unable to create connection");
      return;
    }

    setConnectionForm({ name: "", phone: "", relation: "parent" });
    setShowAddConnection(false);
  };

  const handleApproveConnection = (connectionId) => {
    setConnections(
      connections.map((c) =>
        c.id === connectionId
          ? { ...c, verified: true, permissionStatus: "approved" }
          : c
      )
    );
    setPermissionRequests(
      permissionRequests.filter((p) => p.connectionId !== connectionId)
    );
  };

  const handleDeleteConnection = (id) => {
    if (!confirm("Remove this connection?")) {
      return;
    }

    apiDeleteConnection(id)
      .then(() => {
        setConnections(connections.filter((c) => String(c.id) !== String(id)));
        setTransactions(transactions.filter((t) => String(t.connectionId) !== String(id)));
      })
      .catch((error) => {
        alert(error.message || "Unable to remove connection");
      });
  };

  const handleSendMoney = async () => {
    if (!selectedConnection || !transferForm.amount) {
      alert("Please select connection and amount");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      connectionId: selectedConnection.id,
      connectionName: selectedConnection.name,
      amount: parseFloat(transferForm.amount),
      description: transferForm.description,
      permissionLevel: transferForm.permissionLevel,
      timestamp: new Date().toISOString(),
      status: "initiated", // initiated, processing, completed, failed
      sender: "You",
      receiver: selectedConnection.name,
      type: selectedConnection.relation === "child" ? "send" : "request",
    };

    try {
      const { transaction } = await apiCreateTransaction({
        provider: "payzo",
        connectionId: selectedConnection.id,
        connectionName: selectedConnection.name,
        amount: parseFloat(transferForm.amount),
        description: transferForm.description,
        permissionLevel: transferForm.permissionLevel,
        timestamp: new Date().toISOString(),
        sender: "You",
        receiver: selectedConnection.name,
        type: selectedConnection.relation === "child" ? "send" : "request",
        status: "initiated",
      });

      setTransactions([transaction, ...transactions]);
    } catch (error) {
      setTransactions([...transactions, newTransaction]);
      alert(error.message || "Saved locally because backend transaction failed");
    }

    // Add permission request if limited visibility
    if (transferForm.permissionLevel !== "full") {
      setPermissionRequests([
        ...permissionRequests,
        {
          id: Date.now(),
          transactionId: newTransaction.id,
          connectionId: selectedConnection.id,
          from: selectedConnection.name,
          type: "transaction",
          permissionLevel: transferForm.permissionLevel,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    setTransferForm({
      amount: "",
      description: "",
      permissionLevel: "full",
    });
    setSelectedConnection(null);
    setShowSendMoney(false);

    alert("💳 Payment initiated! Processing...");
  };

  const handleApproveTransactionView = (permissionId) => {
    setPermissionRequests(
      permissionRequests.filter((p) => p.id !== permissionId)
    );
  };

  const getTotalReceived = () => {
    return transactions
      .filter((t) => t.type === "send")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalSent = () => {
    return transactions
      .filter((t) => t.type === "request")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="flex h-screen bg-[#f5efe6]">
      <Sidebar currentPage="payzo" onNavigate={onNavigate} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">💳 Payzo</h1>
                <p className="text-gray-600 mt-1">
                  Send money to family securely
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewMode("overview")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    viewMode === "overview"
                      ? "bg-[#5a1a1a] text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setViewMode("connections")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    viewMode === "connections"
                      ? "bg-[#5a1a1a] text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Connections
                </button>
                <button
                  onClick={() => setViewMode("transactions")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    viewMode === "transactions"
                      ? "bg-[#5a1a1a] text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  History
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Permission Requests Alert */}
        {permissionRequests.length > 0 && (
          <div className="bg-yellow-50 border-b border-yellow-200">
            <div className="max-w-6xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-yellow-800">
                  🔔 You have {permissionRequests.length} pending
                  request{permissionRequests.length > 1 ? "s" : ""}
                </p>
                <div className="flex gap-2">
                  {permissionRequests.map((req) => (
                    <button
                      key={req.id}
                      onClick={() => handleApproveTransactionView(req.id)}
                      className="px-3 py-1 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 text-xs font-medium rounded transition"
                    >
                      {req.type === "connection" ? "Approve" : "Allow"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Overview View */}
          {viewMode === "overview" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Family Members Card */}
                <div className="bg-[#f8f4ee] rounded-2xl shadow-sm border border-[#d9c7b0] p-6">
                  <p className="text-gray-600 text-sm font-medium">
                    Family Members
                  </p>
                  <p className="text-3xl font-bold text-[#5a1a1a] mt-2">
                    {connections.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {connections.filter((c) => c.verified).length} verified
                  </p>
                </div>

                {/* Money Sent Card */}
                <div className="bg-[#f8f4ee] rounded-2xl shadow-sm border border-[#d9c7b0] p-6">
                  <p className="text-gray-600 text-sm font-medium">
                    Sent to Children
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    ₹{getTotalSent().toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {transactions.filter((t) => t.type === "request").length}{" "}
                    transfers
                  </p>
                </div>

                {/* Money Received Card */}
                <div className="bg-[#f8f4ee] rounded-2xl shadow-sm border border-[#d9c7b0] p-6">
                  <p className="text-gray-600 text-sm font-medium">
                    Received from Parents
                  </p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    ₹{getTotalReceived().toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {transactions.filter((t) => t.type === "send").length}{" "}
                    transfers
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => {
                    setShowAddConnection(true);
                    setViewMode("connections");
                  }}
                  className="bg-[#5a1a1a] hover:bg-[#471414] text-white rounded-lg p-6 text-center font-medium transition"
                >
                  👨‍👩‍👧‍👦 Add Family Member
                </button>
                <button
                  onClick={() => setShowSendMoney(true)}
                  className="bg-[#5a1a1a] hover:bg-green-700 text-white rounded-lg p-6 text-center font-medium transition"
                >
                  💸 Send Money
                </button>
              </div>
            </div>
          )}

          {/* Connections View */}
          {viewMode === "connections" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Family Connections
                </h2>
                <button
                  onClick={() => setShowAddConnection(!showAddConnection)}
                  className="bg-[#5a1a1a] hover:bg-[#471414] text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  {showAddConnection ? "Cancel" : "+ Add Member"}
                </button>
              </div>

              {/* Add Connection Form */}
              {showAddConnection && (
                <div className="bg-blue-50 rounded-lg shadow p-6 mb-6 border border-blue-200">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">
                    Add Family Member
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={connectionForm.name}
                        onChange={(e) =>
                          setConnectionForm({
                            ...connectionForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g., Mom"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={connectionForm.phone}
                        onChange={(e) =>
                          setConnectionForm({
                            ...connectionForm,
                            phone: e.target.value,
                          })
                        }
                        placeholder="9876543210"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relation
                      </label>
                      <select
                        value={connectionForm.relation}
                        onChange={(e) =>
                          setConnectionForm({
                            ...connectionForm,
                            relation: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="parent">Parent</option>
                        <option value="child">Child</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleAddConnection}
                      className="flex-1 bg-[#5a1a1a] hover:bg-[#4a1515] text-white py-2 rounded-lg font-medium transition"
                    >
                      Add Connection
                    </button>
                    <button
                      onClick={() => {
                        setShowAddConnection(false);
                        setConnectionForm({
                          name: "",
                          phone: "",
                          relation: "parent",
                        });
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Connections List */}
              {connections.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No family connections yet. Add one to get started!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {connections.map((conn) => (
                    <div
                      key={conn.id}
                      className="bg-[#f8f4ee] rounded-2xl shadow-sm border border-[#d9c7b0] p-6 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {conn.name}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {conn.relation}
                          </p>
                        </div>
                        {conn.verified && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            ✓ Verified
                          </span>
                        )}
                        {!conn.verified && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                            Pending
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        📱 {conn.phone}
                      </p>

                      {!conn.verified && conn.permissionStatus === "pending" && (
                        <div className="bg-yellow-50 p-3 rounded-lg mb-4 border border-yellow-200">
                          <p className="text-xs text-yellow-800 font-medium">
                            ⏳ Awaiting approval from {conn.name}
                          </p>
                        </div>
                      )}

                      {conn.verified && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <button
                            onClick={() => {
                              setSelectedConnection(conn);
                              setShowSendMoney(true);
                            }}
                            className="bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-lg text-sm font-medium transition"
                          >
                            💸 Send Money
                          </button>
                          <button
                            onClick={() => handleDeleteConnection(conn.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg text-sm font-medium transition"
                          >
                            Remove
                          </button>
                        </div>
                      )}

                      {!conn.verified && (
                        <div className="w-full bg-[#f5efe6] border border-[#d9c7b0] text-[#5a1a1a] py-2 rounded-lg text-center text-sm font-medium">
                          ⏳ Request Sent
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Send Money Modal */}
          {showSendMoney && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-[#f8f4ee] rounded-2xl shadow-sm border border-[#d9c7b0] max-w-md w-full p-6">
                <h2 className="text-2xl font-bold mb-6 text-[#5a1a1a]">
                  Send Money
                </h2>

                {!selectedConnection && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Recipient
                    </label>
                    <select
                      onChange={(e) => {
                        const conn = connections.find(
                          (c) => String(c.id) === String(e.target.value)
                        );
                        setSelectedConnection(conn);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Choose a connection...</option>
                        {connections
                        .filter((c) => c.verified)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.relation})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {selectedConnection && (
                  <>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Sending to:</p>
                      <p className="text-lg font-bold text-[#5a1a1a]">
                        {selectedConnection.name}
                      </p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={transferForm.amount}
                        onChange={(e) =>
                          setTransferForm({
                            ...transferForm,
                            amount: e.target.value,
                          })
                        }
                        placeholder="1000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={transferForm.description}
                        onChange={(e) =>
                          setTransferForm({
                            ...transferForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="e.g., Monthly allowance"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction Visibility
                      </label>
                      <select
                        value={transferForm.permissionLevel}
                        onChange={(e) =>
                          setTransferForm({
                            ...transferForm,
                            permissionLevel: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="private">
                          🔒 Private (Parent cannot view)
                        </option>

                        <option value="amount">
                          💰 Share Amount Only
                        </option>

                        <option value="full">
                          👀 Share Full Details
                        </option>
                      </select>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleSendMoney}
                        className="flex-1 bg-[#5a1a1a] hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
                      >
                        Send Money
                      </button>
                      <button
                        onClick={() => {
                          setShowSendMoney(false);
                          setSelectedConnection(null);
                          setTransferForm({
                            amount: "",
                            description: "",
                            permissionLevel: "amount",
                          });
                        }}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Transactions View */}
          {viewMode === "transactions" && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Transaction History
              </h2>

              {transactions.length === 0 ? (
                <div className="text-center py-12 bg-[#f8f4ee] rounded-2xl shadow-sm border border-[#d9c7b0]">
                  <p className="text-gray-500 text-lg">
                    No transactions yet. Send money to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((txn) => (
                      <div
                        key={txn.id}
                        className="bg-[#f8f4ee] rounded-2xl shadow-sm border border-[#d9c7b0] p-6 border-l-4 border-blue-500"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">
                                {txn.type === "send"
                                  ? "📥 Received"
                                  : "📤 Sent to"}{" "}
                                {txn.connectionName}
                              </h3>
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  txn.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : txn.status === "processing"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {txn.status.charAt(0).toUpperCase() +
                                  txn.status.slice(1)}
                              </span>
                            </div>

                            {txn.description && (
                              <p className="text-sm text-gray-600 mb-2">
                                "{txn.description}"
                              </p>
                            )}

                            <p className="text-xs text-gray-500">
                              {new Date(txn.timestamp).toLocaleDateString()} at{" "}
                              {new Date(txn.timestamp).toLocaleTimeString()}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              ₹{txn.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">

                              {txn.permissionLevel === "private" &&
                              "🔒 Private"}

                              {txn.permissionLevel === "amount" &&
                              "💰 Amount Only"}

                              {txn.permissionLevel === "full" &&
                              "👀 Full Details"}

                            </p>
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
