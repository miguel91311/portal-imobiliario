'use client';

import { useState, useCallback, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { FooterSimple } from '@/components/footer-simple';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Check, ChevronRight, ChevronLeft, Upload, MapPin, Home, Euro, FileText, Camera, User, Phone, Mail, Lock } from 'lucide-react';
import { AddressAutocomplete } from '@/components/address-autocomplete';
import { useAuth } from '@/context/auth-context';

const LocationPickerMap = dynamic(() => import('@/components/location-picker-map').then((mod) => mod.LocationPickerMap), { ssr: false });

const TIPOS_IMOVEL = [
  { value: 'apartamento', label: 'Apartamento', desc: 'casa num prédio: apartamento, duplex, penthouse, T0/estúdio/loft' },
  { value: 'moradia', label: 'Moradia', desc: 'casa unifamiliar' },
  { value: 'casa_rustica', label: 'Casa rústica', desc: 'de uma casa de aldeia a um palácio, quinta, monte alentejano, solar, moinho ou similar' },
  { value: 'quarto', label: 'Quarto em casa partilhada', desc: 'apartamento ou moradia partilhado com mais gente' },
  { value: 'escritorio', label: 'Escritório', desc: '' },
  { value: 'loja', label: 'Espaço comercial ou armazém', desc: '' },
  { value: 'garagem', label: 'Lugar de garagem', desc: '' },
  { value: 'terreno', label: 'Terreno', desc: '' },
  { value: 'predio', label: 'Prédio', desc: '' },
];

const STEPS_LOGGED_OUT = [
  { id: 1, label: 'Dados básicos' },
  { id: 2, label: 'Detalhes' },
  { id: 3, label: 'Fotos' },
  { id: 4, label: 'Contacto' },
];

const STEPS_LOGGED_IN = [
  { id: 1, label: 'Dados básicos' },
  { id: 2, label: 'Detalhes' },
  { id: 3, label: 'Fotos' },
];



export default function PublicarNovoPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Step 1: Dados básicos
  const [tipo, setTipo] = useState('');
  const [operacao, setOperacao] = useState<'venda' | 'arrendamento'>('venda');
  const [localidade, setLocalidade] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [moradaConfirmada, setMoradaConfirmada] = useState(false);

  // Step 2: Detalhes
  const [areaBruta, setAreaBruta] = useState('');
  const [areaUtil, setAreaUtil] = useState('');
  const [quartos, setQuartos] = useState(0);
  const [casasBanho, setCasasBanho] = useState(0);
  const [andar, setAndar] = useState('');
  const [porta, setPorta] = useState('');
  const [elevador, setElevador] = useState<'sim' | 'nao'>('nao');
  const [certificadoEnergetico, setCertificadoEnergetico] = useState('');
  const [orientacao, setOrientacao] = useState<string[]>([]);
  const [caracteristicas, setCaracteristicas] = useState<string[]>([]);
  const [preco, setPreco] = useState('');
  const [condominio, setCondominio] = useState('');
  const [descricao, setDescricao] = useState('');
  
  // New fields
  const [hideAddress, setHideAddress] = useState(false);
  const [bloco, setBloco] = useState('');
  const [urbanizacao, setUrbanizacao] = useState('');
  const [tipoCasa, setTipoCasa] = useState('');
  const [situacao, setSituacao] = useState<'disponivel' | 'arrendado'>('disponivel');
  const [estado, setEstado] = useState('');
  const [eficienciaEnergetica, setEficienciaEnergetica] = useState('');
  const [comPlanta, setComPlanta] = useState(false);
  const [comVisitaVirtual, setComVisitaVirtual] = useState(false);

  // Step 3: Fotos
  const [images, setImages] = useState<File[]>([]);

  // Step 4: Contacto
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [password, setPassword] = useState('');
  const [prefContacto, setPrefContacto] = useState<'telefone' | 'mensagem' | 'email'>('telefone');

  const toggleOrientacao = (val: string) => {
    setOrientacao((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
  };

  const toggleCaracteristica = (val: string) => {
    setCaracteristicas((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 40 - images.length);
    setImages((prev) => [...prev, ...newFiles]);
    const previews = newFiles.map((f) => URL.createObjectURL(f));
    setPreviewImages((prev) => [...prev, ...previews]);
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

  const isLoggedIn = isAuthenticated && !!user;
  const STEPS = isLoggedIn ? STEPS_LOGGED_IN : STEPS_LOGGED_OUT;
  const totalSteps = STEPS.length;

  const canProceed = () => {
    if (step === 1) return tipo && localidade && rua && moradaConfirmada;
    if (step === 2) return areaBruta && preco && descricao;
    if (step === 3) return true; // fotos opcionais
    if (step === 4 && !isLoggedIn) return nome && email && telefone && password.length >= 6;
    return false;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      // Se não estiver logado, registar primeiro
      if (!isLoggedIn) {
        const registerRes = await api.register({
          email,
          password,
          name: nome,
          role: 'owner',
          country: 'PT',
        });
        localStorage.setItem('portal_token', registerRes.token);
      }

      // Criar propriedade
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
          energyCertificate: certificadoEnergetico || undefined,
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
        images: previewImages.slice(0, 5).map((url, i) => ({
          url,
          alt: `Foto ${i + 1}`,
          isPrimary: i === 0,
        })),
        listingType: operacao === 'venda' ? 'sale' : 'rent',
        tags: caracteristicas,
      });

      alert('Anúncio publicado com sucesso!');
      // Redirecionar baseado na role ou para o painel de proprietário
      if (isLoggedIn) {
        const dashboard = user?.role === 'agent' || user?.role === 'admin' 
          ? '/painel/agente/imoveis' 
          : '/painel/proprietario';
        router.push(dashboard);
      } else {
        router.push('/painel/proprietario');
      }
    } catch (err: any) {
      setError(err?.data?.error || 'Erro ao publicar anúncio. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100">
      <Navbar />

      {/* Progress bar */}
      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex flex-col items-center py-3 ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step > s.id
                        ? 'bg-emerald-500 text-white'
                        : step === s.id
                        ? 'bg-accent text-white'
                        : 'bg-cream-200 text-foreground-muted'
                    }`}
                  >
                    {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                  </div>
                  <span className={`text-xs mt-1 ${step === s.id ? 'text-accent font-medium' : 'text-foreground-muted'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? 'bg-emerald-500' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-body">
            {error}
          </div>
        )}

        {/* Step 1: Dados básicos */}
        {step === 1 && (
          <div className="space-y-8">
            <h2 className="font-serif text-2xl text-foreground">Publicar o teu anúncio de particular</h2>

            {/* Tipo de imóvel */}
            <div>
              <label className="block text-body font-medium text-foreground mb-2">Escolhe o tipo de imóvel</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full max-w-md px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="">Seleciona</option>
                {TIPOS_IMOVEL.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {tipo && (
                <p className="text-caption text-foreground-muted mt-1">
                  {TIPOS_IMOVEL.find((t) => t.value === tipo)?.desc}
                </p>
              )}
            </div>

            {/* Operação */}
            <div>
              <label className="block text-body font-medium text-foreground mb-2">Operação</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="operacao"
                    checked={operacao === 'venda'}
                    onChange={() => setOperacao('venda')}
                    className="w-4 h-4 text-accent"
                  />
                  <span>Vender</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="operacao"
                    checked={operacao === 'arrendamento'}
                    onChange={() => setOperacao('arrendamento')}
                    className="w-4 h-4 text-accent"
                  />
                  <span>Arrendar</span>
                </label>
              </div>
            </div>

            {/* Localização */}
            <div>
              <label className="block text-body font-medium text-foreground mb-2">Localização do imóvel</label>
              <div className="space-y-3 max-w-md">
                <AddressAutocomplete
                  label="Localidade"
                  value={localidade}
                  onChange={setLocalidade}
                  onSelect={(s) => {
                    const city = s.address.city || s.address.town || s.address.village || s.address.municipality || '';
                    setLocalidade(city);
                  }}
                  placeholder="Escreve a localidade..."
                />
                <input
                  type="text"
                  placeholder="Rua"
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <input
                  type="text"
                  placeholder="Número da via"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <button
                onClick={verificarMorada}
                disabled={!localidade || !rua}
                className="mt-3 px-6 py-2.5 bg-olive-500 text-white rounded-xl font-medium hover:bg-olive-600 transition-colors disabled:opacity-50"
              >
                Verificar morada
              </button>

              {moradaConfirmada && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
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
        )}

        {/* Step 2: Detalhes */}
        {step === 2 && (
          <div className="space-y-8">
            <h2 className="font-serif text-2xl text-foreground">Detalhes do imóvel</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-foreground-muted mb-1">m² área bruta</label>
                <input
                  type="number"
                  value={areaBruta}
                  onChange={(e) => setAreaBruta(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground-muted mb-1">m² úteis (opcional)</label>
                <input
                  type="number"
                  value={areaUtil}
                  onChange={(e) => setAreaUtil(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-foreground-muted mb-1">Número de quartos</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQuartos(Math.max(0, quartos - 1))} className="w-10 h-10 rounded-xl border border-border bg-white hover:bg-cream-200">-</button>
                  <span className="w-10 text-center font-medium">{quartos}</span>
                  <button onClick={() => setQuartos(quartos + 1)} className="w-10 h-10 rounded-xl border border-border bg-white hover:bg-cream-200">+</button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-foreground-muted mb-1">Casas de banho</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCasasBanho(Math.max(0, casasBanho - 1))} className="w-10 h-10 rounded-xl border border-border bg-white hover:bg-cream-200">-</button>
                  <span className="w-10 text-center font-medium">{casasBanho}</span>
                  <button onClick={() => setCasasBanho(casasBanho + 1)} className="w-10 h-10 rounded-xl border border-border bg-white hover:bg-cream-200">+</button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-foreground-muted mb-1">Certificado Energético</label>
              <select
                value={certificadoEnergetico}
                onChange={(e) => setCertificadoEnergetico(e.target.value)}
                className="w-full max-w-xs px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="">Seleciona</option>
                {['A+', 'A', 'B', 'C', 'D', 'E', 'F'].map((c) => (
                  <option key={c} value={c}>Classe {c}</option>
                ))}
              </select>
            </div>

            {/* Ocultar morada (paid) */}
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white cursor-pointer hover:bg-cream-100">
              <input
                type="checkbox"
                checked={hideAddress}
                onChange={(e) => setHideAddress(e.target.checked)}
                className="w-4 h-4 text-accent"
              />
              <span className="text-sm">Não mostrar o número da rua e o andar no anúncio <span className="text-xs text-accent">(pago)</span></span>
            </label>

            {/* Andar, Porta, Bloco, Urbanização */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-foreground-muted mb-1">Andar</label>
                <select
                  value={andar}
                  onChange={(e) => setAndar(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
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
                <label className="block text-sm text-foreground-muted mb-1">Porta</label>
                <select
                  value={porta}
                  onChange={(e) => setPorta(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="">Seleciona</option>
                  <option value="left">Esquerda</option>
                  <option value="right">Direita</option>
                  <option value="front">Frente</option>
                  <option value="back">Trás</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-foreground-muted mb-1">Bloco / Entrada</label>
                <input
                  type="text"
                  value={bloco}
                  onChange={(e) => setBloco(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="Ex: Bloco A, Entrada 2"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground-muted mb-1">Urbanização</label>
                <input
                  type="text"
                  value={urbanizacao}
                  onChange={(e) => setUrbanizacao(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="Ex: Urbanização das Flores"
                />
              </div>
            </div>

            {/* Tipo de casa */}
            <div>
              <label className="block text-sm text-foreground-muted mb-2">Tipo de casa</label>
              <select
                value={tipoCasa}
                onChange={(e) => setTipoCasa(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-foreground-muted mb-2">Situação do imóvel</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSituacao('disponivel')}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm border transition-colors ${
                      situacao === 'disponivel'
                        ? 'bg-accent text-white border-accent'
                        : 'bg-white text-foreground border-border hover:bg-cream-200'
                    }`}
                  >
                    Disponível
                  </button>
                  <button
                    onClick={() => setSituacao('arrendado')}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm border transition-colors ${
                      situacao === 'arrendado'
                        ? 'bg-accent text-white border-accent'
                        : 'bg-white text-foreground border-border hover:bg-cream-200'
                    }`}
                  >
                    Arrendado
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-foreground-muted mb-1">Estado</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
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
              <label className="block text-sm text-foreground-muted mb-2">Características</label>
              <div className="flex flex-wrap gap-2">
                {['Piscina', 'Jardim', 'Garagem', 'Terraço', 'Varanda', 'Ar condicionado', 'Elevador', 'Armários embutidos', 'Vista mar', 'Casa adaptada', 'Casa de luxo'].map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCaracteristica(c.toLowerCase())}
                    className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                      caracteristicas.includes(c.toLowerCase())
                        ? 'bg-accent text-white border-accent'
                        : 'bg-white text-foreground border-border hover:bg-cream-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Eficiência Energética */}
            <div>
              <label className="block text-sm text-foreground-muted mb-2">Eficiência energética</label>
              <div className="flex flex-wrap gap-2">
                {['A+', 'A', 'B', 'C', 'D', 'E', 'F'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setEficienciaEnergetica(eficienciaEnergetica === c ? '' : c)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold border transition-colors ${
                      eficienciaEnergetica === c
                        ? 'bg-accent text-white border-accent'
                        : 'bg-white text-foreground border-border hover:bg-cream-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-foreground-muted mb-1">Preço (€)</label>
                <input
                  type="number"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground-muted mb-1">Condomínio/mês (opcional)</label>
                <input
                  type="number"
                  value={condominio}
                  onChange={(e) => setCondominio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            {/* Multimedia toggles */}
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white cursor-pointer hover:bg-cream-100">
                <input
                  type="checkbox"
                  checked={comPlanta}
                  onChange={(e) => setComPlanta(e.target.checked)}
                  className="w-4 h-4 text-accent"
                />
                <span className="text-sm">Com planta</span>
              </label>
              <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white cursor-pointer hover:bg-cream-100">
                <input
                  type="checkbox"
                  checked={comVisitaVirtual}
                  onChange={(e) => setComVisitaVirtual(e.target.checked)}
                  className="w-4 h-4 text-accent"
                />
                <span className="text-sm">Com visita virtual</span>
              </label>
            </div>

            <div>
              <label className="block text-sm text-foreground-muted mb-1">Descrição do anúncio</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                placeholder="Descreve o imóvel: localização, estado, vistas, proximidades..."
              />
            </div>
          </div>
        )}

        {/* Step 3: Fotos */}
        {step === 3 && (
          <div className="space-y-8">
            <h2 className="font-serif text-2xl text-foreground">Adicionar fotos, plantas e vídeos ao teu anúncio</h2>

            <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center bg-white">
              <div className="flex justify-center gap-4 mb-6">
                <div className="w-16 h-16 bg-cream-200 rounded-xl flex items-center justify-center">
                  <Camera className="w-8 h-8 text-olive-500" />
                </div>
              </div>
              <p className="text-body text-foreground-muted mb-4">
                Arrasta e solta as tuas fotos aqui ou seleciona-as a partir do teu dispositivo
              </p>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium cursor-pointer hover:bg-accent/90 transition-colors">
                <Upload className="w-4 h-4" />
                Adicionar fotos e vídeos
                <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            {previewImages.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {previewImages.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                    <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 px-2 py-0.5 bg-accent text-white text-xs rounded-full">Principal</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              <p className="font-medium mb-1">Lembra-te que...</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Fotos, plantas e vídeos atraem mais pessoas para o teu anúncio</li>
                <li>Se tiveres uma planta do imóvel, podes tirar uma foto da mesma</li>
                <li>Quando tirares as tuas fotografias, certifica-te de que cada divisão está arrumada, limpa e bem iluminada</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 4: Contacto (só para não logados) */}
        {!isLoggedIn && step === 4 && (
          <div className="space-y-8">
            <h2 className="font-serif text-2xl text-foreground">Os teus dados de contacto</h2>

            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm text-foreground-muted mb-1">O teu nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <p className="text-xs text-foreground-muted mt-1">Será visível no anúncio</p>
              </div>

              <div>
                <label className="block text-sm text-foreground-muted mb-1">O teu email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <p className="text-xs text-foreground-muted mt-1">Nunca será visível no anúncio, apenas nos alertas e notificações</p>
              </div>

              <div>
                <label className="block text-sm text-foreground-muted mb-1">O teu telefone</label>
                <div className="flex gap-2">
                  <span className="px-3 py-3 bg-cream-200 rounded-xl text-sm text-foreground-muted">+351</span>
                  <input
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-foreground-muted mb-1">Palavra-passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <p className="text-xs text-foreground-muted mt-1">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm text-foreground-muted mb-2">Como preferes ser contactado?</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white cursor-pointer hover:bg-cream-100">
                    <input
                      type="radio"
                      name="contacto"
                      checked={prefContacto === 'telefone'}
                      onChange={() => setPrefContacto('telefone')}
                      className="w-4 h-4 text-accent"
                    />
                    <div>
                      <p className="text-sm font-medium">Telefone e mensagens no nosso chat (recomendado)</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white cursor-pointer hover:bg-cream-100">
                    <input
                      type="radio"
                      name="contacto"
                      checked={prefContacto === 'mensagem'}
                      onChange={() => setPrefContacto('mensagem')}
                      className="w-4 h-4 text-accent"
                    />
                    <p className="text-sm font-medium">Só por mensagens de chat</p>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white cursor-pointer hover:bg-cream-100">
                    <input
                      type="radio"
                      name="contacto"
                      checked={prefContacto === 'email'}
                      onChange={() => setPrefContacto('email')}
                      className="w-4 h-4 text-accent"
                    />
                    <p className="text-sm font-medium">Só por telefone</p>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-6 py-3 border border-border rounded-xl text-body font-medium hover:bg-cream-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              Continuar
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'A publicar...' : 'Publicar anúncio'}
            </button>
          )}
        </div>
      </div>

      <FooterSimple />
    </div>
  );
}
