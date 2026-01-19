import { useMemo } from "react";
import type { TimetableEntry, Day } from "@/types/timetable";
import { DAYS, PERIOD_TIMES, SUBJECT_COLORS } from "@/types/timetable";

// Parse the timetable CSV data
const TIMETABLE_RAW = `Day,Period,Start,Subject,Course,Teacher,Room
Monday,Period 1,08:10,IGCSE Computer Science,Y10 IGCSE_CS 104,Mr Harkins,301
Monday,Period 2,08:50,IGCSE Computer Science,Y10 IGCSE_CS 104,Mr Harkins,301
Monday,Period 3,09:30,IGCSE Physics,Y10 IGCSE_PHY 103,Mr Fulgham,304
Monday,Period 4,10:10,IGCSE Physics,Y10 IGCSE_PHY 103,Mr Fulgham,304
Monday,Period 5,11:10,Cycle Tests,Y10 S_CTEST 10H,Ms Congedo,
Monday,Period 6,11:50,HS Form,Y10 PSHE/ASS 10H,Mr Scotto,
Monday,Period 7,12:30,Italian Language and Culture Acquisition,Y10 ITA_LCA 101,Miss Gilardoni,311
Monday,Period 8,13:10,Italian Language and Culture Acquisition,Y10 ITA_LCA 101,Miss Gilardoni,311
Tuesday,Period 1,08:10,IGCSE French,Y10 IGCSE_FRE 104,Miss Guidez,302
Tuesday,Period 2,08:50,IGCSE French,Y10 IGCSE_FRE 104,Miss Guidez,302
Tuesday,Period 3,09:30,IGCSE Maths Ext,Y10 MAT_EXT 104,Mr Guite,209
Tuesday,Period 4,10:10,IGCSE Global Perspectives,Y10 IGCSE_GP 1,Ms Connell,206
Tuesday,Period 5,11:10,IGCSE English Literature,Y10 IGCSE_LIT 104,Mr Scotto,209
Tuesday,Period 6,11:50,IGCSE English Literature,Y10 IGCSE_LIT 104,Mr Scotto,209
Tuesday,Period 7,12:30,IGCSE Economics,Y10 IGCSE_ECO 106,Ms Marques,315
Tuesday,Period 8,13:10,IGCSE Economics,Y10 IGCSE_ECO 106,Ms Marques,315
Wednesday,Period 1,08:10,IGCSE Economics,Y10 IGCSE_ECO 106,Ms Marques,315
Wednesday,Period 2,08:50,IGCSE Economics,Y10 IGCSE_ECO 106,Ms Marques,315
Wednesday,Period 3,09:30,IGCSE English Literature,Y10 IGCSE_LIT 104,Mr Scotto,
Wednesday,Period 4,10:10,IGCSE English Literature,Y10 IGCSE_LIT 104,Mr Scotto,
Wednesday,Period 5,11:10,IGCSE Global Perspectives,Y10 IGCSE_GP 1,Ms Connell,206
Wednesday,Period 6,11:50,Cycle Tests,Y10 S_CTEST 10H,Mr Stam,
Wednesday,Period 7,12:30,IGCSE Maths Ext,Y10 MAT_EXT 104,Mr Guite,209
Wednesday,Period 8,13:10,IGCSE Maths Ext,Y10 MAT_EXT 104,Mr Guite,209
Thursday,Period 1,08:10,IGCSE Physics,Y10 IGCSE_PHY 103,Mr Fulgham,304
Thursday,Period 2,08:50,IGCSE Physics,Y10 IGCSE_PHY 103,Mr Fulgham,304
Thursday,Period 3,09:30,IGCSE English Literature,Y10 IGCSE_LIT 104,Mr Scotto,
Thursday,Period 4,10:10,IGCSE English Literature,Y10 IGCSE_LIT 104,Mr Scotto,
Thursday,Period 5,11:10,IGCSE French,Y10 IGCSE_FRE 104,Miss Guidez,302
Thursday,Period 6,11:50,IGCSE French,Y10 IGCSE_FRE 104,Miss Guidez,302
Thursday,Period 7,12:30,IGCSE Computer Science,Y10 IGCSE_CS 104,Mr Harkins,301
Thursday,Period 8,13:10,IGCSE Computer Science,Y10 IGCSE_CS 104,Mr Harkins,301
Friday,Period 1,08:10,IGCSE English Literature,Y10 IGCSE_LIT 104,Mr Scotto,
Friday,Period 2,08:50,IGCSE English Literature,Y10 IGCSE_LIT 104,Mr Scotto,
Friday,Period 3,09:30,IGCSE Maths Ext,Y10 MAT_EXT 104,Mr Guite,209
Friday,Period 4,10:10,IGCSE Maths Ext,Y10 MAT_EXT 104,Mr Guite,209
Friday,Period 5,11:10,IGCSE Global Perspectives,Y10 IGCSE_GP 1,Ms Connell,206
Friday,Period 6,11:50,IGCSE Global Perspectives,Y10 IGCSE_GP 1,Ms Connell,206
Friday,Period 7,12:30,Italian Language and Culture Acquisition,Y10 ITA_LCA 101,Miss Gilardoni,311
Friday,Period 8,13:10,Italian Language and Culture Acquisition,Y10 ITA_LCA 101,Miss Gilardoni,311`;

function parseTimetable(): TimetableEntry[] {
  const lines = TIMETABLE_RAW.split("\n");
  const entries: TimetableEntry[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const [day, period, start, subject, course, teacher, room] = lines[i].split(",");
    if (day && period) {
      entries.push({
        day,
        period,
        start,
        subject: subject || "",
        course: course || "",
        teacher: teacher || "",
        room: room || "",
      });
    }
  }
  
  return entries;
}

const TIMETABLE_DATA = parseTimetable();

export function useTimetable() {
  const today = new Date();
  const currentDay = DAYS[today.getDay() - 1] as Day | undefined; // Monday = 0
  
  const timetableByDay = useMemo(() => {
    const byDay: Record<Day, TimetableEntry[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    };
    
    for (const entry of TIMETABLE_DATA) {
      if (entry.day in byDay) {
        byDay[entry.day as Day].push(entry);
      }
    }
    
    return byDay;
  }, []);
  
  const todaySchedule = useMemo(() => {
    if (!currentDay) return [];
    return timetableByDay[currentDay] || [];
  }, [currentDay, timetableByDay]);
  
  const getCurrentPeriod = useMemo(() => {
    if (!currentDay) return null;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const entry of todaySchedule) {
      const times = PERIOD_TIMES[entry.period];
      if (times) {
        const [startH, startM] = times.start.split(":").map(Number);
        const [endH, endM] = times.end.split(":").map(Number);
        const startMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;
        
        if (currentTime >= startMins && currentTime < endMins) {
          return entry;
        }
      }
    }
    
    return null;
  }, [todaySchedule, currentDay]);
  
  const getNextPeriod = useMemo(() => {
    if (!currentDay) return null;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const entry of todaySchedule) {
      const times = PERIOD_TIMES[entry.period];
      if (times) {
        const [startH, startM] = times.start.split(":").map(Number);
        const startMins = startH * 60 + startM;
        
        if (currentTime < startMins) {
          return entry;
        }
      }
    }
    
    return null;
  }, [todaySchedule, currentDay]);
  
  return {
    timetableByDay,
    todaySchedule,
    currentDay,
    getCurrentPeriod,
    getNextPeriod,
    getSubjectColor: (subject: string) => SUBJECT_COLORS[subject] || "#6B7280",
    PERIOD_TIMES,
    DAYS,
  };
}
