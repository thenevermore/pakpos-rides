export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cdn_url?: string | null;
  country: string;
  created_at: string;
}

export interface Motorcycle {
  id: string;
  brand_id: string;
  model_code: string;
  name: string;
  latest_price: number;
  compression_ratio: string;
  engine_type: string;
  transmission_type: string;
  category: 'sport' | 'matic' | 'bebek' | 'naked' | 'trail';
  image_url: string | null;
  cdn_url?: string | null;
  last_updated: string;
  affiliate_url?: string | null;
  brand?: Brand;
}

export interface FuelBrand {
  id: string;
  name: string;
  octane: number;
  logo_url: string | null;
  cdn_url?: string | null;
  producer: string;
  affiliate_url?: string | null;
}

export interface OilBrand {
  id: string;
  name: string;
  base_type: string;
  viscosity: string;
  certification: string;
  usage_type: 'daily' | 'touring';
  logo_url: string | null;
  cdn_url?: string | null;
  affiliate_url?: string | null;
}

export interface KnowledgeBase {
  id: string;
  motorcycle_id: string;
  min_octane: number;
  ideal_octane: number;
  fuel_brands: FuelBrand[];
  oil_daily: OilBrand[];
  oil_touring: OilBrand[];
}

export interface MotorcycleDetail extends Motorcycle {
  recommendations: KnowledgeBase;
}
