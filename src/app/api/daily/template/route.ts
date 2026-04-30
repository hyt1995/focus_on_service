// /src/app/api/daily/template/route.ts

import { NextResponse } from "next/server";
import { verifyUser } from "@/utils/auth"; // 🔥 우리가 만든 토큰 해독기 추가!
// 네가 만든 dataService에서 방금 추가한 함수들을 불러온다. (경로 주의)
import {
  getAllDailyTemplates,
  saveDailyTemplate,
  deleteDailyTemplate,
  updateDailyTemplate,
} from "../../../../lib/dataService";

export const dynamic = "force-dynamic";

// 1. 조회 (GET)
export async function GET(request: Request) {
  try {
    // 🔥 getUser 대신 verifyUser로 인증하고 user.uid 전달
    const user = await verifyUser(request);
    if (!user)
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    const templates = await getAllDailyTemplates(user.uid);
    return NextResponse.json(templates);
  } catch (e: any) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
}

// 2. 추가 (POST) - 비즈니스 로직(5개 제한) 적용
export async function POST(request: Request) {
  try {
    // 🔥 verifyUser로 인증 적용
    const user = await verifyUser(request);
    if (!user)
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    const templateData = await request.json();

    // 현재 저장된 템플릿 개수 가져오기
    const currentTemplates = await getAllDailyTemplates(user.uid);
    const MAX_FREE_SLOTS = 5;

    // TODO: 프리미엄 유저 검증 로직 추가. 일단은 모두 5개 제한.
    const isPremium = false;
    if (!isPremium && currentTemplates.length >= MAX_FREE_SLOTS) {
      return NextResponse.json(
        { error: "무료 제공 슬롯(5개)을 초과했습니다." },
        { status: 403 }
      );
    }

    const saved = await saveDailyTemplate(user.uid, templateData);
    return NextResponse.json(saved, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
}

// 3. 수정 (PUT)
export async function PUT(request: Request) {
  try {
    // 🔥 verifyUser로 인증 적용
    const user = await verifyUser(request);
    if (!user)
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    const { id, updatedFields } = await request.json();

    const updated = await updateDailyTemplate(user.uid, id, updatedFields);

    if (!updated) {
      return NextResponse.json(
        { error: "데이터를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

// 4. 삭제 (DELETE)
export async function DELETE(request: Request) {
  try {
    // 🔥 verifyUser로 인증 적용
    const user = await verifyUser(request);
    if (!user)
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) throw new Error("삭제할 ID가 없습니다.");

    await deleteDailyTemplate(user.uid, id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "권한이 없습니다." },
      { status: 401 }
    );
  }
}
