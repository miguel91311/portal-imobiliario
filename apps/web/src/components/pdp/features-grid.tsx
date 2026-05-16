import { BedDouble, Bath, Maximize, Car, TreePine, Waves, Zap, Footprints } from 'lucide-react';
import { PropertyFeatures } from '@/types/property';
import { getWalkScoreLabel } from '@/lib/data';

interface FeaturesGridProps {
  features: PropertyFeatures;
  typology: string;
}

export function FeaturesGrid({ features, typology }: FeaturesGridProps) {
  const walkLabel = features.walkScore ? getWalkScoreLabel(features.walkScore) : null;

  const items = [
    { icon: BedDouble, label: 'Quartos', value: features.bedrooms.toString() },
    { icon: Bath, label: 'Casas de Banho', value: features.bathrooms.toString() },
    { icon: Maximize, label: 'Área Bruta', value: `${features.sqm} m²` },
    { icon: Car, label: 'Estacionamento', value: features.parking ? `${features.parking} lugares` : 'N/A' },
    { icon: TreePine, label: 'Jardim', value: features.garden ? 'Sim' : 'Não' },
    { icon: Waves, label: 'Piscina', value: features.pool ? 'Sim' : 'Não' },
    { icon: Zap, label: 'Certificado Energético', value: features.energyCertificate || 'N/A' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-heading-2 text-foreground">Características</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Tipologia em destaque */}
        <div className="p-4 rounded-xl bg-olive-50 border border-olive-100 flex flex-col items-center text-center gap-2">
          <span className="text-overline text-olive-400 uppercase tracking-wider">Tipologia</span>
          <span className="font-serif text-heading-1 text-olive-500">{typology}</span>
        </div>

        {items.map((item) => (
          <div
            key={item.label}
            className="p-4 rounded-xl bg-cream-50 border border-border flex flex-col items-center text-center gap-2 hover:border-olive-200 transition-colors"
          >
            <item.icon className="w-5 h-5 text-foreground-muted" />
            <span className="text-overline text-foreground-muted uppercase tracking-wider">{item.label}</span>
            <span className="text-body font-medium text-foreground">{item.value}</span>
          </div>
        ))}

        {/* Walk Score */}
        {walkLabel && (
          <div className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 ${walkLabel.color}`}>
            <Footprints className="w-5 h-5 opacity-70" />
            <span className="text-overline uppercase tracking-wider opacity-70">Walk Score</span>
            <span className="text-body font-medium">{features.walkScore}</span>
            <span className="text-caption text-center leading-tight">{walkLabel.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
