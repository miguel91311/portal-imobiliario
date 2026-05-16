import { MarketPropertyPage } from '@/components/market-property-page';

interface PageProps {
  params: { id: string };
}

export default function AOPropertyPage({ params }: PageProps) {
  return <MarketPropertyPage market="AO" id={params.id} />;
}
