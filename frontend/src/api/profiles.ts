import axios from "axios";
import type { UserProfile, UserProfilePublic } from "../types";
import { API_CONFIG } from "../config/api";

interface CreateProfilePayload {
  name: string;
  neighborhood?: string;
  city?: string;
  concerns?: string;
  share_location: boolean;
}

interface UpdateProfilePayload {
  name?: string;
  neighborhood?: string;
  city?: string;
  concerns?: string;
  share_location?: boolean;
}

const BASE = API_CONFIG.BASE_URL;

export const getProfiles = (keyword?: string) =>
  axios.get<UserProfilePublic[]>(`${BASE}${API_CONFIG.PROFILES.LIST}`, {
    params: { keyword },
  });

export const getProfile = (id: number) =>
  axios.get<UserProfilePublic>(`${BASE}${API_CONFIG.PROFILES.GET(id)}`);

export const createProfile = (data: CreateProfilePayload) =>
  axios.post<UserProfile>(`${BASE}${API_CONFIG.PROFILES.CREATE}`, data);

export const updateProfile = (id: number, data: UpdateProfilePayload) =>
  axios.put<UserProfile>(`${BASE}${API_CONFIG.PROFILES.UPDATE(id)}`, data);

export const deleteProfile = (id: number) =>
  axios.delete(`${BASE}${API_CONFIG.PROFILES.DELETE(id)}`);
