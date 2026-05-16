'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    try {
      const token = localStorage.getItem('portal_token');
      if (!token) {
        setFavorites([]);
        setIsLoading(false);
        return;
      }
      const data = await api.getFavorites();
      setFavorites(data.value.map((f: any) => f.propertyId));
    } catch {
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (propertyId: string) => favorites.includes(propertyId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      const token = localStorage.getItem('portal_token');
      if (!token) return false;

      try {
        if (favorites.includes(propertyId)) {
          await api.removeFavorite(propertyId);
          setFavorites((prev) => prev.filter((id) => id !== propertyId));
          return false;
        } else {
          await api.addFavorite(propertyId);
          setFavorites((prev) => [...prev, propertyId]);
          return true;
        }
      } catch {
        return favorites.includes(propertyId);
      }
    },
    [favorites]
  );

  return { favorites, isLoading, isFavorite, toggleFavorite, refresh: fetchFavorites };
}
