import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
