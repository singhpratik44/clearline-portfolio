/** User-provided operational records. No scraping, external calls, or personal data persistence. */
import {prepareDecision} from "./decision-report.mjs";
const FIELDS={
 career:{id:"string",title:"string",organization:"string",source_url:"url",verified_at:"date",compensation_min:"number",compensation_max:"number",fit_score:"score"},
 partnership:{id:"string",organization:"string",source_url:"url",verified_at:"date",stage:"string",consent_confirmed:"boolean",agreement_confirmed:"boolean"}
};
const prohibited=/^(?:email|phone|student_name|student_id|dob|ssn|address|access_token|api_key|secret)$/i;
export function validateOperationalRecord(kind,record){
 const spec=FIELDS[kind];if(!spec)throw new RangeError("Unsupported record kind");
 if(!record||typeof record!=="object"||Array.isArray(record))throw new TypeError("Record must be an object");
 const errors=[];
 for(const key of Object.keys(record))if(prohibited.test(key)||!Object.hasOwn(spec,key))errors.push("disallowed-field:"+key);
 for(const [key,type] of Object.entries(spec)){
  const v=record[key];
  if(v===undefined||v===null||v===""){errors.push("missing:"+key);continue;}
  if(type==="string"&&(typeof v!=="string"||v.length>200))errors.push("invalid:"+key);
  if(type==="url"&&(typeof v!=="string"||!/^https:\/\/[^\s]+$/.test(v)))errors.push("invalid:"+key);
  if(type==="date"&&(typeof v!=="string"||!Number.isFinite(Date.parse(v))))errors.push("invalid:"+key);
  if(type==="number"&&(!Number.isFinite(v)||v<0))errors.push("invalid:"+key);
  if(type==="score"&&(!Number.isFinite(v)||v<0||v>1))errors.push("invalid:"+key);
  if(type==="boolean"&&typeof v!=="boolean")errors.push("invalid:"+key);
 }
 if(kind==="career"&&Number.isFinite(record.compensation_min)&&Number.isFinite(record.compensation_max)&&record.compensation_min>record.compensation_max)errors.push("invalid:compensation_range");
 return {valid:errors.length===0,errors};
}
export function evaluateOperationalRecord(kind,record,{now=new Date()}={}){
 const validation=validateOperationalRecord(kind,record);
 if(!validation.valid)return {status:"REJECTED",errors:validation.errors,executed:false};
 const caseId=kind==="career"?"career-application":"uspa-referral";
 const completed=kind==="career"?["verified_listing"]:["partner_agreement"].filter(()=>record.agreement_confirmed).concat(record.consent_confirmed?["school_consent"]:[]);
 const evidence=[{id:record.id,title:kind==="career"?record.title:record.organization,url:record.source_url,published_at:record.verified_at,retrieved_at:record.verified_at,review_status:"source record; not peer-reviewed"}];
 const report=prepareDecision({caseId,completed,evidence,now});
 return {kind,record_id:record.id,organization:record.organization,report,executed:false};
}
