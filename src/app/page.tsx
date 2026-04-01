"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Menu,
  Trash2,
  Mic,
  Plus,
  ChevronUp,
  ChevronDown,
  Play,
} from "lucide-react";
import LoginGate from "@/components/loginGate";
import TodayTimeboxDashboard from "@/components/todayTimeboxDashboard";
import CalendarView from "../components/CalendarView";
import Sidebar from "@/components/Sidebar";
import TaskCard from "@/components/TaskCard";
import AddTaskModal from "@/components/AddTaskModal";
import { Task, Schedule } from "@/types";
import DailyView from "@/components/DailyView";

export default function FocusApp() {
  const [userName, setUserName] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("focus_user_name");
    if (storedUser) setUserName(storedUser);
    setIsInitialized(true);
  }, []);

  if (!isInitialized) return null;
  if (!userName) return <LoginGate onLogin={setUserName} />;

  return (
    <MainDashboard
      userName={userName}
      onLogout={() => {
        localStorage.removeItem("focus_user_name");
        setUserName(null);
      }}
    />
  );
}

function MainDashboard({
  userName,
}: {
  userName: string;
  onLogout: () => void;
}) {
  // --- 상태 관리 ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<number | string | null>(
    null
  );
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentView, setCurrentView] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. 3단 탭 상태 관리 (초기값은 무조건 'todo')
  const [activeTab, setActiveTab] = useState("todo");

  const [showSniperModal, setShowSniperModal] = useState(false);
  const [sniperTask, setSniperTask] = useState<Task | null>(null);

  // 2. 상태 변경 및 탭 강제 견인 함수
  const updateTaskStatus = async (id: number | string, newStatus: string) => {
    setTasks(
      tasks.map(t =>
        String(t.id) === String(id) ? { ...t, status: newStatus } : t
      )
    );
    setActiveTab(newStatus);

    try {
      await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-name": encodeURIComponent(userName),
        },
        body: JSON.stringify({
          id,
          updatedFields: { status: newStatus },
        }),
      });
    } catch (error) {
      console.error("상태 변경 에러:", error);
      alert("서버 오류로 상태가 저장되지 않았습니다.");
    }
  };

  // 브레인 덤프 관련 상태
  const [isBrainDumping, setIsBrainDumping] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [brainDumpTimeLeft, setBrainDumpTimeLeft] = useState<number | null>(
    null
  );
  const [aiUsageCount, setAiUsageCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  // 특별 카드 상세내역 관리를 위한 State
  const [expandedSpecialIds, setExpandedSpecialIds] = useState<string[]>([]);
  const toggleSpecialDesc = (id: string) =>
    setExpandedSpecialIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  // 프론트엔드 전용 1분(60000ms) 타이머
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 참조(Refs)
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const recognizedTextRef = useRef("");
  // 🎯 [추가할 코드]
  const finalTranscriptRef = useRef(""); // 브라우저가 '확정' 지은 텍스트만 모아두는 절대 금고
  const isBrainDumpingRef = useRef(false);
  const isManuallyStoppedRef = useRef(false);

  useEffect(() => {
    syncDailyTasks(); // 🔥 앱 켜질 때 동기화 함수부터 무조건 실행! (하루 1번만 작동함)
    fetchTasks();
    fetchSchedules();
    initSpeechRecognition();
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/usage", {
        headers: { "x-user-name": encodeURIComponent(userName) },
      });
      const data = await res.json();
      setAiUsageCount(data.count);
      setIsPremium(data.isPremium);
    } catch (err) {
      console.error(err);
    }
  };

  // --- [page.tsx 내부의 syncDailyTasks 함수를 핀셋 교체] ---
  const syncDailyTasks = async () => {
    const STORAGE_KEY = `last_daily_sync_${userName}`;
    const lastSyncDate = localStorage.getItem(STORAGE_KEY);

    // 🔥 핵심 수술: 브라우저에서도 무조건 한국 시간(KST) 기준으로 '오늘 날짜'를 구한다.
    const now = new Date();
    const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const today = kstTime.toISOString().split("T")[0];

    // 1차 검문: 로컬스토리지 날짜가 한국 시간 '오늘'과 같다면 서버 호출 없이 즉시 종료
    if (lastSyncDate === today) {
      console.log("🚀 [Sync] 이미 오늘 동기화됨. 서버 요청 생략.");
      return;
    }

    try {
      const res = await fetch("/api/daily/sync", {
        method: "POST",
        headers: { "x-user-name": encodeURIComponent(userName) },
      });

      if (res.ok) {
        // 2차 검문 통과: 서버에서 처리가 완료되면 로컬스토리지에 '오늘(KST)' 도장 쾅
        localStorage.setItem(STORAGE_KEY, today);
        console.log("✅ [Sync] 오늘치 데일리 루틴 동기화 완료.");
      }
    } catch (err) {
      console.error("데일리 동기화 실패:", err);
    }
  };

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks", {
      headers: { "x-user-name": encodeURIComponent(userName) },
    });
    const data = await res.json();
    setTasks(data);
    const runningTask = data.find((t: Task) => t.isActive === true);
    if (runningTask) setActiveTaskId(runningTask.id);
  };

  const fetchSchedules = async () => {
    const res = await fetch("/api/calendar", {
      headers: { "x-user-name": encodeURIComponent(userName) },
    });
    const data = await res.json();
    if (Array.isArray(data)) setSchedules(data);
  };

  // 🎙️ 복구된 음성 인식 초기화 로직
  // 🎯 [교체할 코드]
  const initSpeechRecognition = () => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "ko-KR";

        // 🔥 수술 포인트 1: 글자 반복(메아리) 원천 차단
        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = "";

          // i = 0 이 아니라 event.resultIndex 부터 시작! (새로 들어온 데이터만 취급)
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            // 브라우저가 "이 단어는 이제 안 바뀐다"고 확정(isFinal) 지으면 금고에 박아넣음
            if (event.results[i].isFinal) {
              finalTranscriptRef.current += transcript + " ";
            } else {
              // 아직 웅얼거리고 있는(수정될 수 있는) 텍스트는 임시 변수에만 저장
              interimTranscript += transcript;
            }
          }

          // 화면 및 서버 전송용 상태 업데이트 = 금고 텍스트 + 임시 텍스트
          const fullText = finalTranscriptRef.current + interimTranscript;
          setRecognizedText(fullText);
          recognizedTextRef.current = fullText;
        };

        // 🔥 수술 포인트 2: 모바일 OS의 강제 종료 막는 '좀비 부활' 로직
        recognitionRef.current.onend = () => {
          // 우리가 정지 버튼(isBrainDumpingRef = false)을 안 눌렀는데 꺼졌다? -> OS가 죽인 거임. 강제 재시작.
          if (isBrainDumpingRef.current) {
            console.log(
              "OS 배터리 절약 정책으로 마이크 강제 종료됨. 즉시 부활시킵니다."
            );
            try {
              recognitionRef.current.start();
            } catch (e) {
              // 이미 시작 중인 경우 발생하는 에러 무시
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("음성 인식 에러:", event.error);
          if (event.error === "not-allowed") {
            alert(
              "마이크 권한이 차단되어 있습니다. 브라우저 주소창에서 마이크를 허용해주세요."
            );
            setIsBrainDumping(false);
            isBrainDumpingRef.current = false; // 에러 났으니 부활 로직도 꺼줌
          }
        };
      } else {
        console.warn("이 브라우저는 음성 인식을 지원하지 않습니다.");
      }
    }
  };

  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!activeTaskId) return;
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, [activeTaskId]);

  useEffect(() => {
    if (brainDumpTimeLeft === null) return;
    if (brainDumpTimeLeft === 0) {
      stopAndSendBrainDump();
      return;
    }
    const timer = setTimeout(() => {
      setBrainDumpTimeLeft(prev => prev! - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [brainDumpTimeLeft]);

  const getRealtimeProgress = (task: Task, currentTime: number) => {
    const startMs = task.startedAt || task.lastStartedAt;
    if (!startMs || !task.deadline || task.deadline === "D-Day")
      return task.progress || 0;

    const totalDuration = new Date(task.deadline).getTime() - startMs;
    if (totalDuration <= 0) return 100;

    const elapsed = currentTime - startMs;
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const handleAddTask = async (
    title: string,
    description: string,
    deadline: string
  ) => {
    const newTask = {
      id: Date.now(),
      title: `${tasks.length + 1}. ${title}`,
      description,
      time: "10 min",
      deadline: deadline.replace("T", " "),
      progress: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-name": encodeURIComponent(userName),
      },
      body: JSON.stringify(newTask),
    });
    if (res.ok) {
      setTasks([...tasks, newTask]);
      setIsModalOpen(false);
    }
  };

  const updateCardDetails = async (
    id: number | string,
    newTitle: string,
    newDesc: string
  ) => {
    setTasks(
      tasks.map(t =>
        String(t.id) === String(id)
          ? { ...t, title: newTitle, description: newDesc }
          : t
      )
    );
    await fetch("/api/tasks", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-name": encodeURIComponent(userName),
      },
      body: JSON.stringify({
        id,
        updatedFields: { title: newTitle, description: newDesc },
      }),
    });
  };

  const handleUpdateSchedule = async (
    id: string,
    updatedSchedule: Schedule
  ) => {
    const updatedSchedules = schedules.map(s =>
      s.id === id ? updatedSchedule : s
    );
    setSchedules(updatedSchedules);
    await fetch("/api/calendar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-name": encodeURIComponent(userName),
      },
      body: JSON.stringify({ schedules: updatedSchedules }),
    });
  };

  // 🔥 1. 리셋 함수 추가 (컴포넌트 안에 아무 데나 넣으셈)
  const handleResetUsage = async () => {
    if (!confirm("개발자 모드: AI 사용 횟수를 0으로 리셋하시겠습니까?")) return;
    try {
      const res = await fetch("/api/usage/reset", {
        method: "POST",
        headers: { "x-user-name": encodeURIComponent(userName) },
      });
      if (res.ok) {
        setAiUsageCount(0);
        alert("리셋 완료! 다시 마이크를 사용할 수 있습니다.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFocus = async (task: Task) => {
    const currentTime = Date.now();
    const isActive = String(activeTaskId) !== String(task.id);
    const initialStart = task.startedAt || task.lastStartedAt || currentTime;
    const finalProgress = isActive
      ? task.progress
      : Number(getRealtimeProgress(task, currentTime).toFixed(1));

    setActiveTaskId(isActive ? task.id : null);

    // 🌟 핵심 수술: 상태 업데이트와 동시에 배열 재정렬 수행
    setTasks(prevTasks => {
      // 1. 해당 태스크의 상태를 업데이트한 새로운 배열 생성
      const updatedTasks = prevTasks.map(t =>
        String(t.id) === String(task.id)
          ? {
              ...t,
              isActive,
              progress: finalProgress,
              startedAt: initialStart,
              lastStartedAt: isActive ? currentTime : null,
              // isActive가 true(START 누름)면 자동으로 'in-progress' 탭으로 이동
              status: isActive ? "in-progress" : t.status,
            }
          : t
      );

      // 2. 만약 START를 누른 거라면 강제로 '진행 중' 탭으로 화면 전환
      if (isActive) {
        setActiveTab("in-progress");
      }

      // 3. 배열 정렬 로직 (진행 중인 것들끼리 최신순 정렬)
      return updatedTasks.sort((a, b) => {
        // 둘 다 '진행 중(in-progress)' 상태일 때만 정렬
        if (a.status === "in-progress" && b.status === "in-progress") {
          // 방금 시작한(lastStartedAt이 가장 큰) 카드가 위로 오게 내림차순 정렬
          return (b.lastStartedAt || 0) - (a.lastStartedAt || 0);
        }
        return 0; // 나머지는 기존 순서 유지
      });
    });

    // DB 업데이트 로직은 기존과 동일
    await fetch("/api/tasks", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-name": encodeURIComponent(userName),
      },
      body: JSON.stringify({
        id: task.id,
        updatedFields: {
          isActive,
          progress: finalProgress,
          startedAt: initialStart,
          lastStartedAt: isActive ? currentTime : null,
          status: isActive ? "in-progress" : task.status, // DB에도 상태 변경 반영
        },
      }),
    });
  };

  const stopAndSendBrainDump = async () => {
    isManuallyStoppedRef.current = true; // 🎯 확실히 죽임
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsBrainDumping(false);
    setBrainDumpTimeLeft(null);

    const finalText = recognizedTextRef.current;
    if (!finalText.trim()) {
      alert("인식된 음성이 없습니다. 다시 시도해주세요.");
      return;
    }

    setIsAiProcessing(true);

    try {
      const res = await fetch("/api/braindump", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-name": encodeURIComponent(userName),
        },
        body: JSON.stringify({ text: finalText }),
      });

      if (res.status === 403) {
        alert(
          "무료 제공량(하루 2회)을 모두 소진했습니다. 내일 다시 시도해주세요!"
        );
        setIsAiProcessing(false);
        return;
      }

      if (res.ok) {
        const updatedTasks = await res.json();
        setTasks(updatedTasks);
        setAiUsageCount(prev => prev + 1);

        // 🔥 핵심 수술: AI 정렬이 끝나면 무조건 1순위(배열 0번째) 태스크를 물고 스나이퍼 모달을 띄운다!
        const topPriorityTask =
          updatedTasks.find((t: Task) => t.status === "todo") ||
          updatedTasks[0];
        if (topPriorityTask) {
          setSniperTask(topPriorityTask);
          setShowSniperModal(true);
        }
      }
    } catch (error) {
      console.error("Brain dump error:", error);
    } finally {
      setIsAiProcessing(false);
      setRecognizedText("");
      recognizedTextRef.current = "";
    }
  };

  const deleteTask = async (id: number | string) => {
    const res = await fetch(`/api/tasks?id=${id}`, {
      method: "DELETE",
      headers: { "x-user-name": encodeURIComponent(userName) },
    });
    if (res.ok) setTasks(tasks.filter(t => t.id !== id));
  };

  const updateDeadline = async (id: number | string, newDeadline: string) => {
    if (!newDeadline) return;
    const formattedDeadline = newDeadline.replace("T", " ");

    setTasks(
      tasks.map(t =>
        String(t.id) === String(id) ? { ...t, deadline: formattedDeadline } : t
      )
    );

    await fetch("/api/tasks", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-name": encodeURIComponent(userName),
      },
      body: JSON.stringify({
        id,
        updatedFields: { deadline: formattedDeadline },
      }),
    });
  };

  const handleSort = async () => {
    if (
      dragItem.current === null ||
      dragOverItem.current === null ||
      dragItem.current === dragOverItem.current
    )
      return;
    const _tasks = [...tasks];
    const draggedItemContent = _tasks.splice(dragItem.current, 1)[0];
    _tasks.splice(dragOverItem.current, 0, draggedItemContent);
    setTasks(_tasks);
    dragItem.current = null;
    dragOverItem.current = null;
    await fetch("/api/tasks/reorder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-name": encodeURIComponent(userName),
      },
      body: JSON.stringify({ reorderedTasks: _tasks }),
    });
  };

  const handleSaveSchedule = async (newSchedule: Schedule) => {
    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);
    await fetch("/api/calendar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-name": encodeURIComponent(userName),
      },
      body: JSON.stringify({ schedules: updatedSchedules }),
    });
  };

  const handleDeleteSchedule = async (id: string) => {
    const updatedSchedules = schedules.filter(s => s.id !== id);
    setSchedules(updatedSchedules);
    await fetch("/api/calendar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-name": encodeURIComponent(userName),
      },
      body: JSON.stringify({ schedules: updatedSchedules }),
    });
  };

  // 🎙️ 마이크 버튼 클릭 시 실행되는 토글 함수
  // 🎯 [교체할 코드]
  const toggleBrainDump = async () => {
    if (!recognitionRef.current) {
      return alert("음성 인식은 크롬(Chrome) 브라우저에서 가장 잘 작동합니다.");
    }

    if (isBrainDumping) {
      // 1. 유저(우리)가 의도적으로 마이크를 끌 때: OS 부활 로직 작동 못하게 스위치 먼저 내림
      isBrainDumpingRef.current = false;
      await stopAndSendBrainDump();
    } else {
      // 2. 마이크 시작할 때: 모든 텍스트 금고 초기화 및 스위치 켬
      setRecognizedText("");
      recognizedTextRef.current = "";
      finalTranscriptRef.current = ""; // 👈 금고 초기화
      setBrainDumpTimeLeft(20);
      isBrainDumpingRef.current = true; // 👈 지금부터 마이크는 절대 꺼지면 안 된다고 선언

      try {
        recognitionRef.current.start();
        setIsBrainDumping(true);
      } catch (error) {
        console.error("마이크 시작 에러:", error);
      }
    }
  };

  const todayObj = new Date();
  const formattedToday = `${todayObj.getFullYear()}-${String(
    todayObj.getMonth() + 1
  ).padStart(2, "0")}-${String(todayObj.getDate()).padStart(2, "0")}`;
  const todaySchedules = schedules.filter(s => s.date === formattedToday);

  // --- 렌더링 영역 ---
  return (
    <div className="flex h-screen bg-[#F9F9FB] text-[#1C1C1E] overflow-hidden">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isMobileOpen={isSidebarOpen}
        setIsMobileOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="flex items-center gap-5 justify-between p-4 lg:p-8 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100">
          <button
            className="lg:hidden shrink-0 p-2 -ml-2 text-gray-700 hover:bg-gray-200 rounded-xl"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-7 h-7" />
          </button>
          <div className="flex-1 min-w-0 lg:max-w-2xl lg:mx-auto gap-3">
            <TodayTimeboxDashboard
              userName={userName}
              todaySchedules={todaySchedules}
            />
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-4 pb-40">
          {currentView === "home" ? (
            <div className="w-full max-w-2xl mx-auto space-y-4">
              {/* 특별 일정 카드 */}
              {todaySchedules?.map(schedule => (
                <div
                  key={schedule.id}
                  className="relative bg-blue-50/40 border-[1.5px] border-[#007AFF] p-6 rounded-[24px] shadow-sm mb-4"
                >
                  <span className="absolute -top-3 left-6 bg-[#007AFF] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                    🗓️ 오늘의 중요 일정
                  </span>
                  <div className="mb-4 pr-4">
                    <h3 className="text-lg font-bold text-gray-800 break-words">
                      {schedule.title}
                    </h3>
                    {schedule.description && (
                      <div className="mt-1">
                        <p
                          className={`text-sm text-gray-500 ${
                            expandedSpecialIds.includes(schedule.id)
                              ? ""
                              : "line-clamp-1 truncate"
                          }`}
                        >
                          {schedule.description}
                        </p>
                        <button
                          onClick={() => toggleSpecialDesc(schedule.id)}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#007AFF] mt-1 bg-white px-2 py-0.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
                        >
                          {expandedSpecialIds.includes(schedule.id)
                            ? "접기"
                            : "자세히 보기"}{" "}
                          {expandedSpecialIds.includes(schedule.id) ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold px-1 text-gray-500">
                    <span className="text-left w-1/3">
                      {schedule.startTime !== "-"
                        ? schedule.startTime
                        : "시간 미정"}
                    </span>
                    <span className="text-center w-1/3 font-light">~</span>
                    <span className="text-right w-1/3 text-[#007AFF]">
                      {schedule.endTime} (마감)
                    </span>
                  </div>
                </div>
              ))}

              {/* 🔥 중복 매핑 제거 & 비어있을 때 방어 로직 추가 */}
              {tasks?.length === 0 ? (
                <div className="text-center text-gray-400 py-10 font-bold">
                  우측 하단의 플러스 버튼을 눌러 일정을 추가하세요.
                </div>
              ) : (
                <>
                  {/* 3단 탭 UI */}
                  <div className="flex justify-center gap-2 my-6">
                    {[
                      { id: "todo", label: "진행 전" },
                      { id: "in-progress", label: "진행 중" },
                      { id: "done", label: "완료" },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-24 h-10 rounded-full text-[13px] font-bold transition-all duration-300
                              ${
                                activeTab === tab.id
                                  ? "bg-[#1C1C1E] text-white shadow-md"
                                  : "bg-white text-gray-400 border border-gray-200 hover:bg-gray-50"
                              }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* 탭 상태에 맞는 카드만 단 1번 렌더링 */}
                  {(() => {
                    const filteredTasks = tasks.filter(
                      t => (t.status || "todo") === activeTab
                    );

                    return filteredTasks.length > 0 ? (
                      filteredTasks.map((task, index) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          activeTaskId={activeTaskId}
                          currentTime={now}
                          getRealtimeProgress={getRealtimeProgress}
                          onToggleFocus={toggleFocus}
                          onDelete={deleteTask}
                          onUpdateDeadline={updateDeadline}
                          onUpdateCard={updateCardDetails}
                          onUpdateStatus={updateTaskStatus}
                          dragItemRef={dragItem}
                          dragOverItemRef={dragOverItem}
                          onSort={handleSort}
                          isFaded={index >= 5}
                        />
                      ))
                    ) : (
                      <div className="text-center text-gray-400 py-10 font-bold">
                        해당 상태의 일정이 없습니다.
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          ) : currentView === "daily" ? (
            // 🔥 여기에 우리가 방금 만든 컴포넌트를 끼워 넣는다!
            <div className="w-full max-w-2xl mx-auto">
              <DailyView userName={userName} />
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto">
              <CalendarView
                schedules={schedules}
                onSaveSchedule={handleSaveSchedule}
                onDeleteSchedule={handleDeleteSchedule}
                onUpdateSchedule={handleUpdateSchedule}
              />
            </div>
          )}
        </section>

        {isBrainDumping && (
          <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-white/95 p-5 rounded-2xl shadow-2xl text-center border-2 border-[#FF9500] z-50 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9500] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF9500]"></span>
                </span>
                <p className="text-[#FF9500] text-xs font-bold">
                  AI 브레인덤프 작동 중
                </p>
              </div>
              <p className="text-red-500 text-xs font-bold tracking-wider">
                {brainDumpTimeLeft}초 남음
              </p>
            </div>

            <div className="w-full bg-gray-100 h-1.5 rounded-full mb-4 overflow-hidden">
              <div
                className="bg-[#FF9500] h-full transition-all duration-1000 ease-linear"
                style={{ width: `${(brainDumpTimeLeft! / 20) * 100}%` }}
              />
            </div>

            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 min-h-[80px] flex flex-col justify-center">
              {recognizedText ? (
                <p className="text-gray-800 text-sm font-medium break-words leading-relaxed">
                  "{recognizedText}"
                </p>
              ) : (
                <div className="space-y-1">
                  <p className="text-gray-800 text-sm font-bold">
                    생각나는 업무나 아이디어를 말해주세요.
                  </p>
                  <p className="text-gray-500 text-xs font-medium">
                    AI가 기존 일정과 결합하여 <br />
                    지금 당장 해야 할 최적의 순서를 다시 짜드립니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {isAiProcessing && (
          <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-black/90 text-white px-8 py-4 rounded-full text-sm font-bold animate-bounce z-50 shadow-xl">
            🧠 AI가 일정을 재배열 하는 중...
          </div>
        )}

        <div className="fixed bottom-8 right-6 lg:right-10 flex flex-col items-center bg-white/80 backdrop-blur-xl p-2.5 rounded-full shadow-2xl border border-white/40 z-20 gap-3">
          <button
            onClick={handleResetUsage}
            className="p-1.5 text-[10px] font-bold text-gray-400 bg-gray-100 rounded-full hover:bg-gray-200 hover:text-red-500 transition-colors"
            title="사용량 리셋 (개발자용)"
          >
            ↻ 리셋
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-3.5 rounded-full border-[2.5px] border-[#007AFF] text-[#007AFF] bg-white hover:bg-blue-50 transition-all hover:scale-105 shadow-sm flex items-center justify-center"
            title="새 일정 추가"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          <button
            onClick={toggleBrainDump}
            disabled={isAiProcessing || (!isPremium && aiUsageCount >= 2)}
            className={`p-4 rounded-full transition-all flex justify-center items-center
              ${
                isBrainDumping
                  ? "bg-red-500 animate-pulse shadow-lg shadow-red-500/50"
                  : "bg-[#FF9500] hover:scale-105 shadow-lg shadow-[#FF9500]/40"
              }
              ${
                isAiProcessing || (!isPremium && aiUsageCount >= 2)
                  ? "opacity-50 cursor-not-allowed !bg-gray-400 !shadow-none hover:scale-100"
                  : ""
              }
            `}
            title={
              !isPremium && aiUsageCount >= 2
                ? "오늘의 사용량(2회) 소진됨"
                : "AI 음성 일정 쪼개기"
            }
          >
            <Mic
              className={`w-7 h-7 text-white ${
                isAiProcessing ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
        {/* 🔥 2안: 스나이퍼 모달 (극단적 포커스 뷰) */}
        {showSniperModal && sniperTask && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in duration-300">
            {/* 상단 경고 메시지 */}
            <h2 className="text-white text-lg md:text-2xl font-bold mb-8 tracking-widest text-center animate-pulse">
              딴생각 금지. 지금 당장 이것부터 해치웁니다.
            </h2>

            {/* 거대한 1순위 카드 */}
            <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-[0_0_80px_rgba(0,122,255,0.4)] flex flex-col items-center text-center transform transition-all scale-100 animate-in zoom-in-95 duration-500">
              <span className="text-[#007AFF] text-xs font-bold tracking-widest uppercase mb-4 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                Priority #1
              </span>

              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-snug break-words">
                {sniperTask.title}
              </h3>

              {sniperTask.description && (
                <p className="text-gray-500 font-medium mb-10 text-base md:text-lg">
                  {sniperTask.description}
                </p>
              )}

              <div className="w-full space-y-3">
                {/* 압도적인 크기의 시작 버튼 */}
                <button
                  onClick={() => {
                    setShowSniperModal(false);
                    toggleFocus(sniperTask); // 🔥 아까 고친 '맨 위로 올리며 진행 중 탭 이동' 로직이 여기서 터짐!
                  }}
                  className="w-full bg-[#007AFF] text-white text-lg font-bold py-5 rounded-2xl shadow-lg shadow-blue-500/40 hover:bg-blue-600 transition-all flex items-center justify-center gap-3 hover:scale-[1.02]"
                >
                  <Play className="w-6 h-6 fill-current" /> 지금 바로 시작
                </button>

                {/* 도망갈 구멍 (작게) */}
                <button
                  onClick={() => setShowSniperModal(false)}
                  className="w-full text-gray-400 font-bold py-3 hover:text-gray-600 transition-colors text-sm"
                >
                  나중에 하기
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTask}
      />
    </div>
  );
}
