'use client';

import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { useState } from 'react';

interface PropertyFavoriteButtonProps {
  propertyId: string;
  size?: 'sm' | 'md';
}

export function PropertyFavoriteButton({ propertyId, size = 'md' }: PropertyFavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [animating, setAnimating] = useState(false);
  const favorited = isFavorite(propertyId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAnimating(true);
    await toggleFavorite(propertyId);
    setTimeout(() => setAnimating(false), 300);
  };

  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses} rounded-full bg-white/90 backdrop-blur-sm shadow-soft flex items-center justify-center hover:bg-white transition-all ${animating ? 'scale-110' : 'scale-100'}`}
      aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Heart
        className={`${iconSize} transition-colors ${favorited ? 'text-red-500 fill-red-500' : 'text-foreground-muted'}`}
      />
    </button>
  );
}
