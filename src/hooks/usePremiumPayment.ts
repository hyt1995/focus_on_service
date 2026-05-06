// "use client";

// import { useState } from "react";

// // TypeScript VVIP 명단 (Toss SDK)
// declare global {
//   interface Window {
//     toss: any;
//   }
// }

// export function usePremiumPayment(onUpgrade?: () => void) {
//   const [isLoading, setIsLoading] = useState(false);

//   const handlePremiumPurchase = async () => {
//     // 외부 동작이 우선할 경우 처리
//     if (onUpgrade) {
//       onUpgrade();
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const uniqueOrderId = `order_${Date.now()}`;

//       // 1. 토스 결제창 호출
//       const paymentResult = await window.toss.requestPayment({
//         productId: "ait.0000030288.c601ccb2.3ebb540299.7998823328", // 🚨 콘솔 상품 ID 필수!
//         orderId: uniqueOrderId,
//       });

//       // 2. 백엔드로 영수증 검증 요청
//       const response = await fetch("/api/payments/confirm", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({
//           paymentKey: paymentResult.paymentKey,
//           orderId: paymentResult.orderId,
//           amount: paymentResult.amount,
//         }),
//       });

//       if (response.ok) {
//         alert("🎉 결제가 완료되었습니다! 타임다이브 프리미엄이 활성화됩니다.");
//         window.location.reload();
//       } else {
//         alert("🚨 결제 검증에 실패했습니다. 고객센터에 문의해주세요.");
//       }
//     } catch (error) {
//       console.log("결제가 취소되었거나 에러가 발생했습니다.", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return {
//     isLoading,
//     handlePremiumPurchase,
//   };
// }

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
        // [실제 토스 환경] 진짜 토스 결제 바텀시트 띄우기
        const paymentResult = await window.toss.requestPayment({
          productId: "ait.0000030288.c601ccb2.3ebb540299.7998823328",
          orderId: uniqueOrderId,
        });
        paymentKey = paymentResult.paymentKey;
        amount = paymentResult.amount;
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

      // 🌟 2. 얻어낸 영수증(진짜든 가짜든)을 우리 백엔드로 보내서 검증 요청!
      const response = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("focus_auth_token")}`,
        },
        body: JSON.stringify({ paymentKey, orderId: uniqueOrderId, amount }),
      });

      if (response.ok) {
        alert("🎉 [테스트/실제] 결제가 완료되었습니다! 프리미엄 승급!");
        window.location.reload();
      } else {
        alert("🚨 결제 검증 실패");
      }
    } catch (error) {
      console.log("결제가 취소되었거나 에러가 발생했습니다.", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handlePremiumPurchase };
}
