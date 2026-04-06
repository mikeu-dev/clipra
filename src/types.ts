export interface TiktokExtraction {
  id: string;
  type: 'video' | 'image';
  video?: string;
  hdplay?: string;
  wmplay?: string;
  music?: string;
  images?: string[];
  cover: string;
  caption: string;
  author: string | {
    nickname: string;
    uniqueId: string;
  };
}

export interface ExtractionResult {
  success: boolean;
  data?: TiktokExtraction;
  error?: string;
}

export interface StrategyResult extends ExtractionResult {
  layer: string;
  isCached?: boolean;
}
