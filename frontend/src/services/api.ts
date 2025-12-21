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

export const generateForecast = async (
  datasetId: number,
  dateCol: string,
  valueCol: string,
  periods: number
): Promise<any[]> => {
  const response = await api.post<any[]>(`/forecast/${datasetId}`, {
    date_col: dateCol,
    value_col: valueCol,
    periods,
  });
  return response.data;
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

export default api;
