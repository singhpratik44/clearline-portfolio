#!/usr/bin/env node
// APERTURE Control Plane: deterministic, read-only worker.
// It reads a committed registry and writes a JSON audit artifact.
// No network, payments, deployments, emails, or repository writes.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const root=process.cwd();
const registry=JSON.parse(fs.readFileSync(path.join(root,"project-control/portfolio-import.json"),"utf8"));
const projects=registry.projects;
const ids=new Set(projects.map(p=>p.id));
const failures=[],warnings=[];
if(ids.size!==projects.length)failures.push("Duplicate project IDs");
for(const p of projects){
 if(!p.id||!p.name||!p.source)failures.push("Incomplete project "+p.id);
 for(const dep of p.dependencies||[])if(!ids.has(dep))failures.push("Missing dependency "+p.id+" -> "+dep);
 if(p.path&&!fs.existsSync(path.join(root,p.path)))warnings.push("Candidate source path not found: "+p.path);
 if(p.approved)warnings.push("Imported project unexpectedly marked approved: "+p.id);
}
const graph=new Map(projects.map(p=>[p.id,p.dependencies||[]])),active=new Set(),done=new Set();
function walk(id){if(active.has(id)){failures.push("Dependency cycle at "+id);return}if(done.has(id))return;active.add(id);for(const dep of graph.get(id)||[])if(graph.has(dep))walk(dep);active.delete(id);done.add(id)}
for(const id of ids)walk(id);
const report={schema:"aperture.control-plane.worker-report.v1",createdAt:new Date().toISOString(),commit:process.env.GITHUB_SHA||null,mode:"read-only-audit",projects:projects.length,failures,warnings,reviewRequired:true,externalActionsPerformed:false};
const out=path.join(root,"project-control/worker-report.json");fs.writeFileSync(out,JSON.stringify(report,null,2)+"\n");
const sha=crypto.createHash("sha256").update(fs.readFileSync(out)).digest("hex");
console.log(JSON.stringify({report:out,sha256:sha,projects:projects.length,failures:failures.length,warnings:warnings.length},null,2));
if(failures.length)process.exitCode=1;
