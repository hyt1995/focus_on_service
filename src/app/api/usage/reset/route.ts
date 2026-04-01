import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

function getTodayKST() {
  const now = new Date();
  const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kstTime.toISOString().split("T")[0];
}

export async function POST(request: Request) {
  const userName = request.headers.get("x-user-name");
  if (!userName)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decodedName = decodeURIComponent(userName);
  const today = getTodayKST();

  try {
    const docRef = doc(db, "users_usage", decodedName);
    // 🔥 count를 0으로 강제 리셋. (기존 isPremium 값은 유지하기 위해 merge: true)
    await setDoc(docRef, { count: 0, date: today }, { merge: true });

    return NextResponse.json({ success: true, count: 0 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reset usage" },
      { status: 500 }
    );
  }
}
