import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "time-dive",
  brand: {
    displayName: "타임다이브", // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: "#3182F6", // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: "https://static.toss.im/appsintoss/33049/9b232a36-93d6-4321-8b1c-c3b325700119.png", // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
  },
  web: {
    host: "10.227.3.133",
    port: 5173,
    commands: {
      dev: "next dev -H 0.0.0.0 -p 5173",
      build: "next build",
    },
  },
  permissions: [],
  outdir: "out",
  webViewProps: {
    type: "partner", // 비게임
  },
});
