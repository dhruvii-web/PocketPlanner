import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { generateInsights } from "../data/insightRules";
import { askAI } from "../services/aiService";
import { buildUserContext } from "../services/pocketGuideEngine";

const InboxPage = ({ onNavigate }) => {
  const [chatThreads, setChatThreads] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("chatThreads") || "[]");
    return saved;
  });

  const [selectedThreadId, setSelectedThreadId] = useState(() => {
    return "daily-insights";
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(() => generateInsights());
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  // Check daily insights refresh
  useEffect(() => {
    const lastRefresh = JSON.parse(localStorage.getItem("insightsLastRefresh") || "null");
    const today = new Date().toLocaleDateString();

    if (!lastRefresh || lastRefresh.date !== today) {
      const newInsights = generateInsights();
      setInsights(newInsights);
      localStorage.setItem(
        "insightsLastRefresh",
        JSON.stringify({ date: today, timestamp: Date.now() })
      );
    }
  }, []);

  // Get current thread
  const currentThread = chatThreads.find(t => t.id === selectedThreadId);
  const messages = currentThread?.messages || [];
  const isInsightsChat = selectedThreadId === "daily-insights";
  const isReadOnly = isInsightsChat;

  const createNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newThread = {
      id: newId,
      name: `Chat ${chatThreads.length + 1}`,
      messages: [{
        text: "Hi! I'm PocketGuide 👋\n\nI can help you understand spending, savings, investments, trips, goals, bill splitting (Divido), financial planning and market changes.\n\nAsk me anything.",
        sender: "bot",
      }],
      createdAt: new Date().toLocaleDateString(),
    };

    const updated = [newThread, ...chatThreads];
    setChatThreads(updated);
    localStorage.setItem("chatThreads", JSON.stringify(updated));
    setSelectedThreadId(newId);
  };

  const updateThreadMessages = (threadId, newMessages) => {
    const updated = chatThreads.map(thread => {
      if (thread.id === threadId) {
        return {
          ...thread,
          messages: newMessages,
        };
      }
      return thread;
    });
    setChatThreads(updated);
    localStorage.setItem("chatThreads", JSON.stringify(updated));
  };

  const deleteThread = (threadId) => {
    const updated = chatThreads.filter(t => t.id !== threadId);
    setChatThreads(updated);
    localStorage.setItem("chatThreads", JSON.stringify(updated));
    setOpenMenuId(null);
    
    if (selectedThreadId === threadId) {
      // If no chats left, stay on insights, otherwise pick first chat
      if (updated.length === 0) {
        setSelectedThreadId("daily-insights");
      } else {
        setSelectedThreadId(updated[0].id);
      }
    }
  };

  const renameThread = (threadId) => {
    const thread = chatThreads.find(t => t.id === threadId);
    if (!thread) return;
    
    const newName = prompt("New name for chat:", thread.name);
    if (!newName) return;

    const updated = chatThreads.map(t =>
      t.id === threadId ? { ...t, name: newName } : t
    );
    setChatThreads(updated);
    localStorage.setItem("chatThreads", JSON.stringify(updated));
    setOpenMenuId(null);
  };

  const handleSaveToSpace = (msgText, insightTitle = null) => {
    const spaceName = prompt("Save under this Space name:");
    if (!spaceName) return;

    const existing = JSON.parse(
      localStorage.getItem("savedSpaces") || "[]"
    );

    const spaceIndex = existing.findIndex(s => s.title === spaceName);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
    const dateStr = now.toLocaleDateString();

    if (spaceIndex !== -1) {
      if (!existing[spaceIndex].messages) {
        existing[spaceIndex].messages = [];
      }
      existing[spaceIndex].messages.push({
        id: Date.now(),
        content: msgText,
        savedAt: `${dateStr} ${timeStr}`
      });
    } else {
      existing.push({
        id: Date.now(),
        title: spaceName,
        messages: [{
          id: Date.now(),
          content: msgText,
          savedAt: `${dateStr} ${timeStr}`
        }],
        createdAt: dateStr,
      });
    }

    localStorage.setItem("savedSpaces", JSON.stringify(existing));
    alert("Saved to My Spaces ⭐");
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedThreadId || isReadOnly) return;

    const currentInput = input;
    const userMessage = {
      text: currentInput,
      sender: "user",
    };

    const updatedMessages = [...messages, userMessage];
    updateThreadMessages(selectedThreadId, updatedMessages);

    setInput("");
    setLoading(true);

    try {
      const userContext = buildUserContext();
      const aiResponse = await askAI(currentInput, userContext);

      const botReply = {
        text: aiResponse,
        sender: "bot",
      };

      updateThreadMessages(selectedThreadId, [...updatedMessages, botReply]);
    } catch (error) {
      console.error(error);

      const errorMsg = {
        text: "I couldn't process that right now. Please try again.",
        sender: "bot",
      };

      updateThreadMessages(selectedThreadId, [...updatedMessages, errorMsg]);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#f5efe6]">

      {/* Sidebar */}
      <Sidebar onNavigate={onNavigate} currentPage="inbox" />

      {/* Main Area */}
      <div className="flex-1 flex">

        {/* LEFT PANEL - Chat Threads */}
        <div className="w-[280px] border-r border-black/10 bg-[#f8f4ee] p-4 flex flex-col overflow-hidden">

          <button
            onClick={createNewChat}
            className="mb-4 w-full px-4 py-3 bg-[#5a1a1a] text-white rounded-lg hover:bg-[#4a0f0f] transition font-medium text-sm"
          >
            + New Chat
          </button>

          <div className="flex-1 overflow-y-auto space-y-2">
            {/* Daily Insights - Pinned at top */}
            <div
              onClick={() => setSelectedThreadId("daily-insights")}
              className={`p-3 rounded-lg cursor-pointer transition group ${
                selectedThreadId === "daily-insights"
                  ? "bg-gradient-to-r from-[#ede4d8] to-[#e6dbcd] border-2 border-[#5a1a1a]"
                  : "bg-white hover:bg-[#f0e8dc]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#5a1a1a] truncate">
                    Daily Insights
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {insights.length} insight{insights.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Regular Chats */}
            {chatThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => setSelectedThreadId(thread.id)}
                className={`p-3 rounded-lg cursor-pointer transition group relative ${
                  selectedThreadId === thread.id
                    ? "bg-[#ede4d8]"
                    : "bg-white hover:bg-[#f0e8dc]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#5a1a1a] truncate">
                      {thread.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {thread.messages.length} msg
                    </p>
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === thread.id ? null : thread.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#5a1a1a] transition text-xl p-1 hover:bg-gray-200 rounded"
                    >
                      ⋮
                    </button>

                    {/* Three-dot menu */}
                    {openMenuId === thread.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            renameThread(thread.id);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200 flex items-center gap-2"
                        >
                          ✏️ Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteThread(thread.id);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT PANEL - Chat Area */}
        <div className="flex-1 flex flex-col">

          {/* Header */}
          <div className="border-b border-black/10 px-8 py-4 bg-[#f8f4ee]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#5a1a1a] flex items-center justify-center text-2xl">
                  {isInsightsChat ? "📊" : "🧠"}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#5a1a1a]">
                    {isInsightsChat ? "Daily Insights" : "PocketGuide"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {isInsightsChat ? "Updated daily • Read-only" : currentThread?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">

            {isInsightsChat ? (
              // Daily Insights Display
              <div className="space-y-3">
                {insights.length > 0 ? (
                  insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-5 border-l-4 border-[#5a1a1a] shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">{insight.icon}</span>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-[#5a1a1a]">
                            {insight.title}
                          </h4>
                          <p className="text-gray-700 mt-2">
                            {insight.message}
                          </p>
                          <button
                            onClick={() => handleSaveToSpace(
                              `[${insight.title}]\n\n${insight.message}`,
                              insight.title
                            )}
                            className="mt-3 text-sm text-[#5a1a1a] font-medium hover:underline flex items-center gap-1"
                          >
                            ⭐ Save to My Spaces
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">✨</p>
                    <p className="text-gray-500 mt-4">No insights today</p>
                  </div>
                )}
              </div>
            ) : (
              // Regular Chat Messages
              <>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-5 py-3 rounded-2xl max-w-2xl shadow-sm whitespace-pre-wrap ${
                        msg.sender === "user"
                          ? "bg-[#5a1a1a] text-white"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      {msg.text}

                      {msg.sender === "bot" && index > 0 && (
                        <button
                          onClick={() => handleSaveToSpace(msg.text)}
                          className="block mt-3 text-xs font-medium hover:underline"
                          style={{
                            color: msg.sender === "user" ? "white" : "#5a1a1a"
                          }}
                        >
                          ⭐ Save to My Spaces
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white px-5 py-3 rounded-2xl shadow-sm text-gray-500 text-sm">
                      PocketGuide is thinking...
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

          {/* Input */}
          {!isReadOnly && (
            <div className="p-6 border-t border-black/10 bg-[#f8f4ee]">
              <div className="bg-white rounded-full px-6 py-4 flex items-center justify-between shadow-sm">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  placeholder="Ask PocketGuide something..."
                  className="flex-1 bg-transparent outline-none text-gray-700 text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading}
                  className="text-[#5a1a1a] text-2xl hover:scale-110 transition disabled:opacity-50"
                >
                  ➤
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default InboxPage;
