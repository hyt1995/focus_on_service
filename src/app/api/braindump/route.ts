// /src/app/api/braindump/route.ts

import { NextResponse } from "next/server";
import { getAllTasks, reorderTasks } from "@/lib/dataService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY 환경 변수가 누락되었습니다.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    const now = new Date();
    const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const today = kstTime.toISOString().split("T")[0];

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "입력된 텍스트가 없습니다." },
        { status: 400 }
      );
    }

    const usageRef = doc(db, "users_usage", userName);
    const usageSnap = await getDoc(usageRef);
    let currentCount = 0;
    let isPremium = false;

    if (usageSnap.exists()) {
      const data = usageSnap.data();
      isPremium = data.isPremium || false;
      if (data.date === today) currentCount = data.count;
    }

    if (!isPremium && currentCount >= 2) {
      return NextResponse.json(
        { error: "무료 제공량(하루 2회) 소진" },
        { status: 403 }
      );
    }

    // 1. 기존 데이터 가져오기
    const allTasks = await getAllTasks(userName);
    const activeTasks = allTasks.filter((t: any) => t.status !== "done");
    const doneTasks = allTasks.filter((t: any) => t.status === "done");

    // 🌟 [핵심 수술] AI가 헷갈리지 않게 짧은 임시 번호표(refId) 부여
    const taskMap = new Map();
    const promptTasks = activeTasks.map((t: any, idx: number) => {
      const refId = `T${idx}`;
      taskMap.set(refId, t); // 원본은 금고(Map)에 안전하게 보관
      return { refId, title: t.title }; // AI한테는 번호표와 제목만 줌
    });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    // 🌟 프롬프트 극단적 단순화
    const prompt = `
      사용자의 기존 업무 리스트와 새로운 음성 지시를 보고, 지금 당장 먼저 해야 할 순서대로 배열을 재정렬해라.

      [기존 업무 리스트]:
      ${JSON.stringify(promptTasks)}

      [새로운 음성 지시]: 
      "${text}"

      [지시사항]
      1. 기존 업무는 "refId" 값만 반환해라.
      2. 완전히 새로운 업무가 추가되어야 한다면 "refId"를 "NEW"로 하고 title, description을 작성해라.
      3. 가장 시급한 것이 배열 맨 위에 오게 해라.
      4. JSON 형식으로만 응답해라.

      [응답 예시]
      [
        { "refId": "T1" },
        { "refId": "T0" },
        { "refId": "NEW", "title": "새로운 음성 업무", "description": "내용 요약" }
      ]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let parsedTasks;
    try {
      parsedTasks = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json({ error: "AI 응답 파싱 실패" }, { status: 500 });
    }

    // 🌟 [핵심 수술 2] 번호표를 보고 금고에서 원본 데이터를 꺼내서 재조립
    const finalActiveTasks: any[] = [];

    parsedTasks.forEach((item: any, index: number) => {
      if (item.refId === "NEW") {
        // 새 업무 추가
        finalActiveTasks.push({
          id: Date.now() + index,
          title: item.title || "새 업무",
          description: item.description || "",
          status: "todo",
          time: "10 min",
          progress: 0,
          deadline: "D-Day",
          createdAt: today,
        });
      } else {
        // 기존 업무 원본 복원 (데이터 변조 확률 0%)
        const original = taskMap.get(item.refId);
        if (original) {
          finalActiveTasks.push(original);
          taskMap.delete(item.refId); // 꺼낸 건 금고에서 지움
        }
      }
    });

    // AI가 실수로 누락한 원본이 있다면 맨 밑에 붙여줌
    taskMap.forEach(original => {
      finalActiveTasks.push(original);
    });

    // 완료된 데이터랑 합쳐서 저장
    const finalTasks = [...finalActiveTasks, ...doneTasks];

    await setDoc(
      usageRef,
      { date: today, count: currentCount + 1, isPremium: isPremium },
      { merge: true }
    );

    const updatedTasks = await reorderTasks(userName, finalTasks);
    return NextResponse.json(updatedTasks);
  } catch (error) {
    console.error("Brain Dump Error:", error);
    return NextResponse.json({ error: "서버 처리 실패" }, { status: 500 });
  }
}
