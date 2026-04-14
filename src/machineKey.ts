import { MachineKey, MachineKeyRaw, MachineKeyDisplay } from "./types";
import { bytesToBase64Url, randomBytes } from "./utils";

/**
 * Generate a 32-byte MachineKey and a 100-char display string.
 *
 * - raw: 32 bytes (Uint8Array)
 * - display: 100 chars (base64url-like, deterministic from raw + extra random)
 */
export function generateMachineKey(): MachineKey {
  const rawBytes: Uint8Array = randomBytes(32);

  // 表示用は「100文字必ず行く」仕様に合わせる
  // 32バイトだけだと base64url で 43〜44文字程度なので、
  // 追加でランダムを足して 100 文字にパディングする。
  const extraBytes = randomBytes(64);
  const combined = new Uint8Array(rawBytes.length + extraBytes.length);
  combined.set(rawBytes, 0);
  combined.set(extraBytes, rawBytes.length);

  let display = bytesToBase64Url(combined);

  // 念のため 100 文字以上になるように調整（足りなければさらにランダムを足す）
  while (display.length < 100) {
    const more = randomBytes(16);
    display += bytesToBase64Url(more);
  }
  display = display.slice(0, 100);

  const raw: MachineKeyRaw = { bytes: rawBytes };
  const displayObj: MachineKeyDisplay = { display };

  return { raw, display: displayObj };
}

/**
 * For advanced usage: reconstruct MachineKey from raw bytes.
 * (UI 側で display を別管理したい場合など)
 */
export function fromRawBytes(bytes: Uint8Array, display?: string): MachineKey {
  const raw: MachineKeyRaw = { bytes };
  const displayObj: MachineKeyDisplay = {
    display: display ?? bytesToBase64Url(bytes).slice(0, 100)
  };
  return { raw, display: displayObj };
}
