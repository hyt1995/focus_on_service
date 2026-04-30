// 파일 경로: app/api/tasks/reorder/route.ts
import { NextResponse } from "next/server";
import { reorderTasks } from "@/lib/dataService";
import { verifyUser } from "@/utils/auth"; // 🔥 우리가 만든 토큰 해독기 추가!

export async function POST(request: Request) {
  try {
    // 🔥 낡은 x-user-name 방식 대신 토큰 해독기로 인증!
    const user = await verifyUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: 유효하지 않은 토큰입니다." },
        { status: 401 }
      );
    }

    const { reorderedTasks } = await request.json();

    // DB 업데이트 실행
    const saved = await reorderTasks(user.uid, reorderedTasks);
    return NextResponse.json(saved);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "서버 에러" },
      { status: 500 }
    );
  }
}
