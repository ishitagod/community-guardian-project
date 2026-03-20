export type Classification = "verified" | "noise" | "unreviewed";
export type Severity = "low" | "medium" | "high";
export type AlertType =
  | "phishing"
  | "breach"
  | "scam"
  | "crime"
  | "accident"
  | "disaster"
  | "outage"
  | "general";
export type AIMethod = "groq_ai" | "fallback";

export interface Alert {
  id: number;
  title: string;
  description: string;
  alert_type: AlertType;
  severity: Severity;
  classification: Classification;
  ai_confidence: number;
  ai_reasoning: string;
  action_summary: string;
  ai_method: AIMethod;
  neighborhood: string | null;
  city: string | null;
  dismissed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  name: string;
  neighborhood: string | null;
  city: string | null;
  concerns: string | null;
  share_location: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfilePublic {
  id: number;
  name: string;
  neighborhood: string | null;
  city: string | null;
  concerns: string | null;
  share_location: boolean;
}

export interface AlertFilters {
  keyword?: string;
  classification?: Classification;
  alert_type?: AlertType;
  severity?: Severity;
}
