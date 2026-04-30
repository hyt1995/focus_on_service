// src/app/api/calendar/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  writeBatch,
  query,
  orderBy,
} from "firebase/firestore";
import { verifyUser } from "@/utils/auth"; // 🔥 우리가 만든 토큰 해독기 추가!

// 🔥 1. 캐싱 절대 금지 (새로고침 시 무조건 DB 찌름)
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // 🔥 1. 낡은 x-user-name 방식 대신 토큰 해독기로 인증!
  const user = await verifyUser(request);
  if (!user)
    return NextResponse.json(
      { error: "Unauthorized: 유효하지 않은 토큰입니다." },
      { status: 401 }
    );

  try {
    // 🌟 2. 새로운 방(calendar_events)에서 날짜순으로 가져옴
    const colRef = collection(db, "users", user.uid, "calendar_events");
    const q = query(colRef, orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);

    const schedules = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(schedules);
  } catch (error) {
    console.error("달력 가져오기 에러:", error);
    return NextResponse.json([]);
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
  const { schedules } = await request.json();

  try {
    const colRef = collection(db, "users", user.uid, "calendar_events");

    // 🌟 3. 서브 컬렉션 Batch 업서트 (통신 비용 최소화)
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);

    // a. 기존 달력 방에 있던 데이터 싹 다 지우기 (초기화)
    snapshot.docs.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });

    // b. 프론트에서 넘어온 새로운 배열 데이터를 하나씩 예쁘게 문서로 생성
    schedules.forEach((schedule: any) => {
      const docRef = doc(colRef, schedule.id);
      batch.set(docRef, schedule);
    });

    // c. 이 모든 작업을 단 1번의 통신으로 서버에 반영!
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("달력 저장 에러:", error);
    return NextResponse.json(
      { error: "Failed to save schedules" },
      { status: 500 }
    );
  }
}
