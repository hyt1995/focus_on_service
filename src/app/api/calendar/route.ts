import { NextResponse } from "next/server";
import { db } from "@/lib/firebase"; // firebase 설정 경로 확인
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function GET(request: Request) {
  const userName = request.headers.get("x-user-name");
  if (!userName)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decodedName = decodeURIComponent(userName);
  try {
    const docRef = doc(db, "users_calendar", decodedName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().schedules) {
      return NextResponse.json(docSnap.data().schedules);
    } else {
      return NextResponse.json([]); // 일정이 없으면 빈 배열 반환
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userName = request.headers.get("x-user-name");
  if (!userName)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decodedName = decodeURIComponent(userName);
  const { schedules } = await request.json();

  try {
    const docRef = doc(db, "users_calendar", decodedName);
    await setDoc(docRef, { schedules }, { merge: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
