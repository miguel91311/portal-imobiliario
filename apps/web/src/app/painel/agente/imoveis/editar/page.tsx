'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

function EditPropertyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('id');
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [country, setCountry] = useState('PT');
  const [typology, setTypology] = useState('');
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [sqm, setSqm] = useState('');
  const [parking, setParking] = useState(0);
  const [pool, setPool] = useState(false);
  const [garden, setGarden] = useState(false);
  const [elevator, setElevator] = useState(false);
  const [balcony, setBalcony] = useState(false);
  const [terrace, setTerrace] = useState(false);
  const [airConditioning, setAirConditioning] = useState(false);
  const [storageRoom, setStorageRoom] = useState(false);
  const [condition, setCondition] = useState('');
  const [energyCertificate, setEnergyCertificate] = useState('');
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [status, setStatus] = useState('available');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  
  // New fields
  const [hideAddress, setHideAddress] = useState(false);
  const [floor, setFloor] = useState('');
  const [door, setDoor] = useState('');
  const [block, setBlock] = useState('');
  const [urbanization, setUrbanization] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [situation, setSituation] = useState<'disponivel' | 'arrendado'>('disponivel');
  const [hasFloorPlan, setHasFloorPlan] = useState(false);
  const [hasVirtualTour, setHasVirtualTour] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    loadProperty();
  }, [propertyId]);

  const loadProperty = async () => {
    setIsLoading(true);
    try {
      const property = await api.getProperty(propertyId!);
      setTitle(property.title || '');
      setDescription(property.description || '');
      setPrice(String(property.price || ''));
      setCurrency(property.currency || 'EUR');
      setAddress(property.address || '');
      setCity(property.city || '');
      setNeighborhood(property.neighborhood || '');
      setCountry(property.country || 'PT');
      setTypology(property.typology || '');
      setBedrooms(property.bedrooms || 0);
      setBathrooms(property.bathrooms || 0);
      setSqm(String(property.sqm || ''));
      setParking(property.parking || 0);
      setPool(property.pool || false);
      setGarden(property.garden || false);
      setElevator(property.elevator || false);
      setBalcony(property.balcony || false);
      setTerrace(property.terrace || false);
      setAirConditioning(property.airConditioning || false);
      setStorageRoom(property.storageRoom || false);
      setCondition(property.condition || '');
      setEnergyCertificate(property.energyCertificate || '');
      setListingType(property.listingType || 'sale');
      setStatus(property.status || 'available');
      setLatitude(property.location?.coordinates?.latitude || property.latitude || 0);
      setLongitude(property.location?.coordinates?.longitude || property.longitude || 0);
      
      // New fields
      setHideAddress(property.hideAddress || false);
      setFloor(property.floor || '');
      setDoor(property.door || '');
      setBlock(property.block || '');
      setUrbanization(property.urbanization || '');
      setPropertyType(property.propertyType || '');
      setSituation(property.situation || 'disponivel');
      setHasFloorPlan(property.hasFloorPlan || false);
      setHasVirtualTour(property.hasVirtualTour || false);
    } catch {
      setError('Erro ao carregar imóvel');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!propertyId) return;
    setIsSaving(true);
    setError('');
    try {
      await api.updateProperty(propertyId, {
        title,
        description,
        price: Number(price),
        currency,
        location: {
          address,
          city,
          country,
          neighborhood,
          coordinates: { latitude, longitude },
        },
        typology,
        features: {
          bedrooms,
          bathrooms,
          sqm: Number(sqm) || 0,
          parking,
          pool,
          garden,
          elevator,
          balcony,
          terrace,
          airConditioning,
          storageRoom,
          condition: condition || undefined,
          energyCertificate: energyCertificate || undefined,
          floor: floor || undefined,
          hideAddress,
          door: door || undefined,
          block: block || undefined,
          urbanization: urbanization || undefined,
          propertyType: propertyType || undefined,
          situation: situation || undefined,
          hasFloorPlan,
          hasVirtualTour,
        },
        listingType,
        status,
      });
      router.push('/painel/agente/imoveis');
    } catch (err: any) {
      setError(err?.data?.error || 'Erro ao guardar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  if (!propertyId) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'agent']}>
        <div className="min-h-screen bg-cream-100 flex items-center justify-center">
          <p className="text-foreground-muted">ID do imóvel não especificado</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'agent']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="agente" userName={user?.name || 'Agente'} userRole="Agente Imobiliário" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => router.push('/painel/agente/imoveis')}
                className="p-2 rounded-xl hover:bg-cream-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div>
                <h1 className="font-serif text-heading-1 text-foreground">Editar Imóvel</h1>
                <p className="text-body text-foreground-muted mt-1">Altere os dados do anúncio</p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6 space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">Título do anúncio</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">Descrição</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Preço (€)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Moeda</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    >
                      <option value="EUR">EUR</option>
                      <option value="AOA">AOA</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Tipologia</label>
                    <input
                      type="text"
                      value={typology}
                      onChange={(e) => setTypology(e.target.value)}
                      placeholder="T2, T3, Moradia..."
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Área (m²)</label>
                    <input
                      type="number"
                      value={sqm}
                      onChange={(e) => setSqm(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Quartos</label>
                    <input
                      type="number"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Casas de banho</label>
                    <input
                      type="number"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Estacionamento</label>
                    <input
                      type="number"
                      value={parking}
                      onChange={(e) => setParking(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Tipo de casa</label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
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

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Andar</label>
                    <select
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
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
                    <label className="block text-sm font-medium text-foreground mb-1">Porta</label>
                    <select
                      value={door}
                      onChange={(e) => setDoor(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    >
                      <option value="">Seleciona</option>
                      <option value="left">Esquerda</option>
                      <option value="right">Direita</option>
                      <option value="front">Frente</option>
                      <option value="back">Trás</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Bloco / Entrada</label>
                    <input
                      type="text"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      placeholder="Ex: Bloco A, Entrada 2"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Urbanização</label>
                    <input
                      type="text"
                      value={urbanization}
                      onChange={(e) => setUrbanization(e.target.value)}
                      placeholder="Ex: Urbanização das Flores"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Situação</label>
                    <select
                      value={situation}
                      onChange={(e) => setSituation(e.target.value as 'disponivel' | 'arrendado')}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    >
                      <option value="disponivel">Disponível</option>
                      <option value="arrendado">Arrendado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Estado</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    >
                      <option value="">Seleciona</option>
                      <option value="nova-construcao">Nova construção</option>
                      <option value="bom-estado">Bom estado</option>
                      <option value="para-recuperar">Para recuperar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Certificado Energético</label>
                    <select
                      value={energyCertificate}
                      onChange={(e) => setEnergyCertificate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    >
                      <option value="">Seleciona</option>
                      {['A+', 'A', 'B', 'C', 'D', 'E', 'F'].map((c) => (
                        <option key={c} value={c}>Classe {c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Tipo de negócio</label>
                    <select
                      value={listingType}
                      onChange={(e) => setListingType(e.target.value as 'sale' | 'rent')}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    >
                      <option value="sale">Venda</option>
                      <option value="rent">Arrendamento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    >
                      <option value="available">Disponível</option>
                      <option value="sold">Vendido</option>
                      <option value="rented">Arrendado</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">Morada</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Cidade</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Bairro / Zona</label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pool} onChange={(e) => setPool(e.target.checked)} className="w-4 h-4" />
                      <span className="text-sm">Piscina</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={garden} onChange={(e) => setGarden(e.target.checked)} className="w-4 h-4" />
                      <span className="text-sm">Jardim</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={elevator} onChange={(e) => setElevator(e.target.checked)} className="w-4 h-4" />
                      <span className="text-sm">Elevador</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={balcony} onChange={(e) => setBalcony(e.target.checked)} className="w-4 h-4" />
                      <span className="text-sm">Varanda</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={terrace} onChange={(e) => setTerrace(e.target.checked)} className="w-4 h-4" />
                      <span className="text-sm">Terraço</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={airConditioning} onChange={(e) => setAirConditioning(e.target.checked)} className="w-4 h-4" />
                      <span className="text-sm">Ar condicionado</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={storageRoom} onChange={(e) => setStorageRoom(e.target.checked)} className="w-4 h-4" />
                      <span className="text-sm">Arrecadação</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={hideAddress} onChange={(e) => setHideAddress(e.target.checked)} className="w-4 h-4" />
                      <span className="text-sm">Ocultar morada <span className="text-xs text-accent">(pago)</span></span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={hasFloorPlan} onChange={(e) => setHasFloorPlan(e.target.checked)} className="w-4 h-4" />
                      <span className="text-sm">Com planta</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={hasVirtualTour} onChange={(e) => setHasVirtualTour(e.target.checked)} className="w-4 h-4" />
                      <span className="text-sm">Com visita virtual</span>
                    </label>
                  </div>

                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => router.push('/painel/agente/imoveis')}
                    className="px-6 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-cream-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-olive-500 text-white rounded-xl text-sm font-medium hover:bg-olive-600 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar alterações
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function EditPropertyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
      </div>
    }>
      <EditPropertyContent />
    </Suspense>
  );
}
