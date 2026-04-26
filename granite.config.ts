import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "tiem-dive",
  brand: {
    displayName: "tiem-dive", // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: "#3182F6", // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: "./public/images/logo.png", // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "next dev",
      build: "next build",
    },
  },
  permissions: [],
  outdir: "dist",
});
