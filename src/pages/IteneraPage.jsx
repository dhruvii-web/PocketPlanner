import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  askPocketGuide as apiAskPocketGuide,
  createTrip as apiCreateTrip,
  getTripMessages as apiGetTripMessages,
  getTrips as apiGetTrips,
  sendTripMessage as apiSendTripMessage,
} from "../services/tripService";

export default function IteneraPage({ onNavigate }) {
  const [trips, setTrips] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripMessages, setTripMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [guidePrompt, setGuidePrompt] = useState("");
  const [guideResponse, setGuideResponse] = useState("");

  const [tripData, setTripData] = useState({
    name: "",
    destination: "",
    budget: "",
    days: "",
    travellers: "",
    groupName: "",
    invitees: "",
  });

  useEffect(() => {
    const savedTrips = localStorage.getItem("iteneraTrips");

    if (savedTrips) {
      setTrips(JSON.parse(savedTrips));
    }

    const loadTrips = async () => {
      try {
        const serverTrips = await apiGetTrips();

        if (serverTrips.length > 0) {
          setTrips(serverTrips);
          setSelectedTrip((current) => current || serverTrips[0]);
        }
      } catch (error) {
        console.warn("Itenera backend sync skipped:", error.message);
      }
    };

    loadTrips();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedTrip?.id) {
        setTripMessages([]);
        return;
      }

      try {
        const serverMessages = await apiGetTripMessages(selectedTrip.id);
        setTripMessages(serverMessages);
      } catch (error) {
        console.warn("Trip chat sync skipped:", error.message);
      }
    };

    loadMessages();
  }, [selectedTrip]);

  useEffect(() => {
    localStorage.setItem(
      "iteneraTrips",
      JSON.stringify(trips)
    );
  }, [trips]);

  const parseInvitees = (value) => {
    if (!value) {
      return [];
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [namePart, phonePart] = item.split(":").map((part) => part.trim());

        if (!namePart || !phonePart) {
          return null;
        }

        return {
          name: namePart,
          phone: phonePart,
          role: "member",
        };
      })
      .filter(Boolean);
  };

  const createTrip = async () => {
    if (
      !tripData.name ||
      !tripData.destination ||
      !tripData.budget ||
      !tripData.days
    ) {
      alert("Please fill all required fields");
      return;
    }

    const invitees = parseInvitees(tripData.invitees);

    try {
      const { trip } = await apiCreateTrip({
        ...tripData,
        invitees,
        isGroupTrip: invitees.length > 0,
        participants: invitees,
      });

      const newTrip = {
        ...trip,
        id: trip.id,
        invitees,
      };

      setTrips([newTrip, ...trips]);
      setSelectedTrip(newTrip);
      setGuideResponse("");
      setGuidePrompt("");
      setTripMessages([]);
    } catch (error) {
      alert(error.message || "Unable to create trip");
      return;
    }

    setTripData({
      name: "",
      destination: "",
      budget: "",
      days: "",
      travellers: "",
      groupName: "",
      invitees: "",
    });

    setShowForm(false);
  };

  const handleSendChatMessage = async () => {
    if (!selectedTrip?.id || !chatMessage.trim()) {
      return;
    }

    try {
      const message = await apiSendTripMessage(selectedTrip.id, {
        senderName: "You",
        content: chatMessage.trim(),
        messageType: "text",
      });

      setTripMessages((current) => [...current, message]);
      setChatMessage("");
    } catch (error) {
      alert(error.message || "Unable to send message");
    }
  };

  const handleAskPocketGuide = async () => {
    if (!selectedTrip?.id || !guidePrompt.trim()) {
      return;
    }

    try {
      const response = await apiAskPocketGuide(selectedTrip.id, guidePrompt.trim());
      setGuideResponse(response);
      setTripMessages((current) => [
        ...current,
        {
          id: Date.now(),
          senderName: "PocketGuide",
          content: response,
          messageType: "ai",
          createdAt: new Date().toISOString(),
        },
      ]);
      setGuidePrompt("");
    } catch (error) {
      alert(error.message || "PocketGuide is unavailable right now");
    }
  };

  return (
    <div className="flex h-screen bg-[#f5efe6]">

      <Sidebar
        currentPage="itenera"
        onNavigate={onNavigate}
      />

      <main className="flex-1 overflow-auto">

        {/* Header */}
        <div className="bg-[#f8f4ee] border-b border-[#d9c7b0] sticky top-0 z-10">

          <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">

            <div>
              <h1 className="text-4xl font-serif text-[#5a1a1a]">
                ✈️ Itenera
              </h1>

              <p className="text-gray-600 mt-1">
                Plan smarter. Travel better.
              </p>
            </div>

            <button
              onClick={() =>
                setShowForm(!showForm)
              }
              className="bg-[#5a1a1a] hover:bg-[#471414] text-white px-6 py-3 rounded-xl transition"
            >
              + Create Trip
            </button>

          </div>

        </div>

        {/* Create Trip */}
        {showForm && (

          <div className="max-w-7xl mx-auto px-8 py-6">

            <div className="bg-[#f8f4ee] border border-[#d9c7b0] rounded-2xl p-6">

              <h2 className="text-xl font-semibold text-[#5a1a1a] mb-6">
                Create New Trip
              </h2>

              <div className="grid md:grid-cols-2 gap-4">

                <input
                  placeholder="Trip Name"
                  value={tripData.name}
                  onChange={(e) =>
                    setTripData({
                      ...tripData,
                      name: e.target.value,
                    })
                  }
                  className="p-3 rounded-xl border"
                />

                <input
                  placeholder="Destination"
                  value={tripData.destination}
                  onChange={(e) =>
                    setTripData({
                      ...tripData,
                      destination:
                        e.target.value,
                    })
                  }
                  className="p-3 rounded-xl border"
                />

                <input
                  placeholder="Group Name (optional)"
                  value={tripData.groupName}
                  onChange={(e) =>
                    setTripData({
                      ...tripData,
                      groupName: e.target.value,
                    })
                  }
                  className="p-3 rounded-xl border"
                />

                <textarea
                  placeholder="Invite friends/family as Name:Phone, Name:Phone"
                  value={tripData.invitees}
                  onChange={(e) =>
                    setTripData({
                      ...tripData,
                      invitees: e.target.value,
                    })
                  }
                  className="p-3 rounded-xl border md:col-span-2 min-h-[110px]"
                />

                <input
                  placeholder="Budget (₹)"
                  type="number"
                  value={tripData.budget}
                  onChange={(e) =>
                    setTripData({
                      ...tripData,
                      budget:
                        e.target.value,
                    })
                  }
                  className="p-3 rounded-xl border"
                />

                <input
                  placeholder="Days"
                  type="number"
                  value={tripData.days}
                  onChange={(e) =>
                    setTripData({
                      ...tripData,
                      days: e.target.value,
                    })
                  }
                  className="p-3 rounded-xl border"
                />

                <input
                  placeholder="Travellers"
                  type="number"
                  value={
                    tripData.travellers
                  }
                  onChange={(e) =>
                    setTripData({
                      ...tripData,
                      travellers:
                        e.target.value,
                    })
                  }
                  className="p-3 rounded-xl border"
                />

              </div>

              <button
                onClick={createTrip}
                className="mt-6 bg-[#5a1a1a] hover:bg-[#471414] text-white px-6 py-3 rounded-xl"
              >
                Save Trip
              </button>

            </div>

          </div>

        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Trips */}
            <div className="lg:col-span-2">

              <h2 className="text-xl font-semibold text-[#5a1a1a] mb-4">
                Your Trips
              </h2>

              <div className="grid md:grid-cols-2 gap-5">

                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className={`bg-[#f8f4ee] border rounded-2xl p-5 cursor-pointer transition ${
                      selectedTrip?.id === trip.id
                        ? "border-[#5a1a1a] shadow-md"
                        : "border-[#d9c7b0]"
                    }`}
                  >

                    <h3 className="text-xl font-semibold text-[#5a1a1a]">
                      {trip.name}
                    </h3>

                    <p className="text-gray-600 mt-1">
                      📍 {trip.destination}
                    </p>

                    <div className="mt-4 space-y-2">

                      <p>
                        💰 ₹
                        {Number(
                          trip.budget
                        ).toLocaleString()}
                      </p>

                      <p>
                        🗓️ {trip.days} Days
                      </p>

                      <p>
                        👥 {trip.travellers}
                        {" "}Travellers
                      </p>

                    </div>

                    <div className="mt-4">

                      <span className="bg-[#efe7dc] text-[#5a1a1a] px-3 py-1 rounded-full text-sm">
                        {trip.status}
                      </span>

                      {trip.invitees?.length > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {trip.invitees.length} invites sent
                        </span>
                      )}

                    </div>

                  </div>
                ))}

              </div>

            </div>

            {/* Right Side */}
            <div className="space-y-6">

              {/* PocketGuide */}
              <div className="bg-[#f8f4ee] border border-[#d9c7b0] rounded-2xl p-5">

                <h2 className="text-lg font-semibold text-[#5a1a1a] mb-3">
                  🧠 PocketGuide
                </h2>

                <p className="text-gray-600">
                  Ask PocketGuide to plan routes, packing, budgets, and daily trip help.
                </p>

                <div className="mt-4 space-y-3">
                  <textarea
                    placeholder="Ask PocketGuide anything about this trip"
                    value={guidePrompt}
                    onChange={(e) => setGuidePrompt(e.target.value)}
                    className="w-full p-3 rounded-xl border min-h-[110px]"
                  />

                  <button
                    onClick={handleAskPocketGuide}
                    className="w-full bg-[#5a1a1a] hover:bg-[#471414] text-white px-4 py-3 rounded-xl transition"
                  >
                    Ask PocketGuide
                  </button>

                  {guideResponse && (
                    <div className="bg-white border border-[#d9c7b0] rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">
                      {guideResponse}
                    </div>
                  )}
                </div>

              </div>

              {/* Trip Chat */}
              <div className="bg-[#f8f4ee] border border-[#d9c7b0] rounded-2xl p-5">
                <h2 className="text-lg font-semibold text-[#5a1a1a] mb-3">
                  💬 Trip Chat
                </h2>

                {selectedTrip ? (
                  <>
                    <p className="text-sm text-gray-600 mb-3">
                      Group space for {selectedTrip.name}
                    </p>

                    <div className="space-y-3 max-h-64 overflow-auto pr-1">
                      {tripMessages.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No messages yet. Start the group conversation.
                        </p>
                      ) : (
                        tripMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`rounded-xl p-3 text-sm ${
                              message.messageType === "ai"
                                ? "bg-blue-50 border border-blue-100"
                                : "bg-white border border-[#e0d1bf]"
                            }`}
                          >
                            <p className="font-semibold text-[#5a1a1a]">
                              {message.senderName}
                            </p>
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <textarea
                        placeholder="Write a message for the trip group"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        className="w-full p-3 rounded-xl border min-h-[90px]"
                      />
                      <button
                        onClick={handleSendChatMessage}
                        className="w-full bg-[#5a1a1a] hover:bg-[#471414] text-white px-4 py-3 rounded-xl transition"
                      >
                        Send Message
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">
                    Select a trip to open the group chat and PocketGuide assistant.
                  </p>
                )}
              </div>

              {/* Currency Converter */}
              <div className="bg-[#f8f4ee] border border-[#d9c7b0] rounded-2xl p-5">

                <h2 className="text-lg font-semibold text-[#5a1a1a] mb-3">
                  💱 Currency Converter
                </h2>

                <p className="text-gray-600">
                  ₹100,000 ≈ $1,165
                </p>

              </div>

              {/* Checklist */}
              <div className="bg-[#f8f4ee] border border-[#d9c7b0] rounded-2xl p-5">

                <h2 className="text-lg font-semibold text-[#5a1a1a] mb-3">
                  📋 Travel Checklist
                </h2>

                <ul className="space-y-2 text-gray-600">
                  <li>✅ Passport</li>
                  <li>⏳ Visa</li>
                  <li>❌ Insurance</li>
                  <li>❌ Flights</li>
                  <li>❌ Hotels</li>
                </ul>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}