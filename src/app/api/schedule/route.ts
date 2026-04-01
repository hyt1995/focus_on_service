import { NextResponse } from "next/server";
import { db } from "@/lib/firebase"; // firebase 설정 파일 경로에 맞게 수정하세요
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function GET(request: Request) {
  const userName = request.headers.get("x-user-name");
  if (!userName)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decodedName = decodeURIComponent(userName);

  try {
    const docRef = doc(db, "users_schedule", decodedName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return NextResponse.json(docSnap.data());
    } else {
      return NextResponse.json({ startTime: "09:00", endTime: "18:00" }); // 기본값
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load schedule" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const userName = request.headers.get("x-user-name");
  if (!userName)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decodedName = decodeURIComponent(userName);
  const data = await request.json();

  try {
    const docRef = doc(db, "users_schedule", decodedName);
    // setDoc에 merge: true를 주면 기존 데이터에 덮어쓰기(업데이트) 됩니다.
    await setDoc(
      docRef,
      { startTime: data.startTime, endTime: data.endTime },
      { merge: true }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save schedule" },
      { status: 500 }
    );
  }
}
