// src/types/index.ts
export interface Task {
  id: number | string;
  title: string;
  description?: string; // 🔥 카드 상세내역 추가
  time: string;
  deadline: string;
  progress: number;
  createdAt: string;
  audioPath?: string;
  startedAt?: number;
  lastStartedAt?: number | null;
  isActive?: boolean;
  status?: string;
  order?: number;
}

export interface Schedule {
  id: string;
  date: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}
