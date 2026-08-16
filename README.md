# 보드게임 동아리 운영 앱

카카오톡으로 하던 모임 시간 투표 / 보드게임 투표 / 공지를 대체하는 웹앱입니다. 회원은 로그인 없이 링크만으로 참여하고, 회장은 PIN으로 관리자 페이지에 접근합니다.

## 기술 스택

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite (로컬 개발)
- 관리자 인증: PIN 기반 세션 쿠키 (회원 인증 없음)

## 로컬 개발

```bash
npm install
cp .env.example .env   # DATABASE_URL, ADMIN_PIN 값을 채워주세요
npx prisma migrate dev
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다. `/admin`에서 `.env`의 `ADMIN_PIN` 값으로 로그인합니다.

## 폴더 구조

```
src/
  app/
    page.tsx              # 홈 (진행 중인 투표 + 최근 공지)
    poll/[id]/             # 투표 참여/결과 (회원용)
    notice/                # 공지 목록
    admin/                  # PIN 로그인 + 투표·공지 관리
  components/               # 공용 UI 컴포넌트
  lib/                       # prisma client, 인증, 투표 집계 로직
prisma/
  schema.prisma
```

## 핵심 동작

- **모임 시간 투표**: 관리자가 후보 시간을 여러 개 등록하면 회원은 복수 선택으로 참여합니다. 마감 시각이 지나거나 관리자가 수동으로 마감하면 자동으로 "마감" 상태가 되고 최다 득표 항목이 강조됩니다.
- **보드게임 투표**: 후보 게임 중 하나만 선택하는 단일 투표이며, 득표순으로 정렬되어 표시됩니다.
- **동일 기기 재투표**: 회원은 이름 없이도 브라우저 쿠키(기기)로 식별되어, 같은 기기에서 다시 접속하면 기존 투표를 수정하거나 취소할 수 있습니다. 완벽한 본인확인은 지원하지 않습니다.
- **공지사항**: 고정 공지를 상단에 노출하고, "링크 복사" 버튼으로 카카오톡 공유를 돕습니다.

## Vercel 배포 가이드

### 1. Vercel CLI 설치 및 로그인

```bash
npm i -g vercel
vercel login
vercel link
```

### 2. 프로덕션 데이터베이스 준비

SQLite 파일은 Vercel의 서버리스 환경에 영구 저장되지 않으므로, 배포 전 반드시 별도 DB로 전환해야 합니다. Neon Postgres(Vercel Marketplace 통합, 권장) 또는 Turso(libSQL, SQLite와 호환성이 높음) 중 선택하세요.

**Neon Postgres 사용 시 (권장)**

```bash
vercel integration add neon
vercel env pull --yes   # DATABASE_URL이 자동으로 채워집니다
```

`prisma/schema.prisma`의 datasource provider를 변경합니다.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

기존 SQLite용 마이그레이션 히스토리(`prisma/migrations`)를 삭제하고 Postgres 기준으로 새로 생성합니다.

```bash
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

**Turso 사용 시**

```bash
vercel integration add turso
```

Turso는 Prisma와 driver adapter(`@prisma/adapter-libsql`) 연결이 필요합니다. [Prisma Turso 가이드](https://www.prisma.io/docs/orm/overview/databases/turso)를 참고해 `schema.prisma`와 `src/lib/prisma.ts`를 조정하세요.

### 3. 환경변수 설정

Vercel 대시보드 또는 CLI로 다음 값을 프로덕션에 설정합니다.

```bash
vercel env add ADMIN_PIN production
```

`DATABASE_URL`은 위 2단계의 marketplace 통합이 자동으로 채워줍니다.

### 4. 배포

```bash
vercel deploy --prod
```

배포 후 `/admin`에서 설정한 PIN으로 로그인해 투표·공지를 생성하고, 발급된 `/poll/[id]` 링크를 카카오톡으로 공유하세요.
