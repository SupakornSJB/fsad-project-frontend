import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { getFrontendUrl, getIdentityServerUrl } from "./helpers/backend.ts";
import {AuthProvider} from "react-oidc-context";
import React from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

export const oidcConfig = {
  authority: getIdentityServerUrl(),  // IdentityServer
  client_id: "react-app",
  redirect_uri: `${getFrontendUrl()}/callback`,
  post_logout_redirect_uri: getFrontendUrl(),
  response_type: "code",
  scope: "openid profile api1",
  onSigninCallback: (): void => {
    window.location.href = "/";
  }
};

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <AuthProvider {...oidcConfig}>
    <QueryClientProvider client={queryClient}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </QueryClientProvider>
  </AuthProvider>
)
