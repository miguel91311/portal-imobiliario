'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import {
  Plug, CheckCircle2, XCircle, ExternalLink, Share2,
  Upload, FileSpreadsheet, FileJson, Globe, FileCode,
  Loader2, Eye, Check, AlertCircle, Key, Copy, Trash2, Plus
} from 'lucide-react';

type ImportTab = 'csv' | 'openimmo' | 'json' | 'url';

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Import states
  const [activeTab, setActiveTab] = useState<ImportTab>('csv');
  const [fileContent, setFileContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importResult, setImportResult] = useState<{message?: string; count?: number; error?: string} | null>(null);

  // API Keys states
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState('30');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    loadData();
    loadApiKeys();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getIntegrations();
      setIntegrations(data.value);
    } catch {
      setIntegrations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadApiKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const data = await api.getApiKeys();
      setApiKeys(data);
    } catch {
      setApiKeys([]);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setIsCreatingKey(true);
    try {
      const res = await api.createApiKey(newKeyName.trim(), Number(newKeyExpiry));
      setShowNewKey(res.key);
      setNewKeyName('');
      loadApiKeys();
    } catch (err: any) {
      alert(err?.data?.error || 'Erro ao criar chave');
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Tem a certeza que deseja revogar esta chave?')) return;
    try {
      await api.deleteApiKey(id);
      loadApiKeys();
    } catch (err: any) {
      alert(err?.data?.error || 'Erro ao revogar chave');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFileContent(String(ev.target?.result || ''));
      setShowPreview(false);
      setPreview([]);
      setImportResult(null);
    };
    reader.readAsText(file);
  };

  const handlePreview = async () => {
    if (!fileContent.trim()) return;
    try {
      let res;
      if (activeTab === 'csv') res = await api.previewCSV(fileContent);
      else if (activeTab === 'openimmo') res = await api.previewOpenImmo(fileContent);
      else res = await api.previewJSON(fileContent);
      setPreview(res.properties || []);
      setShowPreview(true);
    } catch (err: any) {
      setImportResult({ error: err?.data?.error || 'Erro ao gerar pré-visualização' });
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    setImportResult(null);
    try {
      let res;
      if (activeTab === 'csv') res = await api.importCSV(fileContent);
      else if (activeTab === 'openimmo') res = await api.importOpenImmo(fileContent);
      else if (activeTab === 'json') res = await api.importJSON(fileContent);
      else res = await api.importURL(urlInput);
      setImportResult({ message: res.message, count: res.count || 1 });
      setFileContent('');
      setUrlInput('');
      setShowPreview(false);
      setPreview([]);
    } catch (err: any) {
      setImportResult({ error: err?.data?.error || 'Erro na importação' });
    } finally {
      setIsImporting(false);
    }
  };

  const tabs = [
    { id: 'csv' as ImportTab, label: 'Excel / CSV', icon: FileSpreadsheet },
    { id: 'openimmo' as ImportTab, label: 'OpenImmo XML', icon: FileCode },
    { id: 'json' as ImportTab, label: 'JSON', icon: FileJson },
    { id: 'url' as ImportTab, label: 'URL (Link)', icon: Globe },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin', 'agent']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="agente" userName={user?.name || 'Agente'} userRole="Agente Imobiliário" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">

            {/* Section: Import Properties */}
            <div className="mb-10">
              <div className="mb-6">
                <h1 className="font-serif text-heading-1 text-foreground">Importar Imóveis</h1>
                <p className="text-body text-foreground-muted mt-1">
                  Importe imóveis de CSV, XML OpenImmo, JSON ou diretamente de um link
                </p>
              </div>

              <div className="bg-surface-elevated rounded-2xl border border-border shadow-card overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-border overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setFileContent('');
                        setUrlInput('');
                        setShowPreview(false);
                        setPreview([]);
                        setImportResult(null);
                      }}
                      className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'text-olive-700 border-b-2 border-olive-500 bg-olive-50/50'
                          : 'text-foreground-muted hover:text-foreground hover:bg-cream-50'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {/* URL Tab */}
                  {activeTab === 'url' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Link do anúncio
                        </label>
                        <input
                          type="url"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder="https://www.idealista.pt/imovel/12345678/"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                        />
                        <p className="text-xs text-foreground-muted mt-1.5">
                          Funciona com Idealista, Imovirtual, OLX e outros portais que usam dados estruturados.
                        </p>
                      </div>
                      <button
                        onClick={handleImport}
                        disabled={!urlInput.trim() || isImporting}
                        className="flex items-center gap-2 px-5 py-2.5 bg-olive-500 text-white rounded-xl text-sm font-medium hover:bg-olive-600 transition-colors disabled:opacity-50"
                      >
                        {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Importar do URL
                      </button>
                    </div>
                  )}

                  {/* File tabs */}
                  {activeTab !== 'url' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Ficheiro {activeTab === 'csv' ? 'CSV / Excel' : activeTab === 'openimmo' ? 'XML OpenImmo' : 'JSON'}
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 px-4 py-2.5 bg-cream-100 border border-border rounded-xl text-sm font-medium text-foreground cursor-pointer hover:bg-cream-200 transition-colors">
                            <Upload className="w-4 h-4" />
                            Escolher ficheiro
                            <input
                              type="file"
                              accept={
                                activeTab === 'csv' ? '.csv,.txt' :
                                activeTab === 'openimmo' ? '.xml,.txt' :
                                '.json,.txt'
                              }
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                          {fileContent && (
                            <span className="text-xs text-emerald-600 font-medium">
                              <Check className="w-3.5 h-3.5 inline mr-1" />
                              Ficheiro carregado
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground-muted mt-1.5">
                          {activeTab === 'csv' && 'O ficheiro deve ter cabeçalho com colunas como: titulo, preco, tipologia, quartos, casasbanho, area, localidade, morada, fotos...'}
                          {activeTab === 'openimmo' && 'Ficheiro XML no formato OpenImmo (padrão europeu).'}
                          {activeTab === 'json' && 'Array de objetos ou objeto com propriedade "properties" / "imoveis".'}
                        </p>
                      </div>

                      {fileContent && (
                        <div className="flex gap-3">
                          <button
                            onClick={handlePreview}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border text-foreground rounded-xl text-sm font-medium hover:bg-cream-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Pré-visualizar
                          </button>
                          <button
                            onClick={handleImport}
                            disabled={isImporting}
                            className="flex items-center gap-2 px-5 py-2.5 bg-olive-500 text-white rounded-xl text-sm font-medium hover:bg-olive-600 transition-colors disabled:opacity-50"
                          >
                            {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            Importar {preview.length > 0 ? `(${preview.length})` : ''}
                          </button>
                        </div>
                      )}

                      {/* Preview table */}
                      {showPreview && preview.length > 0 && (
                        <div className="mt-4 border border-border rounded-xl overflow-hidden">
                          <div className="bg-cream-50 px-4 py-2.5 text-xs font-medium text-foreground-muted uppercase tracking-wide">
                            Pré-visualização ({preview.length} imóveis)
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-cream-100 text-foreground-muted">
                                <tr>
                                  <th className="px-4 py-2 text-left">Título</th>
                                  <th className="px-4 py-2 text-left">Preço</th>
                                  <th className="px-4 py-2 text-left">Cidade</th>
                                  <th className="px-4 py-2 text-left">Tipologia</th>
                                  <th className="px-4 py-2 text-left">Área</th>
                                  <th className="px-4 py-2 text-left">Fotos</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {preview.map((p, i) => (
                                  <tr key={i} className="hover:bg-cream-50">
                                    <td className="px-4 py-2.5 max-w-[200px] truncate">{p.title}</td>
                                    <td className="px-4 py-2.5">{p.price.toLocaleString('pt-PT')} {p.currency}</td>
                                    <td className="px-4 py-2.5">{p.city}</td>
                                    <td className="px-4 py-2.5">{p.typology}</td>
                                    <td className="px-4 py-2.5">{p.sqm} m²</td>
                                    <td className="px-4 py-2.5">{p.images?.length || 0}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Result message */}
                  {importResult?.message && (
                    <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      {importResult.message}
                    </div>
                  )}
                  {importResult?.error && (
                    <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-xl text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {importResult.error}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section: API Keys */}
            <div className="mb-10">
              <div className="mb-6">
                <h2 className="font-serif text-heading-2 text-foreground">Chaves API</h2>
                <p className="text-body text-foreground-muted mt-1">
                  Gera chaves API para integrar o teu CRM ou outras aplicações com o Portal Premium
                </p>
              </div>

              {/* Create new key */}
              <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground mb-1.5">Nome da chave</label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="Ex: CRM ImmoSoft"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    />
                  </div>
                  <div className="w-full sm:w-40">
                    <label className="block text-sm font-medium text-foreground mb-1.5">Validade (dias)</label>
                    <select
                      value={newKeyExpiry}
                      onChange={(e) => setNewKeyExpiry(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                    >
                      <option value="30">30 dias</option>
                      <option value="90">90 dias</option>
                      <option value="180">180 dias</option>
                      <option value="365">1 ano</option>
                      <option value="0">Sem expiração</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleCreateKey}
                      disabled={!newKeyName.trim() || isCreatingKey}
                      className="flex items-center gap-2 px-5 py-2.5 bg-olive-500 text-white rounded-xl text-sm font-medium hover:bg-olive-600 transition-colors disabled:opacity-50"
                    >
                      {isCreatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Gerar chave
                    </button>
                  </div>
                </div>

                {/* Show newly created key */}
                {showNewKey && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm font-medium text-amber-800 mb-2">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      Copia esta chave agora — não a poderás ver novamente!
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm font-mono text-amber-900 break-all">
                        {showNewKey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(showNewKey)}
                        className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors"
                      >
                        {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => setShowNewKey(null)}
                      className="mt-2 text-xs text-amber-700 hover:underline"
                    >
                      Já copiei, fechar
                    </button>
                  </div>
                )}
              </div>

              {/* Keys list */}
              {isLoadingKeys ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-8 h-8 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-10 bg-surface-elevated rounded-2xl border border-border">
                  <Key className="w-10 h-10 text-foreground-muted mx-auto mb-3" />
                  <p className="text-body text-foreground-muted">Ainda não tens chaves API</p>
                  <p className="text-sm text-foreground-muted">Gera uma chave para começar a integrar</p>
                </div>
              ) : (
                <div className="bg-surface-elevated rounded-2xl border border-border shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-cream-100 text-foreground-muted">
                        <tr>
                          <th className="px-4 py-3 text-left">Nome</th>
                          <th className="px-4 py-3 text-left">Chave</th>
                          <th className="px-4 py-3 text-left">Estado</th>
                          <th className="px-4 py-3 text-left">Último uso</th>
                          <th className="px-4 py-3 text-left">Expira</th>
                          <th className="px-4 py-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {apiKeys.map((k) => (
                          <tr key={k.id} className="hover:bg-cream-50">
                            <td className="px-4 py-3 font-medium">{k.name}</td>
                            <td className="px-4 py-3 font-mono text-xs">{k.key}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                k.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                              }`}>
                                {k.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {k.isActive ? 'Ativa' : 'Revogada'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-foreground-muted">
                              {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString('pt-PT') : 'Nunca'}
                            </td>
                            <td className="px-4 py-3 text-foreground-muted">
                              {k.expiresAt ? new Date(k.expiresAt).toLocaleDateString('pt-PT') : 'Nunca'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteKey(k.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                title="Revogar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Section: External Portals */}
            <div>
              <div className="mb-6">
                <h2 className="font-serif text-heading-2 text-foreground">Portais Externos</h2>
                <p className="text-body text-foreground-muted mt-1">Publique nos principais portais imobiliários</p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {integrations.map((integration) => (
                    <div
                      key={integration.portal}
                      className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-olive-50 flex items-center justify-center">
                            <Plug className="w-5 h-5 text-olive-600" />
                          </div>
                          <div>
                            <h3 className="font-serif text-heading-3 text-foreground">{integration.name}</h3>
                            <p className="text-caption text-foreground-muted">{integration.url}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          integration.configured
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {integration.configured ? (
                            <><CheckCircle2 className="w-3.5 h-3.5" /> Ativo</>
                          ) : (
                            <><XCircle className="w-3.5 h-3.5" /> Pendente</>
                          )}
                        </span>
                      </div>
                      <p className="text-body text-foreground-muted mb-4">
                        {integration.configured
                          ? 'Integração configurada. Pode publicar anúncios diretamente.'
                          : 'Configure a integração para publicar anúncios automaticamente neste portal.'}
                      </p>
                      <div className="flex gap-3">
                        <button
                          disabled={!integration.configured}
                          className="flex items-center gap-2 px-4 py-2.5 bg-olive-500 text-white rounded-xl text-sm font-medium hover:bg-olive-600 transition-colors disabled:opacity-50"
                        >
                          <Share2 className="w-4 h-4" />
                          Publicar
                        </button>
                        <a
                          href={integration.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground-muted hover:bg-cream-100 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Visitar
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
