import { ConnectorProvider } from './connector';

export type TopicPriority = 'high' | 'medium' | 'low';

export interface Topic {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  sources: ConnectorProvider[];
  isActive: boolean;
  priority: TopicPriority;
  createdAt: Date;
  updatedAt: Date;
}

export interface TopicUpdate {
  id: string;
  topicId: string;
  source: ConnectorProvider;
  sourceId: string;
  title: string;
  summary: string;
  url: string;
  relevanceScore: number;
  metadata: Record<string, string>;
  fetchedAt: Date;
  readAt: Date | null;
}

export interface CreateTopicInput {
  name: string;
  description: string;
  keywords: string[];
  sources: ConnectorProvider[];
  priority: TopicPriority;
}
