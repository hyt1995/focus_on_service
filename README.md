NEXT_PUBLIC_API_BASE_URL=https://project-a7app.vercel.app

---

// android/app/src/main/AndroidManifest.xml

<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

// 아래 두줄 추가 항상 기억
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|density"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths"></meta-data>
        </provider>
    </application>

    <!-- Permissions -->

    <uses-permission android:name="android.permission.INTERNET" />

</manifest>

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////[Phase 1] 파운데이션: 핵심 UI 및 CRUD (기반 구축)
가장 먼저 사용자가 일정을 입력하고 눈으로 확인하는 단계입니다.

반응형 레이아웃 구현: Next.js + Tailwind를 사용해 제작한 사이트/모바일 가변 레이아웃 적용.

카드 관리 기능 (CRUD): 텍스트/음성으로 카드를 생성하고, 수정 모달(수정, 완료, 진행, 보류) 구현.

5+1 시스템 및 글로우: 리스트 하단 투명도 처리와 첫 번째 카드의 하이라이트 효과 적용.

[Phase 2] 엑션 트리거: 시작과 몰입 (실행 유도)
단순한 '메모장'에서 '행동 유도기'로 넘어가는 핵심 단계입니다. 4. '시작' 버튼 및 경과 시간 로직: 카드 우하단 시작 버튼 구현 및 디데이 대비 경과 시간을 퍼센트로 계산하는 백엔드 로직. 5. 에코 오브 미 (SOS 오디오): 녹음 모듈 구현 및 카드 시작 1분 전 알림과 함께 육성 재생 기능.

[Phase 3] 서바이벌 엔진: 긴박함 조성 (심리 강화)
사용자가 딴짓을 못 하게 뇌를 자극하는 차별화 지점입니다. 6. 리스크 스코어 시스템: 시작 버튼 클릭 지연 시 "지각 확률 40% 상승" 등 부정적 지표를 실시간 계산해 노출. 7. 서바이벌 오버레이: 시작 10분 후 "과거 후회 vs 미래 기쁨" 문구를 보여주는 팝업 및 상태 확인 버튼(하는 중, 이제 시작) 구현.

[Phase 4] 마스터리: 고스트 루틴 (정교화)
계획의 구체성을 높여 '결정 마비'를 완전히 해소하는 단계입니다. 8. 고스트 루틴 프리셋: 샤워, 흡연, 준비 시간 등 반복되는 숨은 시간을 관리하고 일정 역산에 반영. 9. 데이터 히스토리: 내가 작성한 과거의 후회/기쁨 문구들을 DB화하여 서바이벌 오버레이에 랜덤 매칭.

📊 개발 우선순위 및 흐름도
단계 / 기능명 / 핵심 가치 / 개발 난이도

1.  반응형 UI & 카드 / CRUD정보의 가시성 확보 / ★★☆☆☆
2.  시작 & 경과 시간 로직 / 행동의 실시간 추적 / ★★★☆☆
3.  에코 오브 미 (오디오) / 과거의 나를 통한 각성 / ★★★★☆
4.  리스크 스코어 & 팝업 / 생존 본능 자극 / ★★★★☆
5.  고스트 루틴 / 계획의 현실성 극대화 / ★★★☆☆
