// src/app/api/braindump/route.ts
import { NextResponse } from "next/server";
import { getAllTasks, saveTask } from "@/lib/dataService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY 환경 변수가 누락되었습니다.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getTodayKST() {
  const now = new Date();
  const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kstTime.toISOString().split("T")[0];
}

export async function POST(request: Request) {
  try {
    const rawUserName = request.headers.get("x-user-name");
    if (!rawUserName)
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    const userName = decodeURIComponent(rawUserName);
    const { text } = await request.json();
    const today = getTodayKST();

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "입력된 텍스트가 없습니다." },
        { status: 400 }
      );
    }

    // 🌟 1. 사용량 체크 (users 메인 문서 하나만 찌름)
    const userRef = doc(db, "users", userName);
    const userSnap = await getDoc(userRef);
    let currentCount = 0;
    let isPremium = false;

    if (userSnap.exists()) {
      const data = userSnap.data();
      isPremium = data.isPremium || false;
      if (data.aiUsage && data.aiUsage.date === today) {
        currentCount = data.aiUsage.count;
      }
    }

    if (!isPremium && currentCount >= 2) {
      return NextResponse.json(
        { error: "무료 제공량(하루 2회) 소진" },
        { status: 403 }
      );
    }

    // 🌟 2. 기존 데이터 가져오기 및 AI용 번호표 세팅
    const allTasks = await getAllTasks(userName);
    const activeTasks = allTasks.filter((t: any) => t.status !== "done");

    const taskMap = new Map();
    const promptTasks = activeTasks.map((t: any, idx: number) => {
      const refId = `T${idx}`;
      taskMap.set(refId, t);
      return { refId, title: t.title, description: t.description || "" };
    });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    // 🌟 3. 스나이퍼 로직 전용 프롬프트 (딱 1개만 리턴)
    const prompt = `
      사용자의 기존 업무 리스트와 새로운 음성 지시를 분석해라.
      [기존 업무 리스트]: ${JSON.stringify(promptTasks)}
      [새로운 음성 지시]: "${text}"
      
      [지시사항 - 스나이퍼 모드]
      사용자가 "지금 당장 해야 할 단 하나의 최우선 과제"를 찾아라.
      1. 기존 업무 중에 있다면 그 업무의 "refId"만 반환해라. (예: {"refId": "T1"})
      2. 기존 업무에 없고 완전히 새로운 업무를 해야 한다면 "refId"를 "NEW"로 하고 title, description을 작성해라. (예: {"refId": "NEW", "title": "...", "description": "..."})
      3. 오직 단 1개의 JSON 객체만 반환해라. 배열 형태가 아니어야 한다.
    `;

    const result = await model.generateContent(prompt);
    let parsedData = JSON.parse(result.response.text());

    let sniperTask;
    let isNewTask = false;

    // 🌟 4. 결과 분석 및 DB 처리 (극강의 최적화)
    if (parsedData.refId === "NEW") {
      isNewTask = true;
      const newTaskObj = {
        id: Date.now(),
        title: parsedData.title || "새로운 몰입 업무",
        description: parsedData.description || "",
        status: "todo",
        time: "10 min",
        progress: 0,
        deadline: "D-Day",
        createdAt: today,
        order: 0, // 맨 위로 올리기
      };
      // 새로 만들었을 때만 DB에 1건 추가!
      sniperTask = await saveTask(userName, newTaskObj);
    } else {
      // 기존 일정 중 하나를 선택했으면 DB 갱신 없이 그냥 꺼내기만 함!
      sniperTask = taskMap.get(parsedData.refId);
      if (!sniperTask) throw new Error("AI가 잘못된 ID를 반환했습니다.");
    }

    // 🌟 5. 카운트 1 올리기 (merge: true로 기존 세팅 보호)
    await setDoc(
      userRef,
      {
        aiUsage: { date: today, count: currentCount + 1 },
      },
      { merge: true }
    );

    // 프론트엔드로 스나이퍼가 픽한 단 1개의 태스크와 신규 여부만 전달
    return NextResponse.json({ sniperTask, isNewTask });
  } catch (error) {
    console.error("Brain Dump Error:", error);
    return NextResponse.json({ error: "서버 처리 실패" }, { status: 500 });
  }
}
