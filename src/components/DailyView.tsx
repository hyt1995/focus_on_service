// src/components/DailyView.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Plus, Check, Trash2, X, Clock } from "lucide-react";
import { BottomSheet, Button } from "@toss/tds-mobile";

interface RoutineTemplate {
  id: string | number;
  title: string;
  desc: string;
  deadline?: string; // 🔥 마감시간 추가
  isEnabled: boolean;
}

export default function DailyView({ userName }: { userName: string }) {
  const [routines, setRoutines] = useState<RoutineTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const maxSlots = 5;

  // 🔥 모달창 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRoutines();
  }, []);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchRoutines = async () => {
    try {
      const apiUrl = baseUrl
        ? `${baseUrl}/api/daily/template`
        : "/api/daily/template";
      const res = await fetch(apiUrl, {
        headers: { "x-user-name": encodeURIComponent(userName) },
      });
      if (res.ok) {
        const data = await res.json();
        setRoutines(data);
      }
    } catch (err) {
      console.error("루틴 불러오기 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRoutine = async (id: string | number, currentStatus: boolean) => {
    setRoutines(
      routines.map(r => (r.id === id ? { ...r, isEnabled: !currentStatus } : r))
    );
    try {
      const apiUrl = baseUrl
        ? `${baseUrl}/api/daily/template`
        : "/api/daily/template";
      await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-name": encodeURIComponent(userName),
        },
        body: JSON.stringify({
          id,
          updatedFields: { isEnabled: !currentStatus },
        }),
      });
    } catch (err) {
      console.error("상태 업데이트 실패:", err);
    }
  };

  const deleteRoutine = async (id: string | number) => {
    if (!confirm("이 데일리 루틴을 삭제하시겠습니까?")) return;
    setRoutines(routines.filter(r => r.id !== id));
    try {
      // 🔥 수정: baseUrl 적용
      const apiUrl = baseUrl
        ? `${baseUrl}/api/daily/template?id=${id}`
        : `/api/daily/template?id=${id}`;

      await fetch(apiUrl, {
        method: "DELETE",
        headers: { "x-user-name": encodeURIComponent(userName) },
      });
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  // 🔥 모달창 닫기 초기화 함수
  const closeModal = () => {
    setIsModalOpen(false);
    setNewTitle("");
    setNewDesc("");
    setNewDeadline("");
  };

  // 🔥 진짜 추가 로직 (모달에서 저장 버튼 누를 때)
  const submitNewRoutine = async () => {
    if (!newTitle.trim()) {
      alert("제목은 필수 입력입니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = baseUrl
        ? `${baseUrl}/api/daily/template`
        : "/api/daily/template";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-name": encodeURIComponent(userName),
        },
        body: JSON.stringify({
          title: newTitle,
          desc: newDesc,
          deadline: newDeadline,
        }),
      });

      if (res.ok) {
        const newRoutine = await res.json();
        setRoutines([...routines, newRoutine]);
        closeModal();
      } else if (res.status === 403) {
        alert(
          "무료 제공 슬롯(5개)을 모두 사용했습니다. 프리미엄 결제가 필요합니다."
        );
        closeModal();
      } else {
        alert("서버 통신 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("추가 실패:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-gray-400 text-sm font-bold animate-pulse">
        데이터를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pt-4 pb-32">
      <div className="flex flex-col items-center justify-center space-y-3 mb-10">
        <h2 className="text-xs font-bold text-gray-400 tracking-widest uppercase">
          Daily Routine
        </h2>
        <div className="flex items-center gap-4 w-full max-w-xs">
          <div className="h-[1px] flex-1 bg-gray-200"></div>
          <div className="text-sm font-bold text-gray-500">
            <span className="text-[#007AFF]">{routines.length}</span> /{" "}
            {maxSlots}
          </div>
          <div className="h-[1px] flex-1 bg-gray-200"></div>
        </div>
      </div>

      <div className="bg-white rounded-[16px] px-2 mb-6">
        <div className="flex flex-col px-2">
          {routines.map((routine, index) => (
            <div
              key={routine.id}
              className={`group relative flex items-center gap-4 py-4 ${
                index !== routines.length - 1 ? "border-b border-[#F2F4F6]" : ""
              }`}
            >
              <button
                onClick={() => toggleRoutine(routine.id, routine.isEnabled)}
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  routine.isEnabled ? "bg-[#3182F6]" : "bg-[#F2F4F6]"
                }`}
              >
                {routine.isEnabled && (
                  <Check size={14} className="text-white stroke-[3]" />
                )}
              </button>
              <div className="flex-1">
                <h3
                  className={`text-[16px] font-medium transition-colors ${
                    routine.isEnabled ? "text-[#191F28]" : "text-[#8B95A1]"
                  }`}
                >
                  {routine.title}
                </h3>
                {(routine.deadline || routine.desc) && (
                  <div className="flex items-center gap-2 mt-1">
                    {routine.deadline && (
                      <span className="text-[13px] font-semibold text-[#3182F6]">
                        {routine.deadline} 마감
                      </span>
                    )}
                    <p className="text-[13px] text-[#8B95A1] font-medium line-clamp-1">
                      {routine.desc}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteRoutine(routine.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-[#8B95A1] hover:text-[#F04452] transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        {routines.length === 0 && (
          <div className="text-center py-10 text-[#8B95A1] text-[15px] font-medium">
            설정된 데일리 루틴이 없습니다.
          </div>
        )}
      </div>

      {routines.length < maxSlots ? (
        <button
          onClick={() => setIsModalOpen(true)} // 🔥 알림창 대신 모달 열기
          className="w-full py-4 mt-2 rounded-[16px] bg-[#F2F4F6] text-[#6B7684] hover:bg-[#E8F3FF] hover:text-[#3182F6] transition-colors flex items-center justify-center gap-2 text-[15px] font-bold"
        >
          <Plus size={18} /> 새 루틴 추가
        </button>
      ) : (
        <div className="text-center mt-8 text-xs font-bold text-[#007AFF] cursor-pointer hover:underline">
          [ 프리미엄 멤버십으로 슬롯 무제한 확장 ]
        </div>
      )}

      {/* 🔥 새 루틴 추가 모달 (Modal) */}
      {/* 🌟 토스 바이브: 새 루틴 추가 BottomSheet 🌟 */}
      <BottomSheet open={isModalOpen} onClose={closeModal}>
        <div className="flex flex-col p-5 pb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#191F28] text-[20px] tracking-tight">
              새 데일리 루틴
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#6B7684] pl-1">
                제목 <span className="text-[#F04452]">*</span>
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="예: 매일 아침 운동"
                className="w-full px-4 py-4 bg-[#F2F4F6] border border-transparent rounded-[12px] text-[16px] text-[#191F28] placeholder-[#8B95A1] outline-none focus:ring-1 focus:ring-[#3182F6] transition-all"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#6B7684] pl-1">
                상세 내용 (선택)
              </label>
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="루틴에 대한 간단한 메모..."
                className="w-full px-4 py-4 bg-[#F2F4F6] border border-transparent rounded-[12px] text-[15px] text-[#191F28] placeholder-[#8B95A1] outline-none focus:ring-1 focus:ring-[#3182F6] transition-all resize-none h-20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#6B7684] pl-1">
                마감 시간 (선택)
              </label>
              <input
                type="time"
                value={newDeadline}
                onChange={e => setNewDeadline(e.target.value)}
                className="w-full px-4 py-4 bg-[#F2F4F6] border border-transparent rounded-[12px] text-[16px] text-[#191F28] outline-none focus:ring-1 focus:ring-[#3182F6] transition-all"
              />
            </div>
          </div>

          {/* 토스 TDS 액션 버튼 */}
          <div className="flex gap-3 mt-8">
            <Button
              color="dark"
              variant="weak"
              style={{ flex: 1 }}
              onClick={closeModal}
            >
              취소
            </Button>
            <Button
              style={{ flex: 1 }}
              onClick={submitNewRoutine}
              loading={isSubmitting}
              disabled={isSubmitting || !newTitle.trim()}
            >
              저장하기
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
