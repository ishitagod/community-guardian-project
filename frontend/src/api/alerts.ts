import axios from "axios";
import type { Alert, AlertFilters } from "../types";
import { API_CONFIG } from "../config/api";

interface CreateAlertPayload {
  title: string;
  description: string;
}

interface AlertWithChecklist extends Alert {
  checklist?: {
    checklist_items: string[];
    category: string;
    method: string;
  };
}

const BASE = API_CONFIG.BASE_URL;

export const getAlerts = (filters: AlertFilters) =>
  axios.get<Alert[]>(`${BASE}${API_CONFIG.ALERTS.LIST}`, { params: filters });

export const getAlert = (id: number) =>
  axios.get<AlertWithChecklist>(`${BASE}${API_CONFIG.ALERTS.GET(id)}`);

export const createAlert = (data: CreateAlertPayload) =>
  axios.post<Alert>(`${BASE}${API_CONFIG.ALERTS.CREATE}`, data);

// export const updateClassification = (id: number, classification: string) =>
//   axios.put<Alert>(`${BASE}${API_CONFIG.ALERTS.UPDATE_CLASSIFICATION(id)}`, {
//     classification,
//   });

export const dismissAlert = (id: number) =>
  axios.patch<Alert>(`${BASE}${API_CONFIG.ALERTS.DISMISS(id)}`);
