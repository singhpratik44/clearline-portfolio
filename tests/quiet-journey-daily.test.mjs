import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parseISODate,formatISODate,addCalendarMonths,dailyWindow,dailyPlan,STEP_TITLES} from "../prayer/three-year/daily-practice.mjs";
const base={start:"2026-11-09",today:"2026-11-09",months:36,focus:"truth",minutes:10};

test("dates are calendar-correct, DST-independent, and reject impossible dates",()=>{
  assert.equal(formatISODate(parseISODate("2028-02-29")),"2028-02-29");
  assert.throws(()=>parseISODate("2027-02-29"));
  assert.throws(()=>parseISODate("2028-13-01"));
  assert.throws(()=>parseISODate("2028-02-30"));
  assert.equal(addCalendarMonths("2027-01-31",1),"2027-02-28");
  assert.equal(addCalendarMonths("2028-01-31",1),"2028-02-29");
});

test("three years include leap days and real anniversary transitions",()=>{
  const first=dailyWindow(base);
  assert.equal(first.totalDays,1096);
  assert.equal(first.dayNumber,1);
  assert.equal(first.monthNumber,1);
  assert.equal(first.status,"active");
  const secondYear=dailyWindow({...base,today:"2027-11-09"});
  assert.equal(secondYear.monthNumber,13);
  assert.equal(secondYear.yearNumber,2);
  const thirdYear=dailyWindow({...base,today:"2028-11-09"});
  assert.equal(thirdYear.monthNumber,25);
  assert.equal(thirdYear.yearNumber,3);
  assert.equal(dailyWindow({...base,today:"2029-11-08"}).dayNumber,1096);
  assert.equal(dailyWindow({...base,today:"2029-11-09"}).status,"complete");
});

test("start dates in the future and ended commitments are not check-in eligible",()=>{
  const future=dailyWindow({...base,start:"2027-11-09",today:"2026-11-09"});
  assert.equal(future.status,"upcoming");
  assert.equal(future.isCurrentDay,false);
  assert.equal(future.dayNumber,1);
  const done=dailyWindow({...base,today:"2030-12-01"});
  assert.equal(done.status,"complete");
  assert.equal(done.isCurrentDay,false);
});

test("daily plan is deterministic, personalizable, and has exactly five meaningful steps",()=>{
  const a=dailyPlan(base),b=dailyPlan(base);
  assert.deepEqual(a,b);
  assert.equal(a.steps.length,5);
  assert.deepEqual(a.steps.map(s=>s.label),STEP_TITLES);
  assert.match(a.focusInvitation,/true/i);
  const other=dailyPlan({...base,focus:"seva",minutes:20,today:"2026-11-10"});
  assert.match(other.focusInvitation,/help/i);
  assert.match(other.steps[0].detail,/20-minute/);
  assert.notEqual(a.prompt,other.prompt);
});

test("ten-year path navigates year 10 while keeping daily practice available",()=>{
  const year10=dailyPlan({...base,months:120,today:"2036-05-01"});
  assert.equal(year10.yearNumber,10);
  assert.ok(year10.dayNumber>3000);
  assert.equal(year10.status,"active");
  assert.throws(()=>dailyPlan({...base,focus:"made_up"}));
  assert.throws(()=>dailyWindow({...base,months:1}));
});

test("daily experience links to independent scripture readers without fabricated verses",()=>{
  const html=readFileSync(new URL("../prayer/three-year/index.html",import.meta.url),"utf8");
  const js=readFileSync(new URL("../prayer/three-year/daily-ui.mjs",import.meta.url),"utf8");
  assert.match(html,/href="https:\/\/www\.sikhitothemax\.org\/"/);
  assert.match(html,/href="https:\/\/readsggs\.com\/"/);
  assert.match(html,/not reproduce their texts, translations or audio/);
  assert.match(html,/id="dailyRecord"/);
  assert.match(html,/data-daily-step="4"/);
  assert.match(js,/persistVault\(\)/);
  assert.match(js,/state\.vaultData\.entries\[day\]/);
  assert.doesNotMatch(js,/\bfetch\s*\(|sendBeacon|XMLHttpRequest/i);
});
