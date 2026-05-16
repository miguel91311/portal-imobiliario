'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileText, Lock, Download, CheckCircle2, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { FileUploader } from './file-uploader';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'verified' | 'pending' | 'missing';
  createdAt: string;
  size?: number;
  url: string;
}

interface PropertyPassportProps {
  propertyId?: string;
}

export function PropertyPassport({ propertyId }: PropertyPassportProps = {}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getDocuments(propertyId);
      setDocuments(data.value);
    } catch (err: any) {
      setError(err?.data?.error || 'Erro ao carregar documentos');
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (file: File, name: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    if (propertyId) formData.append('propertyId', propertyId);
    formData.append('type', file.name.split('.').pop()?.toUpperCase() || 'PDF');

    await api.uploadDocument(formData);
    await fetchDocuments();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.deleteDocument(id);
      await fetchDocuments();
    } catch (err: any) {
      setError(err?.data?.error || 'Erro ao eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  const verified = documents.filter((d) => d.status === 'verified').length;
  const total = documents.length || 6; // 6 tipos de documento esperados

  const getStatusConfig = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Validado' };
      case 'pending':
        return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Em revisão' };
      default:
        return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Pendente' };
    }
  };

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-olive-100">
              <Lock className="w-5 h-5 text-olive-500" />
            </div>
            <div>
              <h3 className="font-serif text-heading-3 text-foreground">Property Passport</h3>
              <p className="text-caption text-foreground-muted">Cofre digital · Encriptação AES-256</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-serif text-heading-2 text-olive-500">{total > 0 ? Math.round((verified / total) * 100) : 0}%</p>
            <p className="text-overline text-foreground-muted">{verified} / {total} documentos</p>
          </div>
        </div>
        <div className="mt-3 h-2 bg-cream-200 rounded-full overflow-hidden">
          <div className="h-full bg-olive-500 rounded-full transition-all duration-700" style={{ width: `${total > 0 ? (verified / total) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Upload */}
      <div className="px-6 py-5 border-b border-border bg-cream-50">
        <h4 className="text-body font-medium text-foreground mb-3">Adicionar Documento</h4>
        <FileUploader onUpload={handleUpload} />
      </div>

      {/* Document List */}
      <div className="divide-y divide-border">
        {isLoading && (
          <div className="px-6 py-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-foreground-muted" />
            <p className="text-caption text-foreground-muted">A carregar documentos...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="px-6 py-4">
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
              {error}
            </div>
          </div>
        )}

        {!isLoading && documents.length === 0 && (
          <div className="px-6 py-8 text-center">
            <FileText className="w-10 h-10 mx-auto mb-2 text-foreground-muted/50" />
            <p className="text-body text-foreground-muted">Nenhum documento carregado</p>
            <p className="text-caption text-foreground-muted mt-1">Use o formulário acima para adicionar</p>
          </div>
        )}

        {documents.map((doc) => {
          const config = getStatusConfig(doc.status);
          const StatusIcon = config.icon;
          return (
            <div key={doc.id} className="px-6 py-4 flex items-center justify-between hover:bg-cream-50/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bg}`}>
                  <FileText className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <p className="text-body text-foreground font-medium">{doc.name}</p>
                  <div className="flex items-center gap-2 text-caption text-foreground-muted">
                    <span>{doc.type}</span>
                    {doc.size && <span>· {(doc.size / 1024 / 1024).toFixed(1)} MB</span>}
                    <span>· {new Date(doc.createdAt).toLocaleDateString('pt-PT')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-overline ${config.bg} ${config.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {config.label}
                </span>
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${doc.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-cream-200 text-foreground-muted transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  className="p-2 rounded-lg hover:bg-red-50 text-foreground-muted hover:text-red-500 transition-colors disabled:opacity-50"
                  title="Eliminar"
                >
                  {deletingId === doc.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
