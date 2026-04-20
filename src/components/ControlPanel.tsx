"use client";

import React from "react";

// 부모한테서 받아올 슬라이더 상태와 변경 함수들 타입 정의
interface ControlPanelProps {
  paperSize: { w: number; h: number };
  setPaperSize: React.Dispatch<React.SetStateAction<{ w: number; h: number }>>;
  titlePos: { t: number; l?: number };
  setTitlePos: React.Dispatch<React.SetStateAction<any>>;
  logoSize: { w: number; h: number };
  setLogoSize: React.Dispatch<React.SetStateAction<{ w: number; h: number }>>;
  logoPos: { t: number; l?: number };
  setLogoPos: React.Dispatch<React.SetStateAction<any>>;
  photoSize: { w: number; h: number };
  setPhotoSize: React.Dispatch<React.SetStateAction<{ w: number; h: number }>>;
  photoPos: { t: number; l?: number };
  setPhotoPos: React.Dispatch<React.SetStateAction<any>>;
  barcodeSize: { w: number; h: number };
  setBarcodeSize: React.Dispatch<
    React.SetStateAction<{ w: number; h: number }>
  >;
  barcodePos: { t: number; l?: number };
  setBarcodePos: React.Dispatch<React.SetStateAction<any>>;
  contentPos: { t: number };
  setContentPos: React.Dispatch<React.SetStateAction<{ t: number }>>;
  contentWidth: number;
  setContentWidth: React.Dispatch<React.SetStateAction<number>>;
  contentGap: number;
  setContentGap: React.Dispatch<React.SetStateAction<number>>;
  contentHeight: number; // 이건 보여주기만 하니까 변경 함수(set)는 필요 없음!
}

export default function ControlPanel(props: ControlPanelProps) {
  // 보따리 풀기
  const {
    paperSize,
    setPaperSize,
    titlePos,
    setTitlePos,
    logoSize,
    setLogoSize,
    logoPos,
    setLogoPos,
    photoSize,
    setPhotoSize,
    photoPos,
    setPhotoPos,
    barcodeSize,
    setBarcodeSize,
    barcodePos,
    setBarcodePos,
    contentPos,
    setContentPos,
    contentWidth,
    setContentWidth,
    contentGap,
    setContentGap,
    contentHeight,
  } = props;

  return (
    <div className="w-full xl:w-[380px] h-[80vh] overflow-y-auto p-6 bg-white rounded-3xl shadow-xl border border-gray-100 shrink-0 space-y-8 sticky top-10">
      <h3 className="font-extrabold text-xl text-gray-800 border-b pb-4">
        🎨 레이아웃 커스텀
      </h3>

      {/* 1. 영수증 종이 크기 조절 */}
      <section className="space-y-2 text-xs">
        <p className="font-bold text-blue-600 underline text-sm">
          영수증 종이 설정
        </p>
        <div className="flex items-center gap-2">
          <span>가로:</span>
          <input
            type="range"
            min="300"
            max="800"
            value={paperSize.w}
            onChange={e =>
              setPaperSize({ ...paperSize, w: Number(e.target.value) })
            }
            className="flex-1"
          />
          <span className="w-8">{paperSize.w}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>세로:</span>
          <input
            type="range"
            min="500"
            max="1500"
            value={paperSize.h}
            onChange={e =>
              setPaperSize({ ...paperSize, h: Number(e.target.value) })
            }
            className="flex-1"
          />
          <span className="w-8">{paperSize.h}</span>
        </div>
      </section>

      {/* 2. 제목 위치 조절 */}
      <section className="space-y-2">
        <p className="font-bold text-blue-600 underline text-sm">
          메인 제목 위치
        </p>
        <div className="flex items-center gap-2 text-xs">
          <span>위에서:</span>
          <input
            type="range"
            min="0"
            max="1000"
            value={titlePos.t}
            onChange={e =>
              setTitlePos({ ...titlePos, t: Number(e.target.value) })
            }
            className="flex-1"
          />
          <span className="w-8">{titlePos.t}</span>
        </div>
      </section>

      {/* 3. 고래 로고 설정 */}
      <section className="space-y-2 text-xs">
        <p className="font-bold text-blue-600 underline text-sm">
          고래 로고 설정
        </p>
        <div className="flex items-center gap-2">
          <span>가로:</span>
          <input
            type="range"
            min="50"
            max="500"
            value={logoSize.w}
            onChange={e =>
              setLogoSize({ ...logoSize, w: Number(e.target.value) })
            }
            className="flex-1"
          />
          <span className="w-8">{logoSize.w}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>세로:</span>
          <input
            type="range"
            min="50"
            max="500"
            value={logoSize.h}
            onChange={e =>
              setLogoSize({ ...logoSize, h: Number(e.target.value) })
            }
            className="flex-1"
          />
          <span className="w-8">{logoSize.h}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>위치Y:</span>
          <input
            type="range"
            min="0"
            max="1000"
            value={logoPos.t}
            onChange={e =>
              setLogoPos({ ...logoPos, t: Number(e.target.value) })
            }
            className="flex-1"
          />
          <span className="w-8">{logoPos.t}</span>
        </div>
      </section>

      {/* 4. 오늘의 사진 설정 */}
      <section className="space-y-2 text-xs">
        <p className="font-bold text-blue-600 underline text-sm">
          오늘의 사진 설정
        </p>
        <div className="flex items-center gap-2">
          <span>가로:</span>
          <input
            type="range"
            min="100"
            max="500"
            value={photoSize.w}
            onChange={e =>
              setPhotoSize({ ...photoSize, w: Number(e.target.value) })
            }
            className="flex-1"
          />
          <span className="w-8">{photoSize.w}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>세로:</span>
          <input
            type="range"
            min="100"
            max="500"
            value={photoSize.h}
            onChange={e =>
              setPhotoSize({ ...photoSize, h: Number(e.target.value) })
            }
            className="flex-1"
          />
          <span className="w-8">{photoSize.h}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>위치Y:</span>
          <input
            type="range"
            min="0"
            max="1000"
            value={photoPos.t}
            onChange={e =>
              setPhotoPos({ ...photoPos, t: Number(e.target.value) })
            }
            className="flex-1"
          />
          <span className="w-8">{photoPos.t}</span>
        </div>
      </section>

      {/* 5. 바코드 설정 */}
      <section className="space-y-2 text-xs">
        <p className="font-bold text-blue-600 underline text-sm">바코드 설정</p>
        <div className="flex items-center gap-2">
          <span>가로:</span>
          <input
            type="range"
            min="100"
            max="1200"
            value={barcodeSize.w}
            onChange={e =>
              setBarcodeSize({ ...barcodeSize, w: Number(e.target.value) })
            }
            className="flex-1"
          />
          <span className="w-8">{barcodeSize.w}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>위치Y:</span>
          <input
            type="range"
            min="0"
            max="1100"
            value={barcodePos.t}
            onChange={e =>
              setBarcodePos({ ...barcodePos, t: Number(e.target.value) })
            }
            className="flex-1"
          />
          <span className="w-8">{barcodePos.t}</span>
        </div>
      </section>

      {/* 6. 중앙 콘텐츠 설정 */}
      <section className="space-y-2 text-xs">
        <p className="font-bold text-blue-600 underline text-sm">
          중앙 콘텐츠 설정
        </p>
        <div className="flex items-center gap-2">
          <span>시작 위치Y:</span>
          <input
            type="range"
            min="300"
            max="1200"
            value={contentPos.t}
            onChange={e => setContentPos({ t: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="w-8">{contentPos.t}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>가로 여유(%):</span>
          <input
            type="range"
            min="10"
            max="100"
            value={contentWidth}
            onChange={e => setContentWidth(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-8">{contentWidth}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span>묶음 간격:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={contentGap}
            onChange={e => setContentGap(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-8">{contentGap}px</span>
        </div>
        {/* <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800 font-bold">
          📏 현재 데이터 세로 길이:{" "}
          <span className="text-lg">{contentHeight}</span> px
        </div> */}
      </section>
    </div>
  );
}
