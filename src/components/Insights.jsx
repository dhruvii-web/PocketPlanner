import { userData } from "../data/userData";

const Insights = () => {

  const { progress, stats, name } = userData;

  // 🌈 VIBGYOR SYSTEM
  const stages = [
    { name: "Survivor", color: "bg-red-500" },
    { name: "Stabilizing", color: "bg-orange-500" },
    { name: "Balancer", color: "bg-yellow-500" },
    { name: "Builder", color: "bg-green-500" },
    { name: "Strategist", color: "bg-blue-500" },
    { name: "Architect", color: "bg-indigo-500" },
    { name: "Elite", color: "bg-purple-500" },
  ];

  const getCurrentStageIndex = (progress) => {
    return Math.min(
      Math.floor(progress / (100 / stages.length)),
      stages.length - 1
    );
  };

  const currentIndex = getCurrentStageIndex(progress);

  const currentStage = stages[currentIndex];

  const nextStage =
    stages[Math.min(currentIndex + 1, stages.length - 1)];

  return (
    <div className="space-y-10">

      {/* 🔥 HERO SECTION */}
      <div className="bg-white rounded-3xl p-10 shadow-sm">

        <p className="text-sm text-gray-500 mb-3">
          Good evening, {name} 👋
        </p>

        <h1 className="text-4xl font-semibold text-[#5a1a1a] leading-tight">
          You're making strong financial progress.
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          You're currently a{" "}
          <span className="font-semibold">
            {currentStage.name}
          </span>{" "}
          — {progress}% towards{" "}
          <span className="font-semibold">
            {nextStage.name}
          </span>
        </p>

        {/* Progress Bar */}
        <div className="mt-8">

          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

            <div
              className={`h-full rounded-full transition-all duration-500 ${currentStage.color}`}
              style={{ width: `${progress}%` }}
            />

          </div>

        </div>

      </div>


      {/* 🔥 QUICK INSIGHTS */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* FOOD */}
        {stats.foodSpendingChange > 20 && (
          <QuickInsight
            icon="🍔"
            title="Food spending increased"
            text={`Spending is up by ${stats.foodSpendingChange}% this week.`}
          />
        )}

        {/* SAVINGS */}
        {stats.savingsChange > 0 && (
          <QuickInsight
            icon="💰"
            title="Savings improved"
            text={`Your savings improved by ${stats.savingsChange}%.`}
          />
        )}

      </div>


      {/* 🔥 SMART MESSAGE */}
      <div className="bg-[#5a1a1a] text-white rounded-3xl p-8">

        <p className="text-sm uppercase tracking-wider text-white/60 mb-3">
          Pocket Insight
        </p>

        <h2 className="text-2xl font-semibold leading-relaxed">
          You're close to becoming an{" "}
          <span className="text-blue-300">
            {nextStage.name}
          </span>.
        </h2>

        <p className="mt-3 text-white/70">
          Keep tracking expenses consistently to unlock higher financial levels.
        </p>

      </div>


      {/* 📰 FINANCIAL NEWS */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">

        <h2 className="text-2xl font-semibold text-[#5a1a1a] mb-6">
          Financial News
        </h2>

        <div className="space-y-5">

          <NewsItem
            icon="📈"
            text="Stock market shows steady growth this week"
          />

          <NewsItem
            icon="💰"
            text="RBI may revise interest rates soon"
          />

          <NewsItem
            icon="📉"
            text="Inflation expected to cool down next quarter"
          />

        </div>

      </div>

    </div>
  );
};

export default Insights;



// 🔥 QUICK INSIGHT CARD
const QuickInsight = ({ icon, title, text }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm">

    <div className="flex items-start gap-4">

      <span className="text-3xl">
        {icon}
      </span>

      <div>

        <h3 className="text-lg font-semibold text-gray-800">
          {title}
        </h3>

        <p className="text-gray-500 mt-1">
          {text}
        </p>

      </div>

    </div>

  </div>
);


// 📰 NEWS ITEM
const NewsItem = ({ icon, text }) => (
  <div className="flex items-center gap-4">

    <span className="text-2xl">
      {icon}
    </span>

    <p className="text-gray-700">
      {text}
    </p>

  </div>
);