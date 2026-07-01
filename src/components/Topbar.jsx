import { userData } from "../data/userData";

const Topbar = () => {

  const progress = userData.progress;

  // 🌈 VIBGYOR SYSTEM (with proper meaning)
  const stages = [
    { name: "Survivor", color: "bg-red-500" },       // 🔴
    { name: "Stabilizing", color: "bg-orange-500" }, // 🟠
    { name: "Balancer", color: "bg-yellow-500" },    // 🟡
    { name: "Builder", color: "bg-green-500" },      // 🟢
    { name: "Strategist", color: "bg-blue-500" },    // 🔵
    { name: "Architect", color: "bg-indigo-500" },   // 🟣 (Indigo)
    { name: "Elite", color: "bg-purple-500" },       // 🟪 (Violet)
  ];

  // ✅ CURRENT STAGE (floor logic — FIXED)
  const getCurrentStageIndex = (progress) => {
    return Math.min(
      Math.floor(progress / (100 / stages.length)),
      stages.length - 1
    );
  };

  const currentIndex = getCurrentStageIndex(progress);
  const currentStage = stages[currentIndex];

  // 😎 TEMP AVATARS (can upgrade later)
  const getAvatar = (p) => {
    if (p < 30) return "😐";
    if (p < 60) return "🙂";
    if (p < 80) return "😎";
    return "🧠";
  };

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6">

      <h1 className="text-lg font-semibold text-gray-700">
        Dashboard
      </h1>

      <div className="flex items-center gap-4">

        {/* 🧠 Stage Name */}
        <span className="text-sm text-gray-600 hidden md:block">
          {currentStage.name}
        </span>

        {/* 👤 Profile */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg shadow-md ${currentStage.color}`}
        >
          {getAvatar(progress)}
        </div>

      </div>
    </div>
  );
};

export default Topbar;