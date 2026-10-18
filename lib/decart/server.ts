/**
 * Decart Server Utilities
 * Handles secure token issuance for client-side Lucy V-TON WebRTC session.
 * Uses the official @decartai/sdk — DECART_API_KEY is NEVER sent to the browser.
 */

export interface DecartTokenResponse {
  isConfigured: boolean;
  apiKey?: string;
  error?: string;
}

export async function getDecartClientSession(): Promise<DecartTokenResponse> {
  const apiKey = process.env.DECART_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'dummy_key_for_build') {
    return {
      isConfigured: false,
      error: 'DECART_API_KEY is not configured on the server. MirrorFit is running in Demo Mode.',
    };
  }

  try {
    // Dynamically import to avoid loading the SDK in browser bundles
    const { createDecartClient } = await import('@decartai/sdk');
    const client = createDecartClient({ apiKey });

    // Generate a short-lived ephemeral client token
    const tokenResponse = await client.tokens.create();

    return {
      isConfigured: true,
      apiKey: tokenResponse.apiKey,
    };
  } catch (err) {
    console.error('Error generating Decart client token:', err);
    return {
      isConfigured: false,
      error: err instanceof Error ? err.message : 'Unknown error generating Decart token',
    };
  }
}
