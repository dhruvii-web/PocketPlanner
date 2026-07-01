import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Insights from "../components/Insights";

const HomePage = () => {
  return (
    <div className="flex h-screen bg-[#f5efe6]">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <div className="p-6">
            <Insights />
        </div>

      </div>
    </div>
  );
};

export default HomePage;