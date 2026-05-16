'use client';

import { ProtectedRoute } from '@/components/protected-route';
import AdminContent from './admin-content';

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminContent />
    </ProtectedRoute>
  );
}
