import { NextResponse } from "next/server";
import {
  getAllDailyTemplates,
  saveMultipleTasks,
} from "../../../../lib/dataService";

export async function POST(request: Request) {
  try {
    const rawUserName = request.headers.get("x-user-name");
    if (!rawUserName)
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );

    const userName = decodeURIComponent(rawUserName);
    const templates = await getAllDailyTemplates(userName);
    const activeTemplates = templates.filter((t: any) => t.isEnabled);

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

    const updatedTasks = await saveMultipleTasks(userName, newTasks);
    return NextResponse.json(updatedTasks);
  } catch (error) {
    return NextResponse.json({ error: "서버 처리 실패" }, { status: 500 });
  }
}
