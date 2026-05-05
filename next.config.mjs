/** @type {import('next').NextConfig} */
// import type { NextConfig } from "next";

// Capacitor 빌드할 때만 'export' 모드를 활성화하기 위한 변수
const isExport = process.env.IS_EXPORT === "true";

const nextConfig = {
  // 🎯 Vercel 배포 시에는 'export'를 빼야 API 라우트가 정상 작동함!
  // 터미널에서 IS_EXPORT=true npm run build 칠 때만 export 모드가 됨
  // output: isExport ? "export" : undefined,
  // output: undefined,
  // output: "export", // 이렇게 작동해야함
  output: undefined,

  // 2. [핵심 수술] 토스 앱에서 Vercel API로 보낸 요청을 허용하는 CORS 설정
  async headers() {
    return [
      {
        // 모든 API 경로(/api/...)에 대해 헤더 설정 적용
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            // 실무에서는 토스 도메인만 넣는 게 좋지만,
            // 현재 테스트 중이므로 모든 곳(*)에서 오는 요청을 일단 허용하세!
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-user-name",
          },
        ],
      },
    ];
  },

  // 앱 빌드 시 Next.js 서버 이미지를 못 쓰므로 최적화 해제
  images: {
    unoptimized: true,
  },

  // 기타 필요한 설정들 (있다면 유지)
  reactStrictMode: true,
};

export default nextConfig;
