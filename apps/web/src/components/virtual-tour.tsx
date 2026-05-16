'use client';

import { useState } from 'react';
import { Eye, ExternalLink, X } from 'lucide-react';

interface VirtualTourProps {
  url?: string | null;
  title?: string;
}

export function VirtualTour({ url, title }: VirtualTourProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!url) return null;

  const isMatterport = url.includes('matterport.com');

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border bg-cream-50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Eye className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-serif text-heading-3 text-foreground">Visita Virtual 360°</h3>
            <p className="text-caption text-foreground-muted mt-0.5">
              {isMatterport ? 'Powered by Matterport' : 'Tour virtual interativo'}
            </p>
          </div>
        </div>
      </div>

      <div className="relative aspect-video bg-cream-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-dark transition-colors shadow-elevated"
          >
            <Eye className="w-5 h-5" />
            Iniciar Tour Virtual
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl h-[80vh] bg-black rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <iframe
              src={url}
              title={`Virtual Tour - ${title || 'Propriedade'}`}
              className="w-full h-full border-0"
              allow="xr-spatial-tracking; fullscreen"
            />
          </div>
        </div>
      )}
    </div>
  );
}
