'use client';

import { ProtectedRoute } from '@/components/protected-route';
import ProprietarioContent from './proprietario-content';

export default function ProprietarioDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <ProprietarioContent />
    </ProtectedRoute>
  );
}
