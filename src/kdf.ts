import { DerivedKeyResult, KdfParams, MachineKey } from "./types";
import { concatBytes, randomBytes, bytesToBase64Url } from "./utils";

/**
 * Derive an AES-GCM key from PIN + MachineKey using PBKDF2-HMAC-SHA-256.
 *
 * - PIN: short, user-facing secret
 * - MachineKey: 32-byte device-bound secret
 * - salt: random 16 bytes (stored with payload)
 * - iterations: configurable (default 200_000)
 */
export async function deriveKeyFromPinAndMachineKey(
  pin: string,
  machineKey: MachineKey,
  options?: { iterations?: number; salt?: Uint8Array }
): Promise<DerivedKeyResult> {
  const iterations = options?.iterations ?? 200_000;
  const salt = options?.salt ?? randomBytes(16);

  // KDF input: PIN UTF-8 bytes + raw MachineKey bytes
  const encoder = new TextEncoder();
  const pinBytes = encoder.encode(pin);
  const input = concatBytes(pinBytes, machineKey.raw.bytes);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    input,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  const params: KdfParams = { iterations, salt };
  return { key, params };
}

/**
 * Helper to serialize KdfParams for storage (e.g. inside EncryptedPayload).
 */
export function serializeKdfParams(params: KdfParams): { salt: string; iterations: number } {
  return {
    salt: bytesToBase64Url(params.salt),
    iterations: params.iterations
  };
}
