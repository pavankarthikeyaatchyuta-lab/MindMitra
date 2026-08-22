export interface Caregiver {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface User {
  id: number;
  caregiver_id?: number;
  display_name: string;
  name?: string;
  age: number;
  preferred_language: string;
  voice_enabled: boolean;
  created_at: string;
}

export type ElderlyProfile = User;

export interface Session {
  id: number;
  user_id: number;
  started_at: string;
  completed_at: string | null;
  status: string;
}

export interface GameSession {
  id: number;
  session_id: number;
  user_id: number;
  game_type: string;
  difficulty: number;
  started_at: string;
  completed_at: string | null;
  accuracy: number;
  avg_response_time_ms: number;
  total_events: number;
  repeat_errors: number;
  corrections: number;
  completion_time_ms: number;
  invalid_for_trend?: boolean;
  exclusion_reason?: string;
}

export interface GameEvent {
  game_session_id: number;
  user_id: number;
  event_type: string;
  event_data: Record<string, any>;
}

export interface AdaptiveMetrics {
  accuracy: number;
  mean_response_time_ms: number;
  response_time_variance: number;
  repeat_error_rate: number;
  correction_rate: number;
  completion_time_ms: number;
  current_difficulty: number;
  previous_session_accuracy?: number;
  recent_trend?: number;
}

export interface AdaptiveResult {
  recommendation: string;
  recommended_difficulty: number;
  previous_difficulty?: number;
  confidence: number;
  reason?: string;
  model_used: string;
  feature_importance: Record<string, number>;
}

export interface AdaptiveDecision {
  id: number;
  user_id: number;
  game_type: string;
  previous_difficulty: number;
  recommended_difficulty: number;
  recommendation: string;
  reason?: string;
  model_used: string;
  confidence: number;
  features_json: string;
  timestamp: string;
}

export interface FamiliarPerson {
  id: number;
  user_id: number;
  name: string;
  relationship: string;
  photo_url: string;
  consent_confirmed: boolean;
  created_at?: string;
}

export interface Baseline {
  sufficient_data: boolean;
  baseline_accuracy: number | null;
  baseline_response_time: number | null;
  sessions_used: number;
  status?: string;
  details?: Record<string, any>;
}

export interface TrendData {
  game_type: string;
  domain: string;
  domain_label?: string;
  domain_icon?: string;
  current_performance?: number;
  current_latency_ms?: number;
  current_difficulty?: number;
  baseline?: number;
  baseline_latency_ms?: number;
  deviation?: number;
  latency_deviation_ms?: number;
  status?: string;
  trend: string;
  sessions_used?: number;
  total_recorded?: number;
  supporting_sessions?: number;
  reason_codes?: string[];
  observation_note?: string;
  difficulty_context?: {
    previous_difficulty: number;
    current_difficulty: number;
    difficulty_changed: boolean;
  };
  disclaimer?: string;
}

export interface OverallTrend {
  overall_status: string;
  headline: string;
  summary: string;
  recent_change_count: number;
  stable_count: number;
  improving_count: number;
  disclaimer: string;
}

export interface CognitiveDomain {
  domain: string;
  analytics: TrendData;
}

export interface Insight {
  domain: string;
  domain_label?: string;
  game_type?: string;
  status: string;
  evidence?: string;
  reason_codes?: string[];
  insight: string;
  provider?: string;
  tier?: number;
  disclaimer?: string;
}

export interface Reminder {
  id?: number;
  user_id: number;
  type: string;
  title: string;
  time: string;
  repeat_pattern: string;
  enabled: boolean;
}

export interface GameConfig {
  type: string;
  name: string;
  description: string;
  icon: string;
  domain: string;
}

export type Language = 'en' | 'hi' | 'te';
export type GameType = 'memory_match' | 'daily_routine' | 'object_recognition' | 'pattern_recall';
