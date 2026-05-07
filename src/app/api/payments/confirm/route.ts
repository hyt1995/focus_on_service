// src/app/api/payments/confirm/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase"; // 🌟 자네의 기존 설정 파일!
import { doc, setDoc } from "firebase/firestore"; // 🌟 프론트엔드용 SDK 함수
import axios from "axios";
import https from "https";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userUid = payload.uid as string;
    const userName = payload.name as string;

    const { paymentKey, orderId, amount } = await req.json();

    if (paymentKey === "LOCAL_TEST_PAYMENT_KEY") {
      console.log(
        `🛠️ [백엔드] 통신 우회! 가짜 영수증 프리미엄 승인: ${userName}`
      );
    } else {
      if (!paymentKey || !orderId || !amount) {
        return NextResponse.json(
          { error: "결제 정보가 누락되었습니다." },
          { status: 400 }
        );
      }

      const certString = (process.env.TIME_DIVE_MTLS_PUBLIC || "").replace(
        /\\n/g,
        "\n"
      );
      const keyString = (process.env.TIME_DIVE_MTLS_PRIVATE || "").replace(
        /\\n/g,
        "\n"
      );

      const httpsAgent = new https.Agent({
        cert: certString,
        key: keyString,
        rejectUnauthorized: false,
      });

      const res = await axios.post(
        "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/payment/confirm",
        { paymentKey, orderId, amount },
        { httpsAgent }
      );

      console.log("✅ 토스 승인 성공:", res.data);

      console.log(`✅ [실제 환경] 토스 결제 승인 완료: ${userName}`);
    }

    // 🌟 어드민 대신 클라이언트 SDK(setDoc) 방식으로 프리미엄 승급 완료!
    const userRef = doc(db, "Users", userUid);
    await setDoc(
      userRef,
      {
        isPremium: true,
        premiumActivatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log(
      `👑 [DB 업데이트] 유저 ${userName}(${userUid}) 프리미엄 승급 완료!`
    );

    return NextResponse.json({
      success: true,
      message: "결제 및 프리미엄 승급 완료",
    });
  } catch (error: any) {
    console.error("🚨 결제 검증 에러:", error?.response?.data || error.message);
    if (error.response) {
      // 토스 서버가 응답은 줬는데 에러인 경우 (예: 400 Bad Request)
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data));
    } else if (error.request) {
      // 토스 서버에 닿지도 못한 경우 (인증서 문제일 확률 99%)
      console.error("요청은 보냈으나 응답 없음 (인증서/네트워크 확인 요망)");
    } else {
      console.error("설정 에러:", error.message);
    }
    return NextResponse.json(
      { error: "결제 검증에 실패했습니다." },
      { status: 400 }
    );
  }
}
