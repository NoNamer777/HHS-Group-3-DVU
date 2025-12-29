import axios from 'axios';

interface Auth0TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get Auth0 M2M access token for testing
 * Tokens are cached and reused until they expire
 */
export async function getAuth0Token(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const domain = process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '');
  const clientId = process.env.AUTH0_CLIENT_ID;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;
  const audience = process.env.AUTH0_AUDIENCE;

  if (!domain || !clientId || !clientSecret || !audience) {
    throw new Error(
      'Missing Auth0 configuration. Required environment variables:\n' +
      '  - AUTH0_ISSUER_BASE_URL\n' +
      '  - AUTH0_CLIENT_ID\n' +
      '  - AUTH0_CLIENT_SECRET\n' +
      '  - AUTH0_AUDIENCE'
    );
  }

  try {
    const response = await axios.post<Auth0TokenResponse>(
      `https://${domain}/oauth/token`,
      {
        client_id: clientId,
        client_secret: clientSecret,
        audience: audience,
        grant_type: 'client_credentials'
      }
    );

    const token = response.data.access_token;
    const expiresIn = response.data.expires_in;

    // Cache token
    cachedToken = {
      token,
      expiresAt: Date.now() + expiresIn * 1000
    };

    return token;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `Failed to get Auth0 token: ${error.response.status} ${JSON.stringify(error.response.data)}`
      );
    }
    throw new Error(`Failed to get Auth0 token: ${error.message}`);
  }
}

/**
 * Clear cached token (useful for testing token refresh)
 */
export function clearTokenCache(): void {
  cachedToken = null;
}
