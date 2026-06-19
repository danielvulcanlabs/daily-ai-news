export type DigestStatus = 'generating' | 'ready' | 'error';

export interface DigestStory {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  sourceFavicon: string;
  tags: DigestTag[];
  publishedAt: Date;
  relevanceScore: number;
  section: 'hero' | 'watch' | 'card' | 'briefing' | 'deepdive' | 'note';
  bullets?: string[];     // hero + deepdive
  stats?: DigestStat[];   // hero only
  companyMark?: string;   // company logo identifier
}

export interface DigestTag {
  label: string;
  color: 'gold' | 'blue' | 'teal' | 'red' | 'purple';
}

export interface DigestStat {
  label: string;
  value: string;
}

export interface DigestRepo {
  name: string;
  url: string;
  stars: number;
  weeklyStarSpike: number;
  language: string;
  license: string;
  description: string;
  relevanceTag: string;
}

export interface Digest {
  id: string;              // date string "2026-05-28"
  issueNumber: number;
  generatedAt: Date;
  updatedAt: Date;
  status: DigestStatus;
  stories: DigestStory[];
  repos: DigestRepo[];
  stats: {
    totalStories: number;
    sourcesQueried: number;
    topicsMatched: number;
  };
  signalSources: string[];
}
