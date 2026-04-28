// src/components/TaskCard.tsx
import React, { useState } from "react";
import { X, Play, Square, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { Task } from "@/types";
import { formatHighEndTime } from "@/utils/timeFormat";

interface Props {
  task: Task;
  index: number;
  activeTaskId: number | string | null;
  currentTime: number;
  getRealtimeProgress: (task: Task, now: number) => number;
  onToggleFocus: (task: Task) => void;
  onDelete: (id: number | string) => void;
  onUpdateDeadline: (id: number | string, newDeadline: string) => void;
  onUpdateCard: (
    id: number | string,
    newTitle: string,
    newDesc: string
  ) => void; // 🔥 카드 수정 함수
  onUpdateStatus: (id: number | string, newStatus: string) => void;
  dragItemRef: React.MutableRefObject<number | null>;
  dragOverItemRef: React.MutableRefObject<number | null>;
  onSort: () => void;
  isFaded: boolean;
}

export default function TaskCard({
  task,
  index,
  activeTaskId,
  currentTime,
  getRealtimeProgress,
  onToggleFocus,
  onDelete,
  onUpdateDeadline,
  onUpdateCard,
  onUpdateStatus,
  dragItemRef,
  dragOverItemRef,
  onSort,
  isFaded,
}: Props) {
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // 🔥 상세내역 펼치기 상태

  // 🔥 카드 내용 수정 모드 상태
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || "");

  // 🎯 3. 따닥 방지 상태와 핸들러 추가 (기존 state들 밑에 붙여넣기)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (isUpdatingStatus) return; // 처리 중이면 튕겨냄
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(task.id, e.target.value);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  let startTimeStr = "-";
  let elapsedStr = "-";
  let remainingStr = "-";
  const startMs = task.startedAt || task.lastStartedAt;

  if (startMs) {
    startTimeStr = new Date(startMs).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (task.isActive) {
      const elapsedMs = Math.max(0, currentTime - startMs);
      elapsedStr = formatHighEndTime(elapsedMs); // 🔥 모듈화된 함수 사용

      if (task.deadline && task.deadline !== "D-Day") {
        const remainingMs = Math.max(
          0,
          new Date(task.deadline).getTime() - currentTime
        );
        remainingStr = formatHighEndTime(remainingMs); // 🔥 모듈화된 함수 사용
      }
    }
  }

  const handleSaveEdit = () => {
    onUpdateCard(task.id, editTitle, editDesc);
    setIsEditingCard(false);
  };

  return (
    <div
      draggable
      onDragStart={() => (dragItemRef.current = index)}
      onDragEnter={() => (dragOverItemRef.current = index)}
      onDragEnd={onSort}
      onDragOver={e => e.preventDefault()}
      // 🔥 패딩 축소 (p-5 -> p-4)
      className={`relative bg-white p-4 rounded-[16px] transition-all duration-200 cursor-grab active:cursor-grabbing ${
        String(activeTaskId) === String(task.id)
          ? "border-[1.5px] border-[#3182F6] bg-[#F9FAFB] shadow-sm"
          : "border border-[#F2F4F6] hover:border-[#E5E8EB]"
      } ${isFaded ? "opacity-40" : "opacity-100"}`}
    >
      {/* 🌟 헤더 여백 축소 (mb-3 -> mb-2) 🌟 */}
      <div className="flex justify-between items-center mb-2">
        {/* 🔥 셀렉트 박스 높이 축소 (h-[32px] -> h-[28px]) */}
        <div className="relative w-[84px] h-[28px] bg-[#F2F4F6] rounded-[6px] transition-colors hover:bg-[#E5E8EB]">
          <select
            value={task.status || "todo"}
            onChange={handleStatusChange}
            disabled={isUpdatingStatus}
            className="w-full h-full pl-2 pr-5 text-[12px] font-semibold text-[#4E5968] bg-transparent appearance-none outline-none cursor-pointer disabled:opacity-50"
          >
            <option value="todo">진행 전</option>
            <option value="in-progress">진행 중</option>
            <option value="done">완료</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-[#8B95A1]">
            <ChevronDown size={12} />
          </div>
        </div>

        <div className="flex items-center gap-0.5 -mr-1.5">
          {/* 🔥 아이콘 크기 및 패딩 축소 */}
          <button
            onClick={() => setIsEditingCard(true)}
            className="p-1.5 text-[#8B95A1] hover:text-[#3182F6] transition-colors rounded-lg"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-[#8B95A1] hover:text-[#F04452] transition-colors rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* <div className="mb-4 pr-5"> */}
      {/* 모바일 버전 제목 오른쪽 패딩 삭제 */}
      {/* 🔥 하단 여백 축소 (mb-4 -> mb-2.5) */}
      <div className="mb-2.5">
        {isEditingCard ? (
          /* ... 수정 모드 폼은 그대로 유지 ... */
          <div
            className="space-y-2 mb-2"
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
          >
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="w-full border border-[#3182F6] rounded-[8px] px-3 py-1.5 text-[14px] font-bold outline-none"
              placeholder="제목"
              autoFocus
            />
            <textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              className="w-full border border-[#F2F4F6] rounded-[8px] px-3 py-1.5 text-[12px] outline-none resize-none h-12"
              placeholder="상세 내용"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingCard(false)}
                className="flex-1 text-[12px] bg-[#F2F4F6] text-[#4E5968] py-1.5 rounded-[6px] font-bold"
              >
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 text-[12px] bg-[#3182F6] text-white py-1.5 rounded-[6px] font-bold"
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 🔥 폰트 크기 최적화 (text-lg -> text-[16px]) 및 색상 토스화 */}
            <h3 className="text-[16px] font-bold leading-tight break-words text-[#191F28]">
              {task.title}
            </h3>
            {task.description && (
              <div className="mt-0.5">
                <p
                  className={`text-[13px] text-[#6B7684] ${
                    isExpanded ? "" : "line-clamp-1 truncate"
                  }`}
                >
                  {task.description}
                </p>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-[10px] font-bold text-[#3182F6] mt-1 bg-[#E8F3FF] px-2 py-0.5 rounded-full hover:bg-[#D3E4FF] transition-colors"
                >
                  {isExpanded ? "접기" : "자세히 보기"}{" "}
                  {isExpanded ? (
                    <ChevronUp size={12} />
                  ) : (
                    <ChevronDown size={12} />
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 🌟 TDS 스타일: 솔리드 프로그레스 바 🌟 */}
      {/* 🌟 바 두께(h-1.5) 및 여백(mb-1.5) 대폭 압축 🌟 */}
      <div className="w-full bg-[#F2F4F6] h-1.5 rounded-full mb-1.5 overflow-hidden">
        <div
          className="bg-[#3182F6] h-full transition-all duration-1000 ease-linear"
          style={{ width: `${getRealtimeProgress(task, currentTime)}%` }}
        />
      </div>
      {/* 🔥 폰트(text-[11px]) 및 하단 여백(mb-3) 압축 */}
      <div className="flex justify-between items-center text-[11px] font-semibold mb-3 px-1">
        <span className="text-left w-1/3 text-[#8B95A1]">{startTimeStr}</span>
        <span className="text-center w-1/3 text-[#191F28]">{elapsedStr}</span>
        <span className="text-right w-1/3 text-[#3182F6]">{remainingStr}</span>
      </div>

      {/* 🔥 상단 여백 축소 (mt-1) */}
      <div className="flex justify-between items-center mt-1">
        {isEditingDeadline ? (
          <input
            type="datetime-local"
            autoFocus
            // 🔥 패딩(px-2.5 py-1.5) 및 폰트(text-[12px]) 축소
            className="text-[12px] font-semibold px-2.5 py-1.5 bg-[#F2F4F6] border border-transparent rounded-[6px] text-[#191F28] outline-none focus:ring-1 focus:ring-[#3182F6]"
            defaultValue={
              (task.deadline || "").includes(":")
                ? task.deadline.replace(" ", "T")
                : ""
            }
            onBlur={e => {
              onUpdateDeadline(task.id, e.target.value);
              setIsEditingDeadline(false);
            }}
            onKeyDown={e => {
              if (e.key === "Enter") {
                onUpdateDeadline(task.id, e.currentTarget.value);
                setIsEditingDeadline(false);
              }
              if (e.key === "Escape") setIsEditingDeadline(false);
            }}
          />
        ) : (
          <span
            onClick={() => setIsEditingDeadline(true)}
            // 🔥 패딩(px-2.5 py-1.5) 및 폰트(text-[12px]) 축소
            className={`text-[12px] font-semibold px-2.5 py-1.5 cursor-pointer rounded-[6px] transition-colors ${
              task.deadline === "D-Day"
                ? "bg-[#FEF0F0] text-[#F04452] hover:bg-[#FDE2E2]"
                : "bg-[#F2F4F6] text-[#4E5968] hover:bg-[#E5E8EB]"
            }`}
          >
            {task.deadline === "D-Day" ? "⏰ 시간 설정" : task.deadline}
          </span>
        )}

        <button
          onClick={() => onToggleFocus(task)}
          // 🔥 패딩(px-4 py-2), 둥글기(rounded-[8px]), 폰트(text-[13px]) 축소
          className={`flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[13px] font-bold transition-all ${
            String(activeTaskId) === String(task.id)
              ? "bg-[#3182F6] text-white shadow-[0_2px_8px_rgba(49,130,246,0.3)]"
              : "bg-[#E8F3FF] text-[#3182F6] hover:bg-[#D3E4FF]"
          }`}
        >
          {String(activeTaskId) === String(task.id) ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" /> PAUSE
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" /> START
            </>
          )}
        </button>
      </div>
    </div>
  );
}
