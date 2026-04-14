import {
  generateMachineKey,
  deriveKeyFromPinAndMachineKey,
  encryptText,
  decryptText
} from "steadykey-crypto-core";

async function example() {
  const machineKey = generateMachineKey(); // 32 bytes + 100文字 display
  const pin = "1234";

  const derived = await deriveKeyFromPinAndMachineKey(pin, machineKey);

  const encrypted = await encryptText(derived, "secret-password");
  const decrypted = await decryptText(derived, encrypted);

  console.log({ encrypted, decrypted });
}
