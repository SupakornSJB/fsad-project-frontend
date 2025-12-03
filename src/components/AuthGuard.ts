import {withAuthenticationRequired} from 'react-oidc-context';

export const AuthGuard = ({component}: { component: React.ComponentType<object> })  => {
  return withAuthenticationRequired(component, {signinRedirectArgs: { redirect_uri: window.location.href }});
}