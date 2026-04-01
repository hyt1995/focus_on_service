// src/utils/dateUtils.ts

/**
 * 오늘 날짜를 'YYYY-MM-DD' 형식의 문자열로 반환
 */
export const getTodayString = (): string => {
  return new Date().toISOString().split("T")[0];
};

/**
 * 로컬스토리지에 저장된 날짜와 오늘 날짜가 다른지 확인 (동기화 필요 여부)
 */
export const isSyncRequired = (lastSyncDate: string | null): boolean => {
  const today = getTodayString();
  return lastSyncDate !== today;
};
