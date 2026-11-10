/* APERTURE Gmail authorization: browser-only Google Identity Services token model.
 * Requires user-owned Google OAuth Web Client ID with this Pages origin approved.
 * Token is ephemeral (in JS memory); no refresh token or secret storage.
 * ALL Gmail API requests are GET + gmail.readonly, and only user-imported threads.
 */
(function(root){
"use strict";
const CORE=root.AP4DGmailCore,READONLY="https://www.googleapis.com/auth/gmail.readonly";
const API="https://gmail.googleapis.com/gmail/v1/users/me";
let accessToken="",expiresAt=0,client=null,loaded=false,loading=null,busy=false;
function assertSecure(){
 if(root.location.protocol!=="https:"&&root.location.hostname!=="localhost"&&root.location.hostname!=="127.0.0.1")throw Error("Gmail connection is available only over HTTPS or localhost.");
}
function validateClientId(s){
 const id=String(s||"").trim();
 if(!/^[0-9]+-[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(id))throw Error("Enter a Google OAuth 2.0 Web Client ID ending .apps.googleusercontent.com.");
 return id;
}
async function ensureLibrary(){
 assertSecure();
 if(root.google?.accounts?.oauth2){loaded=true;return true;}
 if(loading)return loading;
 loading=new Promise((resolve,reject)=>{
  const script=document.createElement("script");
  script.src="https://accounts.google.com/gsi/client";script.async=true;
  script.referrerPolicy="no-referrer";
  script.onload=()=>{if(!root.google?.accounts?.oauth2){reject(Error("Google Identity Services did not initialize."));return;}loaded=true;resolve(true);};
  script.onerror=()=>reject(Error("Google sign-in script could not load. Check network or content blockers."));
  document.head.append(script);
 });
 try{return await loading;}finally{loading=null;}
}
function connected(){return !!accessToken&&Date.now()<expiresAt-60000;}
async function connect(clientId){
 assertSecure();
 const id=validateClientId(clientId);
 if(!root.google?.accounts?.oauth2)throw Error("Google sign-in is not loaded. Click Prepare Google sign-in first.");
 return await new Promise((resolve,reject)=>{
  try{
   client=root.google.accounts.oauth2.initTokenClient({
    client_id:id,scope:READONLY,
    callback:response=>{
      if(response?.error||!response?.access_token){reject(Error("Google did not grant Gmail read-only access: "+String(response?.error||"access denied")));return;}
      if(!root.google.accounts.oauth2.hasGrantedAllScopes(response,READONLY)){reject(Error("Gmail read-only permission was not granted."));return;}
      accessToken=response.access_token;expiresAt=Date.now()+Math.max(0,Number(response.expires_in||0))*1000;
      resolve({connected:true,expires_at:new Date(expiresAt).toISOString(),scope:READONLY});
    },
    error_callback:e=>reject(Error("Google OAuth popup failed: "+String(e?.type||"unknown")))
   });
   // requestAccessToken must be invoked in a real click, never silently.
   client.requestAccessToken({prompt:"consent"});
  }catch(e){reject(e);}
 });
}
function disconnect(){
 if(accessToken&&root.google?.accounts?.oauth2?.revoke){
  try{root.google.accounts.oauth2.revoke(accessToken,()=>{});}catch{}
 }
 accessToken="";expiresAt=0;client=null;
}
async function getThread(threadId){
 if(!connected())throw Error("Google token expired or is not connected. Reauthorize explicitly.");
 if(!CORE.THREAD_RE.test(threadId))throw Error("Invalid Gmail thread ID.");
 const url=API+"/threads/"+encodeURIComponent(threadId)+"?"+
  new URLSearchParams([["format","metadata"],["metadataHeaders","Subject"],["metadataHeaders","From"],["metadataHeaders","To"],["metadataHeaders","Auto-Submitted"],["metadataHeaders","Precedence"],["metadataHeaders","X-Autoreply"]]);
 let lastError;
 for(let attempt=0;attempt<2;attempt++){
  const response=await fetch(url,{method:"GET",headers:{Authorization:"Bearer "+accessToken,Accept:"application/json"},cache:"no-store",redirect:"error",credentials:"omit",referrerPolicy:"no-referrer"});
  if(response.status===401){accessToken="";throw Error("Google token expired or was revoked; please reconnect.");}
  if(response.status===403)throw Error("Gmail access denied. Verify Gmail API is enabled and the OAuth test user/consent configuration.");
  if(response.status===404)throw Error("Thread not found or unavailable; verify the signed-in Google account.");
  if(response.status===429||response.status>=500){lastError=Error("Gmail temporary error "+response.status);if(attempt===0){await new Promise(resolve=>setTimeout(resolve,500));continue;}}
  if(!response.ok)throw lastError||Error("Gmail API returned HTTP "+response.status);
  const size=Number(response.headers.get("content-length")||0);if(size>1000000)throw Error("Thread metadata exceeds 1 MB limit.");
  const data=await response.json();
  if(!data?.messages||!Array.isArray(data.messages))throw Error("Gmail thread response did not contain message metadata.");
  if(data.messages.length>200)throw Error("A single thread exceeds the 200-message review limit.");
  return data;
 }
 throw lastError||Error("Gmail fetch failed.");
}
async function synchronize(opportunities,progress){
 if(busy)throw Error("A Gmail sync is already running.");
 if(!connected())throw Error("Connect with your Google account first.");
 if(!Array.isArray(opportunities))throw Error("Import private opportunities first.");
 const ids=Array.from(new Set(opportunities.map(r=>CORE.threadId(r.gmail_thread_id||r.source_url)).filter(Boolean)));
 if(!ids.length)throw Error("No linked Gmail threads found in imported records.");
 if(ids.length>25)throw Error("Limit each review sync to 25 source threads.");
 let rows=opportunities.slice(),added=0,updated=0,unchanged=0,newMessages=0;
 let errors=[];
 busy=true;
 try{
  // Serial requests protect quota; each thread is metadata-only, no mailbox scan.
  for(let i=0;i<ids.length;i++){
   const id=ids[i];progress?.({done:i,total:ids.length,thread:id});
   try{
    const t=await getThread(id);
    const result=CORE.merge(rows,t);
    rows=result.opportunities;added+=result.added;updated+=result.updated;
    unchanged+=result.unchanged;newMessages+=result.new_messages;
   }catch(e){errors.push({thread_id:id,error:String(e?.message||e).slice(0,220)});}
  }
 }finally{busy=false;}
 progress?.({done:ids.length,total:ids.length});
 return {opportunities:rows,added,updated,unchanged,new_messages:newMessages,errors,checked:ids.length,synced_at:new Date().toISOString(),source:"gmail_api_readonly"};
}
root.AP4DGmail={READONLY,validateClientId,ensureLibrary,connected,connect,disconnect,synchronize};
})(typeof globalThis!=="undefined"?globalThis:this);
