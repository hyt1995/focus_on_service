const now = Date.now();

// 🌟 수정됨: 영수증 컴포넌트가 요구하는 createdAt, startedAt, lastStartedAt 완벽 추가
const mockTasks = [
  {
    id: 1,
    title: "1. 타임 영수증 기획 및 디자인",
    status: "done",
    createdAt: now - 1000 * 60 * 60 * 3, // 3시간 전 (화면에 찍히는 시간)
    startedAt: now - 1000 * 60 * 60 * 3,
    lastStartedAt: now - 1000 * 60 * 60 * 1.5, // 1.5시간 전 완료 (총 1시간 30분 소요)
  },
  {
    id: 2,
    title: "2. 인스타그램 마케팅 소재 기획",
    status: "done",
    createdAt: now - 1000 * 60 * 60 * 1.5,
    startedAt: now - 1000 * 60 * 60 * 1.5,
    lastStartedAt: now - 1000 * 60 * 60 * 0.5, // 총 1시간 소요
  },
  {
    id: 3,
    title: "3. 서비스 최종 배포 테스트",
    status: "in-progress",
    createdAt: now - 1000 * 60 * 30, // 30분 전
    startedAt: now - 1000 * 60 * 30, // 진행 중이므로 lastStartedAt 생략 -> 30분째 카운트다운 중
  },
];

export default mockTasks;
