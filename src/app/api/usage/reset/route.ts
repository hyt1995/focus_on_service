// src/app/api/usage/reset/route.ts

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { verifyUser } from "@/utils/auth"; // 🔥 우리가 만든 토큰 해독기 추가!

function getTodayKST() {
  const now = new Date();
  const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kstTime.toISOString().split("T")[0];
}

export async function POST(request: Request) {
  const user = await verifyUser(request);
  if (!user)
    return NextResponse.json(
      { error: "Unauthorized: 유효하지 않은 토큰입니다." },
      { status: 401 }
    );

  const today = getTodayKST();

  try {
    // 🌟 DB 단일화 원칙: users 컬렉션 내부의 aiUsage 객체를 0으로 초기화!
    const docRef = doc(db, "users", user.uid);
    await setDoc(
      docRef,
      { aiUsage: { count: 0, date: today } },
      { merge: true }
    );

    return NextResponse.json({ success: true, count: 0 });
  } catch (error: any) {
    console.error("🚨 리셋 에러:", error);
    return NextResponse.json(
      { error: "Failed to reset usage" },
      { status: 500 }
    );
  }
}
