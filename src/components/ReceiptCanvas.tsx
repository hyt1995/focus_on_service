import React, { useState, useRef, useEffect } from "react"; // 🔥 useRef, useEffect 추가

interface TaskItem {
  name: string;
  start: string;
  duration: string;
}

interface ReceiptCanvasProps {
  isFirstPage: boolean;
  isLastPage: boolean;
  appliedText: string | null;
  appliedMedia: { url: string; type: "image" | "video" } | null;
  workingTime: string | null;
  inProgressTasks: any[];
  doneTasks: any[];
  totalDuration: string | null;

  bgSize: { w: number; h: number };
  paperSize: { w: number; h: number };
  titlePos: { t: number; l: number };
  logoSize: { w: number; h: number };
  logoPos: { t: number; l: number };
  photoSize: { w: number; h: number };
  photoPos: { t: number; l: number };
  barcodeSize: { w: number; h: number };
  barcodePos: { t: number; l: number };
  contentPos: { t: number };
  contentWidth: number;
  contentGap: number;
}
export default function ReceiptCanvas(props: ReceiptCanvasProps) {
  const {
    isFirstPage,
    isLastPage,
    appliedText,
    appliedMedia,
    workingTime,
    inProgressTasks,
    doneTasks,
    totalDuration,
    bgSize,
    paperSize,
    titlePos,
    logoSize,
    logoPos,
    photoSize,
    photoPos,
    barcodeSize,
    barcodePos,
    contentPos,
    contentWidth,
    contentGap,
  } = props;

  // 데이터 실제 높이를 측정하기 위한 변수들
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // 데이터 내용이나 너비, 간격이 바뀔 때마다 높이를 다시 계산하는 마법의 코드
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.offsetHeight);
    }
  }, [appliedText, doneTasks, contentWidth, contentGap]);

  // 지출 더미 데이터
  const expenditure = [{ item: "---", price: "0" }];

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start p-4">
      {/* 🌟 [실제 영수증 캔버스 영역] */}
      <div className="flex-1 overflow-auto bg-gray-100 p-10 rounded-3xl border border-gray-200">
        <div
          id="receipt-export"
          className="shrink-0 relative shadow-2xl mx-auto"
          style={{
            width: `${bgSize.w}px`,
            height: `${bgSize.h}px`,
            backgroundColor: "#666666",
            backgroundSize: "100% 100%",
          }}
        >
          {/* 🔥 영수증 종이 크기가 상태(paperSize)에 따라 변합니다. */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 shrink-0 overflow-hidden "
            style={{
              width: `${paperSize.w}px`,
              height: `${paperSize.h}px`,
              backgroundImage: "url('/images/receipt_paper.png')",
              backgroundSize: "100% 100%",
              boxShadow: "0 50px 50px -12px rgba(0, 0, 0, 0.8)",
            }}
          >
            {/* 🌟 1. 첫 장에만 나오는 고유 항목들 */}
            {isFirstPage && (
              <>
                <div
                  className="absolute text-center w-full font-gown"
                  // 🌟 변수 연결 완료! (30px -> titlePos.t)
                  style={{ top: `${titlePos.t}px`, left: "0" }}
                >
                  <h2 className="text-2xl font-black tracking-tighter">
                    Time Receipt & 영탁
                  </h2>
                </div>

                <img
                  src="/images/whale_logo.png"
                  alt="로고"
                  className="absolute object-contain left-1/2 -translate-x-1/2"
                  // 🌟 변수 연결 완료! (크기, 위치 모두 연결)
                  style={{
                    width: `${logoSize.w}px`,
                    height: `${logoSize.h}px`,
                    top: `${logoPos.t}px`,
                  }}
                />

                {/* 🌟 유저 삽입 사진/영상 레이어 (수정됨) */}
                {appliedMedia && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 overflow-hidden shadow-sm border border-gray-200"
                    style={{
                      width: `${photoSize.w}px`,
                      height: `${photoSize.h}px`,
                      top: `${photoPos.t}px`,
                    }}
                  >
                    {appliedMedia.type === "video" ? (
                      /* 🎬 동영상일 때: 자동 재생, 무음, 무한 반복 세팅 */
                      <video
                        src={appliedMedia.url}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      /* 🖼️ 사진일 때: 기존 img 태그 */
                      <img
                        src={appliedMedia.url}
                        alt="유저 미디어"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
              </>
            )}

            {/* 🌟 2. 중앙 콘텐츠 (데이터) */}
            <div
              className="absolute left-1/2 -translate-x-1/2 text-center break-words flex flex-col font-ibm"
              style={{
                top: isFirstPage ? `${contentPos.t}px` : `40px`,
                width: `${contentWidth}%`,
                gap: `${contentGap}px`,
              }}
            >
              {/* (첫 장 리뷰 및 워킹타임, IN PROGRESS, DONE 리스트 코드는 기존과 동일해서 생략 안 하고 둠!) */}
              {isFirstPage && (
                <>
                  <div className="text-center">
                    <p className="text-[14px] font-black border-b border-black mb-1">
                      REVIEW
                    </p>
                    <p className="text-[12px] whitespace-pre-wrap">
                      {appliedText}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-black border-b border-black mb-1">
                      WORKING TIME
                    </p>
                    <p className="text-[13px] ">{workingTime}</p>
                  </div>
                </>
              )}

              {inProgressTasks.length > 0 && (
                <div className="text-left">
                  <p className="text-[14px] font-black border-b border-black text-center mb-2">
                    IN PROGRESS
                  </p>
                  {inProgressTasks.map((task, i) => (
                    <div
                      key={i}
                      className="text-[10px] border-b border-gray-100 pb-1 mb-2"
                    >
                      <div className="flex justify-between font-bold items-start">
                        <span className="w-[65%] break-words">{task.name}</span>
                        <span className="text-[9px] opacity-50 text-right leading-tight">
                          {task.start}
                        </span>
                      </div>
                      <div className="text-right text-[10px] text-blue-600 font-bold mt-0.5">
                        {task.duration}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {doneTasks.length > 0 && (
                <div className="text-left">
                  <p className="text-[14px] font-black border-b border-black text-center mb-2">
                    DONE
                  </p>
                  {doneTasks.map((task, i) => (
                    <div
                      key={i}
                      className="text-[10px] border-b border-gray-100 pb-1 mb-2"
                    >
                      <div className="flex justify-between font-bold items-start">
                        <span className="w-[65%] break-words">{task.name}</span>
                        <span className="text-[9px] opacity-50 text-black text-right leading-tight">
                          {task.start}
                        </span>
                      </div>
                      <div className="text-right text-[10px] text-blue-600 font-bold mt-0.5">
                        {task.duration}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 🌟 3. 마지막 장에만 나오는 TOTAL과 바코드 */}
              {isLastPage && (
                <>
                  <div className="pt-2 border-t-2 border-black flex justify-between items-center">
                    <span className="text-[15px] font-black italic">TOTAL</span>
                    <span className="text-[13px] font-black text-blue-600">
                      {totalDuration}
                    </span>
                  </div>

                  <div className="flex flex-col items-center mt-4">
                    <img
                      src="/images/barcode_2.png"
                      alt="바코드"
                      // 🌟 기존에 있던 w-full h-10 (고정 크기)를 지우고 변수로 연결!
                      // 바코드 위치(barcodePos.t)는 위쪽 여백(marginTop)으로 적용해서 슬라이더 작동하게 만듦!
                      className="object-contain mix-blend-multiply opacity-80"
                      style={{
                        width: `${barcodeSize.w}px`,
                        height: `${barcodeSize.h}px`,
                        marginTop: `${barcodePos.t}px`,
                      }}
                    />
                    <p className="text-[8px] opacity-40">
                      #THANKYOU_FOR_TODAY#
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
