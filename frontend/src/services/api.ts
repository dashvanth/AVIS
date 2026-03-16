// frontend/src/services/api.ts
import axios from "axios";
import type {
  Dataset,
  EDASummary,
  CorrelationData,
  MissingValue,
  PreviewData,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

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

// --- Context-Aware AI Assistance ---

/**
 * Retrieves automated findings for the AI Insights dashboard.
 */
import type { ResearchReport } from "../types";

/**
 * Retrieves automated findings for the AI Insights dashboard.
 */
export const getInsights = async (
  datasetId: number
): Promise<ResearchReport> => {
  const response = await api.get<ResearchReport>(`insights/${datasetId}`);
  return response.data;
};

/**
 * Interacts with the LLM Assistant using data-backed context.
 */
/**
 * Interacts with the LLM Assistant using data-backed context.
 */
export const chatWithDataset = async (
  datasetId: number,
  message: string,
  pageContext?: any
): Promise<{ response: string; plot_config?: any }> => {
  const response = await api.post<{ response: string; plot_config?: any }>(
    `chat/${datasetId}`,
    { message, page_context: pageContext }
  );
  return response.data;
};

// --- Data Preparation (Transparent Cleaning) ---

export const getPreparationSuggestions = async (id: number): Promise<any> => {
  const response = await api.get(`preparation/${id}/suggestions`);
  return response.data;
};

export const applyCleaning = async (
  id: number,
  config: any
): Promise<{ new_dataset_id: number; changes: string[] }> => {
  const response = await api.post(`preparation/${id}/apply`, config);
  return response.data;
};

// --- Intelligent Data Repair Engine ---

export const getRepairRecommendations = async (id: number): Promise<any> => {
  const response = await api.get(`repair/recommendations/${id}`);
  return response.data;
};

export const simulateRepair = async (id: number, column: string, strategy: string): Promise<any> => {
  const response = await api.post(`repair/simulate`, {
    dataset_id: id,
    column,
    strategy
  });
  return response.data;
};

export const applyRepair = async (id: number, column: string, strategy: string): Promise<{ new_dataset_id: number, new_filename: string }> => {
  const response = await api.post(`repair/apply`, {
    dataset_id: id,
    column,
    strategy
  });
  return response.data;
};

// --- Repair Analytics & Explanation ---

export const getRepairTimeline = async (id: number, repairSteps: { column: string, strategy: string }[]): Promise<any> => {
  const response = await api.post(`repair/timeline/${id}`, {
    repair_steps: repairSteps
  });
  return response.data;
};

export const getRepairTrace = async (id: number, column: string, strategy: string): Promise<any> => {
  const response = await api.post(`repair/trace`, {
    dataset_id: id,
    column,
    strategy
  });
  return response.data;
};

export const compareStrategies = async (id: number, column: string): Promise<any> => {
  const response = await api.post(`repair/compare`, {
    dataset_id: id,
    column
  });
  return response.data;
};

export const getDatasetQuality = async (id: number): Promise<any> => {
  const response = await api.get(`quality/${id}`);
  return response.data;
};

export const getDatasetVersions = async (id: number): Promise<any> => {
   const response = await api.get(`versions/${id}`);
   return response.data;
}

export const restoreDatasetVersion = async (id: number): Promise<any> => {
   const response = await api.post(`versions/restore`, { dataset_id: id });
   return response.data;
}

// --- Authentication Management ---

export const login = async (email: string, password: string): Promise<any> => {
  const response = await api.post("auth/login", {
    email,
    password,
  });
  return response.data;
};

export const signup = async (email: string, password: string, fullName: string): Promise<any> => {
  const response = await api.post("auth/signup", {
    name: fullName || "User",
    email,
    password,
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

// --- Export & Download Center ---

export const getDownloadUrl = (
  datasetId: number,
  type: "data" | "zip",
  version?: "original" | "prepared"
): string => {
  const baseUrl = `${API_URL}/export/${datasetId}`;
  if (type === "zip") return `${baseUrl}/zip`;
  return `${baseUrl}/data?version=${version || "prepared"}`;
};

export default api;
