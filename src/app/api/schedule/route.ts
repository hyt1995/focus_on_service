import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function GET(request: Request) {
  const userName = request.headers.get("x-user-name");
  if (!userName)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const decodedName = decodeURIComponent(userName);

  try {
    const docRef = doc(db, "users", decodedName);
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
  const userName = request.headers.get("x-user-name");
  if (!userName)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const decodedName = decodeURIComponent(userName);
  const data = await request.json();

  try {
    const docRef = doc(db, "users", decodedName);
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
