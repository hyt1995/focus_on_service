import { db } from "./firebase";
import {
  doc,
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";

/**
 * 💡 최적화 전략:
 * 1. users/{userName} 문서에는 메타 정보만 저장.
 * 2. 실제 데이터는 서브 컬렉션(tasks, routines, calendar)에 개별 문서로 저장.
 * 3. 한 번에 여러 개를 바꿀 때는 writeBatch를 사용하여 네트워크 통신 최소화.
 */

// ==========================================
// 1. 일반 일정(Tasks) 관련 서비스
// ==========================================

// 모든 태스크 가져오기 (order 기준 정렬)
export async function getAllTasks(userName: string) {
  const tasksRef = collection(db, "users", userName, "tasks");
  const q = query(tasksRef, orderBy("order", "asc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// 태스크 단건 저장
// src/lib/dataService.ts 내부의 saveTask 함수 수정
export async function saveTask(userName: string, newTask: any) {
  const taskId = String(newTask.id || Date.now());
  const taskRef = doc(db, "users", userName, "tasks", taskId);

  // 🌟 현재 저장된 태스크 개수를 파악해서 마지막 순서로 배치 (비용 최적화 위해 간단히 처리)
  const existingTasks = await getAllTasks(userName);
  const nextOrder = existingTasks.length;

  const taskData = {
    ...newTask,
    id: taskId,
    order: newTask.order ?? nextOrder, // order가 없으면 마지막 순번 부여
  };

  await setDoc(taskRef, taskData);
  return taskData;
}

// 태스크 단건 수정 (핀셋 업데이트 - 요금 절감 핵심)
export async function updateTask(
  userName: string,
  id: number | string,
  updatedFields: any
) {
  const taskRef = doc(db, "users", userName, "tasks", String(id));
  await updateDoc(taskRef, updatedFields);
  return { id, ...updatedFields };
}

// 태스크 단건 삭제
export async function deleteTask(userName: string, id: number | string) {
  const taskRef = doc(db, "users", userName, "tasks", String(id));
  await deleteDoc(taskRef);
  return true;
}

// 순서 변경 (Batch 처리 - 여러 개를 한 번에 수정해도 요금 효율적)
export async function reorderTasks(userName: string, reorderedTasks: any[]) {
  const batch = writeBatch(db);

  reorderedTasks.forEach((task, index) => {
    const taskRef = doc(db, "users", userName, "tasks", String(task.id));
    batch.update(taskRef, { order: index });
  });

  await batch.commit();
  return reorderedTasks;
}

// 여러 태스크 한 번에 저장 (데일리 루틴 동기화용)
export async function saveMultipleTasks(userName: string, newTasks: any[]) {
  const batch = writeBatch(db);

  newTasks.forEach(task => {
    const taskRef = doc(db, "users", userName, "tasks", String(task.id));
    batch.set(taskRef, task);
  });

  await batch.commit();
  return newTasks;
}

// ==========================================
// 2. 데일리 루틴(Daily Templates) 관련 서비스
// ==========================================

export async function getAllDailyTemplates(userName: string) {
  const routinesRef = collection(db, "users", userName, "routines");
  const querySnapshot = await getDocs(routinesRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function saveDailyTemplate(userName: string, newTemplate: any) {
  const routineId = String(Date.now());
  const routineRef = doc(db, "users", userName, "routines", routineId);

  const data = {
    ...newTemplate,
    id: routineId,
    isEnabled: true,
    createdAt: new Date().toISOString(),
  };

  await setDoc(routineRef, data);
  return data;
}

export async function updateDailyTemplate(
  userName: string,
  id: string | number,
  updatedFields: any
) {
  const routineRef = doc(db, "users", userName, "routines", String(id));
  await updateDoc(routineRef, updatedFields);
  return { id, ...updatedFields };
}

export async function deleteDailyTemplate(
  userName: string,
  id: string | number
) {
  const routineRef = doc(db, "users", userName, "routines", String(id));
  await deleteDoc(routineRef);
  return true;
}
