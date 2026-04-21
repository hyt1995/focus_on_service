// import { toPng } from "html-to-image";

// interface ExportParams {
//   containerId: string;
//   appliedMedia: { url: string; type: "image" | "video" } | null;
// }

// export const exportReceipt = async ({
//   containerId,
//   appliedMedia,
// }: ExportParams) => {
//   const container = document.getElementById(containerId);
//   if (!container) return;

//   // 🌟 동적 임포트 (빌드 에러 방지용)
//   const tossWebFramework = await import("@apps-in-toss/web-framework");
//   const saveBase64Data = tossWebFramework.saveBase64Data;

//   // 🌟 핵심: 영수증을 한 장씩 쪼개기 위해 클래스명으로 요소들을 찾음
//   // (UI 파일에서 각 영수증 한 장마다 className="receipt-page" 를 꼭 붙여줘야 해!)
//   const pages = Array.from(container.querySelectorAll(".receipt-page"));

//   // 만약 receipt-page 클래스를 못 찾으면 기존처럼 전체를 1장으로 취급
//   const targetPages = pages.length > 0 ? pages : [container];

//   alert(
//     `총 ${targetPages.length}장의 영수증 굽기를 시작합니다! 잠시만 기다려주세요 🐳`
//   );

//   for (let i = 0; i < targetPages.length; i++) {
//     const page = targetPages[i] as HTMLElement;
//     const isFirstPage = i === 0;
//     const isVideo = appliedMedia?.type === "video";

//     // ==========================================
//     // 🎬 [첫 장 & 영상일 때] 동영상으로 녹화
//     // ==========================================
//     if (isVideo && isFirstPage) {
//       try {
//         const videoElement = page.querySelector("video");
//         if (!videoElement) throw new Error("비디오를 찾을 수 없습니다.");

//         // 8초 안전장치
//         if (videoElement.duration > 8.5) {
//           alert("타임 영수증 영상은 8초 이내만 가능합니다.");
//           return;
//         }

//         const dataUrl = await toPng(page, {
//           pixelRatio: 2,
//           backgroundColor: "#171717",
//         });
//         const backgroundImage = new Image();
//         backgroundImage.src = dataUrl;
//         await new Promise(resolve => (backgroundImage.onload = resolve));

//         const canvas = document.createElement("canvas");
//         const ctx = canvas.getContext("2d");
//         if (!ctx) continue;

//         // 동적 스케일링 (에러 방어)
//         const MAX_VIDEO_HEIGHT = 1920;
//         let scale = 2;
//         if (page.offsetHeight * 2 > MAX_VIDEO_HEIGHT) {
//           scale = MAX_VIDEO_HEIGHT / page.offsetHeight;
//         }

//         canvas.width = page.offsetWidth * scale;
//         canvas.height = page.offsetHeight * scale;

//         const pageRect = page.getBoundingClientRect();
//         const videoRect = videoElement.getBoundingClientRect();
//         const vX = (videoRect.left - pageRect.left) * scale;
//         const vY = (videoRect.top - pageRect.top) * scale;
//         const vW = videoRect.width * scale;
//         const vH = videoRect.height * scale;

//         const fps = 30;
//         let intervalId: any = null;

//         const stream = canvas.captureStream(fps);
//         const mediaRecorder = new MediaRecorder(stream, {
//           mimeType: "video/webm",
//         });
//         const chunks: BlobPart[] = [];

//         mediaRecorder.ondataavailable = e => {
//           if (e.data.size > 0) chunks.push(e.data);
//         };

//         // 영상을 완전히 다 구울 때까지 기다리기 위해 Promise로 감쌈
//         await new Promise<void>(resolve => {
//           mediaRecorder.onstop = () => {
//             const videoBlob = new Blob(chunks, { type: "video/webm" });
//             const reader = new FileReader();
//             reader.readAsDataURL(videoBlob);

//             reader.onloadend = async () => {
//               const base64data = (reader.result as string).split(",")[1];
//               const fileName = `my_time_receipt_${i + 1}.webm`;

//               // [PC 다운로드 테스트용]
//               const link = document.createElement("a");
//               link.href = URL.createObjectURL(videoBlob);
//               link.download = fileName;
//               link.click();

//               // [토스 앱인토스용] (테스트 끝난 후 주석 해제)
//               /*
//               await saveBase64Data({ data: base64data, fileName, mimeType: "video/webm" });
//               */
//               resolve();
//             };
//           };

//           const originalLoop = videoElement.loop;
//           videoElement.loop = false;
//           videoElement.currentTime = 0;

//           videoElement.onended = () => {
//             if (intervalId) clearInterval(intervalId);
//             if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
//             videoElement.loop = originalLoop;
//             videoElement.play();
//           };

//           intervalId = setInterval(() => {
//             ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
//             ctx.drawImage(videoElement, vX, vY, vW, vH);
//           }, 1000 / fps);

//           videoElement.play();
//           mediaRecorder.start();
//         });
//       } catch (error) {
//         console.error("1페이지 영상 저장 실패:", error);
//       }
//     }
//     // ==========================================
//     // 🖼️ [나머지 모든 경우] 사진으로 캡처
//     // ==========================================
//     else {
//       try {
//         const dataUrl = await toPng(page, {
//           pixelRatio: 2,
//           backgroundColor: "#171717",
//         });
//         const base64data = dataUrl.split(",")[1];
//         const fileName = `my_time_receipt_${i + 1}.png`;

//         // [PC 다운로드 테스트용]
//         const link = document.createElement("a");
//         link.download = fileName;
//         link.href = dataUrl;
//         link.click();

//         // [토스 앱인토스용] (테스트 끝난 후 주석 해제)
//         /*
//         await saveBase64Data({ data: base64data, fileName, mimeType: "image/png" });
//         */
//       } catch (error) {
//         console.error(`${i + 1}페이지 이미지 저장 실패:`, error);
//       }
//     }

//     // 파일이 여러 개일 때 동시에 다운로드되면 브라우저가 막을 수 있으니 0.5초 딜레이
//     await new Promise(resolve => setTimeout(resolve, 500));
//   }
// };

import { toPng } from "html-to-image";
// 🌟 1. 헤더 수술을 위한 라이브러리 추가
import fixWebmDuration from "fix-webm-duration";

interface ExportParams {
  containerId: string;
  appliedMedia: { url: string; type: "image" | "video" } | null;
}

export const exportReceipt = async ({
  containerId,
  appliedMedia,
}: ExportParams) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  // 🌟 동적 임포트 (빌드 에러 방지용)
  const tossWebFramework = await import("@apps-in-toss/web-framework");
  const saveBase64Data = tossWebFramework.saveBase64Data;

  // 🌟 핵심: 영수증을 한 장씩 쪼개기 위해 클래스명으로 요소들을 찾음
  const pages = Array.from(container.querySelectorAll(".receipt-page"));
  const targetPages = pages.length > 0 ? pages : [container];

  alert(
    `총 ${targetPages.length}장의 영수증 굽기를 시작합니다! 잠시만 기다려주세요 🐳`
  );

  for (let i = 0; i < targetPages.length; i++) {
    const page = targetPages[i] as HTMLElement;
    const isFirstPage = i === 0;
    const isVideo = appliedMedia?.type === "video";

    // ==========================================
    // 🎬 [첫 장 & 영상일 때] 동영상으로 녹화
    // ==========================================
    if (isVideo && isFirstPage) {
      try {
        const videoElement = page.querySelector("video");
        if (!videoElement) throw new Error("비디오를 찾을 수 없습니다.");

        // 8초 안전장치
        if (videoElement.duration > 8.5) {
          alert("타임 영수증 영상은 8초 이내만 가능합니다.");
          return;
        }

        const dataUrl = await toPng(page, {
          pixelRatio: 2,
          backgroundColor: "#171717",
        });
        const backgroundImage = new Image();
        backgroundImage.src = dataUrl;
        await new Promise(resolve => (backgroundImage.onload = resolve));

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        // 동적 스케일링 (에러 방어)
        const MAX_VIDEO_HEIGHT = 1920;
        let scale = 2;
        if (page.offsetHeight * 2 > MAX_VIDEO_HEIGHT) {
          scale = MAX_VIDEO_HEIGHT / page.offsetHeight;
        }

        canvas.width = page.offsetWidth * scale;
        canvas.height = page.offsetHeight * scale;

        const pageRect = page.getBoundingClientRect();
        const videoRect = videoElement.getBoundingClientRect();
        const vX = (videoRect.left - pageRect.left) * scale;
        const vY = (videoRect.top - pageRect.top) * scale;
        const vW = videoRect.width * scale;
        const vH = videoRect.height * scale;

        const fps = 30;
        let intervalId: any = null;

        const stream = canvas.captureStream(fps);
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });
        const chunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = e => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        // 영상을 완전히 다 구울 때까지 기다리기 위해 Promise로 감쌈
        await new Promise<void>(resolve => {
          // 🌟 2. async를 붙여서 내부에서 await를 쓸 수 있게 만듦
          mediaRecorder.onstop = async () => {
            // 녹화된 원본 덩어리
            const rawBlob = new Blob(chunks, { type: "video/webm" });

            // 🌟 3. 핵심 수술: 비디오의 진짜 길이를 가져와서 헤더에 강제 주입
            const durationMs = videoElement.duration * 1000;
            let fixedBlob = rawBlob;

            try {
              // fixWebmDuration을 통과시켜 재생바 꼬임 현상을 완벽히 제거
              fixedBlob = await fixWebmDuration(rawBlob, durationMs);
            } catch (fixError) {
              console.error("WebM 헤더 수정 실패, 원본 유지:", fixError);
            }

            // 수술이 끝난 안전한 파일(fixedBlob)을 읽어들임
            const reader = new FileReader();
            reader.readAsDataURL(fixedBlob);

            reader.onloadend = async () => {
              const base64data = (reader.result as string).split(",")[1];
              const fileName = `my_time_receipt_${i + 1}.webm`;

              // [PC 다운로드 테스트용]
              const link = document.createElement("a");
              link.href = URL.createObjectURL(fixedBlob);
              link.download = fileName;
              link.click();

              // [토스 앱인토스용] (테스트 끝난 후 주석 해제)
              /* await saveBase64Data({ data: base64data, fileName, mimeType: "video/webm" }); */
              resolve();
            };
          };

          const originalLoop = videoElement.loop;
          videoElement.loop = false;
          videoElement.currentTime = 0;

          videoElement.onended = () => {
            if (intervalId) clearInterval(intervalId);
            if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
            videoElement.loop = originalLoop;
            videoElement.play();
          };

          intervalId = setInterval(() => {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(videoElement, vX, vY, vW, vH);
          }, 1000 / fps);

          videoElement.play();
          mediaRecorder.start();
        });
      } catch (error) {
        console.error("1페이지 영상 저장 실패:", error);
      }
    }
    // ==========================================
    // 🖼️ [나머지 모든 경우] 사진으로 캡처
    // ==========================================
    else {
      try {
        const dataUrl = await toPng(page, {
          pixelRatio: 2,
          backgroundColor: "#171717",
        });
        const base64data = dataUrl.split(",")[1];
        const fileName = `my_time_receipt_${i + 1}.png`;

        // [PC 다운로드 테스트용]
        const link = document.createElement("a");
        link.download = fileName;
        link.href = dataUrl;
        link.click();

        // [토스 앱인토스용] (테스트 끝난 후 주석 해제)
        /* await saveBase64Data({ data: base64data, fileName, mimeType: "image/png" }); */
      } catch (error) {
        console.error(`${i + 1}페이지 이미지 저장 실패:`, error);
      }
    }

    // 파일이 여러 개일 때 동시에 다운로드되면 브라우저가 막을 수 있으니 0.5초 딜레이
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};
