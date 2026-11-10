(()=>{
"use strict";
const form=document.getElementById("interest"),status=document.getElementById("coach-status");
form.addEventListener("submit",e=>{
 e.preventDefault();
 const name=document.getElementById("coach-name").value.trim(),
   email=document.getElementById("coach-email").value.trim(),
   track=document.getElementById("coach-track").value,
   available=document.getElementById("coach-availability").value.trim(),
   notes=document.getElementById("coach-notes").value.trim();
 if(name.length<2||name.length>80||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
   status.textContent="Enter a preferred name and a valid email before opening the draft.";return;
 }
 const subject="APERTURE Learning — coding instructor interest ("+track+")";
 const body=[
  "Hello APERTURE Learning,","",
  "I am interested in exploring online project-based coding instruction.",
  "Name: "+name,"Reply email: "+email,"Preferred coding subject(s): "+track,
  "Typical weekly availability: "+(available||"To be discussed"),
  "Experience and compensation preferences: "+(notes||"To be discussed"),"",
  "Please share the instructor screening, student-safety, scheduling and compensation process.",
  "",
  "I understand this inquiry is not an offer or accepted appointment."
 ].join("\n");
 status.textContent="Your email application will open in your email program. Review it before sending; no information was submitted to this website.";
 window.location.href="mailto:parry.s.2324@gmail.com?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
});
})();