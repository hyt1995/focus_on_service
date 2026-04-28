// src/components/AddTaskModal.tsx
import React, { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // 🔥 onAdd에 description 파라미터 추가
  onAdd: (title: string, description: string, deadline: string) => void;
}

export default function AddTaskModal({ isOpen, onClose, onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // 상세내역 상태
  const [deadline, setDeadline] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!title.trim()) return alert("어떤 일에 집중할지 입력해 주세요.");
    if (!deadline) return alert("마감 시간을 꼭 지정해 주세요.");
    onAdd(title, description, deadline);
    setTitle("");
    setDescription("");
    setDeadline("");
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold mb-6 text-gray-800">
          새로운 몰입 과제
        </h3>
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">
              무엇에 집중할까요?
            </label>
            <input
              type="text"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
              placeholder="예: 기획서 초안 작성"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          {/* 🔥 상세내역 텍스트 에어리어 추가 */}
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">
              상세 내역 (선택)
            </label>
            <textarea
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all resize-none h-20 text-sm"
              placeholder="간단한 메모나 목표를 적어주세요"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">
              마감 시간 (필수)
            </label>
            <input
              type="datetime-local"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#007AFF] text-gray-700"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-gray-400 font-bold hover:bg-gray-50 rounded-2xl transition-colors"
          >
            닫기
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 py-4 bg-[#007AFF] text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all"
          >
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
}
