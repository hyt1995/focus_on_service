// /src/app/api/usage/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

function getTodayKST() {
  const now = new Date();
  const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kstTime.toISOString().split("T")[0];
}

export async function GET(request: Request) {
  const userName = request.headers.get("x-user-name");
  if (!userName)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decodedName = decodeURIComponent(userName);
  const today = getTodayKST();

  try {
    // 🌟 단일화 및 비용 절감: users 컬렉션 한 번만 읽기!
    const userRef = doc(db, "users", decodedName);
    const userSnap = await getDoc(userRef);

    let isPremium = false;
    let count = 0;

    if (userSnap.exists()) {
      const userData = userSnap.data();
      isPremium = userData.isPremium || false;

      // 🔥 과거의 users_usage가 아니라, 갱신된 최신 데이터(users 문서 안의 aiUsage 객체)를 바라봄!
      if (userData.aiUsage && userData.aiUsage.date === today) {
        count = Number(userData.aiUsage.count) || 0;
      }
    }

    return NextResponse.json({ count, isPremium });
  } catch (error) {
    console.error("Usage load error:", error);
    return NextResponse.json(
      { error: "Failed to load usage" },
      { status: 500 }
    );
  }
}
