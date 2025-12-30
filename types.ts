
export enum Category {
  MEDICINE = 'Medicine',
  SKINCARE = 'Skincare',
  SUPPLEMENT = 'Supplement'
}

export interface Product {
  id: string;
  name: string;
  hindiName?: string;
  category: Category;
  benefits: string;
  hindiBenefits?: string;
  dosage: string;
  hindiDosage?: string;
  description: string;
  ingredients: string[];
  searchKeywords?: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Recommendation {
  productId: string;
  reason: string;
  priority: 'High' | 'Medium';
}
