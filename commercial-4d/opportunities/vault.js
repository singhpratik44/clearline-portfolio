/* APERTURE Private Vault v1: WebCrypto AES-GCM, PBKDF2, opt-in IndexedDB.
 * No plaintext or passphrase is written to localStorage, cookies, or GitHub.
 * Security model: protects data at rest if browser storage is copied, NOT
 * against scripts maliciously running in the origin or a compromised device.
 */
(function(root){
"use strict";
const NAME="aperture-commercial-4d-private",STORE="vaults",KEY="primary",ITER=310000;
const MAX_RECORD_BYTES=5*1024*1024;
function bytesToB64(bytes){let s="";for(let i=0;i<bytes.length;i+=16384)s+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(s);}
function b64ToBytes(s){
 if(typeof s!=="string"||s.length>MAX_RECORD_BYTES*2)throw Error("Invalid or oversized encrypted payload");
 const raw=atob(s);const a=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)a[i]=raw.charCodeAt(i);return a;
}
function available(){return !!(root.crypto?.subtle&&root.crypto.getRandomValues&&root.indexedDB);}
async function derive(pass,salt,iterations,usage){
 if(typeof pass!=="string"||pass.length<12)throw Error("Vault passphrase must be at least 12 characters.");
 const material=await root.crypto.subtle.importKey("raw",new TextEncoder().encode(pass),"PBKDF2",false,["deriveKey"]);
 return root.crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations,hash:"SHA-256"},material,{name:"AES-GCM",length:256},false,[usage]);
}
async function seal(value,passphrase){
 if(!available())throw Error("Encrypted browser storage is unavailable here. Use HTTPS in a supported browser.");
 const payload=new TextEncoder().encode(JSON.stringify(value));
 if(payload.byteLength>MAX_RECORD_BYTES)throw Error("The private bundle exceeds the 5 MB limit.");
 const salt=root.crypto.getRandomValues(new Uint8Array(16)),iv=root.crypto.getRandomValues(new Uint8Array(12));
 const key=await derive(passphrase,salt,ITER,"encrypt");
 const ciphertext=await root.crypto.subtle.encrypt({name:"AES-GCM",iv,additionalData:new TextEncoder().encode("APERTURE-4D-VAULT-v1"),tagLength:128},key,payload);
 return {schema:"aperture-vault-v1",cipher:"AES-256-GCM",kdf:"PBKDF2-HMAC-SHA256",iterations:ITER,salt:bytesToB64(salt),iv:bytesToB64(iv),data:bytesToB64(new Uint8Array(ciphertext)),encrypted_at:new Date().toISOString()};
}
async function open(envelope,passphrase){
 if(!available())throw Error("WebCrypto and IndexedDB are required on HTTPS.");
 if(!envelope||envelope.schema!=="aperture-vault-v1"||envelope.cipher!=="AES-256-GCM"||envelope.kdf!=="PBKDF2-HMAC-SHA256"||envelope.iterations!==ITER)throw Error("Encrypted vault format or settings are unsupported.");
 const salt=b64ToBytes(envelope.salt),iv=b64ToBytes(envelope.iv),data=b64ToBytes(envelope.data);
 if(salt.length!==16||iv.length!==12||data.length>MAX_RECORD_BYTES+256)throw Error("Corrupt encrypted vault.");
 const key=await derive(passphrase,salt,ITER,"decrypt");
 let plaintext;
 try{plaintext=await root.crypto.subtle.decrypt({name:"AES-GCM",iv,additionalData:new TextEncoder().encode("APERTURE-4D-VAULT-v1"),tagLength:128},key,data);}
 catch{throw Error("Wrong passphrase or corrupted vault; nothing has been changed.");}
 return JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(plaintext));
}
function database(){
 if(!root.indexedDB)throw Error("IndexedDB is unavailable. Try encrypted export instead.");
 return new Promise((resolve,reject)=>{
  const req=root.indexedDB.open(NAME,1);
  req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error("Unable to open private encrypted storage"));
  req.onblocked=()=>reject(Error("Close other APERTURE tabs and retry vault access."));
 });
}
async function write(envelope){
 const db=await database();
 try{await new Promise((resolve,reject)=>{
  const t=db.transaction(STORE,"readwrite");t.objectStore(STORE).put(envelope,KEY);
  t.oncomplete=resolve;t.onerror=()=>reject(t.error||Error("Encrypted vault write failed."));t.onabort=()=>reject(t.error||Error("Encrypted vault write aborted."));
 });}finally{db.close();}
}
async function read(){
 const db=await database();
 try{return await new Promise((resolve,reject)=>{
  const t=db.transaction(STORE,"readonly");const r=t.objectStore(STORE).get(KEY);
  r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error||Error("Private vault read failed."));
 });}finally{db.close();}
}
async function clear(){
 const db=await database();
 try{await new Promise((resolve,reject)=>{
  const t=db.transaction(STORE,"readwrite");t.objectStore(STORE).delete(KEY);
  t.oncomplete=resolve;t.onerror=()=>reject(t.error||Error("Vault delete failed."));t.onabort=()=>reject(t.error||Error("Vault delete aborted."));
 });}finally{db.close();}
}
root.AP4DVault={available,seal,open,read,write,clear,MAX_RECORD_BYTES,ITER};
if(typeof module!=="undefined"&&module.exports)module.exports=root.AP4DVault;
})(typeof globalThis!=="undefined"?globalThis:this);
