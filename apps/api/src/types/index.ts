export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'agent' | 'owner' | 'buyer';
  country: 'PT' | 'AO';
  agency?: string;
  licenseId?: string;
  createdAt: string;
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
    coordinates: { latitude: number; longitude: number };
  };
  typology: string;
  features: {
    bedrooms: number;
    bathrooms: number;
    sqm: number;
    parking?: number;
    pool?: boolean;
    garden?: boolean;
    energyCertificate?: string;
    walkScore?: number;
  };
  images: Array<{ url: string; alt: string; isPrimary?: boolean }>;
  status: 'available' | 'reserved' | 'sold';
  listingType: 'sale' | 'rent';
  agentId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  propertyId: string;
  agentId?: string;
  score: number;
  status: 'hot' | 'warm' | 'cold';
  source: 'organic' | 'paid' | 'referral' | 'direct';
  notes?: string;
  createdAt: string;
}

export interface KYCRequest {
  id: string;
  agency: string;
  country: 'PT' | 'AO';
  licenseId: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  risk: 'low' | 'medium' | 'high';
  documents: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}
