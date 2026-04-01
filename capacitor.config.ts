import type { CapacitorConfig } from "@capacitor/cli";

// 🎯 터미널에서 주입하는 환경 변수에 따라 개발 모드인지 판단!
const isDev = process.env.APP_ENV === "dev";

const config: CapacitorConfig = {
  appId: "com.vibecoding.focus",
  appName: "VibeFocus",
  webDir: "out",
  server: {
    // 🎯 폰에 깔린 앱이 켜지면 무조건 이 주소(Vercel)를 비춰라!
    url: isDev
      ? "http://192.168.45.119:3000"
      : "https://project-a7app.vercel.app/",
    cleartext: true,
  },
};

export default config;
