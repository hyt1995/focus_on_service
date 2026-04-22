import { NextResponse } from "next/server";
import {
  getAllTasks,
  saveTask,
  deleteTask,
  updateTask,
} from "../../../lib/dataService";

export const dynamic = "force-dynamic";

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
    const tasks = await getAllTasks(userName);
    return NextResponse.json(tasks);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const userName = getUser(request);
    const task = await request.json();
    const saved = await saveTask(userName, task);
    return NextResponse.json(saved);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const userName = getUser(request);
    const { id, updatedFields } = await request.json();
    const updated = await updateTask(userName, id, updatedFields);

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
    const userName = getUser(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) throw new Error("삭제할 ID가 없습니다.");

    await deleteTask(userName, id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
