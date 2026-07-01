const Sidebar = ({ onNavigate, currentPage = "inbox" }) => {
  const menuItems = [
    { icon: "🏠", label: "Home", key: "inbox" },
    { icon: "💸", label: "IntelliTrack", key: "intellitrack" },
    { icon: "💳", label: "Payzo", key: "payzo" },
    { icon: "🎯", label: "Visiona", key: "visiona" },
    { icon: "🧳", label: "Itenera", key: "itenera" },
    { icon: "👥", label: "Divido", key: "divido" },
    { icon: "⭐", label: "My Spaces", key: "myspaces" },
    { icon: "🔔", label: "Reminders", key: "reminders" },
  ];

  return (
    <div className="w-24 bg-white border-r flex flex-col items-center py-6 gap-6">

      {/* Logo */}
      <div className="text-2xl font-bold text-[#5a1a1a]">
        PP
      </div>

      {/* Menu */}
      <div className="flex flex-col items-center gap-6 text-sm">

        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate && onNavigate(item.key)}
            className={`flex flex-col items-center transition ${
              currentPage === item.key
                ? "text-[#5a1a1a]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}

      </div>

    </div>
  );
};

export default Sidebar;