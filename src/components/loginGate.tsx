// "use client";

// import React, { useState } from "react";

// interface LoginGateProps {
//   onLogin: (name: string) => void;
// }

// export default function LoginGate({ onLogin }: LoginGateProps) {
//   const [loginInput, setLoginInput] = useState("");

//   const handleLogin = () => {
//     if (!loginInput.trim()) return;
//     if (typeof window !== "undefined") {
//       window.localStorage?.setItem("focus_user_name", loginInput.trim());
//     }
//     // localStorage.setItem("focus_user_name", loginInput.trim());
//     onLogin(loginInput.trim());
//   };

//   return (
//     <div className="flex h-screen bg-[#F9F9FB] items-center justify-center p-4">
//       <div className="bg-white p-8 rounded-[32px] shadow-2xl max-w-sm w-full text-center border border-gray-100">
//         <h1 className="text-4xl font-black text-[#007AFF] mb-2 tracking-tighter">
//           FOCUS
//         </h1>
//         <p className="text-gray-400 mb-8 text-sm font-medium">
//           생존을 위한 몰입 관리를 시작합니다.
//         </p>
//         <div className="space-y-4">
//           <input
//             type="text"
//             className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
//             placeholder="이름(닉네임)을 입력하세요"
//             value={loginInput}
//             onChange={e => setLoginInput(e.target.value)}
//             onKeyDown={e => e.key === "Enter" && handleLogin()}
//           />
//           <button
//             onClick={handleLogin}
//             className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-[0.98] transition-all"
//           >
//             입장하기
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
// 🔥 앱인토스 공식 프레임워크에서 appLogin 함수를 불러옵니다.
import { appLogin } from "@apps-in-toss/web-framework";

export default function LoginGate({
  onLogin,
}: {
  onLogin: (name: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleTossLogin = async () => {
    setIsLoading(true);
    try {
      // 1. 토스 앱에 "로그인 화면 띄워줘!" 요청 (10분짜리 단기 인가 코드 발급)
      const { authorizationCode, referrer } = await appLogin();

      // 2. 발급받은 인가 코드를 우리 Vercel 백엔드로 은밀하게 전송!
      const apiUrl = baseUrl ? `${baseUrl}/api/auth/toss` : "/api/auth/toss";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorizationCode, referrer }),
      });

      if (!res.ok) throw new Error("서버 로그인 처리 실패");

      const data = await res.json();

      if (typeof window !== "undefined") {
        window.localStorage?.setItem("focus_user_name", data.userName);
        window.localStorage?.setItem("focus_auth_token", data.token); // 토큰 저장
      }

      // 3. 백엔드가 토스에서 뜯어온(?) 유저 이름으로 앱 시작!
      onLogin(data.userName);
    } catch (error) {
      console.error("토스 로그인 에러:", error);
      alert("로그인 중 문제가 발생했어요. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#F9F9FB]">
      <div className="bg-white p-8 rounded-[32px] shadow-lg text-center max-w-sm w-full mx-4">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          TIME DIVE
        </h1>
        <p className="text-gray-500 font-medium mb-10 text-sm">
          당신의 하루를 완벽하게 조준하세요
        </p>

        <button
          onClick={handleTossLogin}
          disabled={isLoading}
          className="w-full bg-[#3182F6] text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? "토스 인증 중..." : "토스 계정으로 시작하기"}
        </button>
      </div>
    </div>
  );
}
