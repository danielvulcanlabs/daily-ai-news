import type { ConnectorConfig, ConnectorUpdate } from '@/types/connector';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  scope?: string;
}

export abstract class BaseConnector {
  constructor(protected config: ConnectorConfig) {}

  get id() {
    return this.config.id;
  }

  get name() {
    return this.config.name;
  }

  /**
   * Build the OAuth authorization URL for the user to visit
   */
  getAuthUrl(redirectUri: string, state: string): string {
    if (!this.config.oauth) {
      throw new Error(`${this.name} does not support OAuth`);
    }

    const params = new URLSearchParams({
      client_id: process.env[this.config.oauth.clientIdEnv] || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: this.config.oauth.scopes.join(' '),
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `${this.config.oauth.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCode(code: string, redirectUri: string): Promise<TokenPair> {
    if (!this.config.oauth) {
      throw new Error(`${this.name} does not support OAuth`);
    }

    const response = await fetch(this.config.oauth.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env[this.config.oauth.clientIdEnv] || '',
        client_secret: process.env[this.config.oauth.clientSecretEnv] || '',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed for ${this.name}: ${error}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || '',
      expiresIn: data.expires_in || 3600,
      scope: data.scope,
    };
  }

  /**
   * Refresh an expired access token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    if (!this.config.oauth) {
      throw new Error(`${this.name} does not support OAuth`);
    }

    const response = await fetch(this.config.oauth.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env[this.config.oauth.clientIdEnv] || '',
        client_secret: process.env[this.config.oauth.clientSecretEnv] || '',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed for ${this.name}: ${error}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in || 3600,
      scope: data.scope,
    };
  }

  /**
   * Fetch updates from the connector since a given date
   */
  abstract fetchUpdates(accessToken: string, since: Date): Promise<ConnectorUpdate[]>;

  /**
   * Test if the connection is still valid
   */
  abstract testConnection(accessToken: string): Promise<boolean>;
}
