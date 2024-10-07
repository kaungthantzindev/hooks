import { useEffect, useCallback, useState } from "react";

// Function to generate a nonce for security purposes
const generateNonce = (): string => {
  return Array.from(window.crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export interface ParsedHashParams {
  code: string | null;
  idToken: string | null;
  error: string | null;
}

const parseHashParams = (hash: string): ParsedHashParams => {
  const params = new URLSearchParams(hash.replace("#", ""));
  return {
    code: params.get("code"),
    idToken: params.get("id_token"),
    error: params.get("error"),
  };
};

export interface UseAppleLoginParams {
  clientId: string;
  redirectUri?: string;
  onSuccess: (code: string | null, idToken: string | null) => void;
  onError: (error: string) => void;
  scope?: string;
  responseType?: "code" | "id_token";
}

function useAppleLogin({
  clientId,
  redirectUri,
  onSuccess,
  onError,
  scope = "name email",
  responseType = "code", // Apple's default is to request authorization code
}: UseAppleLoginParams) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const buildAuthUrl = useCallback((): string => {
    const nonce = generateNonce();

    const baseUrl = "https://appleid.apple.com/auth/authorize";
    const queryParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri || window.location.origin,
      response_type: responseType,
      scope,
      nonce,
      response_mode: "form_post", // or "form_post" for server-side exchange
    });

    return `${baseUrl}?${queryParams.toString()}`;
  }, [clientId, redirectUri, responseType, scope]);

  useEffect(() => {
    const { code, idToken, error } = parseHashParams(window.location.hash);

    if (code || idToken) {
      setIsLoading(true);
    }

    if (error) {
      onError(error);
      setIsLoading(false);
    } else if (code || idToken) {
      onSuccess(code || null, idToken || null);

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

export default useAppleLogin;