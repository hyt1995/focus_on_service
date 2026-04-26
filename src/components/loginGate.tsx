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

// "use client";
// import React, { useEffect } from "react";
// // 🔥 나중에 토스 SDK가 정식으로 세팅되면 import 할 부분
// // import { useTossAuth } from "@apps-in-toss/web-framework/auth";

// interface Props {
//   onLogin: (userName: string) => void;
// }

// export default function LoginGate({ onLogin }: Props) {
//   useEffect(() => {
//     const authenticateWithToss = async () => {
//       try {
//         // 🌟 [토스 자동 로그인 로직]
//         // 실제 배포 시에는 토스 SDK를 통해 유저의 고유 식별자(userToken)를 받아옵니다.
//         // ex) const tossUserId = await getTossUserToken();

//         // 지금은 Vercel 테스트를 위해 'TossUser_랜덤번호' 형태로 임시 고유 ID를 발급합니다.
//         // (나중에 SDK 붙일 때 이 부분만 실제 함수로 싹 갈아 끼우면 됩니다!)
//         const tempTossUserId = "TossUser_" + Math.random().toString(36).substring(2, 9);

//         // 0.5초 정도 토스와 통신하는 척(자연스러운 로딩 UX) 하다가 바로 로그인 통과!
//         setTimeout(() => {
//           onLogin(tempTossUserId);
//         }, 500);

//       } catch (error) {
//         console.error("토스 로그인 실패:", error);
//         alert("토스 인증에 문제가 생겼어요. 다시 시도해 주세요.");
//       }
//     };

//     authenticateWithToss();
//   }, [onLogin]);

//   return (
//     <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F9F9FB] z-50 fixed inset-0">
//       <div className="flex flex-col items-center animate-pulse">
//         {/* 토스 특유의 깔끔하고 부드러운 로딩 스피너 UI */}
//         <div className="w-12 h-12 border-[4px] border-blue-100 border-t-[#007AFF] rounded-full animate-spin mb-5"></div>
//         <h2 className="text-gray-800 font-bold text-lg mb-2">
//           안전하게 인증 중이에요
//         </h2>
//         <p className="text-gray-400 font-medium text-sm">
//           잠시만 기다려 주세요...
//         </p>
//       </div>
//     </div>
//   );
// }
