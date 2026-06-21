"use client";

import { useState, useEffect } from "react";

interface OnboardingCarouselProps {
  onComplete: () => void;
}

export default function OnboardingCarousel({
  onComplete,
}: OnboardingCarouselProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);

  // 1. 처음 들어온 사람인지 판단하는 로직
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("has_seen_onboarding_v1");
    if (hasSeenOnboarding) {
      onComplete();
    } else {
      setIsFirstTime(true);
    }
  }, [onComplete]);

  const steps = [
    {
      // 🎯 1번 카드: 특징 [발등에 불이 떨어져야만 움직인다] ➡️ 실시간 타이머 기능 매칭
      title:
        "매번 발등에 불이 떨어져야만 움직이시나요?\n실시간으로 흘러가는 시간을 보며 발등의 불을 직접 경험해 보세요.",
      subtitle:
        "째깍째깍 눈앞에서 1분씩 올라가는 시각적 압박감이\n미루고 미루던 당신의 무거운 몸을 즉시 움직이게 만듭니다.",
      imageKey: "step1",
    },
    {
      // 🎯 2번 카드: 특징 [머릿속에 할 일이 뒤엉키고 정리가 안 됨] ➡️ 음성인식 AI 할 일 정리 기능 매칭
      title:
        "뭐부터 해야 할지 머릿속이 복잡해 터질 것 같다면,\n일단 생각나는 대로 다 말하고 AI에게 정리를 맡기세요.",
      subtitle:
        "뒤엉킨 생각 속에 갇혀 시작조차 못 하고 놓쳐버린 행동력,\n의식의 흐름대로 뱉기만 하면 AI가 '지금 당장 할 일'만 쏙 골라줍니다.",
      imageKey: "step2",
    },
    {
      // 🎯 3번 카드: 특징 [상상에 빠져 시간 순삭 / 처음 시작이 어려움] ➡️ 매일 자동 리셋 루틴 기능 매칭
      title:
        "매일 반복되는 지루한 루틴을 딱 한 번만 입력해 두면,\n날짜가 바뀔 때마다 계획을 다시 짜야 하는 귀찮음이 사라집니다.",
      subtitle:
        "오늘 하루 딴짓하다 무너졌어도 괜찮습니다.\n내일 아침 눈을 뜨면 당신이 지켜야 할 습관이 새롭게 배달됩니다.",
      imageKey: "step3",
    },
    {
      // 🎯 4번 카드: 특징 [내가 뭘 했는지 확인조차 안 함] ➡️ 소요 시간 측정 타임 영수증 기능 매칭
      title:
        "단순히 오늘 집중한 시간만 기록하는 앱이 아닙니다.\n이 일을 끝내기 위해 흘러간 진짜 기회비용을 영수증으로 뽑아보세요.",
      subtitle:
        "시작 버튼을 누른 순간부터 끝날 때까지 낭비된 시간의 영수증.\n진짜 내 시간 지출 내역을 눈으로 확인하고 무서움을 직면할 때입니다.",
      imageKey: "step4",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem("has_seen_onboarding_v1", "true");
      onComplete();
    }
  };

  if (isFirstTime === null) return <div className="min-h-screen bg-white" />;

  return (
    <div className="flex flex-col justify-between min-h-screen bg-white text-[#f9fafb] font-sans antialiased px-6 pt-16 pb-10 overflow-hidden select-none">
      {/* 📊 상단 인디케이터 */}
      <div className="flex gap-2 w-full max-w-md mx-auto mb-10">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index === currentStep ? "bg-[#3182f6]" : "bg-[#e5e8eb]"
            }`}
          />
        ))}
      </div>

      {/* 🎞️ [버그 수정] 스르륵 캐러셀 메인 구역 */}
      {/* max-w-md 주위에 overflow-hidden을 주어 한 장 크기만 화면에 가둡니다. */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full overflow-hidden relative">
        <div
          className="flex transition-transform duration-500 ease-out w-full"
          style={{ transform: `translateX(-${currentStep * 100}%)` }} // 100% 이동이 이제 딱 화면 1장만큼 작동합니다.
        >
          {steps.map((step, index) => (
            // w-full shrink-0 조항을 주어 각 장이 정확히 화면 너비 100%를 독점하게 만듭니다.
            <div key={index} className="w-full shrink-0 flex flex-col px-1">
              {/* 타이포그래피 (손실 자극 카피) */}
              <div className="w-full text-left mb-8 min-h-[140px]">
                <h1 className="text-2xl font-bold leading-snug whitespace-pre-line tracking-tight text-[#191f28]">
                  {step.title.split("\n").map((line, i) => {
                    if (
                      line.includes("사라집니다") ||
                      line.includes("놓쳐버린") ||
                      line.includes("기회비용") ||
                      line.includes("소멸")
                    ) {
                      return (
                        <span key={i} className="block">
                          {line
                            .split(/(사라집니다|놓쳐버린|기회비용|소멸)/)
                            .map((part, idx) =>
                              part === "사라집니다" ||
                              part === "놓쳐버린" ||
                              part === "기회비용" ||
                              part === "소멸" ? (
                                <span
                                  key={idx}
                                  className="text-[#f04452] font-extrabold"
                                >
                                  {part}
                                </span>
                              ) : (
                                part
                              ),
                            )}
                        </span>
                      );
                    }
                    return (
                      <span key={i} className="block">
                        {line}
                      </span>
                    );
                  })}
                </h1>
                <p className="text-[#4e5968] text-[15px] font-medium mt-4 leading-relaxed whitespace-pre-line">
                  {step.subtitle}
                </p>
              </div>

              {/* 📷 이미지 영역 */}
              <div className="w-full aspect-[2/3] rounded-[26px] bg-[#222b38] border border-[#2c3744]/50 flex items-center justify-center p-4 shadow-xl overflow-hidden relative">
                {step.imageKey === "step1" && (
                  <img
                    src="/images/1.png"
                    alt="시간 소멸"
                    className="w-full h-full object-cover rounded-[22px]"
                  />
                )}
                {step.imageKey === "step2" && (
                  <img
                    src="/images/2.png"
                    alt="시간 소멸"
                    className="w-full h-full object-cover rounded-[22px]"
                  />
                )}
                {step.imageKey === "step3" && (
                  <img
                    src="/images/3.png"
                    alt="시간 소멸"
                    className="w-full h-full object-cover rounded-[22px]"
                  />
                )}
                {step.imageKey === "step4" && (
                  <img
                    src="/images/4.png"
                    alt="시간 소멸"
                    className="w-full h-full object-cover rounded-[22px]"
                  />
                )}

                {index === 3 && (
                  <div className="absolute inset-0 bg-gradient-to-t from-red-950/10 to-transparent pointer-events-none animate-pulse" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔘 하단 고정 와이드 버튼 */}
      <div className="w-full max-w-md mx-auto mt-10">
        <button
          onClick={handleNext}
          className={`w-full h-14 rounded-[16px] font-semibold text-base tracking-tight transition-all active:scale-[0.99] duration-200 flex items-center justify-center ${
            currentStep === 3
              ? "bg-[#f04452] text-white hover:bg-[#dc3845]"
              : "bg-[#3182f6] text-white hover:bg-[#2272eb]"
          }`}
        >
          {currentStep === 3 ? "내 시간 지키러 가기" : "다음"}
        </button>
      </div>
    </div>
  );
}
