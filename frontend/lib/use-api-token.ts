import { useAuth } from "./auth-context";

/**
 * Hook to get the API token for authenticated requests
 */
export function useApiToken(): string | null {
  const { token } = useAuth();
  return token;
}

