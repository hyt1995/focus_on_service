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
    <div className="w-full xl:w-[380px] h-[80vh] overflow-y-auto p-5 bg-white rounded-[24px] shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-[#F2F4F6] shrink-0 space-y-4 sticky top-10 custom-scrollbar">
      {/* 🌟 상단 고정 헤더 */}
      <div className="sticky top-0 bg-white z-10 pb-2 mb-2">
        <h3 className="font-bold text-[20px] text-[#191F28] tracking-tight">
          레이아웃 설정
        </h3>
      </div>

      {/* 1. 영수증 종이 크기 조절 */}
      {/* 1. 영수증 종이 크기 조절 */}
      <section className="bg-[#F9FAFB] p-4 rounded-[16px] space-y-3 border border-[#F2F4F6]">
        <p className="font-bold text-[#191F28] text-[14px]">영수증 종이 설정</p>
        <div className="flex items-center gap-3 text-[13px] text-[#6B7684] font-medium">
          <span className="w-10">가로</span>
          <input
            type="range"
            min="300"
            max="800"
            value={paperSize.w}
            onChange={e =>
              setPaperSize({ ...paperSize, w: Number(e.target.value) })
            }
            className="flex-1 accent-[#3182F6] cursor-pointer"
          />
          <span className="w-8 text-right font-bold text-[#3182F6]">
            {paperSize.w}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[13px] text-[#6B7684] font-medium">
          <span className="w-10">세로</span>
          <input
            type="range"
            min="500"
            max="1500"
            value={paperSize.h}
            onChange={e =>
              setPaperSize({ ...paperSize, h: Number(e.target.value) })
            }
            className="flex-1 accent-[#3182F6] cursor-pointer"
          />
          <span className="w-8 text-right font-bold text-[#3182F6]">
            {paperSize.h}
          </span>
        </div>
      </section>

      {/* 2. 제목 위치 조절 */}
      <section className="bg-[#F9FAFB] p-4 rounded-[16px] space-y-3 border border-[#F2F4F6]">
        <p className="font-bold text-[#191F28] text-[14px]">메인 제목 위치</p>
        <div className="flex items-center gap-3 text-[13px] text-[#6B7684] font-medium">
          <span className="w-10">위치 Y</span>
          <input
            type="range"
            min="0"
            max="1000"
            value={titlePos.t}
            onChange={e =>
              setTitlePos({ ...titlePos, t: Number(e.target.value) })
            }
            className="flex-1 accent-[#3182F6] cursor-pointer"
          />
          <span className="w-8 text-right font-bold text-[#3182F6]">
            {titlePos.t}
          </span>
        </div>
      </section>

      {/* 3. 고래 로고 설정 */}
      <section className="bg-[#F9FAFB] p-4 rounded-[16px] space-y-3 border border-[#F2F4F6]">
        <p className="font-bold text-[#191F28] text-[14px]">고래 로고 설정</p>
        <div className="flex items-center gap-3 text-[13px] text-[#6B7684] font-medium">
          <span className="w-10">가로</span>
          <input
            type="range"
            min="50"
            max="500"
            value={logoSize.w}
            onChange={e =>
              setLogoSize({ ...logoSize, w: Number(e.target.value) })
            }
            className="flex-1 accent-[#3182F6] cursor-pointer"
          />
          <span className="w-8 text-right font-bold text-[#3182F6]">
            {logoSize.w}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[13px] text-[#6B7684] font-medium">
          <span className="w-10">세로</span>
          <input
            type="range"
            min="50"
            max="500"
            value={logoSize.h}
            onChange={e =>
              setLogoSize({ ...logoSize, h: Number(e.target.value) })
            }
            className="flex-1 accent-[#3182F6] cursor-pointer"
          />
          <span className="w-8 text-right font-bold text-[#3182F6]">
            {logoSize.h}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[13px] text-[#6B7684] font-medium">
          <span className="w-10">위치 Y</span>
          <input
            type="range"
            min="0"
            max="1000"
            value={logoPos.t}
            onChange={e =>
              setLogoPos({ ...logoPos, t: Number(e.target.value) })
            }
            className="flex-1 accent-[#3182F6] cursor-pointer"
          />
          <span className="w-8 text-right font-bold text-[#3182F6]">
            {logoPos.t}
          </span>
        </div>
      </section>

      {/* 4. 오늘의 사진 설정 */}
      {/* 4. 오늘의 사진 설정 */}
      <section className="bg-[#F9FAFB] p-4 rounded-[16px] space-y-3 border border-[#F2F4F6]">
        <p className="font-bold text-[#191F28] text-[14px]">오늘의 사진 설정</p>
        <div className="flex items-center gap-3 text-[13px] text-[#6B7684] font-medium">
          <span className="w-10">가로</span>
          <input
            type="range"
            min="100"
            max="500"
            value={photoSize.w}
            onChange={e =>
              setPhotoSize({ ...photoSize, w: Number(e.target.value) })
            }
            className="flex-1 accent-[#3182F6] cursor-pointer"
          />
          <span className="w-8 text-right font-bold text-[#3182F6]">
            {photoSize.w}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[13px] text-[#6B7684] font-medium">
          <span className="w-10">세로</span>
          <input
            type="range"
            min="100"
            max="500"
            value={photoSize.h}
            onChange={e =>
              setPhotoSize({ ...photoSize, h: Number(e.target.value) })
            }
            className="flex-1 accent-[#3182F6] cursor-pointer"
          />
          <span className="w-8 text-right font-bold text-[#3182F6]">
            {photoSize.h}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[13px] text-[#6B7684] font-medium">
          <span className="w-10">위치 Y</span>
          <input
            type="range"
            min="0"
            max="1000"
            value={photoPos.t}
            onChange={e =>
              setPhotoPos({ ...photoPos, t: Number(e.target.value) })
            }
            className="flex-1 accent-[#3182F6] cursor-pointer"
          />
          <span className="w-8 text-right font-bold text-[#3182F6]">
            {photoPos.t}
          </span>
        </div>
      </section>

      {/* 5. 바코드 설정 */}
      <section className="bg-[#F9FAFB] p-4 rounded-[16px] space-y-3 border border-[#F2F4F6]">
        <p className="font-bold text-[#191F28] text-[14px]">바코드 설정</p>
        <div className="flex items-center gap-3 text-[13px] text-[#6B7684] font-medium">
          <span className="w-10">가로</span>
          <input
            type="range"
            min="100"
            max="1200"
            value={barcodeSize.w}
            onChange={e =>
              setBarcodeSize({ ...barcodeSize, w: Number(e.target.value) })
            }
            className="flex-1 accent-[#3182F6] cursor-pointer"
          />
          <span className="w-8 text-right font-bold text-[#3182F6]">
            {barcodeSize.w}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[13px] text-[#6B7684] font-medium">
          <span className="w-10">위치 Y</span>
          <input
            type="range"
            min="0"
            max="1100"
            value={barcodePos.t}
            onChange={e =>
              setBarcodePos({ ...barcodePos, t: Number(e.target.value) })
            }
            className="flex-1 accent-[#3182F6] cursor-pointer"
          />
          <span className="w-8 text-right font-bold text-[#3182F6]">
            {barcodePos.t}
          </span>
        </div>
      </section>

      {/* 6. 중앙 콘텐츠 설정 */}
      <section className="bg-[#F9FAFB] p-4 rounded-[16px] space-y-3 border border-[#F2F4F6]">
        <p className="font-bold text-[#191F28] text-[14px]">중앙 콘텐츠 설정</p>
        <div className="flex items-center gap-3 text-[13px] text-[#6B7684] font-medium">
          <span className="w-16">시작 Y</span>
          <input
            type="range"
            min="300"
            max="1200"
            value={contentPos.t}
            onChange={e => setContentPos({ t: Number(e.target.value) })}
            className="flex-1 accent-[#3182F6] cursor-pointer"
          />
          <span className="w-10 text-right font-bold text-[#3182F6]">
            {contentPos.t}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[13px] text-[#6B7684] font-medium">
          <span className="w-16">여유(%)</span>
          <input
            type="range"
            min="10"
            max="100"
            value={contentWidth}
            onChange={e => setContentWidth(Number(e.target.value))}
            className="flex-1 accent-[#3182F6] cursor-pointer"
          />
          <span className="w-10 text-right font-bold text-[#3182F6]">
            {contentWidth}%
          </span>
        </div>
        <div className="flex items-center gap-3 text-[13px] text-[#6B7684] font-medium">
          <span className="w-16">묶음 간격</span>
          <input
            type="range"
            min="0"
            max="100"
            value={contentGap}
            onChange={e => setContentGap(Number(e.target.value))}
            className="flex-1 accent-[#3182F6] cursor-pointer"
          />
          <span className="w-10 text-right font-bold text-[#3182F6]">
            {contentGap}px
          </span>
        </div>
      </section>
    </div>
  );
}
