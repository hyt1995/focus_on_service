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
      // 🌟 자물쇠 검사: 이미 한 번 시도했다면 바로 튕겨냄!
      if (hasAttemptedLogin.current) {
        console.log("🛡️ 이미 로그인 시도를 했습니다. 중복 요청을 차단합니다.");
        return;
      }
      hasAttemptedLogin.current = true; // 찰칵! 자물쇠 잠금!

      try {
        let authCode = "";
        let reqReferrer = "";

        const isTossApp =
          typeof window !== "undefined" && navigator.userAgent.includes("Toss");

        if (isTossApp) {
          setStatusMsg("토스 유저 정보를 확인하고 있어요...");
          try {
            const { authorizationCode, referrer } = await appLogin();
            authCode = authorizationCode;
            reqReferrer = referrer || "toss_app";
          } catch (sdkError: any) {
            alert(
              `🚨 [1단계: 토스 SDK 에러]\n약관 동의 창을 닫았거나, 인가 코드 발급에 실패했습니다.\n사유: ${
                sdkError.message || JSON.stringify(sdkError)
              }`
            );
            setStatusMsg("토스 로그인 연동에 실패했습니다.");
            return;
          }
        } else {
          console.log("🛠️ [로컬 테스트] 자동 가짜 로그인 진행 중...");
          authCode = "LOCAL_TEST_CODE";
          reqReferrer = "local_test";
        }

        setStatusMsg("타임다이브에 접속 중입니다...");

        const apiUrl = "https://project-a7app.vercel.app/api/auth/toss";

        let res;
        try {
          res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              authorizationCode: authCode,
              referrer: reqReferrer,
            }),
          });
        } catch (fetchError: any) {
          alert(
            `🚨 [2단계: 네트워크/CORS 에러]\nVercel 서버로 출발조차 하지 못했습니다.\n토스 콘솔 화이트리스트에 Vercel 도메인(https://project-a7app.vercel.app)이 누락되었을 확률이 매우 높습니다.\n사유: ${
              fetchError.message || JSON.stringify(fetchError)
            }`
          );
          setStatusMsg("서버 통신망에 접근할 수 없습니다.");
          return;
        }

        // 🌟 [관문 3]: Vercel 백엔드의 로그인 거절
        if (!res.ok) {
          let errorDetail = "";
          try {
            const errorData = await res.json();
            errorDetail =
              errorData.error || errorData.detail || JSON.stringify(errorData);
          } catch (e) {
            errorDetail = await res.text();
          }
          alert(
            `🚨 [3단계: Vercel 서버 거절 - HTTP ${res.status}]\nVercel 서버가 토스 본사 서버와 통신 중 실패했거나 에러를 뱉었습니다.\n상세 사유: ${errorDetail}`
          );
          setStatusMsg("서버에서 로그인을 처리할 수 없습니다.");
          return;
        }
        try {
          const data = await res.json();
          if (typeof window !== "undefined") {
            window.localStorage?.setItem("focus_user_name", data.userName);
            window.localStorage?.setItem("focus_auth_token", data.token);
          }
          onLogin(data.userName);
        } catch (parseError: any) {
          alert(
            `🚨 [4단계: 데이터 처리 에러]\n서버 응답은 성공했으나, 기기 저장 중 문제가 발생했습니다.\n사유: ${
              parseError.message || JSON.stringify(parseError)
            }`
          );
          setStatusMsg("데이터 처리 중 오류가 발생했습니다.");
        }
      } catch (error: any) {
        // 🌟 [관문 5]: 최후의 방어막 (기타 런타임 에러)
        alert(
          `🚨 [5단계: 알 수 없는 치명적 에러]\n로그인 중 예기치 못한 문제가 발생했습니다.\n사유: ${
            error.message || JSON.stringify(error)
          }`
        );
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
