// frontend/src/services/api.ts
import axios from "axios";
import type {
  Dataset,
  Dashboard,
  EDASummary,
  CorrelationData,
  MissingValue,
  PreviewData,
} from "../types";

const API_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Dataset Ingestion & Orientation (Functionality 1 & 2) ---

/**
 * Uploads a raw file for ingestion and persistent audit logging.
 */
export const uploadDataset = async (file: File): Promise<Dataset> => {
  const formData = new FormData();
  formData.append("file", file);
  // relative path ensures URL becomes localhost:8000/api/datasets/upload
  const response = await api.post<Dataset>("datasets/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Provides immediate structural feedback before database commitment.
 */
export const previewDataset = async (file: File): Promise<PreviewData> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<PreviewData>("datasets/preview", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Retrieves existing forensic preview data for ingested relational assets.
 */
export const getDatasetPreview = async (id: number): Promise<PreviewData> => {
  const response = await api.get<PreviewData>(`datasets/${id}/preview`);
  return response.data;
};

export const getDatasets = async (): Promise<Dataset[]> => {
  const response = await api.get<Dataset[]>("datasets/");
  return response.data;
};

export const deleteDataset = async (id: number): Promise<void> => {
  await api.delete(`datasets/${id}`);
};

// --- Guided Exploratory Data Analysis (Functionality 3) ---

/**
 * Retrieves high-fidelity summary statistics and automated insights.
 */
export const getEDASummary = async (id: number): Promise<EDASummary> => {
  const response = await api.get<EDASummary>(`eda/${id}/summary`);
  return response.data;
};

/**
 * Identifies 'unstructured' gaps and their impact level on reliability.
 */
export const getMissingValues = async (id: number): Promise<MissingValue[]> => {
  const response = await api.get<MissingValue[]>(`eda/${id}/missing`);
  return response.data;
};

/**
 * Fetches relationship discovery matrix and natural language insights.
 */
export const getCorrelationMatrix = async (
  id: number
): Promise<CorrelationData> => {
  const response = await api.get<CorrelationData>(`eda/${id}/correlation`);
  return response.data;
};

// --- Interactive Visualization (Functionality 4) ---

/**
 * Fetches data formatted for dynamic Plotly charting.
 */
export const getChartData = async (
  id: number,
  xCol: string,
  chartType: string,
  yCol?: string
): Promise<any> => {
  const params = new URLSearchParams({
    x_col: xCol,
    chart_type: chartType,
  });
  if (yCol) params.append("y_col", yCol);

  const response = await api.get(`viz/${id}/chart?${params.toString()}`);
  return response.data;
};

export const getDashboards = async (
  datasetId: number
): Promise<Dashboard[]> => {
  const response = await api.get<Dashboard[]>(`dashboards/${datasetId}`);
  return response.data;
};

export const saveDashboard = async (
  datasetId: number,
  name: string,
  config: any
): Promise<Dashboard> => {
  const response = await api.post<Dashboard>(`dashboards/${datasetId}`, {
    name,
    layout_config: JSON.stringify(config),
  });
  return response.data;
};

/**
 * Explicitly exported to resolve module SyntaxErrors in VisualizationDashboard.
 */
export const deleteDashboard = async (id: number): Promise<void> => {
  await api.delete(`dashboards/${id}`);
};

// --- Context-Aware AI Assistance (Functionality 5) ---

/**
 * Explicitly exported to resolve InsightsDashboard import errors.
 */
export const getInsights = async (datasetId: number): Promise<any[]> => {
  const response = await api.get<any[]>(`insights/${datasetId}`);
  return response.data;
};

/**
 * Feeds metadata and EDA results for data-backed AI responses.
 */
export const sendChatMessage = async (
  datasetId: number,
  message: string
): Promise<{ response: string; plot_config?: any }> => {
  const response = await api.post<{ response: string; plot_config?: any }>(
    `chat/${datasetId}`,
    { message }
  );
  return response.data;
};

// --- Secure User Management (Functionality 7) ---

export const login = async (email: string, password: string): Promise<any> => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await api.post("auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data;
};

export const signup = async (
  email: string,
  password: string,
  fullName: string
): Promise<any> => {
  const response = await api.post("auth/register", {
    email,
    password,
    full_name: fullName,
  });
  return response.data;
};

// --- Security Interceptor ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
