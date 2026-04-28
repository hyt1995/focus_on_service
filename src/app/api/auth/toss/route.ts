import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { SignJWT } from "jose";

// 1. 파이어베이스 어드민 초기화 (이미 다른 API에 있다면 동일하게 세팅)
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

// JWT를 구울 때 사용할 비밀키 (Vercel 환경변수에 추가해야 함!)
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

    // ====================================================================
    // 🚨 [mTLS 연동 전 임시 모킹]
    // 실제로는 authorizationCode로 토스 API를 찔러서 유저 정보를 받아와야 합니다.
    // 현재는 DB 초기화 및 구조 셋팅을 위해 '가짜 토스 응답'을 만들어서 진행합니다.
    // ====================================================================
    const mockTossUser = {
      userKey: "toss_dummy_8f9a2b", // 토스의 고유 식별자 (CI 대신 사용)
      name: "영탁", // 토스에서 받은 이름
      email: "youngtak@example.com", // 토스에서 받은 이메일
      gender: "MALE", // 토스에서 받은 성별
    };

    // 2. 파이어베이스 DB 'Users' 컬렉션에 유저 정보 꽂아넣기 (비용 최적화 Upsert)
    // - 문서(Doc)의 ID를 유저의 고유 userKey로 지정하여 중복 방지
    const userRef = db.collection("Users").doc(mockTossUser.userKey);

    // 🔥 { merge: true } : 기존에 결제 정보(isPremium)가 있으면 덮어쓰지 않고 유지!
    await userRef.set(
      {
        uid: mockTossUser.userKey,
        provider: "toss",
        name: mockTossUser.name,
        email: mockTossUser.email,
        gender: mockTossUser.gender,
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // 3. 서버 비용 절감을 위한 '마법의 통행증(JWT)' 발급
    // DB 조회 없이 프론트가 누군지 알 수 있게 uid와 name을 토큰에 암호화해서 넣음
    const token = await new SignJWT({
      uid: mockTossUser.userKey,
      name: mockTossUser.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d") // 한 달간 로그인 유지
      .sign(JWT_SECRET);

    // 4. 프론트로 결과 전달
    return NextResponse.json({
      success: true,
      token: token,
      userName: mockTossUser.name,
    });
  } catch (error) {
    console.error("토스 로그인 백엔드 처리 에러:", error);
    return NextResponse.json(
      { error: "로그인 처리 중 서버 에러" },
      { status: 500 }
    );
  }
}
