import { NextResponse } from "next/server";
import admin from "firebase-admin";
import axios from "axios";
import https from "https";
import fs from "fs";
import { jwtVerify } from "jose"; // JWT 해독용 (자네의 환경에 맞게 가져다 쓰게!)

// 🔥 Vercel 빌드 봇 접근 차단
export const dynamic = "force-dynamic";

// 1. 파이어베이스 어드민 초기화
if (!admin.apps.length && process.env.FIREBASE_PRIVATE_KEY) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// JWT 비밀키 (토큰 해독용)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: Request) {
  try {
    const db = admin.firestore();

    // 🌟 Step 1: 프론트엔드에서 보낸 JWT 스마트키 검문!
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

    // 프론트에서 보낸 영수증 정보 받기
    const { paymentKey, orderId, amount } = await req.json();

    // 🌟 Step 2: 영수증 확인 분기점 (로컬 우회로 vs 실제 통신)
    if (paymentKey === "LOCAL_TEST_PAYMENT_KEY") {
      // 🛠️ [로컬 테스트 우회로 발동!]
      console.log(
        `🛠️ [백엔드] 통신 우회! 가짜 영수증 프리미엄 승인: ${userName}`
      );
    } else {
      // 🚀 [실제 환경] 진짜 토스 서버에 검증 요청!
      if (!paymentKey || !orderId || !amount) {
        return NextResponse.json(
          { error: "결제 정보가 누락되었습니다." },
          { status: 400 }
        );
      }

      const certString = (process.env.TOSS_CLIENT_CERT || "").replace(
        /\\n/g,
        "\n"
      );
      const keyString = (process.env.TOSS_CLIENT_KEY || "").replace(
        /\\n/g,
        "\n"
      );

      const httpsAgent = new https.Agent({
        // 파일 경로라면 fs.readFileSync, 텍스트 자체라면 변수를 직접 넣습니다.
        cert: certString.includes("BEGIN CERTIFICATE")
          ? certString
          : fs.readFileSync(certString),
        key: keyString.includes("BEGIN PRIVATE KEY")
          ? keyString
          : fs.readFileSync(keyString),
        rejectUnauthorized: false,
      });

      // 토스 서버로 최종 결제 승인 요청
      await axios.post(
        "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/payment/confirm",
        { paymentKey, orderId, amount },
        { httpsAgent }
      );

      console.log(`✅ [실제 환경] 토스 결제 승인 완료: ${userName}`);
    }

    // 🌟 Step 3: [가장 중요!] DB에 프리미엄 권한 부여 (로컬이든 실제든 무조건 실행!)
    const userRef = db.collection("Users").doc(userUid);

    // 유저 문서에 isPremium: true 를 추가(merge)해 줍니다.
    await userRef.set(
      {
        isPremium: true,
        premiumActivatedAt: new Date().toISOString(), // 결제 시간 기록
      },
      { merge: true } // 기존에 저장된 이름, 전화번호 등을 날리지 않고 권한만 덮어씌움!
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
    return NextResponse.json(
      { error: "결제 검증에 실패했습니다." },
      { status: 400 }
    );
  }
}
