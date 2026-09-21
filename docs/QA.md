# 과제 3 검증 기록

실행일: 2026-09-21. 주체: AI 에이전트의 Node 검사와 gstack browse Chromium 검사. 사용자 직접 체험으로 기록하지 않는다. 로컬 주소 http://127.0.0.1:8003. 증거 원본은 qa에 로컬 보관하며 제출 문안에는 첨부하지 않는다.

## 실제 결과

- Node 회귀/검증 검사: 18건 PASS. qa/core-before.txt에 17 PASS / 1 FAIL, qa/core-after.txt에 18 PASS.
- 브라우저 검사: qa/browser-results.json, 2026-09-21T05:12:20.640Z, 30개 assertion PASS.
- 위치·크기·색 각각 변경 전후 캔버스 픽셀이 바뀜.
- PNG·JPEG·투명 PNG 읽기 성공. 거부할 파일 입력 전후 작업 JSON과 캔버스가 완전히 동일함.
- 1:1 1080×1080, 4:5 1080×1350, 9:16 1080×1920에서 미리보기와 PNG의 모든 RGBA 픽셀이 같음. JPEG도 세 크기 모두 디코딩 성공. JPEG는 손실 압축이므로 픽셀 완전 동일을 주장하지 않는다.
- 템플릿 3개 생성→첫 번째 불러오기/이름·문구 수정→두 번째 삭제. 수정된 첫 카드와 세 번째 카드 유지.
- 실제 페이지 새로고침 후 qa/reload-result.json에 `수정한 첫 카드`, 목록 `수정됨`, `템플릿 3` 확인.
- JSON 백업→현재 문구 변경→정상 JSON 복원 성공. 손상 문법과 필수 name 누락은 거부되고 이전 저장 문자열이 같음.
- 네트워크 관찰: 외부 출처 리소스 요청 0건. Canvas 읽기 성능 안내 warning 외 앱 오류 없음.
- 390×844 모바일에서 문서 폭 390, 가로 넘침 없음. qa/mobile.png 시각 확인.

## 극단 입력 12건 (C14)

| 번호 | 입력 | 예상값 | 실제 |
|---|---|---|---|
| E01 | `한글문구` 40회, 총 160자 | 내용 보존, PNG 열기, 영역 안 자동 축소 | PASS |
| E02 | `지금은 TEST 2026 / Hello, 안녕! ` 4회 | 한글/영문 혼합 내용 보존 | PASS |
| E03 | 한글/영문 4줄 | 명시적 개행 유지, PNG 열기 | PASS |
| E04 | 가족·하트·피부색·국기 복합 이모지 144자 | 입력 보존, 이모지 한 묶음 줄바꿈 | PASS, 관련 회귀 결함 아래 기록 |
| E05 | 위 문구 빈 문자열 | 아래 문구/배경 유지, PNG 열기 | PASS |
| E06 | 공백 없는 W 160개 | 폭 기준 줄바꿈, 내용 보존 | PASS |
| E07 | 자체 합성 세로 PNG 400×1200 | 불러오기 성공 | PASS |
| E08 | 자체 합성 가로 JPEG 1600×400 | 불러오기 성공 | PASS |
| E09 | 자체 합성 투명 PNG 600×600 | 투명 영역과 배경 합성 | PASS |
| E10 | fake.png 이름의 SVG 문자열 | 이유 표시, 이전 편집/저장 유지 | PASS |
| E11 | 0바이트 JPEG | 빈 파일 거부, 이전 편집/저장 유지 | PASS |
| E12 | 12MB+1바이트 PNG | 크기 초과 거부, 이전 편집/저장 유지 | PASS |

검사 자동화는 문자열 보존과 PNG 디코딩, 파일 거부 시 상태 동일성을 확인한다. 세 비율의 전체 픽셀 비교는 가장자리 정렬 및 두 줄 문구를 넣은 별도 검사에서 수행했다. 자동 검사가 사람이 읽기 좋은 디자인까지 보증하지 않는다.

## 실제 대표 결함 전후 (C15)

E04의 가족 이모지 `👨‍👩‍👧‍👦`를 두 번 이어 붙인 동일 입력으로 core의 wrapText 회귀 검사를 실행했다. 폭 측정은 코드포인트당 1단위, 사용 폭 8단위의 결정적 대체 측정기다. 이는 브라우저 스크린샷 검사가 아닌 줄바꿈 알고리즘 단위 검사이다.

- 수정 전 실제 FAIL: `Array.from`이 이모지 결합 시퀀스를 분해하여 첫 줄 끝에 다음 가족의 `👨`, 둘째 줄 시작에 결합 문자 `‍`가 남음.
- 수정: `Intl.Segmenter('ko', {granularity:'grapheme'})`로 사용자에게 보이는 문자 묶음 단위로 분리.
- 동일 입력 수정 후 실제 PASS: 각 줄에 온전한 가족 이모지 하나씩.
- 추가 브라우저 E04 PASS: 복합 이모지 입력이 저장에 보존되고 PNG 정상 생성.

## 완성본과 공개 안전

완성 이미지 3개, 메타데이터 검사와 제작 근거는 ASSETS.md. 세 PNG를 실제로 열어 시각 확인했다. 공개 소스 public의 이메일·휴대전화·일반 토큰 패턴 검색에서 일치 0건. 화면 문구와 정적 코드를 직접 확인했으며 외부 분석·원격 API·비밀값이 없다. qa와 tests 및 docs는 편집기 배포 디렉터리에 포함하지 않는다.

## 공개 배포 재검증

2026-09-21, Sites 배포 성공. 결과물: https://jjal-card-studio-aleph.ahs3810.chatgpt.site

배포와 GitHub 소스 기준 커밋: dda2b9f82703db7616b2428744725a5736dbe8db. `git ls-remote`로 실제 원격 커밋 확인. 배포는 이 커밋의 public 4개 파일을 그대로 dist에 복사한 결과다. 이후 문서 정리 커밋은 배포 코드를 변경하지 않는다.

C01 PASS: 기존 browse를 종료한 뒤 새 headless Chromium의 비영구 격리 BrowserContext(시크릿에 해당)를 생성했다. 저장된 로그인·쿠키·인증 헤더를 가져오지 않았다. 결과물 HTTP 200, 편집기와 입력 도구 표시 확인. 소스 전체 커밋 URL도 로그인하지 않은 상태에서 커밋 제목과 변경 파일을 확인했다. GitHub 로그인 링크가 남아 있어 비로그인 상태를 확인했다. 실제 GUI 시크릿 창을 수동으로 클릭한 검사가 아니라 자동 격리 컨텍스트 검사임을 구분한다.

qa/public-browser-results.json: 배포 환경 브라우저 assertion 30건 전부 PASS. qa/public-reload-result.json: 실제 새로고침 뒤 수정/삭제 결과 유지. qa/public-source-access.json: 전체 커밋 URL·페이지 제목·로그아웃 상태. qa/public-desktop.png: 공개 편집기 첫 화면. 검증 중 생성한 데이터는 해당 격리 테스트 브라우저 안에만 있으며 사이트에 업로드되지 않는다.

Sites 기본 패키징 스크립트는 이 Windows의 bash 실행 파일 부재로 실행되지 않았다. 같은 패키지의 prepare-site-build.cjs로 정적 출력 및 manifest를 검증·정규화한 후 Windows tar로 dist만 묶었다. 아카이브 목록을 확인했고 Sites가 정적 파일 5개를 받아 배포 성공했다.

## 아직 완료로 표시하지 않는 항목

- C32: 2026-09-21 후속 요청에서 사용자가 시스템 기본 테마·수동 전환·Vercel 배포를 직접 결정했다. Sites 배포를 수정하도록 요청한 사실을 포함해 SUBMISSION.md의 실제 판단 세 줄을 작성했다.
- C27: 자체 제작의 구현 근거는 기록했으나 사용자의 최종 완성본 확인은 아직 받지 않았다.

완주와 제출 준비를 구분한다. 최종 완성본 사용자 검토가 미완료인 동안 과제 전체 완주로 표시하지 않는다.

## 후속 변경 — 다크 테마와 Vercel 이전

2026-09-21: 시스템(기본)/라이트/다크 테마, 선택 유지, 시스템 변화 반영. UI 전환 전후 카드 PNG 데이터 동일. Node 검사 25건 PASS. 실제 Vercel 배포 https://skt-aleph-project-3-studio.vercel.app 에서 30개 브라우저 assertion PASS. 세 비율 PNG 픽셀 일치와 템플릿/JSON 검사 포함. 새 비로그인 격리 Chromium에서 결과물 및 전체 커밋 소스 URL 접근 확인. 기준 커밋 b037f9cb28554d8f6b59adaab032f67c3f5b11d3. 상세 근거 및 테스트 구분은 DEPLOYMENT.md.

## 후속 변경 — 무료 한글 폰트 7종

2026-09-21: 공식 배포본과 OFL 1.1 고지를 함께 포함했다. 선정 근거·파일·원본 리비전은 FONTS.md. Node 검사 29건 PASS. 로컬 전용 브라우저(127.0.0.1:8005)에서 fonts-browser.js 41건 PASS, 기존 browser.js 30건 PASS. 원본은 qa/fonts-browser-results.json, qa/fonts-regression-results.json.

7종 각각 실제 FontFace 로드, 세 화면비 PNG 전체 픽셀 일치, JPEG 디코딩을 확인했다. 폰트 전송 실패를 주입했을 때 이전 글꼴·저장 JSON·캔버스가 보존되었다. 템플릿과 JSON의 새 폰트 ID 복원도 통과했다. 실제 새로고침 후 나눔손글씨 펜 로드와 템플릿 1개 유지 확인. qa/fonts-contact.png의 7종 글자 모양을 시각 확인했다. 폰트 검사의 첫 실패는 공백이 있는 FontFace.family가 따옴표로 직렬화되는 검사 코드 문제였으며 실제 폰트 로드는 성공했다. 비교 시 따옴표를 정규화한 뒤 전체 재검사했다.

Vercel 공개 재검증: 코드 커밋 080d1047577b944727f246b7a313a00e4cf2bd4a, 배포 dpl_2SceWnD8xChYxWx1TGAZXoHTEk7o READY. 공개 도메인에서 폰트 브라우저 검사 41건 PASS(qa/public-fonts-results.json). 실제 새로고침 후 나눔손글씨 펜 로드 완료·다운로드 활성·기존 2개와 추가 1개의 템플릿 유지(qa/public-fonts-reload.json). 비로그인 browse 컨텍스트에서 편집기, /fonts/licenses.html, GitHub 전체 커밋의 제목과 로그인 링크를 확인했다. 이번 확인은 기존 격리 QA 컨텍스트를 재사용했으며 새 시크릿 생성 검사와 구분한다.

## 후속 변경 — 백업·가져오기 흐름

2026-09-21: 상단의 JSON 버튼을 내 템플릿 영역으로 이동했다. 「작업 백업 다운로드」「백업 파일 가져오기」로 표시하고 .json은 설명에 남겼다. 파일 전체 검증 후 이름·개수·문구·화면비와 전체 교체 안내를 보여준다. 확인 단계에서는 저장하지 않으며 「이 내용으로 복원」을 눌러야 적용한다. 오류는 같은 영역에서 거부 이유와 기존 작업 보존을 안내한다.

로컬 검사: Node 29건 PASS, 기존 편집 검사 30건 PASS(qa/backup-regression-local.json), 폰트 검사 41건 PASS(qa/backup-fonts-local.json). 새 흐름 12건 PASS(qa/backup-flow-local.json): 위치, 선택만으로 무변경, 복원 요약, 이름의 HTML 비실행, 교체 안내·포커스, 취소 보존, 손상 거부·이전 후보 해제, 오래된 후보 적용 불가, 필수 누락 거부, 저장 공간 오류 보존, 명시적 전체 복원, 템플릿 0개 표시. 저장 실패는 Storage.setItem 오류를 실제 주입해 확인했다. 라이트와 390×844 다크 화면을 시각 확인했고 문서 폭 390px로 가로 넘침이 없었다. qa/backup-panel-light.png, qa/backup-panel-mobile-dark.png 보관.

Vercel 배포 dpl_Dv5usdA5T5hNPyfL6CPDg3gDgu6N READY, 코드 커밋 970fd17617562627a1840b36d45208069fa3e5e9. 공개 도메인에서 같은 새 흐름 12건 PASS(qa/backup-flow-public.json). 실제 새로고침 뒤 복원 문구·템플릿 2개 유지, 미적용 확인 화면은 닫힘(qa/backup-reload-public.json). 비로그인 격리 QA 컨텍스트를 재사용하여 공개 편집기와 전체 GitHub 커밋 제목·로그인 링크를 확인했다.
