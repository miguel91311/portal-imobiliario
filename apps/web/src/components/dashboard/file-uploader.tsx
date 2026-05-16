'use client';

import { useState, useCallback } from 'react';
import { Upload, File, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onUpload: (file: File, name: string) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
}

export function FileUploader({ onUpload, accept = '.pdf,.jpg,.jpeg,.png,.webp,.dwg', maxSize = 50 }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSet(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  const validateAndSet = (file: File) => {
    setError('');
    setSuccess(false);
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Ficheiro demasiado grande. Máximo: ${maxSize}MB`);
      return;
    }
    setSelectedFile(file);
    setFileName(file.name.replace(/\.[^/.]+$/, ''));
  };

  const handleUpload = async () => {
    if (!selectedFile || !fileName.trim()) return;
    setIsUploading(true);
    setProgress(0);
    try {
      await onUpload(selectedFile, fileName.trim());
      setSuccess(true);
      setSelectedFile(null);
      setFileName('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.data?.error || 'Erro ao fazer upload');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-accent bg-accent/5'
            : 'border-border bg-cream-50 hover:border-olive-300 hover:bg-cream-100'
        }`}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${isDragging ? 'text-accent' : 'text-foreground-muted'}`} />
        <p className="text-body text-foreground font-medium">
          {isDragging ? 'Solte o ficheiro aqui' : 'Arraste um ficheiro ou clique para selecionar'}
        </p>
        <p className="text-caption text-foreground-muted mt-1">
          PDF, JPG, PNG, DWG até {maxSize}MB
        </p>
      </div>

      {/* Selected File */}
      {selectedFile && (
        <div className="p-4 rounded-xl bg-white border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-olive-100 flex items-center justify-center shrink-0">
              <File className="w-5 h-5 text-olive-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-body text-foreground font-medium truncate">{selectedFile.name}</p>
              <p className="text-caption text-foreground-muted">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button onClick={() => { setSelectedFile(null); setError(''); }} className="p-2 rounded-lg hover:bg-cream-200 text-foreground-muted">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Nome do documento"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-sm focus:outline-none focus:border-olive-300"
            />

            {isUploading && (
              <div className="space-y-2">
                <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
                <p className="text-caption text-foreground-muted text-center">A enviar...</p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={isUploading || !fileName.trim()}
              className="w-full btn-primary gap-2 disabled:opacity-60"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'A enviar...' : 'Enviar Documento'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Documento enviado com sucesso!
        </div>
      )}
    </div>
  );
}
