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
    // 🔥 users_usage가 아니라 users 메인 껍데기 문서를 바라봄!
    const docRef = doc(db, "users", decodedName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const aiUsage = data.aiUsage || {};

      if (aiUsage.date === today) {
        return NextResponse.json({
          count: aiUsage.count || 0,
          isPremium: data.isPremium || false,
        });
      }
      return NextResponse.json({
        count: 0,
        isPremium: data.isPremium || false,
      });
    }

    return NextResponse.json({ count: 0, isPremium: false });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load usage" },
      { status: 500 }
    );
  }
}
