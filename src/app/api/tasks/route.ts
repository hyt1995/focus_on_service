// --- app/api/tasks/route.ts

import { NextResponse } from "next/server";
import {
  getAllTasks,
  saveTask,
  deleteTask,
  updateTask,
} from "../../../lib/dataService";

// --- app/api/tasks/route.ts 파일 하단에 추가 ---

// 👇 이 마법의 한 줄을 반드시 추가하십시오. Next.js에게 "캐시 쓰지 말고 무조건 DB에서 새로 가져와!" 라고 명령하는 겁니다.
export const dynamic = "force-dynamic";

// 4. 수정 (PUT)
export async function PUT(request: Request) {
  try {
    // 1. 헤더에서 입장권(유저 이름) 확인
    const userName = getUser(request);

    // 2. 바디에서 수정할 데이터 추출
    const { id, updatedFields } = await request.json();

    // 3. dataService의 updateTask 호출 시 userName을 첫 번째 인자로 전달!
    const updated = await updateTask(userName, id, updatedFields);

    if (!updated) {
      return NextResponse.json(
        { error: "데이터를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (e: any) {
    // 유저 이름이 없거나 권한 에러 시 401 반환
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

// 인증 미들웨어 역할: 헤더에서 userName을 강제로 추출합니다.
function getUser(request: Request) {
  const userName = request.headers.get("x-user-name");
  if (typeof userName !== "string") throw new Error("이름이 없습니다.");
  const decodeUserName = decodeURIComponent(userName);
  if (!decodeUserName) throw new Error("Unauthorized");
  return decodeUserName;
}

export async function GET(request: Request) {
  try {
    const userName = getUser(request);
    const tasks = await getAllTasks(userName); // 백엔드 로직에 userName 전달
    return NextResponse.json(tasks);
  } catch (e) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userName = getUser(request);
    const task = await request.json();
    const saved = await saveTask(userName, task); // 백엔드 로직에 userName 전달
    return NextResponse.json(saved);
  } catch (e) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userName = getUser(request);
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    await deleteTask(userName, id); // 백엔드 로직에 userName 전달
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "권한이 없습니다." },
      { status: 401 }
    );
  }
}
