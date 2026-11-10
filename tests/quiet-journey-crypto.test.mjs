import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { b64, fromB64, randomSalt, derive, encryptVault, decryptVault, parseBackup, validVault, MAX_BACKUP_BYTES } from "../prayer/three-year/vault-crypto.mjs";

if (!globalThis.crypto) globalThis.crypto = webcrypto;
const PASSWORD = "integration-test-only-correct-horse-467!"; // Never a real credential
const settings = { months:36, focus:"truth", minutes:10, start:"2026-11-09" };
const entry = { text:"Synthetic QA content: the garden is quiet.", done:true, updated:"2026-11-09T12:00:00.000Z" };
const sampleData = { settings, entries:{"2026-11-09":entry} };
const fixture = async () => {
  const salt=randomSalt();
  const key=await derive(PASSWORD,salt);
  return {salt,key,envelope:await encryptVault(key,sampleData,salt)};
};

test("AES-256-GCM round-trip and JSON backup restore with passphrase",async()=>{
  const {envelope}=await fixture();
  const raw=JSON.stringify(envelope);
  assert.ok(validVault(envelope));
  assert.ok(raw.length<MAX_BACKUP_BYTES);
  assert.equal(raw.includes(entry.text),false,"plaintext must never be stored in the backup");
  const imported=parseBackup(raw);
  const recoveredKey=await derive(PASSWORD,fromB64(imported.salt));
  const recovered=await decryptVault(recoveredKey,imported);
  assert.deepEqual(recovered,sampleData);
  assert.equal(imported.iv.length,16,"12-byte GCM IV must be base64 encoded");
});

test("passphrase check and ciphertext tampering are rejected",async()=>{
  const {envelope}=await fixture();
  const wrong=await derive("integration-test-only-incorrect-992!",fromB64(envelope.salt));
  await assert.rejects(()=>decryptVault(wrong,envelope),/./);
  const modified={...envelope,ciphertext:envelope.ciphertext.slice(0,-4)+(envelope.ciphertext.slice(-4)==="AAAA"?"BBBB":"AAAA")};
  const validKey=await derive(PASSWORD,fromB64(envelope.salt));
  await assert.rejects(()=>decryptVault(validKey,modified),/./);
});

test("strict backup validation rejects malformed, fake and oversized input",async()=>{
  const {envelope}=await fixture();
  assert.equal(validVault({ ...envelope, version:9 }),false);
  assert.equal(validVault({ ...envelope, iterations:1 }),false);
  assert.equal(validVault({ ...envelope, iv:b64(new Uint8Array(8)) }),false);
  assert.equal(validVault({ ...envelope, salt:"%%%%" }),false);
  assert.throws(()=>parseBackup("not JSON"));
  assert.throws(()=>parseBackup(JSON.stringify({ ...envelope, ciphertext:"%%%" })));
  assert.throws(()=>parseBackup(" ".repeat(MAX_BACKUP_BYTES+1)));
  assert.throws(()=>parseBackup(JSON.stringify({})));
});

test("unique salt and IV prevent repeating ciphertext for the same note",async()=>{
  const {key,salt,envelope}=await fixture();
  const second=await encryptVault(key,sampleData,salt);
  assert.notEqual(envelope.iv,second.iv);
  assert.notEqual(envelope.ciphertext,second.ciphertext);
});

test("passphrase length and invalid salts are rejected",async()=>{
  await assert.rejects(()=>derive("weak",randomSalt()),/passphrase/i);
  await assert.rejects(()=>derive(PASSWORD,new Uint8Array(8)),/salt/i);
});
