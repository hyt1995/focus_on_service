import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { verifyUser } from "@/utils/auth"; // 🔥 우리가 만든 토큰 해독기 추가!

export async function GET(request: Request) {
  // 🔥 1. 낡은 x-user-name 방식 대신 토큰 해독기로 인증!
  const user = await verifyUser(request);
  if (!user)
    return NextResponse.json(
      { error: "Unauthorized: 유효하지 않은 토큰입니다." },
      { status: 401 }
    );

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().settings) {
      return NextResponse.json(docSnap.data().settings);
    } else {
      return NextResponse.json({ startTime: "09:00", endTime: "18:00" });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load schedule" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  // 🔥 1. 낡은 x-user-name 방식 대신 토큰 해독기로 인증!
  const user = await verifyUser(request);
  if (!user)
    return NextResponse.json(
      { error: "Unauthorized: 유효하지 않은 토큰입니다." },
      { status: 401 }
    );
  const data = await request.json();

  try {
    const docRef = doc(db, "users", user.uid);
    // 🔥 settings 객체 안에 묶어서 저장!
    await setDoc(
      docRef,
      {
        settings: { startTime: data.startTime, endTime: data.endTime },
      },
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
