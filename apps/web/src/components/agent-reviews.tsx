'use client';

import { useEffect, useState, useCallback } from 'react';
import { Star, MessageSquare, ThumbsUp, Loader2, Send } from 'lucide-react';
import { api } from '@/lib/api';

interface AgentReviewsProps {
  agentId?: string;
}

export function AgentReviews({ agentId }: AgentReviewsProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    if (!agentId) return;
    try {
      const data = await api.getReviews(agentId);
      setReviews(data.value);
      setStats(data.stats);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleSubmit = async () => {
    if (!agentId) return;
    setSubmitting(true);
    setError('');
    try {
      await api.createReview({ agentId, rating, title, comment });
      setShowForm(false);
      setRating(5);
      setTitle('');
      setComment('');
      fetch();
    } catch (err: any) {
      setError(err?.data?.error || 'Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  if (!agentId) return null;

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-olive-100">
              <Star className="w-5 h-5 text-olive-500" />
            </div>
            <div>
              <h3 className="font-serif text-heading-3 text-foreground">Avaliações do Agente</h3>
              <p className="text-caption text-foreground-muted">
                {stats.count} avaliação{stats.count !== 1 ? 's' : ''} · Média {stats.average}★
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-dark transition-colors"
          >
            {showForm ? 'Cancelar' : 'Avaliar'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="px-6 py-5 border-b border-border bg-cream-50 space-y-4">
          <div>
            <label className="text-caption font-medium text-foreground mb-2 block">Classificação</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className="p-1">
                  <Star className={`w-6 h-6 ${n <= rating ? 'text-amber-400 fill-amber-400' : 'text-cream-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            placeholder="Título (opcional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-olive-300"
          />
          <textarea
            placeholder="Partilhe a sua experiência..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-olive-300"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={submitting || !comment}
            className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-dark transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'A enviar...' : 'Enviar Avaliação'}
          </button>
        </div>
      )}

      <div className="divide-y divide-border">
        {loading ? (
          <div className="px-6 py-8 text-center">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-foreground-muted" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="px-6 py-8 text-center text-caption text-foreground-muted">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>Sem avaliações ainda. Seja o primeiro!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`w-3.5 h-3.5 ${n <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-cream-300'}`} />
                      ))}
                    </div>
                    {review.verified && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs">Verificada</span>
                    )}
                  </div>
                  {review.title && <h4 className="text-body font-medium text-foreground mb-1">{review.title}</h4>}
                  <p className="text-body text-foreground-muted leading-relaxed">{review.comment}</p>
                  <div className="flex items-center gap-2 mt-2 text-caption text-foreground-muted">
                    <span>{review.author?.name || 'Anónimo'}</span>
                    <span>·</span>
                    <span>{new Date(review.createdAt).toLocaleDateString('pt-PT')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
