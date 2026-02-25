/**
 * Biometric Authentication Service
 * Uses Web Authentication API (WebAuthn) for biometric login
 */

const STORAGE_KEY = 'biometric_enabled';
const CREDENTIAL_KEY = 'biometric_credential_id';

export class BiometricAuthService {
  /**
   * Check if biometric authentication is available on this device
   */
  static isAvailable(): boolean {
    return (
      window.PublicKeyCredential !== undefined &&
      navigator.credentials !== undefined
    );
  }

  /**
   * Check if biometric authentication is enabled for this wallet
   */
  static isEnabled(): boolean {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }

  /**
   * Register biometric authentication for the current wallet
   */
  static async register(userId: string): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new Error('Biometric authentication is not available on this device');
    }

    try {
      // Generate a challenge (in production, this should come from server)
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'Web3 Wallet',
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userId,
          displayName: 'Wallet User',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Use platform authenticator (Touch ID, Face ID, Windows Hello)
          userVerification: 'required',
        },
        timeout: 60000,
        attestation: 'none',
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (credential) {
        // Store credential ID
        const credentialId = btoa(
          String.fromCharCode(...new Uint8Array(credential.rawId))
        );
        localStorage.setItem(CREDENTIAL_KEY, credentialId);
        localStorage.setItem(STORAGE_KEY, 'true');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Biometric registration failed:', error);
      throw error;
    }
  }

  /**
   * Authenticate using biometric
   */
  static async authenticate(): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new Error('Biometric authentication is not available on this device');
    }

    if (!this.isEnabled()) {
      throw new Error('Biometric authentication is not enabled');
    }

    try {
      const credentialId = localStorage.getItem(CREDENTIAL_KEY);
      if (!credentialId) {
        throw new Error('No biometric credential found');
      }

      // Generate a challenge (in production, this should come from server)
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Convert base64 credential ID back to ArrayBuffer
      const credentialIdBuffer = Uint8Array.from(atob(credentialId), c =>
        c.charCodeAt(0)
      );

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [
          {
            id: credentialIdBuffer,
            type: 'public-key',
            transports: ['internal'],
          },
        ],
        timeout: 60000,
        userVerification: 'required',
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      return assertion !== null;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      throw error;
    }
  }

  /**
   * Disable biometric authentication
   */
  static disable(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CREDENTIAL_KEY);
  }

  /**
   * Get biometric type name (for display purposes)
   */
  static getBiometricType(): string {
    const platform = navigator.platform.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();

    if (platform.includes('mac') || userAgent.includes('mac')) {
      return 'Touch ID / Face ID';
    } else if (platform.includes('win') || userAgent.includes('windows')) {
      return 'Windows Hello';
    } else if (userAgent.includes('android')) {
      return 'Fingerprint / Face Unlock';
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'Touch ID / Face ID';
    }

    return 'Biometric Authentication';
  }
}
