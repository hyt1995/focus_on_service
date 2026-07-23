"use client";
import { useState } from "react";
import { IAP } from "@apps-in-toss/web-framework";

export function usePremiumPayment(onUpgrade?: () => void) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePremiumPurchase = async () => {
    if (onUpgrade) {
      onUpgrade();
      return;
    }

    setIsLoading(true);

    try {
      // 1. IAP 모듈 지원 환경 검사
      if (!IAP) {
        alert(
          "🚨 인앱 결제를 지원하지 않는 환경입니다.\n최신 버전의 토스 앱에서 실행해 주세요.",
        );
        setIsLoading(false);
        return;
      }

      // 상품 고유 ID (콘솔에서 발급받은 sku)
      const PREM_SKU = "ait.0000043168.52faf078.7ba7ea33cd.2659096458";

      // 2. 인앱 결제창 호출 및 주문 생성 (createOneTimePurchaseOrder)
      const cleanup = IAP.createOneTimePurchaseOrder({
        options: {
          sku: PREM_SKU,

          // 🔥 [상품 지급 로직] 토스에서 결제 완료 직후 호출함! 여기서 유저에게 권한을 줍니다.
          processProductGrant: async ({ orderId }: { orderId: string }) => {
            try {
              // (선택) 여기서 내 백엔드 서버에 "이 유저 프리미엄 줬어!" 라고 저장하는 API를 찔러도 됩니다.
              const token = window.localStorage?.getItem("focus_auth_token");
              const response = await fetch(
                "https://project-a7app.vercel.app/api/payments/confirm",
                {
                  method: "POST",
                  body: JSON.stringify({ orderId: orderId }),
                  headers: { Authorization: `Bearer ${token}` },
                },
              );

              // 🔥 추가: 서버에서 에러(400, 500 등)를 뱉으면 강제로 에러를 발생시킵니다.
              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`백엔드 DB 처리 실패: ${errorText}`);
              }

              // 상품 지급이 무사히 완료되었음을 토스에게 알립니다.
              return true;
            } catch (error) {
              console.error("상품 지급 처리 중 에러:", error);
              return false; // false를 반환하면 토스가 알아서 환불 안내를 띄워줍니다.
            }
          },
        },

        // 결제 및 상품 지급이 모두 완벽하게 끝났을 때
        onEvent: event => {
          if (event.type === "success") {
            // 디버깅용 영수증 로그
            console.log("결제 성공 내역:", event.data);

            alert(
              `🎉 프리미엄 결제가 완료되었습니다!\n결제 번호: ${event.data.orderId}`,
            );

            // 프리미엄 권한 활성화를 위해 화면 새로고침
            window.location.reload();
            cleanup(); // 반드시 해제
          }
        },

        // 결제창 이탈, 잔액 부족 등 에러 발생 시
        onError: (error: unknown) => {
          // 토스 앱인토스 에러 코드를 문자로 변환해서 유저에게 보여줌
          const errorMsg =
            typeof error === "string" ? error : JSON.stringify(error);

          if (errorMsg.includes("USER_CANCELED")) {
            // 단순 창 닫기이므로 조용히 넘어감
            console.log("사용자가 결제를 취소했습니다.");
          } else {
            alert(`🚨 결제를 진행할 수 없습니다.\n사유: ${errorMsg}`);
          }

          setIsLoading(false);
          cleanup(); // 반드시 해제
        },
      });
    } catch (error: any) {
      alert(`🚨 치명적인 에러 발생\n사유: ${error.message || String(error)}`);
      setIsLoading(false);
    }
  };

  return { isLoading, handlePremiumPurchase };
}
