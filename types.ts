export interface LocalizedText {
  title: string;
  desc: string;
}

export interface Cartoon {
  id: string;
  imageUrl: string;
  ru: LocalizedText;
  en: LocalizedText;
  tr: LocalizedText;
}

export type GameState = 'menu' | 'playing' | 'paused' | 'result' | 'gameover' | 'shop';

export type Language = 'ru' | 'en' | 'tr';

export interface PlayerStats {
    highScore: number;
    totalStars: number;
}