// src/app/api/tasks/route.ts

import { NextResponse } from "next/server";
import {
  getAllTasks,
  saveTask,
  deleteTask,
  updateTask,
} from "../../../lib/dataService";
import { verifyUser } from "@/utils/auth"; // 🔥 1. 우리가 만든 토큰 해독기 추가

export const dynamic = "force-dynamic";

// function getUser(request: Request) {
//   const userName = request.headers.get("x-user-name");
//   if (typeof userName !== "string") throw new Error("이름이 없습니다.");
//   const decodeUserName = decodeURIComponent(userName);
//   if (!decodeUserName) throw new Error("Unauthorized");
//   return decodeUserName;
// }

export async function GET(request: Request) {
  try {
    // 🔥 getUser 대신 verifyUser로 토큰 해독 후, userName 대신 user.uid 전달
    const user = await verifyUser(request);
    if (!user) throw new Error("Unauthorized: 유효하지 않은 토큰입니다.");
    const tasks = await getAllTasks(user.uid);
    return NextResponse.json(tasks);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await verifyUser(request);
    if (!user) throw new Error("Unauthorized");
    const task = await request.json();
    const saved = await saveTask(user.uid, task);
    return NextResponse.json(saved);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await verifyUser(request);
    if (!user) throw new Error("Unauthorized");
    const { id, updatedFields } = await request.json();
    const updated = await updateTask(user.uid, id, updatedFields);

    if (!updated) {
      return NextResponse.json(
        { error: "데이터를 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await verifyUser(request);
    if (!user) throw new Error("Unauthorized");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) throw new Error("삭제할 ID가 없습니다.");

    await deleteTask(user.uid, id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
