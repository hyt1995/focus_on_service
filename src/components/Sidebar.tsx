// src/components/Sidebar.tsx
import React from "react";
import { Menu, Home, Calendar, X, Repeat } from "lucide-react";
// 상단에 Link 모듈이 없으면 추가해 줘
import Link from "next/link";
// 필요한 아이콘도 추가 (lucide-react를 쓴다면)
import { FileText } from "lucide-react";

interface Props {
  currentView: string;
  setCurrentView: (view: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  closingTime?: any;
}

export default function Sidebar({
  currentView,
  setCurrentView,
  isMobileOpen,
  setIsMobileOpen,
  closingTime,
}: Props) {
  // 🎯 [여기 추가!] 마감 시간을 체크하는 잠금(Lock) 함수
  const handleReceiptClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 마감 시간 데이터가 혹시라도 아직 안 넘어왔다면 기본값 처리
    const timeStr = closingTime || "18:00";

    // "18:00" 문자열을 쪼개서 오늘 날짜의 시간으로 변환
    const [hours, minutes] = timeStr.split(":").map(Number);
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);

    // 디버깅용 (필요 없으면 지워도 됨)
    console.log("현재 시간:", now.toLocaleTimeString());
    console.log("화면의 마감 시간:", targetTime.toLocaleTimeString());

    // 마감 시간 전이면 이동 차단!
    if (now < targetTime) {
      e.preventDefault(); // 🔥 라우팅(화면 이동) 즉시 차단
      alert(
        `오늘 하루가 끝나지 않았습니다. (마감: ${timeStr})\n마감 시간 이후에 영수증을 발급할 수 있습니다.`
      );
      return;
    }

    // 조건 통과 시: e.preventDefault()를 안 했으므로 Link 태그가 자연스럽게 이동시켜 줌
    if (setIsMobileOpen) setIsMobileOpen(false); // 모바일 메뉴만 살짝 닫아줌
  };

  return (
    <>
      {/* PC 사이드바 */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <Menu className="w-6 h-6 cursor-pointer" />
          <h1 className="text-xl font-bold tracking-tight text-[#007AFF]">
            FOCUS
          </h1>
        </div>
        <nav className="space-y-2 flex-1 text-[#8E8E93]">
          <button
            onClick={() => setCurrentView("home")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              currentView === "home"
                ? "bg-blue-50 text-[#007AFF]"
                : "hover:bg-gray-50"
            }`}
          >
            <Home className="w-5 h-5" /> <span>Home</span>
          </button>
          <button
            onClick={() => setCurrentView("calendar")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              currentView === "calendar"
                ? "bg-blue-50 text-[#007AFF]"
                : "hover:bg-gray-50"
            }`}
          >
            <Calendar className="w-5 h-5" /> <span>Calendar</span>
          </button>
          <button
            onClick={() => setCurrentView("daily")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              currentView === "daily"
                ? "bg-blue-50 text-[#007AFF]"
                : "hover:bg-gray-50"
            }`}
          >
            <Repeat className="w-5 h-5" /> <span>Daily 루틴</span>
          </button>

          <button
            onClick={(e: any) => {
              // 혹시 handleReceiptClick에 결제 검증 같은 다른 로직이 있다면 같이 실행!
              if (typeof handleReceiptClick === "function") {
                handleReceiptClick(e);
              }

              // 1. 화면 상태를 영수증으로 변경 (DB 재호출 차단 SPA 방식)
              setCurrentView("receipt");

              // 2. 모바일 환경일 경우 메뉴 닫기
              if (setIsMobileOpen) setIsMobileOpen(false);
            }}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors w-full text-left ${
              currentView === "receipt"
                ? "bg-blue-50 text-[#007AFF] font-bold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="font-bold">타임 레시피</span>
          </button>
        </nav>
      </aside>

      {/* 모바일 서랍장 */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-2xl flex flex-col">
            <div className="p-5 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">메뉴</h2>
              <button onClick={() => setIsMobileOpen(false)}>
                <X size={24} className="text-gray-400 hover:text-gray-800" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setCurrentView("home");
                  setIsMobileOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold ${
                  currentView === "home"
                    ? "bg-[#007AFF] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                🏠 홈 (Today's Focus)
              </button>
              <button
                onClick={() => {
                  setCurrentView("calendar");
                  setIsMobileOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold ${
                  currentView === "calendar"
                    ? "bg-[#007AFF] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                📅 달력 및 일정 관리
              </button>
              <button
                onClick={() => {
                  setCurrentView("daily");
                  setIsMobileOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold ${
                  currentView === "daily"
                    ? "bg-[#007AFF] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                🔁 데일리 루틴 관리
              </button>

              <button
                onClick={(e: any) => {
                  // 혹시 handleReceiptClick에 결제 검증 같은 다른 로직이 있다면 같이 실행!
                  if (typeof handleReceiptClick === "function") {
                    handleReceiptClick(e);
                  }

                  // 1. 화면 상태를 영수증으로 변경 (DB 재호출 차단 SPA 방식)
                  setCurrentView("receipt");

                  // 2. 모바일 환경일 경우 메뉴 닫기
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors w-full text-left ${
                  currentView === "receipt"
                    ? "bg-blue-50 text-[#007AFF] font-bold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="font-bold">타임 영수증</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
