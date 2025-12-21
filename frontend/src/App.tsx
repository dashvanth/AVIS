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
import ChatDashboard from "./pages/ChatDashboard"; // Added missing import
import AuthPage from "./pages/AuthPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        {/* Public Landing */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* User Workspace */}
        <Route element={<GlobalLayout />}>
          <Route path="/app" element={<DashboardHome />} />
          <Route path="/app/datasets" element={<DatasetsPage />} />
        </Route>

        {/* Guided Analysis Workspace (Sidebar Layout) */}
        <Route path="/dashboard/:id" element={<AnalysisLayout />}>
          <Route index element={<Navigate to="eda" replace />} />
          <Route path="eda" element={<EDADashboardWrapper />} />
          <Route path="viz" element={<VisualizationDashboardWrapper />} />
          <Route path="builder" element={<DashboardBuilderPageWrapper />} />
          <Route path="insights" element={<InsightsDashboardWrapper />} />
          <Route path="chat" element={<ChatDashboardWrapper />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Params Wrappers to ensure Dataset ID is passed correctly
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

const DashboardBuilderPageWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <DashboardBuilderPage datasetId={Number(id)} />;
};

export default App;
