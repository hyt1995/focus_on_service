// src/app/api/deepgram/route.ts

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const apiKey = process.env.DEEP_GRAM_API_KEY;
    const projectId = process.env.DEEP_GRAM_PROJECT_ID; // 딥그램 대시보드 URL에 있는 프로젝트 ID

    if (!apiKey || !projectId) {
      return NextResponse.json(
        { error: "환경 변수 누락 (API 키 또는 프로젝트 ID)" },
        { status: 500 }
      );
    }

    // 딥그램 서버로 10분(600초)짜리 임시 키 발급을 직접 요청 (SDK 불필요)
    const response = await fetch(
      `https://api.deepgram.com/v1/projects/${projectId}/keys`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: "Temp client token for frontend",
          scopes: ["usage:write"],
          time_to_live_in_seconds: 600,
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      console.error("Deepgram API Error:", errData);
      throw new Error("딥그램 통행증 발급 실패");
    }

    const data = await response.json();

    // 무사히 발급된 1회용 키를 프론트엔드로 전달
    return NextResponse.json({ token: data.key });
  } catch (e) {
    console.error("Token Route Error:", e);
    return NextResponse.json({ error: "서버 처리 실패" }, { status: 500 });
  }
}
