// "use client";

// import React from "react";
// import { usePremiumPayment } from "@/hooks/usePremiumPayment"; // 🌟 분리한 로직 불러오기

// interface PaywallProps {
//   onBack: () => void;
//   onUpgrade?: () => void;
// }

// export default function Paywall({ onBack, onUpgrade }: PaywallProps) {
//   // 🌟 분리해둔 커스텀 훅에서 로딩 상태와 결제 함수를 꺼내옵니다.
//   const { isLoading, handlePremiumPurchase } = usePremiumPayment(onUpgrade);

//   return (
//     // 토스 스타일: 배경색은 살짝 회색빛(gray-50) 또는 흰색, 전체 화면(h-screen) 사용
//     <div className="flex flex-col h-[100dvh] bg-white px-6 pt-12 pb-8 animate-in fade-in duration-300">
//       {/* 상단 텍스트 영역 (토스 특유의 좌측 정렬 및 큰 타이포그래피) */}
//       <div className="flex-1 flex flex-col mt-8">
//         <span className="text-4xl mb-4 block">🔒</span>
//         <h2 className="text-[26px] font-bold text-[#191F28] mb-4 leading-[1.4] tracking-tight">
//           프리미엄 전용 기능
//         </h2>
//         <p className="text-[16px] text-[#8B95A1] font-medium leading-[1.6]">
//           지금까지 작성한 일정을{" "}
//           <span className="text-[#3182F6] font-bold">영구 저장</span>하고
//           <br />
//           타임 영수증을 발급받으려면
//           <br />
//           결제가 필요합니다.
//         </p>
//       </div>

//       {/* 하단 고정 버튼 영역 (Toss Bottom Button Style) */}
//       <div className="flex flex-col gap-3 pb-safe">
//         <button
//           onClick={handlePremiumPurchase}
//           disabled={isLoading}
//           className={`w-full py-[18px] rounded-[14px] text-[17px] font-semibold transition-colors ${
//             isLoading
//               ? "bg-[#F2F4F6] text-[#B0B8C1] cursor-not-allowed" // 로딩 중 (토스 회색)
//               : "bg-[#3182F6] text-white active:bg-[#1B64DA]" // 토스 블루
//           }`}
//         >
//           {isLoading ? "결제 진행 중..." : "무제한 프리미엄 시작하기"}
//         </button>

//         <button
//           onClick={onBack}
//           disabled={isLoading}
//           className="w-full py-[16px] text-[15px] font-semibold text-[#8B95A1] rounded-[14px] active:bg-[#F2F4F6] transition-colors disabled:opacity-50"
//         >
//           다음에 할게요
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import React from "react";
import { usePremiumPayment } from "@/hooks/usePremiumPayment"; // 🌟 분리한 로직 불러오기

interface PaywallProps {
  onBack: () => void;
  onUpgrade?: () => void;
}

export default function Paywall({ onBack, onUpgrade }: PaywallProps) {
  // 🌟 분리해둔 커스텀 훅에서 로딩 상태와 결제 함수를 꺼내옵니다.
  const { isLoading, handlePremiumPurchase } = usePremiumPayment(onUpgrade);

  return (
    // 토스 스타일: 배경색은 살짝 회색빛(gray-50) 또는 흰색, 전체 화면(h-screen) 사용
    <div className="flex flex-col h-[100dvh] bg-white px-6 pt-12 pb-8 animate-in fade-in duration-300">
      {/* 상단 텍스트 영역 (토스 특유의 좌측 정렬 및 큰 타이포그래피) */}
      <div className="flex-1 flex flex-col mt-8">
        <span className="text-4xl mb-4 block">🔒</span>
        <h2 className="text-[26px] font-bold text-[#191F28] mb-4 leading-[1.4] tracking-tight">
          프리미엄 전용 기능
        </h2>
        <p className="text-[16px] text-[#8B95A1] font-medium leading-[1.6]">
          지금까지 작성한 일정을{" "}
          <span className="text-[#3182F6] font-bold">영구 저장</span>하고
          <br />
          타임 영수증을 발급받으려면
          <br />
          결제가 필요합니다.
        </p>
      </div>

      {/* 하단 고정 버튼 영역 (Toss Bottom Button Style) */}
      <div className="flex flex-col gap-3 pb-safe">
        <button
          onClick={handlePremiumPurchase}
          disabled={isLoading}
          className={`w-full py-[18px] rounded-[14px] text-[17px] font-semibold transition-colors ${
            isLoading
              ? "bg-[#F2F4F6] text-[#B0B8C1] cursor-not-allowed" // 로딩 중 (토스 회색)
              : "bg-[#3182F6] text-white active:bg-[#1B64DA]" // 토스 블루
          }`}
        >
          {isLoading ? "결제 진행 중..." : "무제한 프리미엄 시작하기"}
        </button>

        <button
          onClick={onBack}
          disabled={isLoading}
          className="w-full py-[16px] text-[15px] font-semibold text-[#8B95A1] rounded-[14px] active:bg-[#F2F4F6] transition-colors disabled:opacity-50"
        >
          다음에 할게요
        </button>
      </div>
    </div>
  );
}
