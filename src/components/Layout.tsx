import {Outlet} from 'react-router-dom';
import {useAuth} from 'react-oidc-context';
import Navbar from './Navbar.tsx';
import Footer from './Footer.tsx';
import useFetch from "../hooks/useFetch.ts";
import ServerConstant from "../constants/serverConstant.ts";
import {useQuery} from "@tanstack/react-query";
import {useEffect} from "react";

function Layout() {
  const auth = useAuth();
  const { get } = useFetch(auth, ServerConstant.ApiServer);

  const { data: user, refetch } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return await get("api/userInfo");
    },
    enabled: auth.isAuthenticated
  })

  useEffect(() => {
    refetch();
  }, [auth.isAuthenticated, refetch]);

  return (
    <div className="app-shell">
      <Navbar user={user} onLogout={auth.signoutRedirect} isAuthenticated={auth.isAuthenticated}/>
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
