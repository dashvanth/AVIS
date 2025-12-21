import axios from "axios";
import type { Dataset, Dashboard } from "../types";

const API_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const uploadDataset = async (file: File): Promise<Dataset> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<Dataset>("/datasets/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const previewDataset = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<any>("/datasets/preview", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getDatasets = async (): Promise<Dataset[]> => {
  const response = await api.get<Dataset[]>("/datasets/");
  return response.data;
};

export const deleteDataset = async (id: number): Promise<void> => {
  await api.delete(`/datasets/${id}`);
};

export const getEDASummary = async (id: number): Promise<any> => {
  const response = await api.get(`/eda/${id}/summary`);
  return response.data;
};

export const getMissingValues = async (id: number): Promise<any> => {
  const response = await api.get(`/eda/${id}/missing`);
  return response.data;
};

export const getCorrelationMatrix = async (id: number): Promise<any> => {
  const response = await api.get(`/eda/${id}/correlation`);
  return response.data;
};

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

  const response = await api.get(`/viz/${id}/chart?${params.toString()}`);
  return response.data;
};

export const getDashboards = async (
  datasetId: number
): Promise<Dashboard[]> => {
  const response = await api.get<Dashboard[]>(`/dashboards/${datasetId}`);
  return response.data;
};

export const saveDashboard = async (
  datasetId: number,
  name: string,
  config: any
): Promise<Dashboard> => {
  const response = await api.post<Dashboard>(`/dashboards/${datasetId}`, {
    name,
    layout_config: config,
  });
  return response.data;
};

export const deleteDashboard = async (id: number): Promise<void> => {
  await api.delete(`/dashboards/${id}`);
};

export const getInsights = async (datasetId: number): Promise<any[]> => {
  const response = await api.get<any[]>(`/insights/${datasetId}`);
  return response.data;
};

export const sendChatMessage = async (
  datasetId: number,
  message: string
): Promise<{ response: string; plot_config?: any }> => {
  const response = await api.post<{ response: string; plot_config?: any }>(
    `/chat/${datasetId}`,
    { message }
  );
  return response.data;
};

export const login = async (email: string, password: string): Promise<any> => {
  const formData = new URLSearchParams();
  formData.append("username", email); // OAuth2 expects 'username' field
  formData.append("password", password);

  const response = await api.post("/auth/login", formData, {
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
  const response = await api.post("/auth/register", {
    email,
    password,
    full_name: fullName,
  });
  return response.data;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
