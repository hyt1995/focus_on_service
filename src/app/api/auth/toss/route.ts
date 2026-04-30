import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { SignJWT } from "jose";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import https from "https";
import axios from "axios";

// 1. 파이어베이스 어드민 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
const db = admin.firestore();

// JWT 비밀키
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "time-dive-super-secret-key-2026"
);

export async function POST(req: Request) {
  try {
    const { authorizationCode, referrer } = await req.json();

    if (!authorizationCode) {
      return NextResponse.json(
        { error: "인가 코드가 없습니다." },
        { status: 400 }
      );
    }

    // 🌟 1. mTLS 인증서 준비 (fs 모듈로 파일 읽기)
    const certString = (process.env.TOSS_CLIENT_CERT || "").replace(
      /\\n/g,
      "\n"
    );
    const keyString = (process.env.TOSS_CLIENT_KEY || "").replace(/\\n/g, "\n");

    const httpsAgent = new https.Agent({
      cert: fs.readFileSync(certString),
      key: fs.readFileSync(keyString),
      rejectUnauthorized: false, // 개발 환경에서 간혹 발생하는 인증서 에러 방지
    });

    // 🌟 2. 인가 코드로 토스 엑세스 토큰 발급 (generate-token)
    const tokenRes = await axios.post(
      "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/generate-token",
      { authorizationCode, referrer },
      { httpsAgent }
    );
    const accessToken = tokenRes.data.accessToken;

    // 🌟 3. 엑세스 토큰으로 유저 개인정보 가져오기 (login-me)
    const userRes = await axios.post(
      "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/login-me",
      { accessToken },
      { httpsAgent }
    );

    const encryptedData = userRes.data.encryptedData || userRes.data;

    // 🌟 4. 이메일로 받은 복호화 키로 암호 풀기 (AES-256-CBC 방식)
    const decryptKey = process.env.TOSS_DECRYPT_KEY || "";
    if (decryptKey.length !== 48) {
      throw new Error("TOSS_DECRYPT_KEY는 48자리 문자열이어야 합니다.");
    }

    // 앞 32바이트는 Key, 뒤 16바이트는 IV(초기화 벡터)로 사용
    const key = Buffer.from(decryptKey.substring(0, 32), "utf-8");
    const iv = Buffer.from(decryptKey.substring(32, 48), "utf-8");

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decryptedStr = decipher.update(encryptedData, "base64", "utf8");
    decryptedStr += decipher.final("utf8");

    // 복호화된 진짜 유저 정보 파싱!
    const realTossUser = JSON.parse(decryptedStr);
    const userUid = realTossUser.ci || `toss_${Date.now()}`; // 고유 식별자 CI
    const userName = realTossUser.name || "토스유저";
    const userPhone = realTossUser.phone || "";

    // 🌟 5. 파이어베이스 DB 'Users' 컬렉션에 진짜 유저 정보 꽂아넣기
    const userRef = db.collection("Users").doc(userUid);
    await userRef.set(
      {
        uid: userUid,
        provider: "toss",
        name: userName,
        phone: userPhone,
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true } // 기존 결제 정보(isPremium) 덮어쓰기 방지
    );

    // 🌟 6. 우리 앱 전용 마법의 통행증(JWT) 발급
    const token = await new SignJWT({ uid: userUid, name: userName })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d") // 한 달 로그인 유지
      .sign(JWT_SECRET);

    // 🌟 7. 프론트로 결과 전달
    return NextResponse.json({ success: true, token, userName });
  } catch (error: any) {
    console.error("🚨 토스 로그인 통신 에러:", error?.response?.data || error);
    return NextResponse.json(
      { error: "로그인 처리 중 서버 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}
