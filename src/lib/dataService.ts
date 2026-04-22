// /src/lib/dataService.ts

import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// 유저별 고유 문서(Document) 참조를 가져오는 헬퍼 함수
const getUserDoc = (userName: string) => doc(db, "users", userName);

// ==========================================
// 1. 일반 일정(Tasks) 관련 서비스
// ==========================================

export async function getAllTasks(userName: string) {
  const docSnap = await getDoc(getUserDoc(userName));
  if (docSnap.exists()) {
    return docSnap.data().tasks || [];
  }
  return [];
}

export async function saveTask(userName: string, newTask: any) {
  const tasks = await getAllTasks(userName);
  const taskWithUser = { ...newTask, userName };
  tasks.push(taskWithUser);

  // 🔥 { merge: true } 추가: 다른 데이터(데일리 루틴 등) 절대 보호
  await setDoc(getUserDoc(userName), { tasks }, { merge: true });
  return taskWithUser;
}

export async function saveMultipleTasks(userName: string, newTasks: any[]) {
  const existingTasks = await getAllTasks(userName);
  const tasksWithUser = newTasks.map(t => ({ ...t, userName }));
  const updatedTasks = [...existingTasks, ...tasksWithUser];

  // 🔥 { merge: true } 추가
  await setDoc(getUserDoc(userName), { tasks: updatedTasks }, { merge: true });
  return updatedTasks;
}

export async function deleteTask(userName: string, id: number) {
  const tasks = await getAllTasks(userName);
  const filtered = tasks.filter((t: any) => t.id !== id);

  // 🔥 { merge: true } 추가
  await setDoc(getUserDoc(userName), { tasks: filtered }, { merge: true });
  return true;
}

export async function updateTask(
  userName: string,
  id: number | string,
  updatedFields: any
) {
  const tasks = await getAllTasks(userName);
  const index = tasks.findIndex((t: any) => String(t.id) === String(id));

  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updatedFields };
    // 🔥 { merge: true } 추가
    await setDoc(getUserDoc(userName), { tasks }, { merge: true });
    return tasks[index];
  }
  return null;
}

export async function reorderTasks(userName: string, reorderedTasks: any[]) {
  const tasksWithUser = reorderedTasks.map(t => ({ ...t, userName }));
  // 🔥 { merge: true } 추가: 여기서 데일리 루틴이 날아가던 버그 원천 차단
  await setDoc(getUserDoc(userName), { tasks: tasksWithUser }, { merge: true });
  return tasksWithUser;
}

// ==========================================
// 2. 데일리 루틴(Daily Templates) 관련 서비스
// ==========================================

export async function getAllDailyTemplates(userName: string) {
  const docSnap = await getDoc(getUserDoc(userName));
  if (docSnap.exists()) {
    return docSnap.data().daily_templates || [];
  }
  return [];
}

export async function saveDailyTemplate(userName: string, newTemplate: any) {
  const templates = await getAllDailyTemplates(userName);
  const templateWithUser = {
    ...newTemplate,
    id: Date.now().toString(),
    userName,
    isEnabled: true,
    createdAt: new Date().toISOString(),
  };
  templates.push(templateWithUser);

  await setDoc(
    getUserDoc(userName),
    { daily_templates: templates },
    { merge: true }
  );
  return templateWithUser;
}

export async function updateDailyTemplate(
  userName: string,
  id: string | number,
  updatedFields: any
) {
  const templates = await getAllDailyTemplates(userName);
  const index = templates.findIndex((t: any) => String(t.id) === String(id));

  if (index !== -1) {
    templates[index] = { ...templates[index], ...updatedFields };
    await setDoc(
      getUserDoc(userName),
      { daily_templates: templates },
      { merge: true }
    );
    return templates[index];
  }
  return null;
}

export async function deleteDailyTemplate(
  userName: string,
  id: string | number
) {
  const templates = await getAllDailyTemplates(userName);
  const filtered = templates.filter((t: any) => String(t.id) !== String(id));

  await setDoc(
    getUserDoc(userName),
    { daily_templates: filtered },
    { merge: true }
  );
  return true;
}
