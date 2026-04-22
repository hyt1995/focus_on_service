"use client";

import React from "react";

interface PaywallProps {
  onBack: () => void;
  onUpgrade?: () => void;
}

export default function Paywall({ onBack, onUpgrade }: PaywallProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6 animate-in fade-in zoom-in duration-500">
      <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-2xl border border-blue-100 max-w-md w-full relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>

        <span className="text-5xl mb-6 block drop-shadow-sm">🔒</span>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
          프리미엄 전용 기능
        </h2>
        <p className="text-gray-500 font-medium mb-8 leading-relaxed text-sm">
          지금까지 작성한 일정을{" "}
          <span className="text-[#007AFF] font-bold">영구 저장</span>하고
          <br />
          타임 영수증을 발급받으려면 결제가 필요합니다.
        </p>

        <button
          onClick={() => onUpgrade?.() || alert("결제 시스템 준비 중입니다.")}
          className="w-full bg-[#007AFF] text-white text-lg font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:scale-[1.02] transition-all"
        >
          무제한 프리미엄 시작하기
        </button>
        <button
          onClick={onBack}
          className="w-full mt-4 text-gray-400 font-bold py-3 hover:text-gray-600 transition-colors text-sm"
        >
          다음에 할게요 (홈으로 이동)
        </button>
      </div>
    </div>
  );
}
