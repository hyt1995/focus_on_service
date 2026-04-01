// src/components/Sidebar.tsx
import React from "react";
import { Menu, Home, Calendar, X, Repeat } from "lucide-react";

interface Props {
  currentView: string;
  setCurrentView: (view: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

export default function Sidebar({
  currentView,
  setCurrentView,
  isMobileOpen,
  setIsMobileOpen,
}: Props) {
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
            </div>
          </div>
        </>
      )}
    </>
  );
}
