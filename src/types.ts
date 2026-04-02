export interface TiktokExtraction {
  type: 'video' | 'image';
  video?: string;
  images?: string[];
  cover: string;
  caption: string;
  author: string;
}

export interface ExtractionResult {
  success: boolean;
  data?: TiktokExtraction;
  error?: string;
}

export interface StrategyResult extends ExtractionResult {
  layer: string;
}
