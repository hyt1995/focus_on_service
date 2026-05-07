// src/components/LoginGate.tsx

"use client";

import React, { useEffect, useRef, useState } from "react";
import { appLogin } from "@apps-in-toss/web-framework";

export default function LoginGate({
  onLogin,
}: {
  onLogin: (name: string) => void;
}) {
  const [statusMsg, setStatusMsg] = useState("타임다이브를 준비하고 있어요...");
  // React.StrictMode에서 useEffect가 두 번 실행되는 것을 방지하는 방패!
  const hasAttemptedLogin = useRef(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    // 🌟 방어막 제거: Strict Mode가 취소하고 다시 켜는 것을 자연스럽게 허용합니다.

    const autoLogin = async () => {
      try {
        let authCode = "";
        let reqReferrer = "";

        const isTossApp =
          typeof window !== "undefined" && navigator.userAgent.includes("Toss");

        if (isTossApp) {
          setStatusMsg("토스 유저 정보를 확인하고 있어요...");
          const { authorizationCode, referrer } = await appLogin();
          authCode = authorizationCode;
          reqReferrer = referrer || "toss_app";
        } else {
          console.log("🛠️ [로컬 테스트] 자동 가짜 로그인 진행 중...");
          authCode = "LOCAL_TEST_CODE";
          reqReferrer = "local_test";
        }

        setStatusMsg("타임다이브에 접속 중입니다...");

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
          window.localStorage?.setItem("focus_auth_token", data.token);
        }

        onLogin(data.userName);
      } catch (error) {
        console.error("자동 로그인 에러:", error);
        setStatusMsg("연결에 실패했어요. 앱을 다시 실행해주세요.");
      }
    };

    // 1초 스플래시 후 실행
    const timer = setTimeout(() => {
      autoLogin();
    }, 1000);

    // 컴포넌트가 언마운트(또는 Strict Mode 재실행)될 때 이전 타이머를 청소!
    return () => clearTimeout(timer);
  }, [baseUrl, onLogin]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#F9F9FB] px-4 animate-in fade-in duration-500">
      <div className="text-center">
        {/* 버튼 대신 타임 영수증이나 앱 로고 등 온보딩/스플래시 UI를 띄워둡니다 */}
        <h1 className="text-4xl font-extrabold text-[#3182F6] mb-4 animate-pulse">
          TIME DIVE
        </h1>
        <p className="text-gray-500 font-medium text-[15px]">{statusMsg}</p>
      </div>
    </div>
  );
}
