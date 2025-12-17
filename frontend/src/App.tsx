import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AnalysisLayout from './layouts/AnalysisLayout';
import GlobalLayout from './layouts/GlobalLayout';
import LandingPage from './pages/LandingPage';
import DashboardHome from './pages/DashboardHome';
import DatasetsPage from './pages/DatasetsPage';
import EDADashboard from './pages/EDADashboard';
import VisualizationDashboard from './pages/VisualizationDashboard';
import InsightsDashboard from './pages/InsightsDashboard';
import DashboardBuilderPage from './pages/DashboardBuilderPage';
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        {/* Public/Home Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Global Dashboard Routes */}
        <Route element={<GlobalLayout />}>
          <Route path="/app" element={<DashboardHome />} />
          <Route path="/app/datasets" element={<DatasetsPage />} />
          {/* analytics is now the dashboard builder, or maybe reserved for future. Linking to builder for now. */}
          <Route path="/app/analytics" element={<DashboardBuilderPage />} />
        </Route>

        {/* Analysis Dashboard Routes (Sidebar Layout) */}
        <Route path="/dashboard/:id" element={<AnalysisLayout />}>
          <Route index element={<Navigate to="eda" replace />} />
          <Route path="eda" element={<EDADashboardWrapper />} />
          <Route path="viz" element={<VisualizationDashboardWrapper />} />
          {/* Replaced AnalyticsPage with DashboardBuilderPage */}
          <Route path="analytics" element={<DashboardBuilderPage />} />
          <Route path="builder" element={<DashboardBuilderPage />} />
          <Route path="insights" element={<InsightsDashboardWrapper />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Wrapper components to extract ID from URL params and pass to existing components
import { useParams } from 'react-router-dom';

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


export default App;
