export type MenuCategory =
  | 'CUSCUZ'
  | 'BEBIDAS'
  | 'CAFÉ'
  | 'TAPIOCA RENDA — FRANGO'
  | 'TAPIOCA RENDA — QUEIJO'
  | 'TAPIOCA RENDA — CARNE SECA'
  | 'TAPIOCA RENDA — BANANA DA TERRA'
  | 'TAPIOCA RENDA — CALABRESA'
  | 'TAPIOCA RENDA — FITNESS'
  | 'TAPIOCAS DOCES';

export interface MenuItem {
  id: string;
  category: MenuCategory;
  name: string;
  description: string;
  price: string;
  imageUrl?: string;
  image?: string;
  ifoodUrl: string;
  ifoodLink?: string;
  rawPrice?: number;
  recipe?: string;
  tag?: string;
  featured?: boolean;
  notes?: string[];
  dietary?: string[];
  prepTime?: string;
  origin?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  milkOption?: string;
  notes?: string;
}

export interface OperatingHours {
  weekdays: string;
  saturday: string;
  sunday: string;
}

export interface StoreConfig {
  name: string;
  tagline: string;
  logoUrl?: string;
  phone: string;
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  ifoodStoreUrl: string;
  instagramHandle: string;
  instagramUrl: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    googleMapsUrl: string;
  };
  hours: OperatingHours;
}

export interface InstagramPost {
  id: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  url: string;
}

