"use client";

import React, { useState } from "react";

interface LoginGateProps {
  onLogin: (name: string) => void;
}

export default function LoginGate({ onLogin }: LoginGateProps) {
  const [loginInput, setLoginInput] = useState("");

  const handleLogin = () => {
    if (!loginInput.trim()) return;
    if (typeof window !== "undefined") {
      window.localStorage?.setItem("focus_user_name", loginInput.trim());
    }
    // localStorage.setItem("focus_user_name", loginInput.trim());
    onLogin(loginInput.trim());
  };

  return (
    <div className="flex h-screen bg-[#F9F9FB] items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[32px] shadow-2xl max-w-sm w-full text-center border border-gray-100">
        <h1 className="text-4xl font-black text-[#007AFF] mb-2 tracking-tighter">
          FOCUS
        </h1>
        <p className="text-gray-400 mb-8 text-sm font-medium">
          생존을 위한 몰입 관리를 시작합니다.
        </p>
        <div className="space-y-4">
          <input
            type="text"
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
            placeholder="이름(닉네임)을 입력하세요"
            value={loginInput}
            onChange={e => setLoginInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
          <button
            onClick={handleLogin}
            className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-[0.98] transition-all"
          >
            입장하기
          </button>
        </div>
      </div>
    </div>
  );
}
