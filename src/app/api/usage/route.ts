// src/app/api/usage/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// 🔥 핵심: 무조건 한국 시간(KST) 기준의 '오늘 날짜(YYYY-MM-DD)'를 뽑아내는 함수
function getTodayKST() {
  const now = new Date();
  const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC에 9시간 더하기
  return kstTime.toISOString().split("T")[0];
}

export async function GET(request: Request) {
  const userName = request.headers.get("x-user-name");
  if (!userName)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decodedName = decodeURIComponent(userName);
  const today = getTodayKST(); // 🔥 KST 적용

  try {
    const docRef = doc(db, "users_usage", decodedName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // DB에 기록된 날짜가 '한국 시간 오늘'이면 카운트 반환, 아니면 0
      if (data.date === today) {
        return NextResponse.json({
          count: data.count,
          isPremium: data.isPremium || false,
        });
      }
    }
    // 데이터가 없거나 날짜가 바뀌었으면 0회 사용으로 반환
    return NextResponse.json({ count: 0, isPremium: false });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load usage" },
      { status: 500 }
    );
  }
}
