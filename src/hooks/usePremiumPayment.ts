// src/hooks/usePremiumPayment.ts

"use client";

import { useState } from "react";

declare global {
  interface Window {
    toss: any;
  }
}

export function usePremiumPayment(onUpgrade?: () => void) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePremiumPurchase = async () => {
    if (onUpgrade) {
      onUpgrade();
      return;
    }

    setIsLoading(true);

    try {
      const uniqueOrderId = `order_${Date.now()}`;
      let paymentKey = "";
      let amount = 9900; // 테스트용 금액

      // 🌟 1. 환경 검사: 결제창을 띄울 것인가, 흉내만 낼 것인가?
      if (typeof window !== "undefined" && window.toss) {
        try {
          // [실제 토스 환경] 진짜 토스 결제 바텀시트 띄우기
          const paymentResult = await window.toss.requestPayment({
            productId: "ait.0000030288.c601ccb2.3ebb540299.7998823328",
            orderId: uniqueOrderId,
          });
          paymentKey = paymentResult.paymentKey;
          amount = paymentResult.amount;
        } catch (tossError: any) {
          alert(
            `🚨 [1단계: 토스 SDK 에러]\n결제창 호출 중 문제가 발생했습니다. (혹은 결제 취소)\n사유: ${
              tossError.message || JSON.stringify(tossError)
            }`
          );
          setIsLoading(false);
          return; // 여기서 중단!
        }
      } else {
        // [로컬 PC 브라우저 환경] 🛠️ 개발자 우회로 발동!
        console.log(
          "🛠️ [로컬 테스트] 결제창을 띄우는 대신 1.5초 대기합니다..."
        );

        // 지문 인식 결제하는 시간(1.5초)을 흉내 냄 (자연스러운 로딩 UI 테스트용)
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log("🛠️ [로컬 테스트] 가짜 영수증(paymentKey) 발급 완료!");
        paymentKey = "LOCAL_TEST_PAYMENT_KEY"; // 이 암호를 백엔드가 알아듣게 할 거네!
      }

      const token =
        typeof window !== "undefined"
          ? window.localStorage?.getItem("focus_auth_token")
          : "";

      if (!token) {
        alert(
          "🚨 [2단계: 인증 에러]\n로그인 토큰을 찾을 수 없습니다.\n앱을 껐다가 다시 켜서 로그인해주세요."
        );
        setIsLoading(false);
        return;
      }

      let response;
      try {
        response = await fetch(
          `https://project-a7app.vercel.app/api/payments/confirm`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // 🔥 통행증 잊지 말기!
            },
            body: JSON.stringify({
              paymentKey,
              orderId: uniqueOrderId,
              amount,
            }),
          }
        );
      } catch (fetchError: any) {
        alert(
          `🚨 [3단계: 네트워크/CORS 에러]\nVercel 서버에 아예 접근하지 못했습니다.\n사유: ${
            fetchError.message || JSON.stringify(fetchError)
          }`
        );
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        alert("🎉 [테스트/실제] 결제가 완료되었습니다! 프리미엄 승급!");
        window.location.reload();
      } else {
        let errorDetail = "";
        try {
          const errorData = await response.json();
          errorDetail =
            errorData.error || errorData.detail || JSON.stringify(errorData);
        } catch (e) {
          errorDetail = await response.text();
        }
        alert(
          `🚨 [4단계: 서버 검증 거절 - HTTP ${response.status}]\nVercel 서버에서 결제를 승인하지 않았습니다.\n상세 이유: ${errorDetail}`
        );
      }
    } catch (error: any) {
      alert(
        `🚨 [5단계: 알 수 없는 치명적 에러]\n예기치 못한 문제가 발생했습니다.\n사유: ${
          error.message || JSON.stringify(error)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handlePremiumPurchase };
}
