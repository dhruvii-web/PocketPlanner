import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

const MySpacesPage = ({ onNavigate }) => {
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("savedSpaces") || "[]"
    );
    setSpaces(saved);
  }, []);

  const deleteMessage = (spaceId, messageId) => {
    const updated = spaces.map(space => {
      if (space.id === spaceId) {
        return {
          ...space,
          messages: space.messages.filter(m => m.id !== messageId)
        };
      }
      return space;
    }).filter(space => space.messages && space.messages.length > 0);
    
    // Update both state and localStorage
    setSpaces(updated);
    localStorage.setItem("savedSpaces", JSON.stringify(updated));
    
    // Update selectedSpace to reflect new messages list
    const updatedSelectedSpace = updated.find(s => s.id === spaceId);
    if (updatedSelectedSpace) {
      setSelectedSpace(updatedSelectedSpace);
    } else {
      setSelectedSpace(null);
    }
    
    // Clear selected message
    setSelectedMessage(null);
  };

  const deleteSpace = (id) => {
    const updated = spaces.filter(s => s.id !== id);
    setSpaces(updated);
    localStorage.setItem("savedSpaces", JSON.stringify(updated));
    setSelectedSpace(null);
    setSelectedMessage(null);
  };

  return (
    <div className="flex h-screen bg-[#f5efe6]">

      {/* Sidebar */}
      <Sidebar onNavigate={onNavigate} currentPage="myspaces" />

      {/* Main Area */}
      <div className="flex-1 flex">

        {/* LEFT PANEL - Spaces List */}
        <div className="w-[320px] border-r border-black/10 bg-[#f8f4ee] p-4 overflow-y-auto">

          <h1 className="text-3xl font-serif text-[#5a1a1a] mb-6">
            My Spaces
          </h1>

          {spaces.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">📭</p>
              <p className="text-gray-500 mt-4">
                No saved spaces yet.<br />
                Save your PocketGuide responses to build your knowledge base.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {spaces.map((space) => (
                <div
                  key={space.id}
                  onClick={() => {
                    setSelectedSpace(space);
                    setSelectedMessage(null);
                  }}
                  className={`p-4 rounded-2xl cursor-pointer transition ${
                    selectedSpace?.id === space.id
                      ? "bg-[#ede4d8]"
                      : "bg-white hover:bg-[#f0e8dc]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📁</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#5a1a1a] truncate">
                        {space.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {space.messages?.length || 0} message{space.messages?.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Saved {space.createdAt}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT PANEL - Space Content */}
        <div className="flex-1 flex flex-col">

          {selectedSpace ? (
            <>
              {/* Header */}
              <div className="border-b border-black/10 px-8 py-6 bg-[#f8f4ee]">

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">📁</div>
                    <div>
                      <h2 className="text-2xl font-semibold text-[#5a1a1a]">
                        {selectedSpace.title}
                      </h2>
                      <p className="text-gray-500 text-sm">
                        {selectedSpace.messages?.length || 0} saved message{selectedSpace.messages?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteSpace(selectedSpace.id)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition text-sm font-medium"
                  >
                    Delete Space
                  </button>
                </div>

              </div>

              {/* Content Area - Two Panels */}
              <div className="flex-1 flex overflow-hidden">

                {/* Messages List */}
                <div className="w-64 border-r border-black/10 bg-[#f8f4ee] overflow-y-auto p-4">

                  {selectedSpace.messages && selectedSpace.messages.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSpace.messages.map((msg, idx) => (
                        <div
                          key={msg.id}
                          onClick={() => setSelectedMessage(msg)}
                          className={`p-3 rounded-lg cursor-pointer transition text-xs ${
                            selectedMessage?.id === msg.id
                              ? "bg-[#ede4d8]"
                              : "bg-white hover:bg-[#f0e8dc]"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg">💬</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-500 line-clamp-2">
                                {msg.content.substring(0, 60)}...
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                {msg.savedAt}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No messages</p>
                  )}

                </div>

                {/* Message Detail */}
                <div className="flex-1 overflow-y-auto px-10 py-8">

                  {selectedMessage ? (
                    <div className="bg-white rounded-3xl p-8 max-w-3xl shadow-sm">

                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#5a1a1a] flex items-center justify-center text-2xl">
                            🧠
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#5a1a1a] text-lg">
                              PocketGuide Response
                            </h3>
                            <p className="text-gray-500 text-xs">
                              {selectedMessage.savedAt}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteMessage(selectedSpace.id, selectedMessage.id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>

                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedMessage.content}
                      </p>

                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400 text-lg">
                        Select a message to view
                      </p>
                    </div>
                  )}

                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400 text-xl">
                {spaces.length === 0 ? "No saved spaces to display" : "Select a space to view messages"}
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default MySpacesPage;
