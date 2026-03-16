// frontend/src/App.tsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AppLayout from "./layouts/AppLayout";
import LandingPage from "./pages/LandingPage";
import DashboardHome from "./pages/DashboardHome";
import AnalyzePage from "./pages/AnalyzePage";
import RepairPage from "./pages/RepairPage";
import StatisticsPage from "./pages/StatisticsPage";
import VisualizationDashboard from "./pages/VisualizationDashboard";
import ChatDashboard from "./pages/ChatDashboard";
import AuthPage from "./pages/AuthPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public & Authentication Boundaries */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Route>

        {/* Core Application & Analysis Boundaries */}
        <Route element={<AppLayout />}>
          <Route path="/app" element={<DashboardHome />} />
          
          <Route path="/dashboard/:id">
            <Route index element={<Navigate to="analyze" replace />} />
            <Route path="analyze" element={<AnalyzePage />} />
            <Route path="repair" element={<RepairPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="viz" element={<VisualizationDashboardWrapper />} />
            <Route path="chat" element={<ChatDashboardWrapper />} />
            
            {/* Legacy Redirects for stability */}
            <Route path="overview" element={<Navigate to="../analyze" replace />} />
            <Route path="lab" element={<Navigate to="../analyze" replace />} />
            <Route path="repair-legacy" element={<Navigate to="../repair" replace />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/** * Wrappers to ensure the dataset ID from the URL is converted
 * to a number and passed correctly to the feature pages.
 */


const VisualizationDashboardWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <VisualizationDashboard datasetId={Number(id)} />;
};

const ChatDashboardWrapper = () => {
  return <ChatDashboard />;
};

export default App;
