'use client';

import { ProtectedRoute } from '@/components/protected-route';
import AgenteContent from './agente-content';

export default function AgenteDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['agent', 'admin']}>
      <AgenteContent />
    </ProtectedRoute>
  );
}
