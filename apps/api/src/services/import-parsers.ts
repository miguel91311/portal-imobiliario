export interface ParsedProperty {
  title: string;
  description: string;
  price: number; // in euros/units (will be converted to cents if EUR)
  currency: string;
  address: string;
  city: string;
  country: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  typology: string;
  bedrooms: number;
  bathrooms: number;
  sqm: number;
  parking?: number;
  pool?: boolean;
  garden?: boolean;
  energyCertificate?: string;
  listingType: 'sale' | 'rent';
  images: { url: string; alt: string; isPrimary?: boolean }[];
  tags?: string[];
  externalId?: string;
  source?: string;
}

// --- CSV Parser ---
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCSV(content: string): ParsedProperty[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  const properties: ParsedProperty[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 3) continue;

    const get = (name: string) => {
      const idx = headers.findIndex((h) => h.includes(name.toLowerCase()));
      return idx >= 0 ? values[idx] || '' : '';
    };

    const rawPrice = get('preco') || get('price') || get('valor') || '0';
    const priceNum = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0;

    const rawImages = get('fotos') || get('imagens') || get('images') || '';
    const imageUrls = rawImages
      .split(/[;|]/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http'));

    const p: ParsedProperty = {
      title: get('titulo') || get('title') || 'Sem título',
      description: get('descricao') || get('description') || '',
      price: priceNum,
      currency: (get('moeda') || get('currency') || 'EUR').toUpperCase(),
      address: get('morada') || get('address') || 'N/D',
      city: get('localidade') || get('city') || 'N/D',
      country: (get('pais') || get('country') || 'PT').toUpperCase(),
      neighborhood: get('bairro') || get('neighborhood') || get('zona') || '',
      latitude: parseFloat(get('latitude')) || 0,
      longitude: parseFloat(get('longitude')) || 0,
      typology: get('tipologia') || get('typology') || 'T1',
      bedrooms: parseInt(get('quartos') || get('bedrooms') || '0', 10) || 0,
      bathrooms: parseInt(get('casasbanho') || get('bathrooms') || get('wc') || '0', 10) || 0,
      sqm: parseInt(get('area') || get('sqm') || get('metros') || '0', 10) || 0,
      parking: parseInt(get('estacionamento') || get('parking') || '0', 10) || 0,
      pool: ['sim', 'yes', '1', 'true'].includes((get('piscina') || get('pool')).toLowerCase()),
      garden: ['sim', 'yes', '1', 'true'].includes((get('jardim') || get('garden')).toLowerCase()),
      energyCertificate: get('certificado') || get('energetico') || get('energy') || undefined,
      listingType: ['aluguer', 'rent', 'arrendamento', 'aluguel'].includes(
        (get('negocio') || get('listingtype') || get('tipo')).toLowerCase()
      )
        ? 'rent'
        : 'sale',
      images: imageUrls.map((url, i) => ({ url, alt: `Imagem ${i + 1}`, isPrimary: i === 0 })),
      tags: (get('tags') || get('etiquetas'))
        .split(/[,;]/)
        .map((t) => t.trim())
        .filter(Boolean),
      source: 'csv',
    };

    properties.push(p);
  }

  return properties;
}

// --- OpenImmo XML Parser ---
export function parseOpenImmo(xml: string): ParsedProperty[] {
  const properties: ParsedProperty[] = [];

  const objektMatches = xml.match(/<objekt>[\s\S]*?<\/objekt>/g);
  if (!objektMatches) return properties;

  for (const obj of objektMatches) {
    const getTag = (tag: string) => {
      const m = obj.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`));
      return m ? m[1].trim() : '';
    };
    const getAttr = (tag: string, attr: string) => {
      const m = obj.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*>`));
      return m ? m[1].trim() : '';
    };

    const title = getTag('objekttitel') || 'Sem título';
    const description = getTag('objektbeschreibung') || '';
    const kaufpreis = parseFloat(getTag('kaufpreis')) || 0;
    const miete = parseFloat(getTag('nettokaltmiete')) || 0;
    const price = kaufpreis || miete;
    const listingType = kaufpreis > 0 ? 'sale' : 'rent';

    const plz = getTag('plz');
    const ort = getTag('ort');
    const strasse = getTag('strasse');

    const images: ParsedProperty['images'] = [];
    const urlMatches = obj.match(/<pfad>([^<]+)<\/pfad>/g);
    if (urlMatches) {
      urlMatches.forEach((u, i) => {
        const clean = u.replace(/<\/?pfad>/g, '').trim();
        if (clean) images.push({ url: clean, alt: `Imagem ${i + 1}`, isPrimary: i === 0 });
      });
    }

    const p: ParsedProperty = {
      title,
      description,
      price,
      currency: (getAttr('waehrung', 'iso_waehrung') || 'EUR').toUpperCase(),
      address: strasse || plz || 'N/D',
      city: ort || 'N/D',
      country: (getAttr('land', 'iso_land') || 'PT').toUpperCase(),
      neighborhood: '',
      latitude: parseFloat(getTag('breitengrad')) || 0,
      longitude: parseFloat(getTag('laengengrad')) || 0,
      typology: getAttr('wohnung', 'wohnungtyp') || 'T1',
      bedrooms: parseInt(getTag('anzahl_schlafzimmer'), 10) || 0,
      bathrooms: parseInt(getTag('anzahl_badezimmer'), 10) || 0,
      sqm: parseInt(getTag('wohnflaeche'), 10) || 0,
      parking: obj.includes('GARAGE="1"') ? 1 : 0,
      pool: obj.includes('swimmingpool') && obj.includes('>1<'),
      garden: false,
      energyCertificate: getTag('energieverbrauchkennwert') || undefined,
      listingType,
      images,
      source: 'openimmo',
    };

    properties.push(p);
  }

  return properties;
}

// --- JSON Parser ---
export function parseJSON(content: string): ParsedProperty[] {
  let data: any;
  try {
    data = JSON.parse(content);
  } catch {
    throw new Error('JSON inválido');
  }

  const items = Array.isArray(data) ? data : data.properties || data.imoveis || data.items || [];

  return items.map((item: any, idx: number) => {
    const rawPrice =
      item.price || item.preco || item.valor || item.purchasePrice || item.rentPrice || 0;
    const priceNum = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0 : Number(rawPrice) || 0;

    const rawImages = item.images || item.fotos || item.imagens || item.photos || [];
    const images: ParsedProperty['images'] = Array.isArray(rawImages)
      ? rawImages.map((img: any, i: number) => {
          if (typeof img === 'string') return { url: img, alt: `Imagem ${i + 1}`, isPrimary: i === 0 };
          return {
            url: img.url || img.src || img.link || '',
            alt: img.alt || img.title || `Imagem ${i + 1}`,
            isPrimary: img.isPrimary || i === 0,
          };
        }).filter((img: any) => img.url && img.url.startsWith('http'))
      : [];

    const rawTags = item.tags || item.etiquetas || item.features || item.caracteristicas || [];
    const tags = Array.isArray(rawTags)
      ? rawTags.map(String)
      : typeof rawTags === 'string'
      ? rawTags.split(/[,;|]/).map((t: string) => t.trim()).filter(Boolean)
      : [];

    const listingTypeRaw =
      item.listingType || item.tipoNegocio || item.operation || item.businessType || 'sale';
    const listingType = ['rent', 'aluguer', 'arrendamento', 'aluguel', 'lease'].includes(
      String(listingTypeRaw).toLowerCase()
    )
      ? 'rent'
      : 'sale';

    return {
      title: item.title || item.titulo || `Imóvel ${idx + 1}`,
      description: item.description || item.descricao || item.details || '',
      price: priceNum,
      currency: (item.currency || item.moeda || 'EUR').toUpperCase(),
      address: item.address || item.morada || item.street || item.location?.address || 'N/D',
      city: item.city || item.localidade || item.town || item.location?.city || 'N/D',
      country: (item.country || item.pais || item.location?.country || 'PT').toUpperCase(),
      neighborhood:
        item.neighborhood || item.bairro || item.district || item.location?.neighborhood || '',
      latitude:
        item.latitude || item.lat || item.location?.latitude || item.location?.coordinates?.lat ||
        item.location?.coordinates?.latitude || 0,
      longitude:
        item.longitude || item.lng || item.location?.longitude || item.location?.coordinates?.lng ||
        item.location?.coordinates?.longitude || 0,
      typology: item.typology || item.tipologia || item.type || item.propertyType || 'T1',
      bedrooms: Number(item.bedrooms || item.quartos || item.rooms || 0) || 0,
      bathrooms: Number(item.bathrooms || item.casasBanho || item.wc || item.baths || 0) || 0,
      sqm: Number(item.sqm || item.area || item.metros || item.size || 0) || 0,
      parking: Number(item.parking || item.estacionamento || item.garage || 0) || 0,
      pool: Boolean(item.pool || item.piscina),
      garden: Boolean(item.garden || item.jardim),
      energyCertificate: item.energyCertificate || item.certificadoEnergetico || item.energyRating || undefined,
      listingType,
      images,
      tags,
      externalId: item.id || item.externalId || item.reference || undefined,
      source: 'json',
    };
  });
}

// --- URL Scraper (JSON-LD + Meta) ---
export async function scrapePropertyFromURL(url: string): Promise<ParsedProperty> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
    });
    html = await res.text();
  } catch (err: any) {
    clearTimeout(timeout);
    throw new Error(`Não foi possível aceder ao URL: ${err.message}`);
  }
  clearTimeout(timeout);

  // Try JSON-LD first
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    try {
      const data = JSON.parse(jsonLdMatch[1]);
      const item = Array.isArray(data) ? data.find((d: any) => d['@type'] === 'Residence' || d['@type'] === 'Product' || d['@type'] === 'RealEstateListing') || data[0] : data;

      if (item) {
        const price =
          typeof item.price === 'number'
            ? item.price
            : typeof item.price === 'string'
            ? parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0
            : item.offers?.price
            ? parseFloat(String(item.offers.price).replace(/[^0-9.]/g, '')) || 0
            : 0;

        const images: ParsedProperty['images'] = [];
        const rawImgs = item.image || item.photo || item.photos || [];
        if (Array.isArray(rawImgs)) {
          rawImgs.forEach((img: any, i: number) => {
            const url = typeof img === 'string' ? img : img.url || img.contentUrl;
            if (url) images.push({ url, alt: `Imagem ${i + 1}`, isPrimary: i === 0 });
          });
        } else if (typeof rawImgs === 'string') {
          images.push({ url: rawImgs, alt: 'Imagem principal', isPrimary: true });
        }

        const addressObj = item.address || {};
        const locality = addressObj.addressLocality || addressObj.addressRegion || '';

        return {
          title: item.name || item.headline || 'Sem título',
          description: item.description || '',
          price,
          currency: (item.priceCurrency || 'EUR').toUpperCase(),
          address: addressObj.streetAddress || 'N/D',
          city: locality,
          country: (addressObj.addressCountry || 'PT').toUpperCase(),
          neighborhood: locality,
          latitude: item.geo?.latitude || 0,
          longitude: item.geo?.longitude || 0,
          typology: item.numberOfRooms ? `T${item.numberOfRooms}` : 'T1',
          bedrooms: item.numberOfRooms || 0,
          bathrooms: item.numberOfBathroomsTotal || 0,
          sqm: item.floorSize?.value || item.livingArea?.value || 0,
          parking: item.parkingSpace ? 1 : 0,
          pool: (item.amenityFeature || []).some((a: any) => a.value && (a.name || '').toLowerCase().includes('pool')),
          garden: (item.amenityFeature || []).some((a: any) => a.value && (a.name || '').toLowerCase().includes('garden')),
          energyCertificate: undefined,
          listingType: (item.businessFunction || item.offers?.businessFunction || '').toLowerCase().includes('rent') ? 'rent' : 'sale',
          images,
          tags: [],
          externalId: url,
          source: 'url',
        };
      }
    } catch {
      // ignore JSON-LD parse errors
    }
  }

  // Fallback: meta tags + og tags
  const meta = (name: string) => {
    const m = html.match(new RegExp(`<meta[^>]+(?:name|property)="${name}"[^>]+content="([^"]+)"`, 'i'));
    return m ? m[1] : '';
  };

  const ogTitle = meta('og:title');
  const ogDesc = meta('og:description');
  const ogImage = meta('og:image');

  const priceMatch = html.match(/(\d[\d.\s]*(?:\.\d{3})*,?\d{0,2})\s*€/) || html.match(/€\s*(\d[\d.,\s]*)/);
  const price = priceMatch ? parseFloat(priceMatch[1].replace(/[.\s]/g, '').replace(',', '.')) || 0 : 0;

  const images: ParsedProperty['images'] = ogImage ? [{ url: ogImage, alt: 'Imagem principal', isPrimary: true }] : [];

  return {
    title: ogTitle || 'Sem título',
    description: ogDesc || '',
    price,
    currency: 'EUR',
    address: 'N/D',
    city: 'N/D',
    country: 'PT',
    neighborhood: '',
    latitude: 0,
    longitude: 0,
    typology: 'T1',
    bedrooms: 0,
    bathrooms: 0,
    sqm: 0,
    listingType: 'sale',
    images,
    tags: [],
    externalId: url,
    source: 'url',
  };
}
