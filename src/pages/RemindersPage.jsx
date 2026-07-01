import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

const RemindersPage = ({ onNavigate }) => {
  const [reminders, setReminders] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("reminders") || "[]");
    return saved;
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = () => {
    if (!title.trim()) {
      alert("Please enter a reminder title");
      return;
    }

    if (editingId) {
      // Update existing reminder
      setReminders(reminders.map(r =>
        r.id === editingId
          ? {
              ...r,
              title,
              description,
              frequency,
              updatedAt: new Date().toLocaleDateString()
            }
          : r
      ));
      setEditingId(null);
    } else {
      // Add new reminder
      const newReminder = {
        id: Date.now(),
        title,
        description,
        frequency,
        createdAt: new Date().toLocaleDateString(),
        nextReminder: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      };
      setReminders([newReminder, ...reminders]);
    }

    setTitle("");
    setDescription("");
    setFrequency("daily");
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setTitle("");
      setDescription("");
    }
  };

  const editReminder = (reminder) => {
    setEditingId(reminder.id);
    setTitle(reminder.title);
    setDescription(reminder.description);
    setFrequency(reminder.frequency);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setFrequency("daily");
  };

  return (
    <div className="flex h-screen bg-[#f5efe6]">

      {/* Sidebar */}
      <Sidebar onNavigate={onNavigate} currentPage="reminders" />

      {/* Main Area */}
      <div className="flex-1 flex">

        {/* LEFT PANEL - Reminders List */}
        <div className="w-[320px] border-r border-black/10 bg-[#f8f4ee] p-4 overflow-y-auto flex flex-col">

          <h1 className="text-3xl font-serif text-[#5a1a1a] mb-6">
            My Reminders
          </h1>

          {reminders.length === 0 ? (
            <div className="text-center py-12 flex-1 flex items-center justify-center">
              <div>
                <p className="text-gray-400 text-lg">🔔</p>
                <p className="text-gray-500 mt-4">
                  No reminders yet.<br />
                  Create one to get started.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  onClick={() => editReminder(reminder)}
                  className={`p-4 rounded-2xl cursor-pointer transition ${
                    editingId === reminder.id
                      ? "bg-[#ede4d8] border-2 border-[#5a1a1a]"
                      : "bg-white hover:bg-[#f0e8dc]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🔔</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#5a1a1a] truncate">
                        {reminder.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {reminder.frequency === "daily" ? "📅 Daily" : "📆 Weekly"}
                      </p>
                      {reminder.description && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {reminder.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT PANEL - Create/Edit Reminder */}
        <div className="flex-1 flex flex-col">

          {/* Header */}
          <div className="border-b border-black/10 px-8 py-5 bg-[#f8f4ee]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#5a1a1a] flex items-center justify-center text-2xl">
                🔔
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#5a1a1a]">
                  {editingId ? "Edit Reminder" : "New Reminder"}
                </h2>
                <p className="text-gray-500 text-sm">
                  {editingId ? "Update your reminder" : "Create a new reminder"}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-10 py-8">

            <div className="bg-white rounded-3xl p-8 max-w-2xl shadow-sm">

              <div className="space-y-6">

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-[#5a1a1a] mb-2">
                    Reminder Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Review Budget, Check Savings Goal"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5a1a1a] focus:ring-2 focus:ring-[#5a1a1a]/20"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-[#5a1a1a] mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details about your reminder..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5a1a1a] focus:ring-2 focus:ring-[#5a1a1a]/20 resize-none"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-semibold text-[#5a1a1a] mb-2">
                    Frequency
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFrequency("daily")}
                      className={`px-6 py-2 rounded-lg font-medium transition ${
                        frequency === "daily"
                          ? "bg-[#5a1a1a] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      📅 Daily
                    </button>
                    <button
                      onClick={() => setFrequency("weekly")}
                      className={`px-6 py-2 rounded-lg font-medium transition ${
                        frequency === "weekly"
                          ? "bg-[#5a1a1a] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      📆 Weekly
                    </button>
                  </div>
                </div>

              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={addReminder}
                  className="flex-1 px-6 py-3 bg-[#5a1a1a] text-white rounded-lg hover:bg-[#4a0f0f] transition font-medium"
                >
                  {editingId ? "Update Reminder" : "Add Reminder"}
                </button>
                {editingId && (
                  <>
                    <button
                      onClick={cancelEdit}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        deleteReminder(editingId);
                        cancelEdit();
                      }}
                      className="px-6 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default RemindersPage;
