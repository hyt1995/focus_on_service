import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  userName: string;
  todaySchedules: any[]; // page.tsx에서 오늘 일정만 걸러서 받아옵니다.
}

const TodayTimeboxDashboard: React.FC<Props> = ({
  userName,
  todaySchedules,
}) => {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [isEditing, setIsEditing] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 꺾쇠 열림 상태

  const today = new Date();
  const dateString = `${today.getMonth() + 1}월 ${today.getDate()}일 ${
    ["일", "월", "화", "수", "목", "금", "토"][today.getDay()]
  }요일`;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!userName) return;
    fetch("/api/schedule", {
      headers: { "x-user-name": encodeURIComponent(userName) },
    })
      .then(res => res.json())
      .then(data => {
        if (data.startTime) setStartTime(data.startTime);
        if (data.endTime) setEndTime(data.endTime);
      })
      .catch(() => {});
  }, [userName]);

  const saveSchedule = async () => {
    setIsEditing(false);
    await fetch("https://project-a7app.vercel.app/api/schedule", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-name": encodeURIComponent(userName),
      },
      body: JSON.stringify({ startTime, endTime }),
    });
  };

  const getTimeStamp = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.getTime();
  };

  const startMs = getTimeStamp(startTime);
  const endMs = getTimeStamp(endTime);
  const totalMs = Math.max(1, endMs - startMs);
  const elapsedMs = Math.max(0, now - startMs);
  const progress = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));

  const formatMs = (ms: number) => {
    if (ms <= 0) return "00:00";
    const totalMins = Math.floor(ms / 60000);
    return `${Math.floor(totalMins / 60)
      .toString()
      .padStart(2, "0")}:${(totalMins % 60).toString().padStart(2, "0")}`;
  };

  const elapsedStr = formatMs(elapsedMs);
  const remainingStr = formatMs(Math.max(0, endMs - Math.max(now, startMs)));

  return (
    <div className="relative w-full z-10">
      <div
        className="bg-white p-3 px-5 rounded-[20px] shadow-sm border border-gray-100 w-full cursor-pointer relative z-20"
        onClick={() => !isEditing && setIsEditing(true)}
      >
        <p className="text-[10px] text-gray-400 font-bold mb-1 text-center tracking-wider">
          {dateString} 마감 시간
        </p>

        {isEditing ? (
          <div
            className="flex justify-center items-center gap-2 mb-2"
            onClick={e => e.stopPropagation()}
          >
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="border rounded px-2 py-1 text-xs"
            />
            <span className="text-gray-400 text-xs">~</span>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="border rounded px-2 py-1 text-xs"
            />
            <button
              onClick={saveSchedule}
              className="bg-[#007AFF] text-white text-xs px-3 py-1 rounded-md font-bold"
            >
              저장
            </button>
          </div>
        ) : (
          <div className="w-full bg-gray-100 h-1.5 rounded-full mb-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#007AFF] to-[#5856D6] h-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {!isEditing && (
          <div className="flex justify-between items-center text-xs font-medium text-gray-500 tracking-wide px-1 relative">
            <span className="text-left w-1/3">{startTime}</span>
            <span className="text-center w-1/3 font-bold text-gray-700">
              {elapsedStr}
            </span>
            <span className="text-right w-1/3 pr-6 text-[#007AFF]">
              {remainingStr}
            </span>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#007AFF] transition-colors"
              onClick={e => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
            >
              {isDropdownOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* 🔽 꺾쇠를 누르면 펼쳐지는 오늘 일정 리스트 */}
      {isDropdownOpen && !isEditing && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[20px] shadow-lg border border-gray-100 p-4 z-10 animate-in slide-in-from-top-2">
          <h4 className="text-xs font-bold text-gray-400 mb-3 ml-1">
            오늘 등록된 일정
          </h4>
          {todaySchedules.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {todaySchedules.map(s => (
                <div
                  key={s.id}
                  className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100"
                >
                  <span className="font-bold text-gray-700 text-sm truncate pr-2">
                    {s.title}
                  </span>
                  <span className="text-[#007AFF] font-bold text-xs shrink-0">
                    {s.startTime} ~ {s.endTime}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">
              오늘 일정이 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TodayTimeboxDashboard;
