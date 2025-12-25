// frontend/src/App.tsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AnalysisLayout from "./layouts/AnalysisLayout";
import GlobalLayout from "./layouts/GlobalLayout";
import LandingPage from "./pages/LandingPage";
import DashboardHome from "./pages/DashboardHome";
import DatasetsPage from "./pages/DatasetsPage";
import EDADashboard from "./pages/EDADashboard";
import VisualizationDashboard from "./pages/VisualizationDashboard";
import InsightsDashboard from "./pages/InsightsDashboard";
import ChatDashboard from "./pages/ChatDashboard";
import AuthPage from "./pages/AuthPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Public Landing Section */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Core Workspace: History Hub & Ingestion */}
        <Route element={<GlobalLayout />}>
          <Route path="/app" element={<DashboardHome />} />
          <Route path="/app/datasets" element={<DatasetsPage />} />
        </Route>

        {/* Functionality 2-6: Step-by-Step Analysis Sidebar Workspace */}
        <Route path="/dashboard/:id" element={<AnalysisLayout />}>
          {/* Default to the EDA Step */}
          <Route index element={<Navigate to="eda" replace />} />
          <Route path="eda" element={<EDADashboardWrapper />} />
          <Route path="viz" element={<VisualizationDashboardWrapper />} />
          <Route path="insights" element={<InsightsDashboardWrapper />} />
          <Route path="chat" element={<ChatDashboardWrapper />} />
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
const EDADashboardWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <EDADashboard datasetId={Number(id)} />;
};

const VisualizationDashboardWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <VisualizationDashboard datasetId={Number(id)} />;
};

const InsightsDashboardWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <InsightsDashboard datasetId={Number(id)} />;
};

const ChatDashboardWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <ChatDashboard datasetId={Number(id)} />;
};

export default App;
