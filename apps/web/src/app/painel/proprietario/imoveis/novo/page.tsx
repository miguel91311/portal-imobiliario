'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Check, X, MapPin } from 'lucide-react';
import Link from 'next/link';

const LocationPickerMap = dynamic(() => import('@/components/location-picker-map').then((mod) => mod.LocationPickerMap), { ssr: false });

const TIPOS_IMOVEL = [
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'moradia', label: 'Moradia' },
  { value: 'loft', label: 'Loft' },
  { value: 'escritorio', label: 'Escritório' },
  { value: 'loja', label: 'Loja' },
  { value: 'terreno', label: 'Terreno' },
];

export default function NewPropertyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Dados básicos
  const [tipo, setTipo] = useState('apartamento');
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [operacao, setOperacao] = useState<'venda' | 'arrendamento'>('venda');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [localidade, setLocalidade] = useState('');
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [moradaConfirmada, setMoradaConfirmada] = useState(false);

  // Step 2: Detalhes
  const [areaBruta, setAreaBruta] = useState('');
  const [areaUtil, setAreaUtil] = useState('');
  const [quartos, setQuartos] = useState(0);
  const [casasBanho, setCasasBanho] = useState(0);
  const [andar, setAndar] = useState('');
  const [porta, setPorta] = useState('');
  const [bloco, setBloco] = useState('');
  const [urbanizacao, setUrbanizacao] = useState('');
  const [tipoCasa, setTipoCasa] = useState('');
  const [situacao, setSituacao] = useState<'disponivel' | 'arrendado'>('disponivel');
  const [estado, setEstado] = useState('');
  const [eficienciaEnergetica, setEficienciaEnergetica] = useState('');
  const [certificadoEnergetico, setCertificadoEnergetico] = useState('');
  const [caracteristicas, setCaracteristicas] = useState<string[]>([]);
  const [preco, setPreco] = useState('');
  const [condominio, setCondominio] = useState('');
  const [descricao, setDescricao] = useState('');
  const [hideAddress, setHideAddress] = useState(false);
  const [comPlanta, setComPlanta] = useState(false);
  const [comVisitaVirtual, setComVisitaVirtual] = useState(false);

  // Step 3: Fotos
  const [images, setImages] = useState<{ url: string; alt: string; isPrimary: boolean }[]>([]);

  const toggleCaracteristica = (c: string) => {
    setCaracteristicas((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const addImageUrl = () => {
    const url = prompt('URL da imagem:');
    if (url) {
      setImages((prev) => [...prev, { url, alt: 'Imóvel', isPrimary: prev.length === 0 }]);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const verificarMorada = async () => {
    if (!localidade || !rua) return;
    try {
      const query = `${rua} ${numero}, ${localidade}, Portugal`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMapPosition([lat, lon]);
        setMoradaConfirmada(true);
      } else {
        setError('Morada não encontrada. Verifica os dados introduzidos.');
      }
    } catch {
      setError('Erro ao verificar morada. Tenta novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.createProperty({
        title: `${TIPOS_IMOVEL.find((t) => t.value === tipo)?.label} em ${localidade}`,
        description: descricao,
        price: Number(preco),
        currency: 'EUR',
        location: {
          address: `${rua}, ${numero}`,
          city: localidade,
          country: 'PT',
          neighborhood: localidade,
          coordinates: {
            latitude: mapPosition?.[0] || 38.7,
            longitude: mapPosition?.[1] || -9.1,
          },
        },
        typology: `T${quartos}`,
        features: {
          bedrooms: quartos,
          bathrooms: casasBanho,
          sqm: Number(areaBruta) || 0,
          parking: caracteristicas.includes('garagem') ? 1 : 0,
          pool: caracteristicas.includes('piscina'),
          garden: caracteristicas.includes('jardim'),
          elevator: caracteristicas.includes('elevador'),
          balcony: caracteristicas.includes('varanda'),
          terrace: caracteristicas.includes('terraço'),
          airConditioning: caracteristicas.includes('ar condicionado'),
          storageRoom: caracteristicas.includes('armários embutidos'),
          energyCertificate: eficienciaEnergetica || certificadoEnergetico || undefined,
          condition: estado || undefined,
          floor: andar || undefined,
          hideAddress,
          door: porta || undefined,
          block: bloco || undefined,
          urbanization: urbanizacao || undefined,
          propertyType: tipoCasa || undefined,
          situation: situacao || undefined,
          hasFloorPlan: comPlanta,
          hasVirtualTour: comVisitaVirtual,
        },
        images: images.length > 0 ? images : [{ url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', alt: 'Imóvel', isPrimary: true }],
        listingType: operacao === 'venda' ? 'sale' : 'rent',
        tags: caracteristicas,
      });

      router.push('/painel/proprietario/imoveis');
    } catch (err: any) {
      setError(err?.data?.error || 'Erro ao criar anúncio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="proprietario" userName={user?.name || 'Proprietário'} userRole="Proprietário" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-4xl mx-auto">
            <div className="mb-8">
              <Link href="/painel/proprietario/imoveis" className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground mb-4">
                <ArrowLeft className="w-4 h-4" />
                Voltar aos anúncios
              </Link>
              <h1 className="font-serif text-heading-1 text-foreground">Novo Anúncio</h1>
              <p className="text-body text-foreground-muted mt-1">Publique o seu imóvel no Portal Premium</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6 space-y-10">
              {/* ===== SECÇÃO 1: DADOS BÁSICOS ===== */}
              <div className="space-y-4">
                <h3 className="font-serif text-heading-3 text-foreground">Dados básicos</h3>

                {/* Tipo de imóvel — dropdown nativo */}
                <div>
                  <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Tipo de imóvel</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                  >
                    {TIPOS_IMOVEL.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Operação */}
                <div>
                  <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Operação</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOperacao('venda')}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm border transition-colors ${
                        operacao === 'venda'
                          ? 'bg-olive-500 text-white border-olive-500'
                          : 'bg-white text-foreground border-border hover:bg-cream-50'
                      }`}
                    >
                      Venda
                    </button>
                    <button
                      type="button"
                      onClick={() => setOperacao('arrendamento')}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm border transition-colors ${
                        operacao === 'arrendamento'
                          ? 'bg-olive-500 text-white border-olive-500'
                          : 'bg-white text-foreground border-border hover:bg-cream-50'
                      }`}
                    >
                      Arrendamento
                    </button>
                  </div>
                </div>

                {/* Localização com verificação e mapa */}
                <div className="space-y-3">
                  <label className="block text-overline text-foreground-muted uppercase tracking-wider">Localização do imóvel</label>

                  <div>
                    <label className="block text-sm text-foreground-muted mb-1">Localidade</label>
                    <input
                      required
                      type="text"
                      value={localidade}
                      onChange={(e) => setLocalidade(e.target.value)}
                      placeholder="Ex: Lisboa, Porto, Cascais..."
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-foreground-muted mb-1">Rua</label>
                    <input
                      required
                      type="text"
                      value={rua}
                      onChange={(e) => setRua(e.target.value)}
                      placeholder="Ex: Rua Augusta"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-foreground-muted mb-1">Número</label>
                      <input
                        type="text"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        placeholder="Ex: 42, 3º Esq."
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={verificarMorada}
                    disabled={!localidade || !rua}
                    className="px-6 py-2.5 bg-olive-500 text-white rounded-xl font-medium hover:bg-olive-600 transition-colors disabled:opacity-50"
                  >
                    Verificar morada
                  </button>

                  {moradaConfirmada && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Morada confirmada: {rua}, {numero}, {localidade}
                    </div>
                  )}

                  <LocationPickerMap
                    mapPosition={mapPosition}
                    setMapPosition={setMapPosition}
                    onAddressChange={(addr) => {
                      if (addr.address) setRua(addr.address);
                      if (addr.city) setLocalidade(addr.city);
                    }}
                  />
                </div>
              </div>

              {/* ===== SECÇÃO 2: DETALHES ===== */}
              <div className="space-y-4 pt-6 border-t border-border">
                <h3 className="font-serif text-heading-3 text-foreground">Detalhes do imóvel</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">m² área bruta</label>
                    <input
                      type="number"
                      value={areaBruta}
                      onChange={(e) => setAreaBruta(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">m² úteis (opcional)</label>
                    <input
                      type="number"
                      value={areaUtil}
                      onChange={(e) => setAreaUtil(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Número de quartos</label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setQuartos(Math.max(0, quartos - 1))} className="w-10 h-10 rounded-xl border border-border bg-white hover:bg-cream-200">-</button>
                      <span className="w-10 text-center font-medium">{quartos}</span>
                      <button type="button" onClick={() => setQuartos(quartos + 1)} className="w-10 h-10 rounded-xl border border-border bg-white hover:bg-cream-200">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Casas de banho</label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setCasasBanho(Math.max(0, casasBanho - 1))} className="w-10 h-10 rounded-xl border border-border bg-white hover:bg-cream-200">-</button>
                      <span className="w-10 text-center font-medium">{casasBanho}</span>
                      <button type="button" onClick={() => setCasasBanho(casasBanho + 1)} className="w-10 h-10 rounded-xl border border-border bg-white hover:bg-cream-200">+</button>
                    </div>
                  </div>
                </div>

                {/* Ocultar morada */}
                <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white cursor-pointer hover:bg-cream-100">
                  <input
                    type="checkbox"
                    checked={hideAddress}
                    onChange={(e) => setHideAddress(e.target.checked)}
                    className="w-4 h-4 text-olive-500"
                  />
                  <span className="text-sm">Não mostrar o número da rua e o andar no anúncio <span className="text-xs text-olive-600">(pago)</span></span>
                </label>

                {/* Andar, Porta, Bloco, Urbanização */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Andar</label>
                    <select
                      value={andar}
                      onChange={(e) => setAndar(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                    >
                      <option value="">Seleciona</option>
                      <option value="last">Último andar</option>
                      <option value="intermediate">Andares intermédios</option>
                      <option value="ground">Rés-do-chão</option>
                      <option value="basement">Cave</option>
                      <option value="mezzanine">Mezanino</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Porta</label>
                    <select
                      value={porta}
                      onChange={(e) => setPorta(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                    >
                      <option value="">Seleciona</option>
                      <option value="left">Esquerda</option>
                      <option value="right">Direita</option>
                      <option value="front">Frente</option>
                      <option value="back">Trás</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Bloco / Entrada</label>
                    <input
                      type="text"
                      value={bloco}
                      onChange={(e) => setBloco(e.target.value)}
                      placeholder="Ex: Bloco A, Entrada 2"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Urbanização</label>
                    <input
                      type="text"
                      value={urbanizacao}
                      onChange={(e) => setUrbanizacao(e.target.value)}
                      placeholder="Ex: Urbanização das Flores"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                    />
                  </div>
                </div>

                {/* Tipo de casa */}
                <div>
                  <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Tipo de casa</label>
                  <select
                    value={tipoCasa}
                    onChange={(e) => setTipoCasa(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                  >
                    <option value="">Seleciona</option>
                    <optgroup label="Apartamentos">
                      <option value="apartment">Apartamento</option>
                      <option value="penthouse">Penthouse</option>
                      <option value="duplex">Duplex</option>
                      <option value="loft">Loft</option>
                      <option value="studio">Estúdio</option>
                    </optgroup>
                    <optgroup label="Moradias">
                      <option value="detached">Moradia isolada</option>
                      <option value="semi-detached">Moradia geminada</option>
                      <option value="terraced">Moradia em banda</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="villa">Villa</option>
                      <option value="quinta">Quinta</option>
                    </optgroup>
                    <optgroup label="Rustic">
                      <option value="rustic">Casa rústica</option>
                      <option value="farmhouse">Quinta/Herdade</option>
                      <option value="cottage">Casa de campo</option>
                    </optgroup>
                  </select>
                </div>

                {/* Situação e Estado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Situação do imóvel</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSituacao('disponivel')}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm border transition-colors ${
                          situacao === 'disponivel'
                            ? 'bg-olive-500 text-white border-olive-500'
                            : 'bg-white text-foreground border-border hover:bg-cream-50'
                        }`}
                      >
                        Disponível
                      </button>
                      <button
                        type="button"
                        onClick={() => setSituacao('arrendado')}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm border transition-colors ${
                          situacao === 'arrendado'
                            ? 'bg-olive-500 text-white border-olive-500'
                            : 'bg-white text-foreground border-border hover:bg-cream-50'
                        }`}
                      >
                        Arrendado
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Estado</label>
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                    >
                      <option value="">Seleciona</option>
                      <option value="nova-construcao">Nova construção</option>
                      <option value="bom-estado">Bom estado</option>
                      <option value="para-recuperar">Para recuperar</option>
                    </select>
                  </div>
                </div>

                {/* Características */}
                <div>
                  <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-2">Características</label>
                  <div className="flex flex-wrap gap-2">
                    {['Piscina', 'Jardim', 'Garagem', 'Terraço', 'Varanda', 'Ar condicionado', 'Elevador', 'Armários embutidos', 'Vista mar', 'Casa adaptada', 'Casa de luxo'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCaracteristica(c.toLowerCase())}
                        className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                          caracteristicas.includes(c.toLowerCase())
                            ? 'bg-olive-500 text-white border-olive-500'
                            : 'bg-white text-foreground border-border hover:bg-cream-50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Eficiência Energética */}
                <div>
                  <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-2">Eficiência energética</label>
                  <div className="flex flex-wrap gap-2">
                    {['A+', 'A', 'B', 'C', 'D', 'E', 'F'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEficienciaEnergetica(eficienciaEnergetica === c ? '' : c)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold border transition-colors ${
                          eficienciaEnergetica === c
                            ? 'bg-olive-500 text-white border-olive-500'
                            : 'bg-white text-foreground border-border hover:bg-cream-50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preço e Condomínio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Preço (€)</label>
                    <input
                      required
                      type="number"
                      value={preco}
                      onChange={(e) => setPreco(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Condomínio/mês (opcional)</label>
                    <input
                      type="number"
                      value={condominio}
                      onChange={(e) => setCondominio(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                    />
                  </div>
                </div>

                {/* Multimédia */}
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white cursor-pointer hover:bg-cream-100">
                    <input
                      type="checkbox"
                      checked={comPlanta}
                      onChange={(e) => setComPlanta(e.target.checked)}
                      className="w-4 h-4 text-olive-500"
                    />
                    <span className="text-sm">Com planta</span>
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white cursor-pointer hover:bg-cream-100">
                    <input
                      type="checkbox"
                      checked={comVisitaVirtual}
                      onChange={(e) => setComVisitaVirtual(e.target.checked)}
                      className="w-4 h-4 text-olive-500"
                    />
                    <span className="text-sm">Com visita virtual</span>
                  </label>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Descrição do anúncio</label>
                  <textarea
                    required
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                    placeholder="Descreve o imóvel: localização, estado, vistas, proximidades..."
                  />
                </div>
              </div>

              {/* ===== SECÇÃO 3: FOTOS ===== */}
              <div className="space-y-4 pt-6 border-t border-border">
                <h3 className="font-serif text-heading-3 text-foreground">Fotos</h3>
                <div className="flex flex-wrap gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-border group">
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1 left-1 px-2 py-0.5 bg-olive-500 text-white text-xs rounded-full">Principal</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-foreground-muted hover:border-olive-500 hover:text-olive-500 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Adicionar</span>
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                  <p className="font-medium mb-1">Lembra-te que...</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Fotos, plantas e vídeos atraem mais pessoas para o teu anúncio</li>
                    <li>Se tiveres uma planta do imóvel, podes tirar uma foto da mesma</li>
                    <li>Quando tirares as tuas fotografias, certifica-te de que cada divisão está arrumada, limpa e bem iluminada</li>
                  </ul>
                </div>
              </div>

              {/* ===== SUBMIT ===== */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <p className="text-caption text-foreground-muted">
                  Anúncios gratuitos restantes: <span className="font-medium text-foreground">{Math.max(0, 3 - (user?.freeListingsUsed || 0))}</span>/3
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-olive-500 text-white rounded-xl font-medium hover:bg-olive-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'A publicar...' : 'Publicar Anúncio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
