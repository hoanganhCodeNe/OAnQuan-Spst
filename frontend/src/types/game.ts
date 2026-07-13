export interface Hole {
  stones: number;
  isMandarin: boolean;
}

export interface Material {
  chapter: number;
  title: string;
  period: string;
  summary: string;
  details: string[];
  quotes: string;
}
