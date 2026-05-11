// src/app/api/auth/toss/route.ts

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase"; // 🌟 자네의 기존 설정 파일!
import { doc, setDoc } from "firebase/firestore"; // 🌟 프론트엔드용 SDK 함수
import { SignJWT } from "jose";
import crypto from "crypto";
import https from "https";
import axios from "axios";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: Request) {
  try {
    const { authorizationCode, referrer } = await req.json();

    // 🌟 시니어의 블랙박스 기록장치!
    console.log("🚀 [토스 발사 준비] AuthCode:", authorizationCode);
    console.log("🚀 [토스 발사 준비] Referrer:", referrer);

    let tossUserCI = "";
    let tossUserName = "";
    let tossUserPhone = "";

    if (authorizationCode === "LOCAL_TEST_CODE") {
      console.log("🛠️ [백엔드] 통신 우회! 가짜 테스트 유저를 생성합니다.");
      tossUserCI = "local_test_uid_777";
      tossUserName = "로컬테스트";
      tossUserPhone = "010-0000-0000";
    } else {
      if (!authorizationCode)
        return NextResponse.json(
          { error: "인가 코드가 없습니다." },
          { status: 400 }
        );

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

      const tokenRes = await axios.post(
        "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/generate-token",
        {
          authorizationCode,
          referrer,
        },
        {
          httpsAgent,
          // 🌟 시니어의 안전장치: JSON 명찰을 강제로 붙입니다!
          headers: { "Content-Type": "application/json" },
        }
      );
      const accessToken = tokenRes.data.success.accessToken;

      // 🌟 GET 방식으로 바꾸고, 토큰을 Authorization 헤더에 Bearer 방식으로 넣습니다. Body는 비웁니다.
      const userRes = await axios.get(
        "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/login-me",
        {
          httpsAgent,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // (임시 확인용) 암호화된 데이터를 먼저 콘솔에 찍어봅니다.
      console.log("✅ 토스 유저 정보 획득 성공:", userRes.data);

      const encryptedData = userRes.data.encryptedData || userRes.data;
      const decryptKey = process.env.TOSS_ADDITIONAL_AUTHENTICATED_DATA || "";

      const key = Buffer.from(decryptKey.substring(0, 32), "utf-8");
      const iv = Buffer.from(decryptKey.substring(32, 48), "utf-8");
      const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
      let decryptedStr = decipher.update(encryptedData, "base64", "utf8");
      decryptedStr += decipher.final("utf8");

      const realTossUser = JSON.parse(decryptedStr);

      tossUserCI = realTossUser.ci || `toss_${Date.now()}`;
      tossUserName = realTossUser.name || "토스유저";
      tossUserPhone = realTossUser.phone || "";
    }

    /* ======= 🚨 DB 저장 스위치 (출시 전: 켬 / 출시 후: 끔) ======= */
    // 지금은 모든 유저를 저장한다. 나중에 firebase 비용이 걱정될때 삭제할 것

    // 🌟 어드민 대신 클라이언트 SDK(setDoc) 방식으로 변경 완료!
    const userRef = doc(db, "Users", tossUserCI);
    await setDoc(
      userRef,
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

    const token = await new SignJWT({ uid: tossUserCI, name: tossUserName })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(JWT_SECRET);

    return NextResponse.json({ success: true, token, userName: tossUserName });
  } catch (error: any) {
    console.log(
      "🚨 토스 로그인 상세 에러:",
      JSON.stringify(error?.response?.data || error?.response || error, null, 2)
    );
    return NextResponse.json(
      { error: "로그인 처리 중 서버 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}
