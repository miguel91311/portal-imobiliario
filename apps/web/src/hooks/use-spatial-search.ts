import { useState, useCallback } from 'react';
import { request } from '@/lib/api';

interface NearbyParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
  listingType?: 'sale' | 'rent';
  minPrice?: number;
  maxPrice?: number;
}

interface SpatialResult {
  center: { latitude: number; longitude: number };
  radiusKm: number;
  count: number;
  value: any[];
}

export function useSpatialSearch() {
  const [result, setResult] = useState<SpatialResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const searchNearby = useCallback(async (params: NearbyParams) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await request<SpatialResult>('/api/spatial/nearby', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err?.data?.error || 'Erro na pesquisa espacial');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchWithinPolygon = useCallback(async (coordinates: [number, number][], listingType?: 'sale' | 'rent') => {
    setIsLoading(true);
    setError('');
    try {
      const data = await request<any>('/api/spatial/within', {
        method: 'POST',
        body: JSON.stringify({ coordinates, listingType }),
      });
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err?.data?.error || 'Erro na pesquisa poligonal');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError('');
  }, []);

  return { result, isLoading, error, searchNearby, searchWithinPolygon, clearResult };
}
