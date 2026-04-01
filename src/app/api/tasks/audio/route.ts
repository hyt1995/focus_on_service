// src/app/api/tasks/audio/route.ts
import { NextResponse } from "next/server";
// 경로 주의: audio 폴더가 한 뎁스 더 깊으므로 ../ 가 4개입니다.
import { updateTask } from "../../../../lib/dataService";

export async function POST(request: Request) {
  try {
    // 1. 헤더에서 유저 이름 추출 (updateTask에 필수)
    const rawUserName = request.headers.get("x-user-name");
    if (!rawUserName) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }
    const userName = decodeURIComponent(rawUserName);

    // 2. 클라이언트에서 보낸 id와 base64 음성 데이터 받기
    const { id, audioData } = await request.json();

    // 3. 파일 저장(saveAudioFile) 로직을 폐기하고,
    // base64 문자열 자체를 Firestore의 audioPath 필드에 직접 꽂아 넣습니다.
    await updateTask(userName, id, { audioPath: audioData });

    return NextResponse.json({ audioPath: audioData });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
