
export interface ModelData {
  id: string;
  title: string;
  description: string;
  category: 'Physics' | 'Astrology' | 'Quantum';
  thumbnail: string;
  complexity: 'Simple' | 'Medium' | 'Complex';
}

export type AppView = 'catalog' | 'active-model';
