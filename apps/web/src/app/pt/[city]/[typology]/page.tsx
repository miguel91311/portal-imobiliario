import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MarketExplorarPage } from '@/components/market-explorar-page';

const VALID_CITIES = ['lisboa', 'porto', 'cascais', 'matosinhos', 'lagos', 'evora', 'benguela', 'luanda', 'lubango'];
const VALID_TYPOLOGIES = ['t1', 't2', 't3', 't4', 't5', 't6', 't1+1', 't2+1', 't3+1', 't4+1', 't5+1'];

export async function generateMetadata({ params }: { params: { city: string; typology: string } }): Promise<Metadata> {
  const city = params.city;
  const typology = params.typology.toUpperCase();
  const cityFormatted = city.charAt(0).toUpperCase() + city.slice(1);
  return {
    title: `${typology} em ${cityFormatted} · Portal Premium`,
    description: `Encontre ${typology} para comprar ou arrendar em ${cityFormatted}. Propriedades premium curadas com avaliação preditiva e simulação fiscal.`,
  };
}

export function generateStaticParams() {
  const params: { city: string; typology: string }[] = [];
  for (const city of VALID_CITIES) {
    for (const typology of VALID_TYPOLOGIES) {
      params.push({ city, typology });
    }
  }
  return params;
}

export default function SEOCityTypologyPage({ params }: { params: { city: string; typology: string } }) {
  if (!VALID_CITIES.includes(params.city.toLowerCase()) || !VALID_TYPOLOGIES.includes(params.typology.toLowerCase())) {
    notFound();
  }

  return <MarketExplorarPage market="PT" />;
}
