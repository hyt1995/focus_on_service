// src/utils/timeFormat.ts

/**
 * 밀리초(ms)를 받아 '1일 02:30' 또는 '02:30' 형태의 하이엔드 포맷으로 변환하는 유틸
 */
export const formatHighEndTime = (ms: number): string => {
  const totalMins = Math.floor(ms / 60000);
  const d = Math.floor(totalMins / (24 * 60));
  const h = Math.floor((totalMins % (24 * 60)) / 60);
  const m = totalMins % 60;

  const hh = h.toString().padStart(2, "0");
  const mm = m.toString().padStart(2, "0");

  if (d > 0) {
    return `${d}일 ${hh}:${mm}`;
  }
  return `${hh}:${mm}`;
};
