'use client';

import { useState } from 'react';
import { Calendar, Share2, Heart, FileText, Check } from 'lucide-react';

interface CTASectionProps {
  propertyId: string;
}

export function CTASection({ propertyId }: CTASectionProps) {
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button className="btn-primary gap-2 flex-1 sm:flex-none">
        <Calendar className="w-4 h-4" />
        Agendar Visita
      </button>
      <button className="btn-ghost gap-2 flex-1 sm:flex-none">
        <FileText className="w-4 h-4" />
        Solicitar Brochura
      </button>
      <button
        onClick={() => setLiked(!liked)}
        className={`p-3 rounded-xl border transition-all ${
          liked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-cream-50 border-border text-foreground-muted hover:border-olive-300'
        }`}
      >
        <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
      </button>
      <button
        onClick={handleShare}
        className="p-3 rounded-xl border border-border bg-cream-50 text-foreground-muted hover:border-olive-300 transition-all"
      >
        {shared ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
      </button>
    </div>
  );
}
