import type { ConnectorConfig, ConnectorCategory } from '@/types/connector';

export const CONNECTOR_REGISTRY: ConnectorConfig[] = [
  // ── AI Tools ──
  {
    id: 'claude',
    name: 'Claude',
    category: 'ai',
    icon: '/icons/claude.png',
    description: 'Anthropic Claude — conversations & memory',
    color: '#d4a373',
    comingSoon: true,
    oauth: null,
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'ai',
    icon: '/icons/chatgpt.jpg',
    description: 'OpenAI ChatGPT — conversations & plugins',
    color: '#10a37f',
    comingSoon: true,
    oauth: null,
  },
  {
    id: 'gemini',
    name: 'Gemini',
    category: 'ai',
    icon: '/icons/gemini.png',
    description: 'Google Gemini — conversations & search',
    color: '#4285f4',
    comingSoon: true,
    oauth: null,
  },
  {
    id: 'grok',
    name: 'Grok',
    category: 'ai',
    icon: '/icons/grok.png',
    description: 'xAI Grok — conversations & analysis',
    color: '#1d9bf0',
    comingSoon: true,
    oauth: null,
  },

  // ── Communication ──
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    icon: '/icons/slack.png',
    description: 'Channels, messages, threads & mentions',
    color: '#4a154b',
    oauth: {
      authUrl: 'https://slack.com/oauth/v2/authorize',
      tokenUrl: 'https://slack.com/api/oauth.v2.access',
      scopes: ['channels:read', 'channels:history', 'groups:read', 'groups:history', 'search:read', 'users:read'],
      clientIdEnv: 'SLACK_CLIENT_ID',
      clientSecretEnv: 'SLACK_CLIENT_SECRET',
    },
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'communication',
    icon: '/icons/teams.png',
    description: 'Teams chats, channels & meetings',
    color: '#6264a7',
    oauth: {
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      scopes: ['Chat.Read', 'ChannelMessage.Read.All', 'Team.ReadBasic.All'],
      clientIdEnv: 'TEAMS_CLIENT_ID',
      clientSecretEnv: 'TEAMS_CLIENT_SECRET',
    },
  },
  {
    id: 'google-chat',
    name: 'Google Chat',
    category: 'communication',
    icon: '/icons/google-chat.png',
    description: 'Google Chat spaces & conversations',
    color: '#00ac47',
    oauth: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/chat.messages.readonly', 'https://www.googleapis.com/auth/chat.spaces.readonly'],
      clientIdEnv: 'GOOGLE_CHAT_CLIENT_ID',
      clientSecretEnv: 'GOOGLE_CHAT_CLIENT_SECRET',
    },
  },
  {
    id: 'lark',
    name: 'Lark',
    category: 'communication',
    icon: '/icons/lark.png',
    description: 'Lark/Feishu messages & groups',
    color: '#3370ff',
    oauth: {
      authUrl: 'https://open.larksuite.com/open-apis/authen/v1/authorize',
      tokenUrl: 'https://open.larksuite.com/open-apis/authen/v1/oidc/access_token',
      scopes: ['im:message:readonly', 'contact:user.id:readonly'],
      clientIdEnv: 'LARK_APP_ID',
      clientSecretEnv: 'LARK_APP_SECRET',
    },
  },

  // ── Email ──
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'email',
    icon: '/icons/gmail.png',
    description: 'Email threads, labels & search',
    color: '#ea4335',
    oauth: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
      clientIdEnv: 'GMAIL_CLIENT_ID',
      clientSecretEnv: 'GMAIL_CLIENT_SECRET',
    },
  },
  {
    id: 'outlook-mail',
    name: 'Outlook',
    category: 'email',
    icon: '/icons/outlook.png',
    description: 'Outlook email, folders & search',
    color: '#0078d4',
    oauth: {
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      scopes: ['Mail.Read', 'Mail.ReadBasic'],
      clientIdEnv: 'OUTLOOK_CLIENT_ID',
      clientSecretEnv: 'OUTLOOK_CLIENT_SECRET',
    },
  },

  // ── Calendar ──
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    category: 'calendar',
    icon: '/icons/google-calendar.png',
    description: 'Events, meetings & agendas',
    color: '#4285f4',
    oauth: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
      clientIdEnv: 'GOOGLE_CALENDAR_CLIENT_ID',
      clientSecretEnv: 'GOOGLE_CALENDAR_CLIENT_SECRET',
    },
  },
  {
    id: 'outlook-calendar',
    name: 'Outlook Calendar',
    category: 'calendar',
    icon: '/icons/outlook-calendar.png',
    description: 'Outlook events & meetings',
    color: '#0078d4',
    oauth: {
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      scopes: ['Calendars.Read'],
      clientIdEnv: 'OUTLOOK_CLIENT_ID',
      clientSecretEnv: 'OUTLOOK_CLIENT_SECRET',
    },
  },

  // ── Tasks ──
  {
    id: 'jira',
    name: 'Jira',
    category: 'tasks',
    icon: '/icons/jira.png',
    description: 'Issues, sprints & project boards',
    color: '#0052cc',
    oauth: {
      authUrl: 'https://auth.atlassian.com/authorize',
      tokenUrl: 'https://auth.atlassian.com/oauth/token',
      scopes: ['read:jira-work', 'read:jira-user'],
      clientIdEnv: 'JIRA_CLIENT_ID',
      clientSecretEnv: 'JIRA_CLIENT_SECRET',
    },
  },
  {
    id: 'trello',
    name: 'Trello',
    category: 'tasks',
    icon: '/icons/trello.png',
    description: 'Boards, cards & checklists',
    color: '#0079bf',
    oauth: {
      authUrl: 'https://trello.com/1/authorize',
      tokenUrl: 'https://trello.com/1/OAuthGetAccessToken',
      scopes: ['read'],
      clientIdEnv: 'TRELLO_API_KEY',
      clientSecretEnv: 'TRELLO_API_SECRET',
    },
  },
  {
    id: 'linear',
    name: 'Linear',
    category: 'tasks',
    icon: '/icons/linear.png',
    description: 'Issues, projects & cycles',
    color: '#5e6ad2',
    oauth: {
      authUrl: 'https://linear.app/oauth/authorize',
      tokenUrl: 'https://api.linear.app/oauth/token',
      scopes: ['read'],
      clientIdEnv: 'LINEAR_CLIENT_ID',
      clientSecretEnv: 'LINEAR_CLIENT_SECRET',
    },
  },
];

export const CONNECTOR_CATEGORIES: { id: ConnectorCategory; label: string; icon: string }[] = [
  { id: 'ai', label: 'AI Tools', icon: '🧠' },
  { id: 'communication', label: 'Communication', icon: '💬' },
  { id: 'email', label: 'Email', icon: '✉️' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'tasks', label: 'Task Management', icon: '📋' },
];

export function getConnectorConfig(provider: string): ConnectorConfig | undefined {
  return CONNECTOR_REGISTRY.find((c) => c.id === provider);
}

export function getConnectorsByCategory(category: ConnectorCategory): ConnectorConfig[] {
  return CONNECTOR_REGISTRY.filter((c) => c.category === category);
}
