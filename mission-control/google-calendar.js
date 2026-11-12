/* APERTURE / GOOGLE CALENDAR READ-ONLY
   User-initiated OAuth token, no refresh token or persistent credentials.
   Only calendar.readonly; metadata only, never attendees or descriptions.
   No event writes, invites, recordings, email, or unattended sync. */
(function(root){
"use strict";
const SCOPE="https://www.googleapis.com/auth/calendar.readonly";
const ORIGIN="https://accounts.google.com/gsi/client";
let token=null,client=null,expires=0,epoch=0;
const validId=id=>/^[0-9]+-[a-z0-9_-]+\.apps\.googleusercontent\.com$/.test(id||"");
const iso=s=>{const d=new Date(s);return Number.isFinite(d.getTime())?d.toISOString():null;};
function normalizeEvent(e,calendarId){
 if(!e||e.status==="cancelled"||e.recurringEventId||e.recurrence||e.eventType&&e.eventType!=="default")return null;
 const start=e.start?.dateTime?iso(e.start.dateTime):null;
 if(!start||!e.id||!e.summary||!calendarId)return null;
 return {provider:"google-calendar",providerId:String(calendarId).slice(0,180)+"|"+String(e.id).slice(0,180),
 title:String(e.summary).slice(0,130),startsAt:start,agenda:"",owner:"",source:"Google Calendar read-only metadata (title/time only). Confirm all details before using as evidence."};
}
function dedup(events,existing){
 const keys=new Set(existing.map(x=>x.title.trim().toLowerCase()+"|"+x.startsAt));
 const seen=new Set();
 return events.map(e=>{
  const key=e.title.trim().toLowerCase()+"|"+e.startsAt;
  const duplicate=keys.has(key)||seen.has(key);seen.add(key);
  return {...e,duplicate};
 });
}
function install(){
 if(root.google?.accounts?.oauth2)return Promise.resolve();
 if(document.querySelector("script[data-aperture-gis]"))return new Promise((resolve,reject)=>{
  let n=0;const t=setInterval(()=>{if(root.google?.accounts?.oauth2){clearInterval(t);resolve();}else if(++n>80){clearInterval(t);reject(Error("Google sign-in unavailable."));}},100);
 });
 return new Promise((resolve,reject)=>{
  const s=document.createElement("script");s.src=ORIGIN;s.async=true;s.dataset.apertureGis="true";
  s.onload=()=>root.google?.accounts?.oauth2?resolve():reject(Error("Google Identity Services unavailable."));
  s.onerror=()=>reject(Error("Could not load Google's sign-in library."));
  document.head.append(s);
 });
}
async function authorize(clientId){
 if(!validId(clientId))throw Error("Enter a valid Google OAuth Web Client ID.");
 await install();
 return new Promise((resolve,reject)=>{
  let settled=false;const done=(fn,val)=>{if(settled)return;settled=true;fn(val);};
  try{
   client=root.google.accounts.oauth2.initTokenClient({
    client_id:clientId,scope:SCOPE,include_granted_scopes:false,
    callback:r=>{
     if(r.error||!r.access_token){done(reject,Error("Google authorization was not granted."));return;}
     token=r.access_token;expires=Date.now()+Math.min(3300,Math.max(60,Number(r.expires_in)||3600))*1000;epoch++;
     done(resolve,{scope:SCOPE,expiresAt:expires});
    },
    error_callback:()=>done(reject,Error("Google authorization cancelled or blocked."))
   });
   client.requestAccessToken({prompt:"consent"});
  }catch(e){done(reject,e);}
 });
}
function disconnect(){
 const previous=token;token=null;expires=0;epoch++;client=null;
 if(previous&&root.google?.accounts?.oauth2?.revoke)root.google.accounts.oauth2.revoke(previous,()=>{});
}
async function readEvents({days=30,calendarId="primary"}={}){
 if(!token||Date.now()>expires-30000)throw Error("Calendar session expired. Reconnect with explicit consent.");
 if(calendarId!=="primary")throw Error("Only the primary calendar is supported in this pilot.");
 const currentEpoch=epoch,access=token;
 const start=new Date(),end=new Date(start.getTime()+Math.min(60,Math.max(1,days))*86400000);
 const params=new URLSearchParams({
  timeMin:start.toISOString(),timeMax:end.toISOString(),maxResults:"100",
  singleEvents:"false",orderBy:"updated",
  fields:"items(id,summary,status,start(dateTime),recurringEventId,recurrence,eventType),nextPageToken"
 });
 const url="https://www.googleapis.com/calendar/v3/calendars/primary/events?"+params;
 const response=await fetch(url,{method:"GET",headers:{Authorization:"Bearer "+access,Accept:"application/json"},cache:"no-store",redirect:"error",referrerPolicy:"no-referrer"});
 if(currentEpoch!==epoch)throw Error("Calendar disconnected during sync.");
 if(!response.ok)throw Error(response.status===401?"Google session expired. Reconnect.":"Google Calendar read failed (HTTP "+response.status+").");
 const body=await response.json();
 if(currentEpoch!==epoch)throw Error("Calendar disconnected during sync.");
 const raw=Array.isArray(body.items)?body.items:[];
 return {events:raw.map(e=>normalizeEvent(e,calendarId)).filter(Boolean),
  skipped:raw.length-raw.map(e=>normalizeEvent(e,calendarId)).filter(Boolean).length,
  truncated:Boolean(body.nextPageToken),
  note:"Only the first 100 calendar entries in the selected window were read. Recurring events, all-day events, cancelled entries, and non-default event types are excluded. No descriptions, guests or attachments were requested."};
}
root.ApertureGoogleCalendar={authorize,disconnect,readEvents,dedup,normalizeEvent,validId,scope:SCOPE,isConnected:()=>Boolean(token&&Date.now()<expires-30000)};
})(typeof globalThis!=="undefined"?globalThis:this);
