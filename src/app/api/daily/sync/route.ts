// /src/app/api/daily/sync/route.ts

import { NextResponse } from "next/server";
import {
  getAllDailyTemplates,
  saveMultipleTasks,
} from "../../../../lib/dataService";

export async function POST(request: Request) {
  try {
    const rawUserName = request.headers.get("x-user-name");
    if (!rawUserName) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }
    const userName = decodeURIComponent(rawUserName);

    // 1. 체크박스가 켜진(isEnabled: true) 데일리 루틴만 긁어온다
    const templates = await getAllDailyTemplates(userName);
    const activeTemplates = templates.filter((t: any) => t.isEnabled);

    if (activeTemplates.length === 0) {
      return NextResponse.json({ message: "동기화할 루틴이 없습니다." });
    }

    // 2. KST(한국 시간) 기준 오늘 날짜 구하기
    const now = new Date();
    const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const todayStr = kstTime.toISOString().split("T")[0];

    // 3. 루틴을 진짜 Task(카드) 형태로 변환
    const newTasks = activeTemplates.map((t: any, index: number) => ({
      id: Date.now() + index, // 겹치지 않는 고유 ID 부여
      title: `[루틴] ${t.title}`, // 루틴임을 알 수 있게 말머리 추가
      description: t.desc || "",
      status: "todo", // 무조건 '진행 전' 탭으로
      time: "10 min",
      progress: 0,
      deadline: t.deadline || "D-Day",
      createdAt: todayStr,
    }));

    // 4. DB의 기존 tasks 배열에 안전하게 추가 (아까 만든 절대 방어벽 saveMultipleTasks 사용)
    const updatedTasks = await saveMultipleTasks(userName, newTasks);

    return NextResponse.json(updatedTasks);
  } catch (error) {
    console.error("데일리 동기화 에러:", error);
    return NextResponse.json({ error: "서버 처리 실패" }, { status: 500 });
  }
}
