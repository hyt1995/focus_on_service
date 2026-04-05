"use client";

import React, { useState, useEffect } from "react";
import { Plus, Check, Trash2, X, Clock } from "lucide-react";

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
      await fetch(`/api/daily/template?id=${id}`, {
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

      <div className="space-y-4">
        {routines.map(routine => (
          <div
            key={routine.id}
            className={`group relative flex items-center gap-4 p-5 rounded-[20px] bg-white border shadow-sm transition-all duration-300 hover:shadow-md ${
              routine.isEnabled ? "border-[#007AFF]/30" : "border-gray-200"
            }`}
          >
            <button
              onClick={() => toggleRoutine(routine.id, routine.isEnabled)}
              className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                routine.isEnabled
                  ? "bg-[#007AFF] border-[#007AFF]"
                  : "bg-gray-50 border-gray-300 hover:border-[#007AFF]/50"
              }`}
            >
              {routine.isEnabled && (
                <Check size={14} className="text-white stroke-[3]" />
              )}
            </button>

            <div className="flex-1">
              <h3
                className={`text-base font-bold transition-colors ${
                  routine.isEnabled ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {routine.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {routine.deadline && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-bold rounded-md">
                    <Clock size={10} /> {routine.deadline}
                  </span>
                )}
                <p className="text-xs text-gray-500 font-medium line-clamp-1">
                  {routine.desc}
                </p>
              </div>
            </div>

            <button
              onClick={() => deleteRoutine(routine.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {routines.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm font-bold">
            설정된 데일리 루틴이 없습니다.
          </div>
        )}
      </div>

      {routines.length < maxSlots ? (
        <button
          onClick={() => setIsModalOpen(true)} // 🔥 알림창 대신 모달 열기
          className="w-full py-4 mt-4 rounded-[20px] border-2 border-dashed border-gray-300 text-gray-500 hover:text-[#007AFF] hover:border-[#007AFF] hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-sm font-bold"
        >
          <Plus size={18} /> 새 루틴 추가
        </button>
      ) : (
        <div className="text-center mt-8 text-xs font-bold text-[#007AFF] cursor-pointer hover:underline">
          [ 프리미엄 멤버십으로 슬롯 무제한 확장 ]
        </div>
      )}

      {/* 🔥 새 루틴 추가 모달 (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                새 데일리 루틴
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="예: 매일 아침 운동"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#007AFF] focus:bg-white transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">
                  상세 내용 (선택)
                </label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="루틴에 대한 간단한 메모..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#007AFF] focus:bg-white transition-all resize-none h-20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">
                  마감 시간 (선택)
                </label>
                <input
                  type="time"
                  value={newDeadline}
                  onChange={e => setNewDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#007AFF] focus:bg-white transition-all text-gray-700"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={submitNewRoutine}
                disabled={isSubmitting}
                className="flex-1 py-3 text-sm font-bold text-white bg-[#007AFF] rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "저장 중..." : "저장하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
