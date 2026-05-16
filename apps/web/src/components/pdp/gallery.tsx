'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { PropertyImage } from '@/types/property';

interface GalleryProps {
  images: PropertyImage[];
  title: string;
}

export function Gallery({ images, title }: GalleryProps) {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (!images.length) return null;

  const next = () => setCurrent((c) => (c + 1) % images.length);
  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);

  return (
    <>
      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 rounded-2xl overflow-hidden">
        {/* Imagem principal */}
        <div className="lg:col-span-2 relative aspect-[16/10] group cursor-pointer" onClick={() => setFullscreen(true)}>
          <Image
            src={images[current].url}
            alt={images[current].alt}
            fill
            className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <button className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur rounded-full text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <Expand className="w-5 h-5" />
          </button>
        </div>

        {/* Thumbnails verticais */}
        <div className="hidden lg:flex flex-col gap-3">
          {images.slice(0, 3).map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative flex-1 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                current === i ? 'border-accent' : 'border-transparent hover:border-border'
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="33vw"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Navegação mobile */}
      <div className="flex lg:hidden items-center justify-between mt-3 px-1">
        <button onClick={prev} className="p-2 rounded-full bg-cream-200 hover:bg-cream-300 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-caption text-foreground-muted">
          {current + 1} / {images.length}
        </span>
        <button onClick={next} className="p-2 rounded-full bg-cream-200 hover:bg-cream-300 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <Image
            src={images[current].url}
            alt={images[current].alt}
            fill
            className="object-contain p-8"
            sizes="100vw"
          />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <button onClick={prev} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-white text-sm">{current + 1} / {images.length}</span>
            <button onClick={next} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
