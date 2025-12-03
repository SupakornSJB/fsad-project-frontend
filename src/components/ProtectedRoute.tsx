import { Outlet } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

function ProtectedRoute() {
  const { isLoading, isAuthenticated, signinRedirect } = useAuth();

  if (isLoading) {
    return (
      <div className="container loading-state">
        <span className="spinner" aria-hidden="true" />
        <span>Loading workspace...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    signinRedirect();
    return null;
  }

  return <Outlet />;
}

export default ProtectedRoute;
