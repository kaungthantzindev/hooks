import { useEffect, useCallback, useState } from "react";

const generateNonce = (): string => {
  return Array.from(window.crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export interface ParsedHashParams {
  idToken: string | null;
  accessToken: string | null;
  error: string | null;
}

const parseHashParams = (hash: string): ParsedHashParams => {
  const params = new URLSearchParams(hash.replace("#", ""));
  return {
    idToken: params.get("id_token"),
    accessToken: params.get("access_token"),
    error: params.get("error"),
  };
};

export interface UseGoogleLoginParams {
  clientId: string;
  redirectUri?: string;
  onSuccess: (idToken: string | null, accessToken: string | null) => void;
  onError: (error: string) => void;
  scope?: string;
  responseType?: 'id_token token' | 'id_token';
}

function useGoogleLogin({
  clientId,
  redirectUri,
  onSuccess,
  onError,
  scope = "openid email profile",
  responseType = "id_token token", // Requesting both id_token and access_token
}: UseGoogleLoginParams) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const buildAuthUrl = useCallback((): string => {
    const nonce = generateNonce();

    const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const queryParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri || window.location.origin,
      response_type: responseType,
      scope,
      nonce,
    });

    return `${baseUrl}?${queryParams.toString()}`;
  }, [clientId, redirectUri, responseType, scope]);

  useEffect(() => {
    const { idToken, accessToken, error } = parseHashParams(window.location.hash);

    if (idToken || accessToken) {
      setIsLoading(true);
    }

    if (error) {
      onError(error);
      setIsLoading(false);
    } else if (idToken || accessToken) {
      onSuccess(idToken || null, accessToken || null);

      window.history.pushState(
        "",
        document.title,
        window.location.pathname + window.location.search
      );
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  const initiateLogin = () => {
    setIsLoading(true);
    window.location.href = buildAuthUrl();
  };

  return {
    initiateLogin,
    isLoading,
  };
}

export default useGoogleLogin;
