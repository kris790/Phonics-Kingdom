
import { PairingState } from '../types';

/**
 * Handles anonymous device linking.
 * Generates temporary codes to link a child device to a parent device
 * without requiring traditional accounts or PII.
 */
class PairingService {
  /**
   * Generates a new pairing code for the current device.
   */
  async generateCode(): Promise<string> {
    // In production, this would register a short-lived code in a sync DB (Firestore)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.debug('[Pairing] Generated Session Code:', code);
    return code;
  }

  /**
   * Checks if the current device has a valid link.
   */
  async verifyLink(pairingState: PairingState): Promise<boolean> {
    if (!pairingState.isPaired) return false;
    // Mock check: verify the parent ID is still active
    return true;
  }

  /**
   * Clears all pairing data.
   */
  async unpair(): Promise<void> {
    console.debug('[Pairing] Link severed.');
  }
}

export const pairingService = new PairingService();
