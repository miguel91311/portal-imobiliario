import { MarketPropertyPage } from '@/components/market-property-page';

interface PageProps {
  params: { id: string };
}

export default function PTPropertyPage({ params }: PageProps) {
  return <MarketPropertyPage market="PT" id={params.id} />;
}
