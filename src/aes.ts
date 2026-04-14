import { AesGcmCiphertext, EncryptedPayload, DerivedKeyResult } from "./types";
import { randomBytes, bytesToBase64Url, base64UrlToBytes } from "./utils";

/**
 * Encrypt arbitrary UTF-8 text using a derived AES-GCM key.
 *
 * - `derived`: result from deriveKeyFromPinAndMachineKey
 * - `plaintext`: string to encrypt
 */
export async function encryptText(
  derived: DerivedKeyResult,
  plaintext: string
): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  const iv = randomBytes(12); // 96-bit IV recommended for AES-GCM

  const ciphertextBuf = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    derived.key,
    data
  );

  const ciphertext = new Uint8Array(ciphertextBuf);

  return {
    iv: bytesToBase64Url(iv),
    data: bytesToBase64Url(ciphertext),
    salt: bytesToBase64Url(derived.params.salt),
    iterations: derived.params.iterations
  };
}

/**
 * Decrypt an EncryptedPayload back into UTF-8 text.
 *
 * - `derived`: must be derived with the same PIN + MachineKey + KDF params
 * - `payload`: stored encrypted payload
 */
export async function decryptText(
  derived: DerivedKeyResult,
  payload: EncryptedPayload
): Promise<string> {
  const iv = base64UrlToBytes(payload.iv);
  const ciphertext = base64UrlToBytes(payload.data);

  const decryptedBuf = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv
    },
    derived.key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuf);
}

/**
 * Low-level AES-GCM encrypt (raw bytes).
 */
export async function encryptBytes(
  key: CryptoKey,
  data: Uint8Array
): Promise<AesGcmCiphertext> {
  const iv = randomBytes(12);
  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return {
    iv,
    ciphertext: new Uint8Array(ciphertextBuf)
  };
}

/**
 * Low-level AES-GCM decrypt (raw bytes).
 */
export async function decryptBytes(
  key: CryptoKey,
  cipher: AesGcmCiphertext
): Promise<Uint8Array> {
  const decryptedBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: cipher.iv },
    key,
    cipher.ciphertext
  );
  return new Uint8Array(decryptedBuf);
}
