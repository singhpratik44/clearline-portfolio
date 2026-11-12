/* APERTURE / CALENDAR BRIDGE — private, read-only .ics parser.
   No network calls, OAuth, calendar mutation, auto-approval or attendee transmission. */
(function(root){
"use strict";
function unfold(text){return text.replace(/\r\n[ \t]|\n[ \t]/g,"").replace(/\r\n?/g,"\n");}
function unescapeICS(v){return v.replace(/\\[nN]/g,"\n").replace(/\\,/g,",").replace(/\\;/g,";").replace(/\\\\/g,"\\");}
function instant(raw,key){
 const v=raw?.trim()||"";
 if(!v)return null;
 if(/^\d{8}T\d{6}Z$/.test(v))return new Date(v.slice(0,4)+"-"+v.slice(4,6)+"-"+v.slice(6,8)+"T"+v.slice(9,11)+":"+v.slice(11,13)+":"+v.slice(13,15)+"Z").toISOString();
 if(/^\d{8}T\d{6}$/.test(v)){
  // Floating times are interpreted in the user's local timezone; TZID requires
  // explicit review because arbitrary calendar timezone databases are unavailable.
  if(/TZID=/i.test(key))return null;
  const d=new Date(Number(v.slice(0,4)),Number(v.slice(4,6))-1,Number(v.slice(6,8)),Number(v.slice(9,11)),Number(v.slice(11,13)),Number(v.slice(13,15)));
  return Number.isFinite(d.getTime())?d.toISOString():null;
 }
 return null; // date-only and unrecognized formats cannot be imported safely
}
function parse(text){
 if(typeof text!=="string"||text.length>1024*1024)throw Error("Calendar file must be text under 1 MB.");
 const lines=unfold(text).split("\n");
 if(!lines.some(x=>x.trim()==="BEGIN:VCALENDAR"))throw Error("Not an iCalendar file.");
 const out=[];let ev=null,seen=0;
 for(const line of lines){
  if(line.trim()==="BEGIN:VEVENT"){if(ev)throw Error("Nested calendar event.");ev={};seen++;if(seen>100)throw Error("Maximum 100 events per file.");continue;}
  if(line.trim()==="END:VEVENT"){
   if(!ev)throw Error("Unexpected event ending.");
   if(ev.summary&&ev.start&&!ev.cancelled&&!ev.recurrence){
    out.push({uid:ev.uid||null,title:ev.summary.slice(0,130),startsAt:ev.start,
     agenda:(ev.description||"").slice(0,1600),owner:(ev.organizer||"").slice(0,90)});
   }
   ev=null;continue;
  }
  if(!ev)continue;
  const i=line.indexOf(":");if(i<1)continue;
  const key=line.slice(0,i),name=key.split(";")[0].toUpperCase(),val=line.slice(i+1);
  if(name==="SUMMARY")ev.summary=unescapeICS(val).trim();
  if(name==="UID")ev.uid=val.slice(0,180);
  if(name==="DESCRIPTION")ev.description=unescapeICS(val).trim();
  if(name==="DTSTART")ev.start=instant(val,key);
  if(name==="STATUS"&&val.toUpperCase()==="CANCELLED")ev.cancelled=true;
  if(name==="RRULE"||name==="RECURRENCE-ID")ev.recurrence=true;
  if(name==="ORGANIZER")ev.organizer=unescapeICS(val.replace(/^mailto:/i,"")).slice(0,90);
 }
 if(ev)throw Error("Unclosed calendar event.");
 return {events:out,seen,skipped:seen-out.length,notice:"Recurring, cancelled, date-only, and timezone-qualified events are omitted; verify times before import."};
}
function key(m){return m.title.trim().toLowerCase()+"|"+new Date(m.startsAt).toISOString();}
function preview(events,existing){
 const known=new Set(existing.map(key)),seen=new Set();
 return events.map(e=>{
  const k=key(e),duplicate=known.has(k)||seen.has(k);seen.add(k);
  return {...e,duplicate};
 });
}
root.ApertureCalendarBridge={parse,preview};
})(typeof globalThis!=="undefined"?globalThis:this);
