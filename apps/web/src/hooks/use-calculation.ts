import { useState, useCallback } from 'react';
import { api, request } from '@/lib/api';

interface UseCalculationOptions {
  type: 'imt-jovem' | 'ipu-angola';
  propertyId?: string;
}

export function useCalculation({ type, propertyId }: UseCalculationOptions) {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const calculate = useCallback(async (inputData: any) => {
    setIsLoading(true);
    setError('');
    try {
      const endpoint = type === 'imt-jovem' ? '/api/calculations/imt-jovem' : '/api/calculations/ipu-angola';
      const data = await request<any>(endpoint, {
        method: 'POST',
        body: JSON.stringify(inputData),
      });
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err?.data?.error || 'Erro ao calcular');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  const saveSimulation = useCallback(async (inputData: any, resultData: any, contact?: { name?: string; email?: string; phone?: string }) => {
    try {
      await request<any>('/api/simulations', {
        method: 'POST',
        body: JSON.stringify({
          type,
          inputData,
          resultData,
          propertyId,
          ...contact,
        }),
      });
    } catch {
      // Silently fail — simulation saving is secondary
    }
  }, [type, propertyId]);

  return { result, isLoading, error, calculate, saveSimulation };
}
