// src/components/loginGate.tsx

"use client";

import React, { useState } from "react";
// 🔥 앱인토스 공식 프레임워크에서 appLogin 함수를 불러옵니다.
import { appLogin } from "@apps-in-toss/web-framework";

export default function LoginGate({
  onLogin,
}: {
  onLogin: (name: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleTossLogin = async () => {
    setIsLoading(true);
    try {
      let authCode = "";
      let reqReferrer = "";

      // 🌟 1. 환경 검사: 현재 토스 앱 내부인가? PC(로컬) 브라우저인가?
      // 토스 앱 웹뷰는 userAgent에 'Toss'라는 문자열을 포함합니다.
      const isTossApp =
        typeof window !== "undefined" && navigator.userAgent.includes("Toss");

      if (isTossApp) {
        // [실제 토스 환경] 공식 프레임워크를 통해 진짜 인가 코드 발급
        const { authorizationCode, referrer } = await appLogin();
        authCode = authorizationCode;
        reqReferrer = referrer || "toss_app";
      } else {
        // [로컬 PC 환경] 🛠️ 개발자 우회로 발동!
        console.log("🛠️ [로컬 테스트] 가짜 로그인 인가 코드를 발급합니다.");
        authCode = "LOCAL_TEST_CODE";
        reqReferrer = "local_test";
      }

      // 2. 발급받은 인가 코드(진짜 혹은 가짜)를 우리 Vercel 백엔드로 은밀하게 전송!
      const apiUrl = baseUrl ? `${baseUrl}/api/auth/toss` : "/api/auth/toss";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorizationCode: authCode,
          referrer: reqReferrer,
        }),
      });

      if (!res.ok) throw new Error("서버 로그인 처리 실패");
      const data = await res.json();

      if (typeof window !== "undefined") {
        window.localStorage?.setItem("focus_user_name", data.userName);
        window.localStorage?.setItem("focus_auth_token", data.token); // 토큰 저장
      }

      // 3. 백엔드가 토스에서 뜯어온(?) 혹은 가짜로 만들어준 유저 이름으로 앱 시작!
      onLogin(data.userName);
    } catch (error) {
      console.error("토스 로그인 에러:", error);
      alert("로그인 중 문제가 발생했어요. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#F9F9FB]">
      <div className="bg-white p-8 rounded-[32px] shadow-lg text-center max-w-sm w-full mx-4">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          TIME DIVE
        </h1>
        <p className="text-gray-500 font-medium mb-10 text-sm">
          당신의 하루를 완벽하게 조준하세요
        </p>
        <button
          onClick={handleTossLogin}
          disabled={isLoading}
          className="w-full bg-[#3182F6] text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? "토스 인증 중..." : "토스 계정으로 시작하기"}
        </button>
      </div>
    </div>
  );
}
