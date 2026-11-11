/**
 * APERTURE arXiv ingestion, Node 22+.
 * Run: node research/ingest-arxiv.mjs 2610.28679 2606.04874
 * Network errors fail closed; never replace the curated register with invented metadata.
 * Output JSON to stdout; stderr for diagnostics.
 */
import {pathToFileURL} from "node:url";
const API="https://export.arxiv.org/api/query";
const clean=s=>s.replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g," ").trim();
const tag=(xml,name)=>clean(xml.match(new RegExp("<"+name+"(?:\\s[^>]*)?>([\\s\\S]*?)<\\/"+name+">","i"))?.[1]??"");
export function parseArxivAtom(xml) {
  const entries=[...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/g)].map(m=>m[1]);
  return entries.map(entry=>{
    const id=tag(entry,"id").match(/\/(\d{4}\.\d{4,5})(v\d+)?(?:$|\?)/);
    if(!id) return null;
    const published=tag(entry,"published"),updated=tag(entry,"updated");
    return {source:"arxiv",id:"arxiv:"+id[1],version:id[2]??null,title:tag(entry,"title"),abstract:tag(entry,"summary"),published_at:published||null,updated_at:updated||null,url:"https://arxiv.org/abs/"+id[1]+(id[2]??""),retrieved_at:null,review_status:"preprint; peer review not inferred"};
  }).filter(Boolean);
}
export function validateArxivIds(ids) {
  if(!Array.isArray(ids)||ids.length===0||ids.length>50||ids.some(id=>!/^\d{4}\.\d{4,5}(?:v\d+)?$/.test(id))) throw new Error("Provide 1-50 valid arXiv identifiers");
  return [...new Set(ids)];
}
export async function fetchArxiv(ids,{fetchImpl=fetch,now=()=>new Date().toISOString()}={}) {
  const valid=validateArxivIds(ids);
  const url=API+"?id_list="+encodeURIComponent(valid.join(","))+"&max_results="+valid.length;
  const response=await fetchImpl(url,{headers:{Accept:"application/atom+xml"},signal:AbortSignal.timeout(15000)});
  if(!response.ok) throw new Error("arXiv returned HTTP "+response.status);
  const body=await response.text();
  const papers=parseArxivAtom(body);
  if(papers.length===0) throw new Error("arXiv response contained no parseable entries");
  const requested=new Set(valid.map(id=>id.replace(/v\d+$/,"")));
  if(papers.some(p=>!requested.has(p.id.slice(6)))) throw new Error("Unexpected arXiv identifier in response");
  return papers.map(p=>({...p,retrieved_at:now()}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
  fetchArxiv(process.argv.slice(2)).then(p=>process.stdout.write(JSON.stringify({records:p},null,2)+"\n")).catch(err=>{process.stderr.write("Ingestion failed: "+err.message+"\n");process.exitCode=1});
}
