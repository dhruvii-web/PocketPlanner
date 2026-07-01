const features = [
  {
    title: "IntelliTrack",
    desc: "Supports both automatic bank-synced expense tracking with smart categorization and manual expense entry into custom or system-generated categories.",
    icon: "💸",
  },
  {
    title: "Itinera",
    desc: "Plan trips seamlessly with budgeting, expense tracking, and smart cost-splitting—so you can organize, manage, and share expenses effortlessly in one place.",
    icon: "🧳",
  },
  {
    title: "Visiona",
    desc: "Set, track, and achieve your dreams with goal-based planning, progress tracking, and smart insights to keep you consistently moving forward.",
    icon: "🎯",
  },
  {
    title: "Payzo",
    desc: "Enable parents to securely manage and send money to their children, with controlled spending, tracking, and financial guidance built into one system.",
    icon: "💳",
  },
  {
    title: "Bank integration",
    desc: "Connect your existing accounts for automatic tracking and reconciliation.",
    icon: "🏦",
  },
  {
    title: "Global support",
    desc: "Handle expenses anywhere in the world with multi-currency conversion for trips and buiness work.",
    icon: "🌍",
  },
  
  {
    title: "Finsight",
    desc: "Build better habits with consistent tracking and gain actionable insights into your spending patterns to make smarter financial decisions.",
    icon: "📊",
  },

  {
    title: "Divido",
    desc: "Create split groups for specific occasions, allows to add contacts, and divide expenses easily with auto-generated messages for quick settlement.",
    icon: "👥",
  },
  
];



const FeaturesSection = () => {
  return (
    <div className="bg-[#f5efe6] py-20 px-6">

      {/* Heading */}
      <h2 className="text-4xl md:text-5xl text-center mb-16 font-serif text-[#5a1a1a]">
        Features
      </h2>

      {/* Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">

        {features.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-4">

              <span className="text-2xl">{item.icon}</span>

              <h3 className="text-lg font-semibold text-[#2a0707]">
                {item.title}
              </h3>

            </div>

            {/* Description */}
            <p className="text-sm text-[#4a1a1a]/80 mb-4 leading-relaxed">
              {item.desc}
            </p>

            {/* Learn More */}
            <p className="text-blue-600 text-sm cursor-pointer hover:underline">
              Learn More
            </p>
          </div>
        ))}

      </div>

      {/* Get Started Button */}
        <div className="mt-16 flex justify-center">
            <button className="px-8 py-3 bg-[#5a1a1a] text-white rounded-full font-medium 
            hover:bg-[#3b0a0a] transition shadow-md hover:shadow-lg">
                Get Started
            </button>
        </div>

    </div>
  );
};

export default FeaturesSection;