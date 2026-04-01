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
      className={`relative bg-white p-6 rounded-[24px] shadow-sm border transition-all duration-300 cursor-grab active:cursor-grabbing hover:shadow-md
        ${
          String(activeTaskId) === String(task.id)
            ? "border-[#007AFF] shadow-[0_0_20px_rgba(0,122,255,0.15)] ring-1 ring-[#007AFF]/20"
            : "border-gray-100"
        }
        ${isFaded ? "opacity-40" : "opacity-100"}
      `}
    >
      {/* 🌟 수정 & 삭제 버튼 (간격 조절: gap-2) 🌟 */}
      <div className="absolute -top-3 -right-3 flex items-center gap-2 z-10">
        {/* 💡 크기 조절: w-24(너비), h-8(높이) / 여백 조절: mr-1 (오른쪽 마진) */}
        <div className="relative w-24 h-8 mr-1 bg-white border border-gray-200 shadow-md rounded-full transition-all hover:border-[#007AFF]">
          <select
            value={task.status || "todo"}
            onChange={handleStatusChange}
            disabled={isUpdatingStatus}
            className="w-full h-full pl-3 pr-6 text-[11px] font-bold text-gray-600 bg-transparent appearance-none outline-none cursor-pointer disabled:opacity-50 rounded-full"
          >
            <option value="todo">진행 전</option>
            <option value="in-progress">진행 중</option>
            <option value="done">완료</option>
          </select>
          {/* 화살표 아이콘 커스텀 */}
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
            <ChevronDown size={14} />
          </div>
        </div>
        <button
          onClick={() => setIsEditingCard(true)}
          className="p-2 bg-white border border-gray-200 shadow-md rounded-full text-gray-400 hover:text-[#007AFF] hover:bg-blue-50 transition-colors"
          title="수정"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 bg-white border border-gray-200 shadow-md rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="삭제"
        >
          <X size={18} />
        </button>
      </div>

      {/* <div className="mb-4 pr-5"> */}
      {/* 모바일 버전 제목 오른쪽 패딩 삭제 */}
      <div className="mb-4">
        {isEditingCard ? (
          <div
            className="space-y-2 mb-4"
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
          >
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="w-full border border-[#007AFF] rounded-lg px-3 py-2 text-sm font-bold outline-none"
              placeholder="제목"
              autoFocus
            />
            <textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none resize-none h-16"
              placeholder="상세 내용"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingCard(false)}
                className="flex-1 text-xs bg-gray-100 text-gray-600 py-1.5 rounded-md font-bold"
              >
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 text-xs bg-[#007AFF] text-white py-1.5 rounded-md font-bold"
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold leading-tight break-words text-gray-800">
              {task.title}
            </h3>
            {/* 🔥 1줄 상세내역 + 꺾쇠 */}
            {task.description && (
              <div className="mt-1">
                <p
                  className={`text-sm text-gray-500 ${
                    isExpanded ? "" : "line-clamp-1 truncate"
                  }`}
                >
                  {task.description}
                </p>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-[10px] font-bold text-[#007AFF] mt-1 bg-blue-50 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors"
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

      <div className="w-full bg-gray-100 h-3 rounded-full mb-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#007AFF] to-[#5856D6] h-full transition-all duration-1000 ease-linear"
          style={{ width: `${getRealtimeProgress(task, currentTime)}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-xs font-medium text-gray-500 mb-6 px-1 tracking-wide">
        <span className="text-left w-1/3">{startTimeStr}</span>
        <span className="text-center w-1/3 font-bold text-gray-700">
          {elapsedStr}
        </span>
        <span className="text-right w-1/3 text-[#007AFF]">{remainingStr}</span>
      </div>

      <div className="flex justify-between items-center mt-2">
        {isEditingDeadline ? (
          <input
            type="datetime-local"
            autoFocus
            className="text-xs font-bold px-3 py-2 bg-white border-2 border-[#007AFF] rounded-md text-gray-800 outline-none shadow-sm"
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
            className={`text-sm font-bold px-3 py-2.5 cursor-pointer rounded-lg transition-colors border ${
              task.deadline === "D-Day"
                ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100 animate-pulse"
                : "bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-200"
            }`}
          >
            {task.deadline === "D-Day" ? "⏰ 시간 설정" : task.deadline}
          </span>
        )}

        <button
          onClick={() => onToggleFocus(task)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${
            String(activeTaskId) === String(task.id)
              ? "bg-gray-800 text-white"
              : "bg-white border border-gray-200 text-[#007AFF] hover:bg-gray-50"
          }`}
        >
          {String(activeTaskId) === String(task.id) ? (
            <>
              <Square className="w-4 h-4 fill-current" /> PAUSE
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> START
            </>
          )}
        </button>
      </div>
    </div>
  );
}
