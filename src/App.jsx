import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/HomePage";
import Timeline from "./pages/TimelinePage";
import People from "./pages/PeoplePage";

import DashboardPage from "./pages/DashboardPage";
import GenealogyPage from "./pages/GenealogyPage";
import CovenantsPage from "./pages/CovenantsPage";
import PromisesPage from "./pages/PromisesPage";
import QuestionsPage from "./pages/QuestionsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />

        <Route path="/home" element={<Home />} />

        <Route path="/timeline" element={<Timeline />} />

        <Route path="/people" element={<People />} />

        <Route path="/genealogy" element={<GenealogyPage />} />

        <Route path="/covenants" element={<CovenantsPage />} />

        <Route path="/promises" element={<PromisesPage />} />

        <Route path="/questions" element={<QuestionsPage />} />

        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;