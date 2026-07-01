import { useState } from "react";
import IteneraPage from "./pages/IteneraPage";
import InboxPage from "./pages/InboxPage";
import MySpacesPage from "./pages/MySpacesPage";
import RemindersPage from "./pages/RemindersPage";
import IntelliTrackPage from "./pages/IntelliTrackPage";
import VisionaPage from "./pages/VisionaPage";
import PayzoPage from "./pages/PayzoPage";
import DividoPage from "./pages/DividoPage";

function App() {
  const [currentPage, setCurrentPage] = useState("inbox");

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      {currentPage === "inbox" && (
        <InboxPage onNavigate={handleNavigate} />
      )}
      {currentPage === "myspaces" && (
        <MySpacesPage onNavigate={handleNavigate} />
      )}
      {currentPage === "reminders" && (
        <RemindersPage onNavigate={handleNavigate} />
      )}
      {currentPage === "intellitrack" && (
        <IntelliTrackPage onNavigate={handleNavigate} />
      )}
      {currentPage === "visiona" && (
        <VisionaPage onNavigate={handleNavigate} />
      )}
      {currentPage === "payzo" && (
        <PayzoPage onNavigate={handleNavigate} />
      )}
      {currentPage === "divido" && (
        <DividoPage onNavigate={handleNavigate} />
      )}
      {currentPage === "itenera" && (
        <IteneraPage onNavigate={handleNavigate} />
      )}
    </>
  );
}

export default App;