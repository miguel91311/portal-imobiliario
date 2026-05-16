export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface PropertyImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  sqm: number;
  parking?: number;
  pool?: boolean;
  garden?: boolean;
  energyCertificate?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  walkScore?: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'EUR' | 'AOA' | 'USD';
  location: {
    address: string;
    city: string;
    country: 'PT' | 'AO';
    neighborhood: string;
    coordinates: GeoCoordinates;
  };
  typology: string; // T1, T2, T3, T4, etc.
  features: PropertyFeatures;
  images: PropertyImage[];
  status: 'available' | 'reserved' | 'sold';
  listingType: 'sale' | 'rent';
  agent?: {
    name: string;
    agency: string;
    image?: string;
  };
  tags?: string[];
  featured?: boolean;
  featuredUntil?: string;
  featuredLevel?: string;
  createdAt: string;
  updatedAt: string;
}
