import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { SignJWT } from "jose";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import https from "https";
import axios from "axios";

// 🔥 1. Vercel 빌드 봇 접근 차단! (이 페이지는 100% 동적으로만 작동함)
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

// JWT 비밀키
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: Request) {
  try {
    const db = admin.firestore();
    const { authorizationCode, referrer } = await req.json();

    // 🌟 1. 공통으로 사용할 변수 선언 (가짜든 진짜든 결국 여기에 담깁니다)
    let tossUserCI = "";
    let tossUserName = "";
    let tossUserPhone = "";

    // 🌟 2. 프론트에서 보낸 암호를 확인하는 분기점
    if (authorizationCode === "LOCAL_TEST_CODE") {
      // 🛠️ [로컬 테스트 우회로] 토스 서버 안 가고 바로 가짜 데이터 주입!
      console.log("🛠️ [백엔드] 통신 우회! 가짜 테스트 유저를 생성합니다.");
      tossUserCI = "local_test_uid_777";
      tossUserName = "로컬테스트";
      tossUserPhone = "010-0000-0000";
    } else {
      // 🚀 [실제 환경] 가짜가 아니라면 진짜 토스 서버와 통신합니다.
      if (!authorizationCode) {
        return NextResponse.json(
          { error: "인가 코드가 없습니다." },
          { status: 400 }
        );
      }

      // 기존 자네의 mTLS 및 복호화 로직 100% 그대로!
      const certString = (process.env.TOSS_CLIENT_CERT || "").replace(
        /\\n/g,
        "\n"
      );
      const keyString = (process.env.TOSS_CLIENT_KEY || "").replace(
        /\\n/g,
        "\n"
      );

      const httpsAgent = new https.Agent({
        // 🚨 시니어의 팁: 환경변수에 인증서 '내용'이 들어있다면 fs.readFileSync 대신 바로 넣어야 합니다.
        // 만약 경로가 들어있다면 fs.readFileSync를 쓰는 게 맞습니다. (상황에 맞게 쓰게!)
        cert: certString,
        key: keyString,
        rejectUnauthorized: false,
      });

      const tokenRes = await axios.post(
        "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/generate-token",
        { authorizationCode, referrer },
        { httpsAgent }
      );
      const accessToken = tokenRes.data.accessToken;

      const userRes = await axios.post(
        "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/login-me",
        { accessToken },
        { httpsAgent }
      );

      const encryptedData = userRes.data.encryptedData || userRes.data;
      const decryptKey = process.env.TOSS_DECRYPT_KEY || "";
      if (decryptKey.length !== 48) throw new Error("TOSS_DECRYPT_KEY 오류");

      const key = Buffer.from(decryptKey.substring(0, 32), "utf-8");
      const iv = Buffer.from(decryptKey.substring(32, 48), "utf-8");
      const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
      let decryptedStr = decipher.update(encryptedData, "base64", "utf8");
      decryptedStr += decipher.final("utf8");

      const realTossUser = JSON.parse(decryptedStr);

      // 🌟 [핵심 변경점] 복호화한 진짜 데이터를 아까 만들어둔 공통 변수에 넣습니다!
      tossUserCI = realTossUser.ci || `toss_${Date.now()}`;
      tossUserName = realTossUser.name || "토스유저";
      tossUserPhone = realTossUser.phone || "";
    }

    /* ======= 🚨 3. DB 저장 스위치 (출시 전: 켬 / 출시 후: 끔) ======= */
    // 테스트할 땐 이 주석을 풀고, 출시할 땐 아래 덩어리를 주석(/* ... */) 처리하세요!

    const userRef = db.collection("Users").doc(tossUserCI);
    await userRef.set(
      {
        uid: tossUserCI,
        provider: "toss",
        name: tossUserName,
        phone: tossUserPhone,
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log(`💾 [DB 스위치 ON] 유저 저장 완료: ${tossUserName}`);

    /* ========================================================= */

    // 🌟 4. 우리 앱 전용 마법의 통행증(JWT) 발급 (공통 변수 사용)
    const token = await new SignJWT({
      uid: tossUserCI,
      name: tossUserName,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(JWT_SECRET);

    // 🌟 5. 프론트로 결과 전달
    return NextResponse.json({ success: true, token, userName: tossUserName });
  } catch (error: any) {
    console.error("🚨 토스 로그인 통신 에러:", error?.response?.data || error);
    return NextResponse.json(
      { error: "로그인 처리 중 서버 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}
