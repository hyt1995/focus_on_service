// src/components/CalendarView.tsx

"use client"; // 🔥 [필수] 이거 없으면 배포 시 달력 터집니다!
import React, { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Pencil,
} from "lucide-react";
// 🔥 토스 TDS 컴포넌트 추가
import { BottomSheet, Button } from "@toss/tds-mobile";

interface Schedule {
  id: string;
  date: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

interface Props {
  schedules: Schedule[];
  onSaveSchedule: (schedule: Schedule) => void;
  onUpdateSchedule: (id: string, updated: Schedule) => void;
  onDeleteSchedule: (id: string) => void;
}

const CalendarView: React.FC<Props> = ({
  schedules,
  onSaveSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 폼 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // 달력 날짜 계산
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;

  // 데이터 에러 방어막
  const safeSchedules = Array.isArray(schedules) ? schedules : [];

  const thisMonthSchedules = safeSchedules
    .filter(
      s =>
        s && typeof s.date === "string" && s.date.startsWith(currentMonthPrefix)
    )
    .sort(
      (a, b) =>
        (a.date || "").localeCompare(b.date || "") ||
        (a.startTime || "").localeCompare(b.startTime || "")
    );

  const selectedDateSchedules = selectedDate
    ? safeSchedules
        .filter(s => s && s.date === selectedDate)
        .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
    : [];

  const handleDateClick = (day: number) => {
    setSelectedDate(
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}`
    );
    setIsAdding(false);
    setExpandedId(null);
  };

  const handleOpenForm = (scheduleToEdit?: Schedule) => {
    if (scheduleToEdit) {
      setEditingId(scheduleToEdit.id);
      setTitle(scheduleToEdit.title);
      setDescription(scheduleToEdit.description || "");
      setStartTime(
        scheduleToEdit.startTime === "-" ? "" : scheduleToEdit.startTime
      );
      setEndTime(scheduleToEdit.endTime);
    } else {
      setEditingId(null);
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
    }
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!title || !endTime) return alert("제목과 마감 시간은 필수입니다!");
    const scheduleData = {
      id: editingId || Date.now().toString(),
      date: selectedDate!,
      title,
      description,
      startTime: startTime || "-",
      endTime,
    };

    if (editingId) onUpdateSchedule(editingId, scheduleData);
    else onSaveSchedule(scheduleData);

    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      {/* 🌟 1. 증발했던 상단 달력 렌더링 영역 복구 🌟 */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        {/* 달력 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#F9F9FB]">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {year}년 {month + 1}월
          </h2>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ChevronRight size={24} className="text-gray-600" />
          </button>
        </div>

        {/* 달력 그리드 */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-4 text-center text-sm font-bold text-gray-400">
            {["일", "월", "화", "수", "목", "금", "토"].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {blanks.map(b => (
              <div key={`blank-${b}`} className="h-14"></div>
            ))}
            {days.map(day => {
              const formattedDate = `${year}-${String(month + 1).padStart(
                2,
                "0"
              )}-${String(day).padStart(2, "0")}`;
              const hasSchedule = safeSchedules.some(
                s => s && s.date === formattedDate
              );

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className="relative h-12 sm:h-14 flex flex-col items-center justify-center rounded-xl text-base sm:text-lg font-medium text-gray-700 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all"
                >
                  <span>{day}</span>
                  {hasSchedule && (
                    <span className="absolute bottom-1.5 sm:bottom-2 w-1.5 h-1.5 bg-green-500 rounded-full shadow-sm"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🌟 2. 토스 네이티브 스타일: 이번 달 전체 일정 리스트 🌟 */}
      <div className="bg-white rounded-[16px] p-2 mb-8">
        <h3 className="text-[#191F28] text-[20px] font-bold tracking-tight mb-2 px-4">
          이번 달 전체 일정
        </h3>
        {thisMonthSchedules.length > 0 ? (
          <div className="flex flex-col px-4">
            {thisMonthSchedules.map((schedule, index) => (
              <div
                key={schedule.id}
                className={`flex items-center justify-between py-4 ${
                  index !== thisMonthSchedules.length - 1
                    ? "border-b border-[#F2F4F6]"
                    : ""
                }`}
              >
                <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-3">
                  <span className="text-[12px] sm:text-[13px] font-semibold text-[#8B95A1]">
                    {schedule.date}
                  </span>
                  <span className="text-[15px] sm:text-[16px] font-medium text-[#191F28] truncate">
                    {schedule.title}
                  </span>
                </div>
                <div className="text-[13px] sm:text-[15px] font-bold text-[#3182F6] shrink-0">
                  {schedule.startTime} ~ {schedule.endTime}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[15px] text-[#8B95A1] text-center py-8 font-medium">
            이번 달 일정이 없습니다.
          </p>
        )}
      </div>

      {/* 🌟 3. 특정 날짜 클릭 시 나타나는 모달창 🌟 */}
      {/* 🌟 3. 토스 바이브: 특정 날짜 클릭 시 나타나는 BottomSheet 🌟 */}
      <BottomSheet
        open={!!selectedDate}
        onClose={() => {
          setSelectedDate(null);
          setIsAdding(false);
        }}
      >
        <div className="flex flex-col max-h-[85vh] p-5 pb-8">
          {/* 헤더 영역 */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#191F28] text-[20px] tracking-tight">
              {selectedDate}
            </h3>
            {!isAdding && (
              <button
                onClick={() => handleOpenForm()}
                className="flex items-center gap-1 bg-[#F2F4F6] text-[#3182F6] px-3 py-1.5 rounded-[8px] text-[14px] font-bold transition-colors"
              >
                <Plus size={16} /> 추가하기
              </button>
            )}
          </div>

          <div className="overflow-y-auto">
            {isAdding ? (
              <div className="animate-in fade-in duration-300 flex flex-col gap-4 w-full">
                <input
                  type="text"
                  placeholder="일정 제목"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  // 겹침 방지를 위해 mb-1 (margin-bottom)을 추가로 주어 확실하게 띄워줍니다.
                  className="w-full h-[52px] bg-[#F2F4F6] rounded-[12px] px-4 text-[16px] font-medium text-[#191F28] placeholder-[#8B95A1] outline-none focus:ring-1 focus:ring-[#3182F6] leading-normal mb-1"
                />
                <textarea
                  placeholder="상세 내역 (선택)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full h-[100px] bg-[#F2F4F6] rounded-[12px] px-4 py-3.5 text-[15px] text-[#191F28] placeholder-[#8B95A1] outline-none focus:ring-1 focus:ring-[#3182F6] resize-none leading-relaxed"
                />

                {/* 4. 시간 입력 컨테이너: min-w-0을 추가해 작은 기기에서 인풋창이 터지는 것을 방어 */}
                <div className="flex gap-2 sm:gap-3 pt-2">
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <label className="text-[12px] sm:text-[13px] text-[#6B7684] font-semibold pl-1">
                      시작 시간
                    </label>
                    {/* 5. 모바일 기본 UI 여백 때문에 잘리지 않도록 높이 h-[48px] 고정 및 text-center 처리 */}
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="w-full h-[48px] bg-[#F2F4F6] rounded-[12px] px-1 sm:px-3 text-[14px] sm:text-[16px] text-center outline-none"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <label className="text-[12px] sm:text-[13px] text-[#3182F6] font-bold pl-1">
                      마감 시간 ★
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="w-full h-[48px] bg-[#E8F3FF] text-[#3182F6] font-bold rounded-[12px] px-1 sm:px-3 text-[14px] sm:text-[16px] text-center outline-none"
                    />
                  </div>
                </div>

                {/* 6. 저장 버튼 영역의 상단 여백을 늘려(mt-8) 입력칸과 시각적으로 완전히 분리 */}
                <div className="flex gap-3 mt-8 pt-2">
                  <Button
                    color="dark"
                    variant="weak"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setIsAdding(false);
                      setEditingId(null);
                    }}
                  >
                    취소
                  </Button>
                  <Button style={{ flex: 1 }} onClick={handleSave}>
                    {editingId ? "수정하기" : "저장하기"}
                  </Button>
                </div>
              </div>
            ) : (
              /* --- 상세 리스트 영역 --- */
              <div className="animate-in fade-in duration-300">
                {selectedDateSchedules.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateSchedules.map(s => (
                      <div
                        key={s.id}
                        className="bg-[#F9FAFB] rounded-[16px] p-5 relative group"
                      >
                        <div className="flex justify-between items-start mb-2 gap-2 w-full">
                          <h4 className="font-bold text-[#191F28] text-[16px] sm:text-[17px] flex-1 min-w-0 truncate">
                            {s.title}
                          </h4>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenForm(s)}
                              className="text-[#8B95A1] hover:text-[#3182F6] p-1"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("삭제하시겠습니까?"))
                                  onDeleteSchedule(s.id);
                              }}
                              className="text-[#8B95A1] hover:text-[#F04452] p-1"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <span className="text-[14px] font-bold text-[#3182F6]">
                          {s.startTime} ~ {s.endTime}
                        </span>
                        {s.description && (
                          <div className="mt-3 text-[15px] text-[#6B7684]">
                            <p
                              className={`${
                                expandedId === s.id ? "" : "line-clamp-2"
                              }`}
                            >
                              {s.description}
                            </p>
                            <button
                              onClick={() =>
                                setExpandedId(expandedId === s.id ? null : s.id)
                              }
                              className="w-full flex justify-center mt-2 py-1.5 text-[#B0B8C1] hover:text-[#8B95A1]"
                            >
                              {expandedId === s.id ? (
                                <ChevronUp size={20} />
                              ) : (
                                <ChevronDown size={20} />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-[#8B95A1] font-medium text-[16px]">
                      오늘 일정이 없습니다.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

export default CalendarView;
