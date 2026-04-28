// src/coomponents/BrainDumpModal.tsx
"use client";

import React from "react";
import { BottomSheet } from "@toss/tds-mobile";

// page.tsx에서 넘겨받을 데이터 타입 정의
interface BrainDumpModalProps {
  isOpen: boolean;
  prepCount: number | null;
  timeLeft: number | null;
  recognizedText: string;
}

export default function BrainDumpModal({
  isOpen,
  prepCount,
  timeLeft,
  recognizedText,
}: BrainDumpModalProps) {
  if (!isOpen) return null;

  return (
    // <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-white/95 p-5 rounded-2xl shadow-2xl text-center border-2 border-[#FF9500] z-50 animate-in slide-in-from-bottom-4">
    //   {/* 상단 헤더 & 타이머 */}
    //   <div className="flex justify-between items-center mb-2">
    //     <div className="flex items-center gap-2">
    //       <span className="relative flex h-3 w-3">
    //         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9500] opacity-75"></span>
    //         <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF9500]"></span>
    //       </span>
    //       <p className="text-[#FF9500] text-xs font-bold">
    //         {prepCount !== null ? "음성인식 준비 중" : "AI 브레인덤프 작동 중"}
    //       </p>
    //     </div>
    //     <p className="text-red-500 text-xs font-bold tracking-wider">
    //       {prepCount !== null
    //         ? `${prepCount}초 후 시작`
    //         : timeLeft !== null
    //         ? `${timeLeft}초 남음`
    //         : "연결 중..."}
    //     </p>
    //   </div>

    //   {/* 20초 타이머 진행바 (녹음 중에만 보임) */}
    //   {timeLeft !== null && prepCount === null && (
    //     <div className="w-full bg-gray-100 h-1.5 rounded-full mb-4 overflow-hidden">
    //       <div
    //         className="bg-[#FF9500] h-full transition-all duration-1000 ease-linear"
    //         style={{ width: `${(timeLeft / 20) * 100}%` }}
    //       />
    //     </div>
    //   )}

    //   {/* 중앙 안내 문구 & 인식된 텍스트 */}
    //   <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 min-h-[80px] flex flex-col justify-center">
    //     {prepCount !== null ? (
    //       <div className="text-center">
    //         <p className="text-[#FF9500] text-3xl font-extrabold animate-bounce">
    //           {prepCount}
    //         </p>
    //         <p className="text-gray-600 text-sm font-bold mt-2">
    //           {prepCount}초 후에 음성인식이 시작됩니다.
    //         </p>
    //       </div>
    //     ) : recognizedText ? (
    //       <p className="text-gray-800 text-sm font-medium break-words leading-relaxed">
    //         "{recognizedText}"
    //       </p>
    //     ) : (
    //       <div className="space-y-1">
    //         <p className="text-gray-800 text-sm font-bold">
    //           생각나는 업무나 아이디어를 말해주세요.
    //         </p>
    //         <p className="text-gray-500 text-xs font-medium">
    //           지금 당장 해야 할 최적의 순서를 짜드립니다.
    //         </p>
    //       </div>
    //     )}
    //   </div>
    // </div>
    <BottomSheet open={isOpen} onClose={() => {}}>
      <div className="p-5 text-center">
        {/* 1. 모달 상단 (타이틀 및 시간) */}
        {/* <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9500] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF9500]"></span>
            </span>
            <p className="text-[#FF9500] text-xs font-bold">
              {prepCount !== null
                ? "마이크 켤 준비를 하고 있어요"
                : "AI가 듣고 있어요"}
            </p>
          </div>
          <p className="text-red-500 text-xs font-bold tracking-wider">
            {prepCount !== null
              ? `${prepCount}초 후 시작`
              : timeLeft !== null
              ? `${timeLeft}초 남음`
              : "연결 중..."}
          </p>
        </div> */}
        {/* 1. 모달 상단 (TDS 스타일 타이틀 및 시간) */}
        <div className="flex justify-between items-end mb-4 px-1">
          <h3 className="text-[#191F28] text-[20px] font-bold tracking-tight">
            {prepCount !== null ? "마이크 켤 준비 중" : "말씀해 주세요"}
          </h3>
          <p className="text-[#3182F6] text-[15px] font-semibold">
            {prepCount !== null
              ? `${prepCount}초 후 시작`
              : timeLeft !== null
              ? `${timeLeft}초 남음`
              : "연결 중..."}
          </p>
        </div>

        {/* 2. 20초 진짜 녹음 중에만 보이는 주황색 진행바 */}
        {/* {timeLeft !== null && prepCount === null && (
          <div className="w-full bg-gray-100 h-1.5 rounded-full mb-4 overflow-hidden">
            <div
              className="bg-[#FF9500] h-full transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 20) * 100}%` }}
            />
          </div>
        )} */}
        {/* 2. 20초 진짜 녹음 중에만 보이는 TDS 블루 진행바 */}
        {timeLeft !== null && prepCount === null && (
          <div className="w-full bg-[#F2F4F6] h-2 rounded-full mb-5 overflow-hidden">
            <div
              className="bg-[#3182F6] h-full transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 20) * 100}%` }}
            />
          </div>
        )}

        {/* 3. 중앙 안내 & 텍스트 영역 */}
        {/* <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 min-h-[80px] flex flex-col justify-center">
          {prepCount !== null ? (
            // 4초 카운트다운 화면
            <div className="text-center">
              <p className="text-[#FF9500] text-3xl font-extrabold animate-bounce">
                {prepCount}
              </p>
              <p className="text-gray-600 text-xs font-bold mt-2">
                {prepCount}초 뒤에 마이크가 켜져요.
              </p>
            </div>
          ) : recognizedText ? (
            // 사용자가 말한 텍스트 보여주기
            <p className="text-gray-800 text-sm font-medium break-words leading-relaxed">
              "{recognizedText}"
            </p>
          ) : (
            // 0초 땡! 하고 아직 말 안 했을 때 기본 화면
            <div className="space-y-1">
              <p className="text-gray-800 text-sm font-bold">
                생각나는 일정을 편하게 말씀해 주세요.
              </p>
              <p className="text-gray-500 text-xs font-medium">
                가장 먼저 해야 할 순서를 정리해 드릴게요.
              </p>
            </div>
          )}
        </div> */}
        {/* 3. 중앙 안내 & 텍스트 영역 (TDS 그레이 박스) */}
        <div className="bg-[#F2F4F6] p-5 rounded-[16px] min-h-[100px] flex flex-col items-center justify-center">
          {prepCount !== null ? (
            // 4초 카운트다운 화면
            <div className="text-center">
              <p className="text-[#3182F6] text-[40px] font-bold leading-none mb-1">
                {prepCount}
              </p>
              <p className="text-[#6B7684] text-[15px] font-medium">
                초 뒤에 녹음이 시작됩니다
              </p>
            </div>
          ) : recognizedText ? (
            // 사용자가 말한 텍스트 보여주기
            <p className="text-[#191F28] text-[16px] font-medium break-words leading-relaxed text-center w-full">
              "{recognizedText}"
            </p>
          ) : (
            // 0초 땡! 하고 아직 말 안 했을 때 기본 화면
            <div className="text-center space-y-1">
              <p className="text-[#191F28] text-[16px] font-semibold">
                생각나는 일정을 말씀해 주세요
              </p>
              <p className="text-[#6B7684] text-[14px] font-medium">
                AI가 최우선 순위를 정리해 드립니다
              </p>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
