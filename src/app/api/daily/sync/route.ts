import { NextResponse } from "next/server";
import {
  getAllDailyTemplates,
  saveMultipleTasks,
} from "../../../../lib/dataService";
import { verifyUser } from "@/utils/auth"; // 🔥 우리가 만든 토큰 해독기 추가!

export async function POST(request: Request) {
  try {
    // 🔥 1. 낡은 x-user-name 대신 토큰 해독기로 인증!
    const user = await verifyUser(request);
    if (!user)
      return NextResponse.json(
        { error: "Unauthorized: 유효하지 않은 토큰입니다." },
        { status: 401 }
      );

    const templates = await getAllDailyTemplates(user.uid);
    const activeTemplates = templates.filter(
      (t: any) => t.isEnabled === true || String(t.isEnabled) === "true"
    );
    if (activeTemplates.length === 0) {
      return NextResponse.json({ message: "동기화할 루틴이 없습니다." });
    }

    const now = new Date();
    const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const todayStr = kstTime.toISOString().split("T")[0];

    // 루틴 -> 일정 변환 시 order 부여 로직은 프론트 혹은 여기서 추가해도 좋아!
    const newTasks = activeTemplates.map((t: any, index: number) => ({
      id: Date.now() + index,
      title: `[루틴] ${t.title}`,
      description: t.desc || "",
      status: "todo",
      time: "10 min",
      progress: 0,
      deadline: t.deadline || "D-Day",
      createdAt: todayStr,
      order: index, // 🔥 순서값 부여!
    }));

    const updatedTasks = await saveMultipleTasks(user.uid, newTasks);
    return NextResponse.json(updatedTasks);
  } catch (error) {
    return NextResponse.json({ error: "서버 처리 실패" }, { status: 500 });
  }
}
