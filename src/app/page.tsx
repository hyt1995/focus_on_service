// src/app/page.tsx
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
// import { Capacitor } from "@capacitor/core";
// import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import BrainDumpModal from "@/components/BrainDumpModal"; // 상단에 추가
import TimeReceiptView from "./time-receipt/page";
import Paywall from "@/components/Paywall";
// 🔥 [TDS 추가] 토스 디자인 컴포넌트들을 불러와요
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { ConfirmDialog, Button, FixedBottomCTA } from "@toss/tds-mobile";

export default function FocusApp() {
  const [userName, setUserName] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 🔥 수술 포인트: 웹뷰 앱에 로컬스토리지가 없어서 null일 경우를 대비해 '?' 추가
    const storedUser = window.localStorage?.getItem("focus_user_name");
    if (storedUser) setUserName(storedUser);
    setIsInitialized(true);
  }, []);

  if (!isInitialized) return null;
  if (!userName) return <LoginGate onLogin={setUserName} />;

  return (
    <MainDashboard
      userName={userName}
      onLogout={() => {
        if (typeof window !== "undefined") {
          window.localStorage?.removeItem("focus_user_name");
        }
        // localStorage.removeItem("focus_user_name");
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

  const [prepCount, setPrepCount] = useState<number | null>(null); // 4초 카운트다운용
  const deepgramTokenRef = useRef(""); // 4초 기다리는 동안 토큰 담아둘 금고

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // 2. 상태 변경 및 탭 강제 견인 함수
  const updateTaskStatus = async (id: number | string, newStatus: string) => {
    setTasks(
      tasks.map(t =>
        String(t.id) === String(id) ? { ...t, status: newStatus } : t
      )
    );
    setActiveTab(newStatus);

    // 🌟 방어막: 체험판이면 여기서 함수 강제 종료 (DB에 쓰지 않음 = 비용 0원)
    if (!isPremium) return;

    try {
      const apiUrl = baseUrl ? `${baseUrl}/api/tasks` : "/api/tasks";
      await fetch(apiUrl, {
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
      alert("서버 오류로 상태가 저장되지 않았어요.");
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
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeardRef = useRef<number>(Date.now()); // 🔥 새로 추가할 코드
  // 🎙️ 딥그램 실시간 스트리밍 제어용 Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 🔥 자식(대시보드)으로부터 마감 시간을 받아올 공간 마련 (기본값 18:00)
  const [todayStartTime, setTodayStartTime] = useState("09:00");
  const [todayEndTime, setTodayEndTime] = useState("18:00");

  // 1. 세팅 가져오는 함수 생성
  const fetchSettings = async () => {
    try {
      const apiUrl = baseUrl ? `${baseUrl}/api/schedule` : "/api/schedule";
      const res = await fetch(apiUrl, {
        headers: { "x-user-name": encodeURIComponent(userName) },
      });
      const data = await res.json();
      if (data.startTime && data.endTime) {
        setTodayStartTime(data.startTime);
        setTodayEndTime(data.endTime);
      }
    } catch (err) {
      console.error("세팅 로드 실패:", err);
    }
  };

  // 🌟 1. userName이 세팅된 후에만 프리미엄 확인을 돌도록 의존성 배열 추가!
  useEffect(() => {
    if (!userName) return; // 닉네임을 아직 못 가져왔으면 API 쏘지 말고 대기!

    checkPremiumStatus();
  }, [userName]);

  const checkPremiumStatus = async () => {
    if (!userName) return;
    try {
      const apiUrl = baseUrl ? `${baseUrl}/api/usage` : "/api/usage";
      const res = await fetch(apiUrl, {
        headers: { "x-user-name": encodeURIComponent(userName) },
        cache: "no-store",
      });
      const data = await res.json();

      setIsPremium(data.isPremium);
      setAiUsageCount(Number(data.count) || 0);

      // 🌟 2. 결제한 VIP 유저만 진짜 DB에서 일정 데이터를 가져옴! (Read 폭탄 방어)
      if (data.isPremium) {
        syncDailyTasks();
        fetchTasks();
        fetchSchedules();
        fetchSettings(); // 🌟 여기서 세팅값(마감시간)도 불러오기!
      } else {
        console.log("🚀 체험판 모드 진입: 서버 DB 통신이 실패했어요.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsage = async () => {
    try {
      const apiUrl = baseUrl ? `${baseUrl}/api/usage` : "/api/usage";
      const res = await fetch(apiUrl, {
        headers: { "x-user-name": encodeURIComponent(userName) },
        cache: "no-store",
      });
      const data = await res.json();
      setAiUsageCount(Number(data.count) || 0);
      setIsPremium(data.isPremium);
    } catch (err) {
      console.error(err);
    }
  };

  // --- [page.tsx 내부의 syncDailyTasks 함수를 핀셋 교체] ---
  // --- [page.tsx 내부의 syncDailyTasks 함수를 핀셋 교체] ---
  const syncDailyTasks = async () => {
    let lastSyncDate = null;
    const STORAGE_KEY = `last_daily_sync_${userName}`;

    // 'window'가 존재할 때만 실행
    if (typeof window !== "undefined") {
      // 🔥 수술 포인트: '?' 추가
      lastSyncDate = window.localStorage?.getItem(STORAGE_KEY);
    }

    const now = new Date();
    const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const today = kstTime.toISOString().split("T")[0];

    // 1차 검문: 로컬스토리지 날짜가 한국 시간 '오늘'과 같다면 서버 호출 없이 즉시 종료
    if (lastSyncDate === today) {
      console.log("🚀 [Sync] 이미 오늘 동기화됨. 서버 요청 생략.");
      return;
    }

    try {
      const apiUrl = baseUrl ? `${baseUrl}/api/daily/sync` : "/api/daily/sync";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "x-user-name": encodeURIComponent(userName) },
        cache: "no-store",
      });

      if (res.ok) {
        // 2차 검문 통과: 서버에서 처리가 완료되면 로컬스토리지에 저장 (여기에도 방어 코드 추가)
        if (typeof window !== "undefined") {
          window.localStorage?.setItem(STORAGE_KEY, today);
        }
        console.log("✅ [Sync] 오늘치 데일리 루틴 동기화 완료.");
      }
    } catch (err) {
      console.error("데일리 동기화 실패:", err);
    }
  };

  const fetchTasks = async () => {
    const apiUrl = baseUrl ? `${baseUrl}/api/tasks` : "/api/tasks";
    const res = await fetch(apiUrl, {
      headers: { "x-user-name": encodeURIComponent(userName) },
    });
    const data = await res.json();
    setTasks(data);
    const runningTask = data.find((t: Task) => t.isActive === true);
    if (runningTask) setActiveTaskId(runningTask.id);
  };

  const fetchSchedules = async () => {
    const apiUrl = baseUrl ? `${baseUrl}/api/calendar` : "/api/calendar";
    const res = await fetch(apiUrl, {
      headers: { "x-user-name": encodeURIComponent(userName) },
    });
    const data = await res.json();
    if (Array.isArray(data)) setSchedules(data);
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

  // ⏳ 1. 4초 준비 타이머 로직 (4 -> 3 -> 2 -> 1 -> 녹음 시작)
  useEffect(() => {
    if (prepCount === null) return;
    if (prepCount > 0) {
      const timer = setTimeout(() => setPrepCount(prepCount - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (prepCount === 0) {
      setPrepCount(null); // 준비 끝! 화면에서 숫자 지우기
      startDeepgramRecording(); // 진짜 녹음 함수 실행
    }
  }, [prepCount]);

  // ⏳ 2. 20초 진짜 녹음 타이머 로직 (20 -> 19 ... -> 0 -> 전송)
  useEffect(() => {
    if (brainDumpTimeLeft === null) return;
    if (brainDumpTimeLeft > 0) {
      const timer = setTimeout(
        () => setBrainDumpTimeLeft(brainDumpTimeLeft - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
    if (brainDumpTimeLeft === 0) {
      stopAndSendBrainDump(); // 20초 다 쓰면 자동 종료 및 AI 전송
    }
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
      status: "todo",
    };

    setTasks([...tasks, newTask]);
    setIsModalOpen(false);

    // 🌟 방어막: 체험판이면 여기서 함수 강제 종료 (DB에 쓰지 않음 = 비용 0원)
    if (!isPremium) {
      return;
    }

    const apiUrl = baseUrl ? `${baseUrl}/api/tasks` : "/api/tasks";
    await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-name": encodeURIComponent(userName),
      },
      body: JSON.stringify(newTask),
    });
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

    // 🌟 방어막: 체험판이면 서버로 상태값 보내지 않고 종료!
    if (!isPremium) return;

    const apiUrl = baseUrl ? `${baseUrl}/api/tasks` : "/api/tasks";
    await fetch(apiUrl, {
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
    const apiUrl = baseUrl ? `${baseUrl}/api/calendar` : "/api/calendar";
    await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-name": encodeURIComponent(userName),
      },
      body: JSON.stringify({ schedules: updatedSchedules }),
    });
  };

  // 🔥 1. 강력한 리셋 함수 (API가 실패해도 강제로 0으로 만듦)
  const handleResetUsage = async () => {
    if (!confirm("개발자 모드: AI 사용 횟수를 0으로 리셋하시겠어요?")) return;

    try {
      const apiUrl = baseUrl
        ? `${baseUrl}/api/usage/reset`
        : "/api/usage/reset";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "x-user-name": encodeURIComponent(userName) },
        cache: "no-store",
      });

      if (res.ok) {
        setAiUsageCount(0);
        alert("리셋 완료! 다시 마이크를 사용할 수 있습니다.");
      } else {
        // 🔥 서버에 리셋 API가 아직 없거나 에러가 나더라도 테스트를 위해 화면 횟수는 강제 초기화!
        console.warn(
          `서버 리셋 실패 (상태 코드: ${res.status}). 프론트엔드 횟수를 강제로 0으로 변경합니다.`
        );
        setAiUsageCount(0);
        alert(
          "임시 리셋 완료! (서버 연결 실패로 화면만 0으로 강제 리셋했습니다)"
        );
      }
    } catch (error) {
      console.error("리셋 통신 에러:", error);
      // 🔥 인터넷이 끊기거나 주소가 완전히 틀려도 테스트는 해야 하니까 강제 초기화!
      setAiUsageCount(0);
      alert("임시 리셋 완료! (API 연결 에러로 화면만 0으로 강제 리셋했습니다)");
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
    const apiUrl = baseUrl ? `${baseUrl}/api/tasks` : "/api/tasks";
    await fetch(apiUrl, {
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

  // 🎙️ 3. 안전하게 종료하고 서버로 텍스트 보내기
  const stopAndSendBrainDump = async () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (socketRef.current) socketRef.current.close();
    if (streamRef.current)
      streamRef.current.getTracks().forEach(track => track.stop());

    setIsBrainDumping(false);
    isBrainDumpingRef.current = false;
    setBrainDumpTimeLeft(null);
    setPrepCount(null);

    const finalText = recognizedTextRef.current;
    if (!finalText.trim()) return;

    setIsAiProcessing(true);
    try {
      const apiUrl = baseUrl ? `${baseUrl}/api/braindump` : "/api/braindump";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-name": encodeURIComponent(userName),
        },
        cache: "no-store",
        body: JSON.stringify({ text: finalText }),
      });

      if (res.status === 403) {
        alert("오늘 이용 가능 횟수(2회)를 모두 소진했어요.");
        setAiUsageCount(2);
        setIsAiProcessing(false);
        return;
      }

      if (res.ok) {
        // 🌟 수정: 백엔드가 스나이퍼 타겟 딱 1개만 줌
        const { sniperTask, isNewTask, updatedCount } = await res.json();

        // 새로 생성된 거라면 내 화면(상태)의 태스크 목록에 추가
        if (isNewTask) {
          setTasks(prev => [sniperTask, ...prev]);
        }

        // 🌟 프론트가 짐작하지 않고, 서버가 준 정확한 숫자로 즉시 화면을 갱신 (새로고침 불필요)
        if (typeof updatedCount === "number") {
          setAiUsageCount(updatedCount);
        }

        // 🌟 바로 스나이퍼 모달로 직행!
        setSniperTask(sniperTask);
        setShowSniperModal(true);
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
    setTasks(tasks?.filter(t => t.id !== id));

    // 🌟 방어막: 체험판이면 서버로 상태값 보내지 않고 종료!
    if (!isPremium) return;

    await fetch(`/api/tasks?id=${id}`, {
      method: "DELETE",
      headers: { "x-user-name": encodeURIComponent(userName) },
    });
  };

  const updateDeadline = async (id: number | string, newDeadline: string) => {
    if (!newDeadline) return;
    const formattedDeadline = newDeadline.replace("T", " ");

    setTasks(
      tasks.map(t =>
        String(t.id) === String(id) ? { ...t, deadline: formattedDeadline } : t
      )
    );

    // 🌟 방어막: 체험판이면 서버로 상태값 보내지 않고 종료!
    if (!isPremium) return;

    const apiUrl = baseUrl ? `${baseUrl}/api/tasks` : "/api/tasks";
    await fetch(apiUrl, {
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

    // 🌟 방어막: 체험판이면 서버로 상태값 보내지 않고 종료!
    if (!isPremium) return;

    const apiUrl = baseUrl
      ? `${baseUrl}/api/tasks/reorder`
      : "/api/tasks/reorder";
    await fetch(apiUrl, {
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
    const apiUrl = baseUrl ? `${baseUrl}/api/calendar` : "/api/calendar";
    await fetch(apiUrl, {
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
    const apiUrl = baseUrl ? `${baseUrl}/api/calendar` : "/api/calendar";
    await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-name": encodeURIComponent(userName),
      },
      body: JSON.stringify({ schedules: updatedSchedules }),
    });
  };

  // 마이크 버튼을 눌렀을때 실행되는 함// 🎙️ 1. 버튼 눌렀을 때 (마이크 즉시 선점 + 4초 카운트다운)
  const toggleBrainDump = async () => {
    if (isBrainDumping) {
      setPrepCount(null);
      await stopAndSendBrainDump();
      return;
    }

    // 1차 방어막: 프리미엄 미결제 유저 원천 차단 (비용 발생 방지)
    if (!isPremium) {
      alert("AI 음성 일정 쪼개기는 프리미엄 전용 기능입니다.");
      return;
    }

    // 2차 방어막: 프리미엄 유저의 하루 사용량 제한 (0, 1은 통과 / 2 이상은 차단)
    if (aiUsageCount >= 2) {
      alert("오늘 제공량(2회)을 모두 소진했어요.");
      return;
    }

    setRecognizedText("");
    recognizedTextRef.current = "";
    finalTranscriptRef.current = "";
    setIsBrainDumping(true);
    isBrainDumpingRef.current = true;
    setBrainDumpTimeLeft(null);

    try {
      // 1️⃣ [가장 먼저] 네이티브 앱(폰)의 OS 권한부터 정중하게 허락받기
      // if (
      //   typeof window !== "undefined" &&
      //   (window as any).Capacitor?.isNativePlatform()
      // ) {
      //   await SpeechRecognition.requestPermissions();
      // }

      // 2️⃣ [그 다음] OS가 허락했으니 안심하고 실제 마이크 하드웨어 켜기
      // (Vercel이 아닌 로컬 앱 환경이라 이제 딜레이 튕김 없음!)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3️⃣ 백엔드(Vercel) 통신해서 딥그램 토큰 받아오기
      const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const res = await fetch(`${BASE_URL}/api/deepgram`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error("토큰 발급 실패");
      deepgramTokenRef.current = data.token;

      // 4️⃣ 소켓 통신선 미리 연결해두기
      const socket = new WebSocket(
        "wss://api.deepgram.com/v1/listen?model=nova-2&language=ko&interim_results=true&endpointing=false",
        ["token", data.token]
      );
      socketRef.current = socket;

      // 🚀 모든 준비가 끝났으니 우아하게 4초 카운트다운 시작!
      setPrepCount(4);
    } catch (err: any) {
      console.error("준비 에러:", err);
      setIsBrainDumping(false);
      isBrainDumpingRef.current = false;
      alert(
        `마이크 에러:\n${
          err.message ||
          "마이크 접근 권한이 필요해요. 휴대폰 설정에서 마이크 권한을 켜주세요."
        }`
      );
    }
  };

  // 🎙️ 2. 진짜 녹음 시작 (4초 끝나고 자동으로 불리는 함수)
  // const startDeepgramRecording = async () => {
  //   setBrainDumpTimeLeft(20); // 20초 카운트다운 시작!

  //   try {
  //     if (!streamRef.current || !socketRef.current)
  //       throw new Error("마이크/소켓 미준비");
  //     const socket = socketRef.current;

  //     // 🔥 [핵심 3] 4초 뒤, 대기시켜놨던 마이크 소리를 딥그램으로 쏘기 시작
  //     const startRecording = () => {
  //       const mediaRecorder = new MediaRecorder(streamRef.current!);
  //       mediaRecorderRef.current = mediaRecorder;
  //       mediaRecorder.addEventListener("dataavailable", event => {
  //         if (event.data.size > 0 && socket.readyState === 1) {
  //           socket.send(event.data);
  //         }
  //       });
  //       mediaRecorder.start(250);
  //     };

  //     // 이미 소켓이 열렸다면 즉시 쏘고, 아니라면 열리는 순간 쏜다
  //     if (socket.readyState === 1) {
  //       startRecording();
  //     } else {
  //       socket.onopen = startRecording;
  //     }

  //     // 글자 받아오기
  //     socket.onmessage = message => {
  //       const received = JSON.parse(message.data);
  //       if (received.channel?.alternatives[0]) {
  //         const transcript = received.channel.alternatives[0].transcript;
  //         if (transcript) {
  //           if (received.is_final)
  //             finalTranscriptRef.current += transcript + " ";
  //           const currentText =
  //             finalTranscriptRef.current +
  //             (received.is_final ? "" : transcript);
  //           setRecognizedText(currentText);
  //           recognizedTextRef.current = currentText;
  //         }
  //       }
  //     };
  //   } catch (err: any) {
  //     console.error("녹음 시작 에러:", err);
  //     alert("녹음을 시작하는 데 문제가 생겼어요. 다시 시도해 주세요.");
  //     stopAndSendBrainDump();
  //   }
  // };

  const startDeepgramRecording = async () => {
    setBrainDumpTimeLeft(20);

    try {
      if (!streamRef.current || !deepgramTokenRef.current)
        throw new Error("마이크나 토큰 미준비");

      const socket = new WebSocket(
        "wss://api.deepgram.com/v1/listen?model=nova-2&language=ko&interim_results=true&endpointing=false",
        ["token", deepgramTokenRef.current]
      );
      socketRef.current = socket;

      // 🌟 핵심 무기: 문이 열리기 전까지 오디오 조각을 담아둘 임시 대기실(Queue)
      const audioQueue: Blob[] = [];

      // 🚀 문이 열리든 말든, 20초 시작과 동시에 무조건 유저 목소리부터 녹음 시작!
      const mediaRecorder = new MediaRecorder(streamRef.current!);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.addEventListener("dataavailable", event => {
        if (event.data.size > 0) {
          if (socket.readyState === 1) {
            // 1. 문이 열려있으면 딥그램으로 바로 전송
            socket.send(event.data);
          } else if (socket.readyState === 0) {
            // 2. 문이 아직 열리는 중(Connecting)이라면 대기실에 안전하게 보관!
            audioQueue.push(event.data);
          }
        }
      });

      // 0.25초 단위로 쪼개서 녹음 진행
      mediaRecorder.start(250);

      // 🎉 딥그램 서버 문이 열리는 순간!
      socket.onopen = () => {
        // 대기실에 모아둔 유저의 첫마디 오디오 조각들을 빛의 속도로 전부 밀어넣음 (유실률 0%)
        while (audioQueue.length > 0) {
          const chunk = audioQueue.shift();
          if (chunk) socket.send(chunk);
        }
      };

      socket.onmessage = message => {
        const received = JSON.parse(message.data);
        if (received.channel?.alternatives[0]) {
          const transcript = received.channel.alternatives[0].transcript;
          if (transcript) {
            if (received.is_final)
              finalTranscriptRef.current += transcript + " ";
            const currentText =
              finalTranscriptRef.current +
              (received.is_final ? "" : transcript);
            setRecognizedText(currentText);
            recognizedTextRef.current = currentText;
          }
        }
      };

      socket.onerror = error => {
        console.error("🚨 Deepgram WebSocket Error:", error);
      };
      socket.onclose = event => {
        console.log(
          `🔒 Deepgram WebSocket Closed: Code ${event.code}, Reason: ${event.reason}`
        );
      };
    } catch (err: any) {
      console.error("녹음 시작 에러:", err);
      alert("녹음을 시작하는 데 문제가 생겼어요. 다시 시도해 주세요.");
      stopAndSendBrainDump();
    }
  };

  const todayObj = new Date();
  const formattedToday = `${todayObj.getFullYear()}-${String(
    todayObj.getMonth() + 1
  ).padStart(2, "0")}-${String(todayObj.getDate()).padStart(2, "0")}`;
  const todaySchedules = schedules.filter(s => s.date === formattedToday);

  // 화면 상태(currentView)에 따라 컴포넌트를 배분하는 함수
  const renderCurrentView = () => {
    const lockedViews = ["receipt", "daily", "calendar"];

    // 무료 유저가 잠긴 탭을 누르면 모듈화한 Paywall 컴포넌트 렌더링
    if (!isPremium && lockedViews.includes(currentView)) {
      return <Paywall onBack={() => setCurrentView("home")} />;
    }

    if (currentView === "home") {
      return (
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
              우측 하단의 플러스 버튼을 눌러 일정을 추가해주세요.
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
                  <Button
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
                  </Button>
                ))}
              </div>

              {/* 탭 상태에 맞는 카드만 단 1번 렌더링 */}
              {(() => {
                const filteredTasks = tasks?.filter(
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
                    해당 상태의 일정이 없어요!
                  </div>
                );
              })()}
            </>
          )}
        </div>
      );
    }

    if (currentView === "daily") {
      return (
        <div className="w-full max-w-2xl mx-auto">
          <DailyView userName={userName} />
        </div>
      );
    }

    // page.tsx의 renderCurrentView 함수 내부
    if (currentView === "receipt") {
      // 🌟 대시보드에서 설정한 진짜 스케줄 시간을 영수증으로 통째로 넘겨줌!
      return (
        <TimeReceiptView
          tasks={tasks}
          schedules={schedules}
          userName={userName}
          workingTime={`${todayStartTime} ~ ${todayEndTime}`}
        />
      );
    }

    // 기본값 (calendar)
    return (
      <div className="w-full max-w-4xl mx-auto">
        <CalendarView
          schedules={schedules}
          onSaveSchedule={handleSaveSchedule}
          onDeleteSchedule={handleDeleteSchedule}
          onUpdateSchedule={handleUpdateSchedule}
        />
      </div>
    );
  };

  // --- 렌더링 영역 ---
  return (
    <TDSMobileAITProvider>
      <div className="flex h-screen bg-[#F9F9FB] text-[#1C1C1E] overflow-hidden">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          isMobileOpen={isSidebarOpen}
          setIsMobileOpen={setIsSidebarOpen}
          closingTime={todayEndTime}
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
                onTimeLoad={(start, end) => {
                  setTodayStartTime(start);
                  setTodayEndTime(end);
                }}
                isPremium={isPremium}
              />
            </div>
          </header>

          <section className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-4 pb-40">
            {renderCurrentView()}
          </section>

          {/* 모듈화된 브레인덤프 모달 */}
          <BrainDumpModal
            isOpen={isBrainDumping}
            prepCount={prepCount}
            timeLeft={brainDumpTimeLeft}
            recognizedText={recognizedText}
          />

          {isAiProcessing && (
            <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-black/90 text-white px-8 py-4 rounded-full text-sm font-bold animate-bounce z-50 shadow-xl">
              🧠 AI가 일정을 재배열 하는 중이에요...
            </div>
          )}

          {/* <div className="fixed bottom-8 right-6 lg:right-10 flex flex-col items-center bg-white/80 backdrop-blur-xl p-2.5 rounded-full shadow-2xl border border-white/40 z-20 gap-3"> */}
          {/* <button
            onClick={handleResetUsage}
            className="p-1.5 text-[10px] font-bold text-gray-400 bg-gray-100 rounded-full hover:bg-gray-200 hover:text-red-500 transition-colors"
            title="사용량 리셋 (개발자용)"
          >
            ↻ 리셋
          </button> */}

          {/* <button
              onClick={toggleBrainDump}
              disabled={
                !isPremium ||
                isAiProcessing ||
                (!isPremium && aiUsageCount >= 2)
              }
              className={`p-4 rounded-full transition-all flex justify-center items-center
              ${
                isBrainDumping
                  ? "bg-red-500 animate-pulse shadow-lg shadow-red-500/50"
                  : "bg-[#FF9500] hover:scale-105 shadow-lg shadow-[#FF9500]/40"
              }
              ${
                isAiProcessing ||
                (!isPremium && aiUsageCount >= 2) ||
                !isPremium
                  ? "opacity-50 cursor-not-allowed !bg-gray-400 !shadow-none hover:scale-100"
                  : ""
              }
            `}
              title={
                !isPremium && aiUsageCount >= 2
                  ? "오늘의 사용량(2회) 소진됐어요"
                  : "AI 음성 일정 쪼개기"
              }
            >
              <Mic
                className={`w-7 h-7 text-white ${
                  isAiProcessing ? "animate-spin" : ""
                }`}
              />
            </button> */}
          {/* 🔥 하단 고정 CTA 버튼 (토스 공식 폼 제출 UI) */}
          <FixedBottomCTA.Double
            leftButton={
              <Button
                color="dark"
                variant="weak"
                onClick={() => setIsModalOpen(true)}
              >
                새 일정 추가
              </Button>
            }
            rightButton={
              <Button
                loading={isAiProcessing}
                disabled={!isPremium || aiUsageCount >= 2 || isAiProcessing}
                onClick={toggleBrainDump}
              >
                {isBrainDumping
                  ? "마이크 끄기"
                  : !isPremium
                  ? "AI 쪼개기 (프리미엄)"
                  : `AI 쪼개기 (${Math.max(0, 2 - aiUsageCount)}회 남음)`}
              </Button>
            }
          />
          {/* </div> */}
          {/* 🔥 2안: 스나이퍼 모달 (극단적 포커스 뷰) */}
          {showSniperModal && sniperTask && (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in duration-300">
              {/* 상단 경고 메시지 */}
              {/* <h2 className="text-white text-lg md:text-2xl font-bold mb-8 tracking-widest text-center animate-pulse">
              딴생각 보다는 지금 이것부터 같이 해요.
            </h2> */}
              <h2 className="text-white text-lg md:text-2xl font-bold mb-8 tracking-wide text-center animate-pulse">
                지금은 이 일정에 집중해 볼까요?
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
                    <Play className="w-6 h-6 fill-current" /> 지금 바로
                    시작해요!
                  </button>

                  {/* 도망갈 구멍 (작게) */}
                  <button
                    onClick={() => setShowSniperModal(false)}
                    className="w-full text-gray-400 font-bold py-3 hover:text-gray-600 transition-colors text-sm"
                  >
                    닫기
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
    </TDSMobileAITProvider>
  );
}

// 배포 강제 트리거
