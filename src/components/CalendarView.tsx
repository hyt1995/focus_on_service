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
                  className="relative h-16 flex flex-col items-center justify-center rounded-xl text-lg font-medium text-gray-700 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all"
                >
                  <span>{day}</span>
                  {hasSchedule && (
                    <span className="absolute bottom-2 w-1.5 h-1.5 bg-green-500 rounded-full shadow-sm"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🌟 2. 증발했던 이번 달 전체 일정 리스트 복구 🌟 */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          이번 달 전체 일정
        </h3>
        {thisMonthSchedules.length > 0 ? (
          <div className="space-y-3">
            {thisMonthSchedules.map(schedule => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800">
                    {schedule.date}
                  </span>
                  <span className="text-sm text-gray-600">
                    {schedule.title}
                  </span>
                </div>
                <div className="text-sm font-bold text-[#007AFF]">
                  {schedule.startTime} ~ {schedule.endTime}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">
            이번 달 일정이 없습니다.
          </p>
        )}
      </div>

      {/* 🌟 3. 특정 날짜 클릭 시 나타나는 모달창 🌟 */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-md rounded-[24px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800 text-lg">
                {selectedDate}
              </h3>
              <div className="flex items-center gap-2">
                {!isAdding && (
                  <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-1 bg-[#007AFF] text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={16} /> 추가하기
                  </button>
                )}
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-1 hover:bg-gray-200 rounded-full"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              {isAdding ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <input
                    type="text"
                    placeholder="일정 제목"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3 text-sm font-bold outline-none focus:border-[#007AFF]"
                  />
                  <textarea
                    placeholder="상세 내역 (선택)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3 text-sm outline-none focus:border-[#007AFF] h-20 resize-none"
                  />
                  <div className="flex gap-3 mb-5">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400 font-bold ml-1">
                        시작 시간
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-[#007AFF] font-bold ml-1">
                        마감 시간 ★
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        className="w-full border border-[#007AFF] bg-blue-50 rounded-xl px-3 py-2 text-sm font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsAdding(false);
                        setEditingId(null);
                      }}
                      className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-[#007AFF] text-white font-bold py-3 rounded-xl shadow-md hover:bg-blue-600 transition-colors"
                    >
                      {editingId ? "수정하기" : "저장하기"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                  {selectedDateSchedules.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDateSchedules.map(s => (
                        <div
                          key={s.id}
                          className="border border-gray-200 rounded-xl p-4 shadow-sm relative group hover:border-blue-200 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <h4 className="font-bold text-gray-800 flex-1">
                              {s.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-[#007AFF] bg-blue-50 px-2 py-1 rounded-md mr-1">
                                {s.startTime} ~ {s.endTime}
                              </span>
                              <button
                                onClick={() => handleOpenForm(s)}
                                className="text-gray-300 hover:text-[#007AFF] transition-colors p-1"
                                title="수정"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm("삭제하시겠습니까?"))
                                    onDeleteSchedule(s.id);
                                }}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                title="삭제"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          {s.description && (
                            <div className="mt-2 text-sm text-gray-600">
                              <p
                                className={`${
                                  expandedId === s.id
                                    ? ""
                                    : "line-clamp-1 truncate"
                                }`}
                              >
                                {s.description}
                              </p>
                              <button
                                onClick={() =>
                                  setExpandedId(
                                    expandedId === s.id ? null : s.id
                                  )
                                }
                                className="w-full flex justify-center mt-2 text-gray-400 hover:text-[#007AFF]"
                              >
                                {expandedId === s.id ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500 font-bold mb-4">
                        오늘 일정이 없습니다.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
