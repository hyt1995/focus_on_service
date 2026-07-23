"use client";

import { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Check, Edit3, Download } from "lucide-react";
import ReceiptCanvas from "@/components/ReceiptCanvas";
import ControlPanel from "@/components/ControlPanel";
import { exportReceipt } from "@/utils/exportReceipt";
import {
  Asset,
  Button,
  TextButton,
  FixedBottomCTA,
  Badge,
  BottomSheet,
  TextField,
  TextArea,
} from "@toss/tds-mobile";

interface TaskItem {
  name: string;
  start: string;
  duration: string;
}

interface ReceiptPageData {
  inProgress: TaskItem[];
  done: TaskItem[];
}

// 🌟 1. Props로 page.tsx에서 들고 있는 진짜 데이터를 받아옵니다!
interface TimeReceiptViewProps {
  tasks?: any[];
  schedules?: any[];
  userName?: string;
  workingTime?: string; // 🌟 부모로부터 실제 설정 시간을 받음
}

export default function TimeReceiptView({
  tasks = [],
  schedules = [],
  userName,
  workingTime,
}: TimeReceiptViewProps) {
  const [isEditing, setIsEditing] = useState(true);
  const [draftText, setDraftText] = useState("");
  const [appliedText, setAppliedText] = useState("");
  const [draftMedia, setDraftMedia] = useState<{
    url: string;
    type: "image" | "video";
  } | null>(null);
  const [appliedMedia, setAppliedMedia] = useState<{
    url: string;
    type: "image" | "video";
  } | null>(null);

  // 🌟 추가: 설정창(ControlPanel) 렌더링을 제어할 상태
  const [isControlSheetOpen, setIsControlSheetOpen] = useState(false);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("video/") ? "video" : "image";
    setDraftMedia({ url, type });
  };

  const handleApply = () => {
    setAppliedText(draftText);
    setAppliedMedia(draftMedia);
    setIsEditing(false);
  };

  const [isMeasuring, setIsMeasuring] = useState(true);
  const [receiptPages, setReceiptPages] = useState<ReceiptPageData[]>([]);
  const measureRef = useRef<HTMLDivElement>(null);

  const [bgSize, setBgSize] = useState({ w: 600, h: 1100 });
  const [paperSize, setPaperSize] = useState({ w: 300, h: 1160 });
  const [titlePos, setTitlePos] = useState({ t: 30, l: 200 });
  const [logoSize, setLogoSize] = useState({ w: 260, h: 180 });
  const [logoPos, setLogoPos] = useState({ t: 50, l: 50 });
  const [photoSize, setPhotoSize] = useState({ w: 275, h: 165 });
  const [photoPos, setPhotoPos] = useState({ t: 225, l: 297 });
  const [barcodeSize, setBarcodeSize] = useState({ w: 1500, h: 300 });
  const [barcodePos, setBarcodePos] = useState({ t: 100, l: 909 });
  const [contentPos, setContentPos] = useState({ t: 420 });
  const [contentWidth, setContentWidth] = useState(90);
  const [contentGap, setContentGap] = useState(15);
  const [contentHeight, setContentHeight] = useState(0);

  // ==========================================
  // 🌟 2. 진짜 데이터 맵핑 (타임 영수증 전용 완벽 포맷팅)
  // ==========================================
  const formatTime = (msOrDateStr: number | string | undefined | null) => {
    if (!msOrDateStr) return "--";
    const d = new Date(msOrDateStr);
    if (isNaN(d.getTime())) return "--";
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(
      2,
      "0",
    )}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(
      2,
      "0",
    )}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const formatDurationMs = (diffMs: number) => {
    if (diffMs <= 0) return "00:00분";
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diffMs / 1000 / 60) % 60);

    const timeStr = `${String(hours).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0",
    )}분`;
    return days > 0 ? `${days}일 ${timeStr}` : timeStr;
  };

  const nowTime = Date.now();
  let totalDurationMs = 0;
  let hasValidDuration = false; // 🔥 "--"가 아닌 유효한 시간이 하나라도 있는지 체크

  // IN PROGRESS 처리
  const realInProgress: TaskItem[] = tasks
    .filter(t => t.status === "in-progress")
    .map(t => {
      // 보여지는 시작 시간은 유저 말대로 createdAt 사용
      const displayStartTime = formatTime(t.startedAt);

      // 🔥 핵심: 실제 start를 누른 적이 없으면 내 맘대로 계산하지 않고 쿨하게 "--"
      if (!t.startedAt) {
        return { name: t.title, start: displayStartTime, duration: "--" };
      }

      const startMs = new Date(t.startedAt).getTime();
      const durationMs = Math.max(0, nowTime - startMs);

      totalDurationMs += durationMs;
      hasValidDuration = true;

      return {
        name: t.title,
        start: displayStartTime,
        duration: formatDurationMs(durationMs),
      };
    });

  // DONE 처리
  // 수정 전
  // const realDone: TaskItem[] = tasks
  //   .filter(t => t.status === "done")
  //   .map(t => {
  //     const displayStartTime = formatTime(t.createdAt);

  //     // 🔥 완료된 일정도 실제 start를 누른 적 없으면 무조건 "--"
  //     if (!t.startedAt) {
  //       return { name: t.title, start: displayStartTime, duration: "--" };
  //     }

  //     const startMs = new Date(t.startedAt).getTime();
  //     const endMs = t.lastStartedAt
  //       ? new Date(t.lastStartedAt).getTime()
  //       : nowTime;

  //     const durationMs = Math.max(0, endMs - startMs);
  //     totalDurationMs += durationMs;
  //     hasValidDuration = true;

  //     return {
  //       name: t.title,
  //       start: displayStartTime,
  //       duration: formatDurationMs(durationMs),
  //     };
  //   });

  // 수정 후
  // DONE 처리
  const realDone: TaskItem[] = tasks
    .filter(t => t.status === "done")
    .map(t => {
      const displayStartTime = formatTime(t.startedAt);
      // 🔥 완료된 일정도 실제 start를 누른 적 없으면 무조건 "--"
      if (!t.startedAt) {
        return { name: t.title, start: displayStartTime, duration: "--" };
      }
      const startMs = new Date(t.startedAt).getTime();

      // 🌟 [핵심 수술] page.tsx에서 구워준 고정 종료 시간(t.endedAt)이 있다면 그것을 사용하고,
      // 만약 없다면(예외 방어) 현재 시간을 차선책으로 사용해 동결 자물쇠를 채웁니다.
      const endMs = t.endedAt ? new Date(t.endedAt).getTime() : nowTime;

      const durationMs = Math.max(0, endMs - startMs);
      totalDurationMs += durationMs;
      hasValidDuration = true;
      return {
        name: t.title,
        start: displayStartTime,
        duration: formatDurationMs(durationMs),
      };
    });

  // 부모(대시보드)가 넘겨준 진짜 스케줄 시간
  const mockWorkingTime = workingTime || "--:-- ~ --:--";

  // 🔥 TOTAL 버그 완벽 해결: 시작한 적 있는 일정이 단 하나라도 있으면 합산, 전부 시작 안 했으면 TOTAL도 "--"
  const totalDurationText = hasValidDuration
    ? formatDurationMs(totalDurationMs)
    : "--";

  // ==========================================
  // 🌟 3. 철수의 완벽한 페이징 로직 (실제 데이터 연동)
  // ==========================================
  useEffect(() => {
    if (!isMeasuring || !measureRef.current) return;

    const inProgressNodes = measureRef.current.querySelectorAll(
      ".measure-in-progress",
    );
    const doneNodes = measureRef.current.querySelectorAll(".measure-done");

    const inProgressHeights = Array.from(inProgressNodes).map(
      node => (node as HTMLElement).offsetHeight,
    );
    const doneHeights = Array.from(doneNodes).map(
      node => (node as HTMLElement).offsetHeight,
    );

    const totalInProgressHeight = inProgressHeights.reduce(
      (sum, h) => sum + h + contentGap,
      0,
    );
    const totalDoneHeight = doneHeights.reduce(
      (sum, h) => sum + h + contentGap,
      0,
    );
    const totalDataHeight = totalInProgressHeight + totalDoneHeight;

    const pages: ReceiptPageData[] = [];
    let currentPage: ReceiptPageData = { inProgress: [], done: [] };
    let currentHeight = 0;

    const FIRST_PAGE_LIMIT = totalDataHeight > 500 ? 550 : 500;
    const OTHER_PAGE_LIMIT = 1100;
    let currentLimit = FIRST_PAGE_LIMIT;

    // IN PROGRESS 분할 계산 (realInProgress 적용)
    realInProgress.forEach((task, i) => {
      const itemHeight = inProgressHeights[i] + contentGap;
      if (currentHeight + itemHeight > currentLimit) {
        pages.push(currentPage);
        currentPage = { inProgress: [], done: [] };
        currentHeight = 0;
        currentLimit = OTHER_PAGE_LIMIT;
      }
      currentPage.inProgress.push(task);
      currentHeight += itemHeight;
    });

    // DONE 분할 계산 (realDone 적용)
    realDone.forEach((task, i) => {
      const itemHeight = doneHeights[i] + contentGap;
      if (currentHeight + itemHeight > currentLimit) {
        pages.push(currentPage);
        currentPage = { inProgress: [], done: [] };
        currentHeight = 0;
        currentLimit = OTHER_PAGE_LIMIT;
      }
      currentPage.done.push(task);
      currentHeight += itemHeight;
    });

    if (currentPage.inProgress.length > 0 || currentPage.done.length > 0) {
      pages.push(currentPage);
    }

    if (totalDataHeight > 600 && pages.length === 1) {
      pages.push({ inProgress: [], done: [] });
    }

    setReceiptPages(pages);
    setIsMeasuring(false);
  }, [isMeasuring, realInProgress, realDone, contentPos.t, contentGap]);

  const handleDownload = () => {
    exportReceipt({
      containerId: "receipt-export-container",
      appliedMedia: appliedMedia,
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // 🌟 4. page.tsx 내부 section에 예쁘게 쏙 들어가도록 껍데기 레이아웃 걷어냄
  return (
    <div className="w-full flex flex-col relative overflow-hidden bg-[#F9F9FB]">
      <header className="flex items-center justify-between px-5 py-3 bg-white sticky top-0 z-20 shrink-0">
        <h1 className="text-[20px] font-bold text-[#191F28] tracking-tight">
          {userName ? `${userName}님의 ` : ""}타임 영수증
        </h1>
        <button
          onClick={() => setIsControlSheetOpen(true)}
          className="p-2 -mr-2 rounded-full transition-colors active:scale-95"
        >
          {/* <Asset.Icon name="setting" color="grey" /> */}
        </button>
      </header>

      <section className="flex-1 w-full flex flex-col items-center relative">
        <div className="w-full max-w-[420px] shrink-0 mt-0 px-0">
          {isEditing ? (
            <div className="flex flex-col px-4 py-0 bg-white w-full">
              {/* 미디어 첨부 영역 */}
              <div className="flex items-center gap-4">
                <label className="flex flex-col items-center justify-center w-20 h-20 bg-[#F2F4F6] rounded-[16px] cursor-pointer hover:bg-[#E5E8EB] transition-colors shrink-0 overflow-hidden relative">
                  {draftMedia ? (
                    draftMedia.type === "video" ? (
                      <video
                        src={draftMedia.url}
                        className="w-full h-full object-cover"
                        muted
                        autoPlay
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={draftMedia.url}
                        alt="미리보기"
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      {/* <Asset.Icon name="image" color="grey" /> */}
                      <span className="text-[12px] font-semibold text-[#8B95A1]">
                        첨부
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*, video/*"
                    className="hidden"
                    onChange={handleMediaUpload}
                  />
                </label>
                <div className="flex flex-col">
                  <span className="text-[16px] font-bold text-[#191F28]">
                    오늘의 사진/영상
                  </span>
                  <span className="text-[13px] text-[#8B95A1] mt-0.5">
                    {draftMedia
                      ? "첨부 완료!"
                      : "사진 / 영상 (8초 이내, 공유만 가능)"}
                  </span>
                </div>
              </div>

              {/* TDS TextField (TextArea) */}
              <TextArea
                label="오늘 소감"
                variant="box" // {'box' | 'line' | 'big' | 'hero'}
                value={draftText}
                onChange={e => setDraftText(e.target.value)}
                placeholder="오늘 하루 소감을 적어보세요! (최대 100자)"
                maxLength={100}
                style={{ height: "120px" }}
              />

              {/* TDS Button */}
              <Button
                size="large"
                onClick={handleApply}
                className="mt-2 flex items-center justify-center gap-1.5"
              >
                {/* <Asset.Icon name="check" color="white" />  */}
                작성 완료
              </Button>
            </div>
          ) : (
            <div className="flex justify-between items-center bg-white p-5 mx-5 rounded-[16px] border border-[#F2F4F6] mt-3 mb-0">
              <div className="flex items-center gap-2">
                <Badge color="blue" size="small" variant="fill">
                  완료
                </Badge>
                <span className="text-[15px] font-bold text-[#191F28]">
                  영수증 입력됨
                </span>
              </div>
              <TextButton
                size="small"
                onClick={handleEdit}
                className="flex items-center gap-1 text-[#8B95A1] hover:text-[#191F28] font-semibold"
              >
                {/* <Asset.Icon name="edit" color="blue" /> */}
                다시 수정
              </TextButton>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex flex-col items-center bg-[#F9F9FB] min-h-screen w-full relative px-4 pb-48 pt-0">
            <BottomSheet
              open={isControlSheetOpen}
              onClose={() => setIsControlSheetOpen(false)}
            >
              <div className="p-5 pb-8">
                <h3 className="text-xl font-bold text-[#191F28] mb-6">
                  영수증 설정
                </h3>
                <ControlPanel
                  paperSize={paperSize}
                  setPaperSize={setPaperSize}
                  titlePos={titlePos}
                  setTitlePos={setTitlePos}
                  logoSize={logoSize}
                  setLogoSize={setLogoSize}
                  logoPos={logoPos}
                  setLogoPos={setLogoPos}
                  photoSize={photoSize}
                  setPhotoSize={setPhotoSize}
                  photoPos={photoPos}
                  setPhotoPos={setPhotoPos}
                  barcodeSize={barcodeSize}
                  setBarcodeSize={setBarcodeSize}
                  barcodePos={barcodePos}
                  setBarcodePos={setBarcodePos}
                  contentPos={contentPos}
                  setContentPos={setContentPos}
                  contentWidth={contentWidth}
                  setContentWidth={setContentWidth}
                  contentGap={contentGap}
                  setContentGap={setContentGap}
                  contentHeight={contentHeight}
                />
              </div>
            </BottomSheet>

            {isMeasuring && (
              <div
                ref={measureRef}
                className="absolute top-0 left-0 invisible pointer-events-none"
                style={{ width: "380px" }}
              >
                <div
                  style={{ width: `${contentWidth}%` }}
                  className="mx-auto text-left font-dos"
                >
                  {/* 🌟 가짜 데이터 대신 진짜 데이터 매핑! */}
                  {realInProgress.map((task, i) => (
                    <div
                      key={i}
                      className="measure-in-progress text-[10px] border-b border-gray-100 pb-1 mb-2"
                    >
                      <div className="flex justify-between font-bold items-start">
                        <span className="w-[65%] break-words">{task.name}</span>
                        <span className="text-[7px]">{task.start}</span>
                      </div>
                      <div className="text-right text-[8px] mt-0.5">
                        {task.duration}
                      </div>
                    </div>
                  ))}
                  {realDone.map((task, i) => (
                    <div
                      key={i}
                      className="measure-done text-[10px] border-b border-gray-100 pb-1 mb-2"
                    >
                      <div className="flex justify-between font-bold items-start">
                        <span className="w-[65%] break-words">{task.name}</span>
                        <span className="text-[7px]">{task.start}</span>
                      </div>
                      <div className="text-right text-[8px] mt-0.5">
                        {task.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              id="receipt-export-container"
              className="flex flex-col items-center gap-0 w-full pb-20 pt-8"
            >
              {!isMeasuring &&
                receiptPages.map((page, index) => (
                  <div key={index} className="receipt-page">
                    <ReceiptCanvas
                      key={index}
                      userName={userName}
                      isFirstPage={index === 0}
                      isLastPage={index === receiptPages.length - 1}
                      bgSize={bgSize}
                      paperSize={paperSize}
                      titlePos={titlePos}
                      logoSize={logoSize}
                      logoPos={logoPos}
                      photoSize={photoSize}
                      photoPos={photoPos}
                      barcodeSize={barcodeSize}
                      barcodePos={barcodePos}
                      contentPos={contentPos}
                      contentWidth={contentWidth}
                      contentGap={contentGap}
                      appliedText={index === 0 ? appliedText : null}
                      appliedMedia={index === 0 ? appliedMedia : null}
                      workingTime={index === 0 ? mockWorkingTime : null}
                      inProgressTasks={page.inProgress}
                      doneTasks={page.done}
                      totalDuration={
                        index === receiptPages.length - 1
                          ? totalDurationText
                          : null
                      }
                    />
                  </div>
                ))}
            </div>
            {/* <div className="flex-1 flex flex-col items-center gap-10 w-full relative"> */}
            <FixedBottomCTA.Double
              leftButton={
                <Button
                  variant="weak"
                  color="primary"
                  className="flex items-center justify-center gap-5 font-bold"
                  onClick={() => setIsControlSheetOpen(true)}
                >
                  {/* <Asset.Icon name="setting" color="grey" /> */}
                  영수증 꾸미기
                </Button>
              }
              rightButton={
                <Button
                  className="flex items-center justify-center gap-2 font-bold"
                  onClick={handleDownload}
                >
                  {/* <Asset.Icon name="download" color="white" /> */}
                  영수증 저장
                </Button>
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}
