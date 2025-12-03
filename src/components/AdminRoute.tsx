import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

function AdminRoute() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/reports" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
