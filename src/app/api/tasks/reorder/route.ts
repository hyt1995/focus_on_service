// 파일 경로: app/api/tasks/reorder/route.ts
import { NextResponse } from "next/server";
import { reorderTasks } from "@/lib/dataService";

export async function POST(request: Request) {
  try {
    const rawUserName = request.headers.get("x-user-name");
    if (!rawUserName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userName = decodeURIComponent(rawUserName);

    const { reorderedTasks } = await request.json();

    // DB 업데이트 실행
    const saved = await reorderTasks(userName, reorderedTasks);
    return NextResponse.json(saved);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "서버 에러" },
      { status: 500 }
    );
  }
}
