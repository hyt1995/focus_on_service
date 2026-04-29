// src/components/AddTaskModal.tsx
import React, { useState } from "react";
// 🔥 [TDS 추가] 토스의 바텀시트, 텍스트 입력창, 버튼을 불러옵니다.
import { BottomSheet, TextField, TextArea, Button } from "@toss/tds-mobile";

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
    // 🔥 BottomSheet.Content 껍데기를 없애고 바로 div로 내용을 넣습니다!
    <BottomSheet open={isOpen} onClose={onClose}>
      <div className="p-6 pb-8 space-y-6">
        <h3 className="text-xl font-bold text-gray-800">새로운 몰입 과제</h3>

        <div className="space-y-5 mb-8">
          <TextField
            label="무엇에 집중할까요?"
            placeholder="예: 기획서 초안 작성"
            value={title}
            onChange={e => setTitle(e.target.value)}
            variant="line"
          />

          <TextArea
            label="상세 내역 (선택)"
            placeholder="간단한 메모나 목표를 적어주세요"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ minHeight: "80px" }}
            variant="line"
          />

          <TextField
            type="datetime-local"
            label="마감 시간 (필수)"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            variant="line"
          />
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            color="dark"
            variant="weak"
            display="block"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            닫기
          </Button>
          <Button
            color="primary"
            variant="fill"
            display="block"
            onClick={handleAdd}
            style={{ flex: 1 }}
          >
            추가하기
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
