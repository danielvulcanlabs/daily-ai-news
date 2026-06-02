export type ConnectorCategory = 'ai' | 'communication' | 'email' | 'calendar' | 'tasks';

export type ConnectorStatus = 'connected' | 'disconnected' | 'error' | 'expired';

export type ConnectorProvider =
  // AI Tools
  | 'claude' | 'chatgpt' | 'gemini' | 'grok'
  // Communication
  | 'slack' | 'teams' | 'google-chat' | 'lark'
  // Email
  | 'gmail' | 'outlook-mail'
  // Calendar
  | 'google-calendar' | 'outlook-calendar'
  // Tasks
  | 'jira' | 'trello' | 'linear';

export interface ConnectorConfig {
  id: ConnectorProvider;
  name: string;
  category: ConnectorCategory;
  icon: string;
  description: string;
  color: string;
  comingSoon?: boolean; // true = show badge, disable Connect
  oauth: {
    authUrl: string;
    tokenUrl: string;
    scopes: string[];
    clientIdEnv: string;
    clientSecretEnv: string;
  } | null; // null for connectors without OAuth
}

export interface UserConnector {
  id: string;
  provider: ConnectorProvider;
  category: ConnectorCategory;
  status: ConnectorStatus;
  accessToken: string;   // encrypted
  refreshToken: string;  // encrypted
  tokenExpiresAt: Date | null;
  scopes: string[];
  metadata: Record<string, string>;
  lastSyncAt: Date | null;
  connectedAt: Date;
}

export interface ConnectorUpdate {
  id: string;
  source: ConnectorProvider;
  sourceId: string;
  title: string;
  summary: string;
  url: string;
  relevanceScore: number;
  metadata: Record<string, string>;
  fetchedAt: Date;
}
