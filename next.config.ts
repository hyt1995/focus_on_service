import type { NextConfig } from "next";

// Capacitor 빌드할 때만 'export' 모드를 활성화하기 위한 변수
const isExport = process.env.IS_EXPORT === "true";

const nextConfig: NextConfig = {
  // 🎯 Vercel 배포 시에는 'export'를 빼야 API 라우트가 정상 작동함!
  // 터미널에서 IS_EXPORT=true npm run build 칠 때만 export 모드가 됨
  output: isExport ? "export" : undefined,

  // 앱 빌드 시 Next.js 서버 이미지를 못 쓰므로 최적화 해제
  images: {
    unoptimized: true,
  },

  // 기타 필요한 설정들 (있다면 유지)
  reactStrictMode: true,
};

export default nextConfig;
