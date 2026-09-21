# Vercel 배포와 테마

2026-09-21 사용자 요청: 시스템 기본 테마, 라이트/다크 전환, 매뉴얼에 따른 배포 서비스 이용.

## 매뉴얼 확인

https://aleph-omega.vercel.app/manual/student-free 의 v6(2026-09-18), 제2부를 gstack browse로 확인했다. 화면이 있는 결과물은 Vercel, 서버 데이터 저장은 Supabase, 상시/예약 실행은 적합한 서버 서비스로 안내한다. Railway는 예시이며 무료 조건을 확인하고 유료 전환은 하지 않는다.

현재 T03은 브라우저에서 처리·보관하는 정적 편집기이므로 Vercel을 선택한다. 서버 DB나 예약 실행 기능은 이번 요청에 추가하지 않는다. 이전 Sites 주소는 이전 버전이며 앞으로의 기준 배포는 Vercel로 전환한다.

## 설정

- GitHub: https://github.com/PeterAhnn/SKT-ALEPH-Project-3-Studio
- Framework: Other (`framework: null`). Root Directory: 저장소 최상위.
- Build Command: `npm test && npm run build`
- Output Directory: `dist`
- 환경변수와 외부 API 키 없음.
- 원본 public의 6개 파일만 배포. qa·docs·Sites 설정·로컬 도구 자료는 .vercelignore로 업로드 제외.
- 공개 production 주소에서 로그인 없는 접근 확인 후 SUBMISSION.md 갱신.

## 테마 동작

상단 화면 테마 선택: 시스템(기본) / 라이트 / 다크. 설정은 `jjal-studio-theme`로 브라우저에 보관하며 템플릿/작업 JSON과 분리한다. 시스템 선택 시 `prefers-color-scheme`의 실시간 변경을 따른다. 수동 선택은 시스템보다 우선한다. 다른 탭의 테마 변경과 저장 데이터 삭제도 반영한다. 저장이 차단돼도 현재 화면 전환은 가능하며 다음 방문에 기억되지 않음을 알린다.

첫 CSS 표시 전에 저장된 설정을 적용해 라이트 화면이 먼저 깜박이는 것을 방지한다. UI 테마는 캔버스·편집 문구·다운로드 파일을 변경하지 않는다.

## 확인 결과

- Node 검사 25건 PASS(기존 18건 + 테마 7건).
- 시스템 light/dark 초기값과 운영체제 변경 이벤트는 격리된 단위 환경에서 재현했다.
- 실제 Chromium의 기본 시스템(light) 일치, 다크/라이트 수동 선택, 새로고침 유지, 시스템으로 돌아가기 PASS.
- 테마 전환 직전/직후 PNG 데이터 동일. 편집/템플릿 브라우저 회귀 assertion 30건 PASS: qa/theme-regression.json.
- 다크 데스크톱 및 390px 모바일 스크린샷 확인, 가로 넘침 없음.

## 계정 상태

Vercel 연결 도구의 peter-ahns-projects 접근은 403 권한 오류. 공식 CLI 59.23.2 설치 및 로그인 요청 진행 중이다. 이 상태는 자동 승인 거절이 아니라 Vercel 계정 인증 문제다. 로그인 토큰은 저장소나 문서에 보관하지 않는다.
