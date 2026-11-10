/**
 * A Quiet Journey v2 — offline-only encrypted vault primitives.
 * Browser Web Crypto only. No network, third-party libraries or credential recovery.
 * Envelope format v1 remains readable by the initial release.
 */
export const ITERATIONS = 250000;
export const VAULT_VERSION = 1;
export const MAX_BACKUP_BYTES = 3_000_000;

export function b64(bytes) {
  if (!(bytes instanceof Uint8Array)) bytes = new Uint8Array(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    out += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(out);
}
export function fromB64(text) {
  if (typeof text !== "string" || text.length > MAX_BACKUP_BYTES * 2 ||
      text.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(text)) {
    throw new Error("Invalid encoded data");
  }
  return Uint8Array.from(atob(text), c => c.charCodeAt(0));
}
export function validVault(v) {
  if (!v || typeof v !== "object" || Array.isArray(v) ||
      v.version !== VAULT_VERSION || v.kdf !== "PBKDF2-SHA256" ||
      v.iterations !== ITERATIONS ||
      typeof v.salt !== "string" || typeof v.iv !== "string" ||
      typeof v.ciphertext !== "string" ||
      v.ciphertext.length > MAX_BACKUP_BYTES * 2) return false;
  try {
    return fromB64(v.salt).length === 16 &&
      fromB64(v.iv).length === 12 &&
      fromB64(v.ciphertext).length >= 16;
  } catch { return false; }
}
export function randomSalt() {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return salt;
}
export async function derive(password, salt) {
  if (typeof password !== "string" || password.length < 12 || password.length > 200 ||
      !(salt instanceof Uint8Array) || salt.length !== 16)
    throw new Error("Invalid passphrase or salt");
  const input = new TextEncoder().encode(password);
  const base = await crypto.subtle.importKey("raw", input, "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name:"PBKDF2", salt, iterations:ITERATIONS, hash:"SHA-256" },
    base, { name:"AES-GCM", length:256 }, false, ["encrypt","decrypt"]
  );
}
export async function encryptVault(key, data, salt) {
  if (!(salt instanceof Uint8Array) || salt.length !== 16) throw new Error("Invalid salt");
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  if (bytes.length > MAX_BACKUP_BYTES - 512) throw new Error("Journal exceeds backup size limit");
  const sealed = await crypto.subtle.encrypt({name:"AES-GCM",iv},key,bytes);
  return {
    version:VAULT_VERSION,
    kdf:"PBKDF2-SHA256",
    iterations:ITERATIONS,
    salt:b64(salt),
    iv:b64(iv),
    ciphertext:b64(new Uint8Array(sealed))
  };
}
export async function decryptVault(key, envelope) {
  if (!validVault(envelope)) throw new Error("Invalid encrypted vault");
  const plaintext = await crypto.subtle.decrypt(
    {name:"AES-GCM", iv:fromB64(envelope.iv)},
    key,fromB64(envelope.ciphertext)
  );
  const data = JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(plaintext));
  if (!data || typeof data !== "object" || Array.isArray(data) ||
      !data.entries || typeof data.entries !== "object" || Array.isArray(data.entries) ||
      !data.settings || typeof data.settings !== "object") {
    throw new Error("Invalid journal structure");
  }
  return data;
}
export function parseBackup(input) {
  if (typeof input !== "string" || input.length > MAX_BACKUP_BYTES) throw new Error("Backup too large");
  const data = JSON.parse(input);
  if (!validVault(data)) throw new Error("Not a valid encrypted A Quiet Journey backup");
  return data;
}
