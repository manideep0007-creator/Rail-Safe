import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="rail-grid flex min-h-screen items-center justify-center bg-rail-navy px-4">
        <div className="glass rounded-lg p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 animate-pulse text-rail-orange" />
          <p className="mt-4 font-semibold text-white">Verifying RailSafe session</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
