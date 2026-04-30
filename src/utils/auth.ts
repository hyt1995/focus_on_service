// src/utils/auth.ts
import { jwtVerify } from "jose";

// 로그인 API에서 썼던 것과 똑같은 비밀키 세팅
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "time-dive-super-secret-key-2026"
);

export async function verifyUser(req: Request) {
  try {
    // 1. 프론트가 보낸 헤더에서 'Authorization: Bearer [토큰]'을 꺼냄
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null; // 출입증이 없거나 위조됨
    }

    // 2. 'Bearer ' 글자를 떼고 진짜 토큰 알맹이만 분리
    const token = authHeader.split(" ")[1];

    // 3. 비밀키로 토큰 잠금 해제 (해독)
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // 4. 해독된 데이터(uid, name) 반환
    return payload as { uid: string; name: string };
  } catch (error) {
    console.error("🚨 토큰 해독 실패 (위조/만료):", error);
    return null; // 해독 실패 시 차단
  }
}
