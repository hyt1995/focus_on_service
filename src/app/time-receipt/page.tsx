"use client";

import Receipt from "@/components/Receipt";

export default function TimeReceiptPage() {
  const data = {
    name: "영탁",
    date: "2026-04-05",
    startTime: "10:00",

    comment: "오늘은 집중은 했는데, 완벽하진 않았다",

    schedule: [
      "10:00 출근 및 커피",
      "10:30 스프린트 회의",
      "11:30 API 설계",
      "14:00 프론트 개발",
      "16:00 버그 수정",
      "18:30 퇴근",
    ],

    completed: [
      "스프린트 회의 참여",
      "로그인 API 구현",
      "UI 레이아웃 80% 완료",
      "버그 3개 해결",
    ],

    incomplete: ["에러 핸들링 정리", "리팩토링", "테스트 코드 작성"],

    expenses: [
      { title: "아메리카노", price: 4500 },
      { title: "점심 식사", price: 12000 },
      { title: "편의점 간식", price: 3000 },
      { title: "저녁", price: 15000 },
    ],

    image: "/sunset.jpg",
    barcode: "202604051023451234",
  };

  return (
    <main style={{ padding: 40 }}>
      <Receipt data={data} />
    </main>
  );
}
