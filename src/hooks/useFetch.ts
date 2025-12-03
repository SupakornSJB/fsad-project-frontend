import type {AuthContextProps} from "react-oidc-context";
import ServerConstant from "../constants/serverConstant.ts";
import {getBackendUrl, getIdentityServerUrl} from "../helpers/backend.ts";

async function checkText(res: Response) {
  const text = await res.text();
  if (res.ok && !text) return res.json();
  return {}
}

export default function useFetch(authContext: AuthContextProps, server: ServerConstant) {
  let serverUrl = getBackendUrl();
  switch (server) {
    case ServerConstant.ApiServer:
      serverUrl = getBackendUrl();
      break;
    case ServerConstant.IdentityServer:
      serverUrl = getIdentityServerUrl();
      break;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authContext.user?.access_token,
  };

  const get = async (path: string, options?: object) => {
    return fetch(`${serverUrl}/${path}`, { ...options, headers }).then(res => res.text()).then(text => {
      if (!text) {
        return null;
      }
      return JSON.parse(text);
    });
  }

  const post = async (path: string, body?: never, options?: object) => {
    return fetch(`${serverUrl}/${path}`, {
      ...options,
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }).then(res => res.text()).then(text => {
      if (!text) {
        return null;
      }
      return JSON.parse(text);
    });
  }

  const put = async (path: string, body?: never, options?: object) => {
    return fetch(`${serverUrl}/${path}`, {
      ...options,
      headers,
      method: 'PUT',
      body: JSON.stringify(body)
    }).then(res => res.text()).then(text => {
      if (!text) {
        return true;
      }
      return JSON.parse(text);
    });
  }

  const del = async (path: string, options?: object) => {
    return fetch(`${serverUrl}/${path}`, {
      ...options,
      headers,
      method: 'DELETE'
    }).then(res => res.text()).then(text => {
      if (!text) {
        return null;
      }
      return JSON.parse(text);
    });
  }

  return { get, post, put, del }
}
