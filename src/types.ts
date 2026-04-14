export interface MachineKeyRaw {
  /** 32 bytes of random key material (Uint8Array length 32) */
  bytes: Uint8Array;
}

export interface MachineKeyDisplay {
  /** Human-facing representation (e.g. 100 chars, base64url-like) */
  display: string;
}

/**
 * Combined MachineKey representation:
 * - raw bytes for crypto
 * - display string for UI / backup
 */
export interface MachineKey {
  raw: MachineKeyRaw;
  display: MachineKeyDisplay;
}

export interface KdfParams {
  /** PBKDF2 iteration count */
  iterations: number;
  /** Salt used for PBKDF2 (Uint8Array) */
  salt: Uint8Array;
}

export interface DerivedKeyResult {
  /** CryptoKey usable for AES-GCM */
  key: CryptoKey;
  /** Parameters used to derive this key (for storage) */
  params: KdfParams;
}

export interface AesGcmCiphertext {
  /** IV used for AES-GCM */
  iv: Uint8Array;
  /** Ciphertext bytes (includes auth tag) */
  ciphertext: Uint8Array;
}

export interface EncryptedPayload {
  /** Base64URL-encoded IV */
  iv: string;
  /** Base64URL-encoded ciphertext */
  data: string;
  /** Base64URL-encoded salt used for KDF */
  salt: string;
  /** PBKDF2 iteration count */
  iterations: number;
}
