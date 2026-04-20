"use client";

import { useState, useEffect, useRef } from "react"; // useRef, useEffect 꼭 임포트!
import Sidebar from "@/components/Sidebar";
import { Menu, Image as ImageIcon, Check, Edit3, Download } from "lucide-react";
import ReceiptCanvas from "@/components/ReceiptCanvas";
import ControlPanel from "@/components/ControlPanel";
import html2canvas from "html2canvas";
import { exportReceipt } from "@/utils/exportReceipt"; // 경로(절대/상대)는 네 프로젝트에 맞게 수정!

interface TaskItem {
  name: string;
  start: string;
  duration: string;
}

interface ReceiptPageData {
  inProgress: TaskItem[];
  done: TaskItem[];
}

export default function TimeReceiptPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  const [draftText, setDraftText] = useState("");
  // const [draftImage, setDraftImage] = useState<string | null>(null);
  // const [appliedImage, setAppliedImage] = useState<string | null>(null);

  const [appliedText, setAppliedText] = useState("");
  const [draftMedia, setDraftMedia] = useState<{
    url: string;
    type: "image" | "video";
  } | null>(null);
  const [appliedMedia, setAppliedMedia] = useState<{
    url: string;
    type: "image" | "video";
  } | null>(null);

  // 🌟 파일이 올라오면 사진인지 영상인지 자동으로 판별하는 똑똑한 함수
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    // 파일의 MIME 타입(예: 'video/mp4', 'image/png')을 읽어서 앞부분이 video인지 확인!
    const type = file.type.startsWith("video/") ? "video" : "image";

    setDraftMedia({ url, type });
  };

  const handleApply = () => {
    setAppliedText(draftText);
    setAppliedMedia(draftMedia); // 적용 시점에도 미디어 정보 통째로 넘기기
    setIsEditing(false);
  };

  // 🌟 [추가됨] 투 패스 렌더링을 위한 상태와 Ref
  const [isMeasuring, setIsMeasuring] = useState(true); // 측정 중인지 여부
  const [receiptPages, setReceiptPages] = useState<any[]>([]); // 쪼개진 영수증 데이터
  const measureRef = useRef<HTMLDivElement>(null); // 실제 높이를 잴 숨겨진 DOM

  // 🌟 1. ReceiptCanvas에 있던 상태들 전부 여기로 이사!
  const [bgSize, setBgSize] = useState({ w: 600, h: 1100 });
  const [paperSize, setPaperSize] = useState({ w: 300, h: 1160 });
  const [titlePos, setTitlePos] = useState({ t: 30, l: 200 });
  const [logoSize, setLogoSize] = useState({ w: 260, h: 100 });
  const [logoPos, setLogoPos] = useState({ t: 90, l: 166 });
  const [photoSize, setPhotoSize] = useState({ w: 275, h: 165 });
  const [photoPos, setPhotoPos] = useState({ t: 225, l: 297 });
  const [barcodeSize, setBarcodeSize] = useState({ w: 800, h: 100 });
  const [barcodePos, setBarcodePos] = useState({ t: 0, l: 909 });
  const [contentPos, setContentPos] = useState({ t: 420 });
  const [contentWidth, setContentWidth] = useState(90);
  const [contentGap, setContentGap] = useState(15);
  const [contentHeight, setContentHeight] = useState(0); // 측정된 높이 표시용

  // DB에서 가져온 데이터 예시 (나중에는 실제 DB 연동 코드로 바뀝니다)
  // page.tsx의 데이터 선언부
  const mockWorkingTime = "08:30 ~ 13:24";

  const mockInProgress = [
    {
      name: "출근 및 커피",
      start: "2026/04/12 18:45",
      duration: "1일 03:45분",
    },
    {
      name: "10:30 스프린트 회의",
      start: "2026/04/12 18:45",
      duration: "1일 03:45분",
    },
    {
      name: "서류 전달하기",
      start: "2026/04/12 18:45",
      duration: "1일 03:45분",
    },
    // {
    //   name: "서류 전달하기",
    //   start: "2026/04/12 18:45",
    //   duration: "1일 03:45분",
    // },
    {
      name: "서류 전달하기",
      start: "2026/04/12 18:45",
      duration: "1일 03:45분",
    },
    {
      name: "서류 전달하기",
      start: "2026/04/12 18:45",
      duration: "1일 03:45분",
    },
    {
      name: "서류 전달하기",
      start: "2026/04/12 18:45",
      duration: "1일 03:45분",
    },
  ];

  const mockDone = [
    {
      name: "스프린트 회의 참여",
      start: "2026/04/12 18:45",
      duration: "1일 03:45분",
    },
    {
      name: "스프린트 회의 참여",
      start: "2026/04/12 18:45",
      duration: "1일 03:45분",
    },
    { name: "로그인 API 구현", start: "2026/04/12 20:15", duration: "03:45분" },
    {
      name: "스프린트 회의 참여",
      start: "2026/04/12 18:45",
      duration: "1일 03:45분",
    },
    {
      name: "스프린트 회의 참여",
      start: "2026/04/12 18:45",
      duration: "1일 03:45분",
    },
    { name: "로그인 API 구현", start: "2026/04/12 20:15", duration: "03:45분" },
    {
      name: "스프린트 회의 참여",
      start: "2026/04/12 18:45",
      duration: "1일 03:45분",
    },
    {
      name: "스프린트 회의 참여",
      start: "2026/04/12 18:45",
      duration: "1일 03:45분",
    },
  ];

  // 🌟 [추가됨] 몰래 그린 항목들의 실제 픽셀 높이를 재고 페이지를 나누는 마법!
  useEffect(() => {
    if (!isMeasuring || !measureRef.current) return;

    const inProgressNodes = measureRef.current.querySelectorAll(
      ".measure-in-progress"
    );
    const doneNodes = measureRef.current.querySelectorAll(".measure-done");

    const inProgressHeights = Array.from(inProgressNodes).map(
      node => (node as HTMLElement).offsetHeight
    );
    const doneHeights = Array.from(doneNodes).map(
      node => (node as HTMLElement).offsetHeight
    );

    // 🌟 1. 일단 렌더링될 '모든 데이터의 총합 높이'를 먼저 계산해!
    const totalInProgressHeight = inProgressHeights.reduce(
      (sum, h) => sum + h + contentGap,
      0
    );
    const totalDoneHeight = doneHeights.reduce(
      (sum, h) => sum + h + contentGap,
      0
    );
    const totalDataHeight = totalInProgressHeight + totalDoneHeight;

    const pages: ReceiptPageData[] = [];
    let currentPage: ReceiptPageData = { inProgress: [], done: [] };
    let currentHeight = 0;

    // 🌟 2. 철수의 완벽한 로직 적용!
    // 총 데이터가 600px 이하면? 첫 장 기준은 600!
    // 총 데이터가 600px 초과면? 바코드가 뒤로 밀리니까 첫 장 기준을 1000으로 뻥튀기!
    const FIRST_PAGE_LIMIT = totalDataHeight > 500 ? 550 : 500;

    // 그리고 두 번째 장부터는 텅 비었으니까 무조건 1600!
    const OTHER_PAGE_LIMIT = 1100;

    let currentLimit = FIRST_PAGE_LIMIT;

    // IN PROGRESS 분할 계산
    mockInProgress.forEach((task, i) => {
      const itemHeight = inProgressHeights[i] + contentGap;
      if (currentHeight + itemHeight > currentLimit) {
        pages.push(currentPage);
        currentPage = { inProgress: [], done: [] };
        currentHeight = 0;
        currentLimit = OTHER_PAGE_LIMIT; // 두 번째 장으로 넘어가면 기준을 1600으로 변경!
      }
      currentPage.inProgress.push(task);
      currentHeight += itemHeight;
    });

    // DONE 분할 계산
    mockDone.forEach((task, i) => {
      const itemHeight = doneHeights[i] + contentGap;
      if (currentHeight + itemHeight > currentLimit) {
        pages.push(currentPage);
        currentPage = { inProgress: [], done: [] };
        currentHeight = 0;
        currentLimit = OTHER_PAGE_LIMIT; // 여기서 넘어가도 기준은 1600!
      }
      currentPage.done.push(task);
      currentHeight += itemHeight;
    });

    // 남은 데이터 저장
    if (currentPage.inProgress.length > 0 || currentPage.done.length > 0) {
      pages.push(currentPage);
    }

    // 🌟 3. 철벽 방어 코드: 데이터가 600~1000px 사이일 때 바코드 분리하기
    // 총 데이터가 600px을 넘어서 첫 장 한도를 1000px로 늘렸는데, 데이터가 딱 800px이라 첫 장에 다 들어갔어!
    // 이러면 바코드가 첫 장에 나오면 안 되니까, 강제로 바코드용 텅 빈 두 번째 영수증을 하나 추가해 주는 거야.
    if (totalDataHeight > 600 && pages.length === 1) {
      pages.push({ inProgress: [], done: [] });
    }

    setReceiptPages(pages);
    setIsMeasuring(false);
  }, [isMeasuring, mockInProgress, mockDone, contentPos.t, contentGap]);

  // 🌟 길었던 코드를 싹 지우고 이렇게 3줄로 교체!
  const handleDownload = () => {
    exportReceipt({
      containerId: "receipt-export-container",
      appliedMedia: appliedMedia, // 상태로 가지고 있는 appliedMedia를 밖으로 던져줌
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };
  return (
    <div className="flex h-screen bg-[#F9F9FB] text-[#1C1C1E] overflow-hidden">
      <Sidebar
        currentView="receipt"
        setCurrentView={() => {}}
        isMobileOpen={isSidebarOpen}
        setIsMobileOpen={setIsSidebarOpen}
        closingTime="23:59"
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="flex items-center gap-5 p-4 lg:p-8 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 shrink-0">
          <button
            className="lg:hidden shrink-0 p-2 -ml-2 text-gray-700 hover:bg-gray-200 rounded-xl"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-7 h-7" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            나만의 타임 레시피
          </h1>
        </header>

        {/* 🔥 여기서부터 스크롤이 완벽하게 내려갑니다. */}
        <section className="flex-1 overflow-y-auto w-full flex flex-col items-center relative">
          <div className="w-full max-w-[420px] shrink-0 mt-4 px-4">
            {isEditing ? (
              <div className="space-y-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <label className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl cursor-pointer hover:bg-gray-200 transition-colors border border-dashed border-gray-300 shrink-0 overflow-hidden relative">
                    {/* 🌟 미디어 타입에 따라 img 태그를 쓸지 video 태그를 쓸지 결정! */}
                    {draftMedia ? (
                      draftMedia.type === "video" ? (
                        <video
                          src={draftMedia.url}
                          className="w-full h-full object-cover"
                          muted
                          autoPlay
                          loop
                          playsInline // 소리 끄고 무한 반복 재생!
                        />
                      ) : (
                        <img
                          src={draftMedia.url}
                          alt="미리보기"
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                    <input
                      type="file"
                      accept="image/*, video/*" // 🌟 핵심: 사진과 동영상 모두 허용!
                      className="hidden"
                      onChange={handleMediaUpload}
                    />
                  </label>
                  <div className="text-sm font-bold text-gray-600">
                    {draftMedia
                      ? draftMedia.type === "video"
                        ? "동영상 첨부 완료!"
                        : "사진 첨부 완료!"
                      : "오늘 하루를 나타내는 사진/영상"}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={draftText}
                    onChange={e => setDraftText(e.target.value)}
                    maxLength={100}
                    placeholder="오늘 하루 소감을 적어보세요! (최대 100자)"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-4 pb-8 rounded-2xl outline-none focus:ring-2 focus:ring-[#007AFF]/50 transition-all font-medium resize-none min-h-[120px] leading-relaxed"
                  />
                  <div
                    className={`absolute bottom-3 right-4 text-xs font-bold ${
                      draftText.length === 100
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {draftText.length} / 100
                  </div>
                </div>

                <button
                  onClick={handleApply}
                  className="w-full flex items-center justify-center gap-2 bg-[#007AFF] text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  작성 완료
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6 w-full">
                <div className="text-sm font-bold text-[#007AFF]">
                  ✅ 영수증 데이터가 입력되었습니다.
                </div>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  다시 수정
                </button>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex flex-col xl:flex-row items-start gap-8 py-10 bg-neutral-900 min-h-screen w-full relative px-4 lg:px-10">
              {/* 🌟 2. 왼쪽에 모듈화한 컨트롤 패널 딱 한 줄로 부르기! */}
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
              {/* 🌟 3. 오른쪽에 기존 영수증 영역 몰아넣기 */}
              <div className="flex-1 flex flex-col items-center gap-10 w-full relative">
                {/* 🌟 다운로드 버튼 (화면 우측 상단에 둥둥 떠 있게 고정) */}
                <button
                  onClick={handleDownload}
                  className="absolute top-0 right-0 z-50 flex items-center gap-2 bg-[#007AFF] text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-transform hover:scale-105"
                >
                  <Download className="w-5 h-5" />
                  영수증 저장하기
                </button>

                {/* 기존에 있던 투 패스 렌더링 (Hidden Ruler) 그대로 유지! */}
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
                      {mockInProgress.map((task, i) => (
                        <div
                          key={i}
                          className="measure-in-progress text-[10px] border-b border-gray-100 pb-1 mb-2"
                        >
                          <div className="flex justify-between font-bold items-start">
                            <span className="w-[65%] break-words">
                              {task.name}
                            </span>
                            <span className="text-[7px]">{task.start}</span>
                          </div>
                          <div className="text-right text-[8px] mt-0.5">
                            {task.duration}
                          </div>
                        </div>
                      ))}
                      {mockDone.map((task, i) => (
                        <div
                          key={i}
                          className="measure-done text-[10px] border-b border-gray-100 pb-1 mb-2"
                        >
                          <div className="flex justify-between font-bold items-start">
                            <span className="w-[65%] break-words">
                              {task.name}
                            </span>
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

                {/* 실제 화면에 그려지는 영수증들 */}
                <div
                  id="receipt-export-container"
                  className="flex flex-col items-center gap-10 w-full pb-20 pt-16"
                >
                  {!isMeasuring &&
                    receiptPages.map((page, index) => (
                      <div key={index} className="receipt-page">
                        <ReceiptCanvas
                          key={index}
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
                              ? "4일 22:50분"
                              : null
                          }
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
