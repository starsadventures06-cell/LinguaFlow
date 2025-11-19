export enum AppView {
  DASHBOARD = 'DASHBOARD',
  LIVE_TUTOR = 'LIVE_TUTOR',
  SCENE_BUILDER = 'SCENE_BUILDER',
  IMMERSION_VIDEO = 'IMMERSION_VIDEO',
  CULTURAL_INSIGHTS = 'CULTURAL_INSIGHTS'
}

export interface LanguageLevel {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  title: string;
  description: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingUrls?: Array<{uri: string; title: string}>;
}

// Define a simpler interface for the global aistudio object
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}