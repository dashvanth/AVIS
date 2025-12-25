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

// --- Dataset Ingestion & Orientation ---

/**
 * Uploads a raw file for ingestion and persistent audit logging.
 */
export const uploadDataset = async (file: File): Promise<Dataset> => {
  const formData = new FormData();
  formData.append("file", file);
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
 * Retrieves forensic preview data for an existing dataset.
 */
export const getDatasetPreview = async (id: number): Promise<PreviewData> => {
  const response = await api.get<PreviewData>(`datasets/${id}/preview`);
  return response.data;
};

/**
 * Fetches all persistent dataset records from MySQL.
 */
export const getDatasets = async (): Promise<Dataset[]> => {
  const response = await api.get<Dataset[]>("datasets/");
  return response.data;
};

/**
 * Prunes a dataset record and its associated physical file.
 */
export const deleteDataset = async (id: number): Promise<void> => {
  await api.delete(`datasets/${id}`);
};

// --- Guided Exploratory Data Analysis (EDA) ---

/**
 * Retrieves high-fidelity summary statistics and distribution insights.
 */
export const getEDASummary = async (id: number): Promise<EDASummary> => {
  const response = await api.get<EDASummary>(`eda/${id}/summary`);
  return response.data;
};

/**
 * Identifies and assesses the impact of missing values in the dataset.
 */
export const getMissingValues = async (id: number): Promise<MissingValue[]> => {
  const response = await api.get<MissingValue[]>(`eda/${id}/missing`);
  return response.data;
};

/**
 * Retrieves the relationship matrix and Pearson correlation insights.
 */
export const getCorrelationMatrix = async (
  id: number
): Promise<CorrelationData> => {
  const response = await api.get<CorrelationData>(`eda/${id}/correlation`);
  return response.data;
};

// --- Interactive Visualization ---

/**
 * Fetches formatted data for dynamic Plotly charting.
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

/**
 * Retrieves saved dashboard layouts for a specific dataset.
 */
export const getDashboards = async (
  datasetId: number
): Promise<Dashboard[]> => {
  const response = await api.get<Dashboard[]>(`dashboards/${datasetId}`);
  return response.data;
};

/**
 * Persists a custom dashboard configuration.
 */
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
 * Removes a saved dashboard configuration.
 */
export const deleteDashboard = async (id: number): Promise<void> => {
  await api.delete(`dashboards/${id}`);
};

// --- Context-Aware AI Assistance ---

/**
 * Retrieves automated findings for the AI Insights dashboard.
 */
export const getInsights = async (datasetId: number): Promise<any[]> => {
  const response = await api.get<any[]>(`insights/${datasetId}`);
  return response.data;
};

/**
 * Interacts with the LLM Assistant using data-backed context.
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

// --- Simple Authentication Management ---

/**
 * Authenticates credentials and initiates a session.
 */
export const login = async (email: string, password: string): Promise<any> => {
  const response = await api.post("auth/login", {
    email: email,
    password: password,
  });
  return response.data;
};

/**
 * Registers a new user and returns a session token for immediate redirect.
 */
export const signup = async (
  email: string,
  password: string,
  fullName: string
): Promise<any> => {
  // Requirement: Maps UI 'fullName' to 'name' for backend compatibility
  const response = await api.post("auth/signup", {
    name: fullName,
    email: email,
    password: password,
  });
  return response.data;
};

// --- Handshake Security Interceptor ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
