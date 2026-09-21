# 과제 3 인수인계

## 목표

docs/ASSIGNMENT.md의 카드 1~5를 충족하는 무로그인 짤·카드 스튜디오. 제출에는 주소 2개·확인 4줄·판단 3줄만 남긴다.

## 현재 상태

편집·미리보기·PNG/JPEG 다운로드·1:1/4:5/9:16·템플릿 CRUD·JSON 백업 복원 구현. 현재 검증 수치는 아래 최신 배포 상태를 따른다. 실제 이모지 줄바꿈 결함의 수정 전후 기록 있음. 완성 이미지 3개는 qa에 로컬 보관.

Vercel 공개 배포 완료: https://skt-aleph-project-3-studio.vercel.app

공개 GitHub: https://github.com/PeterAhnn/SKT-ALEPH-Project-3-Studio

최신 배포 검증 기준 커밋: 757e14a97d9121bc6e994561a35477414e67c5e9. IndexedDB 이미지 중복 제거·원자적 저장, 무손실 PNG 정규화, JSON v2와 v1 호환, 이전 자료 자동 이전/원본 보존, 손상 원본 다운로드, 모바일 핵심 입력 우선 배치, 실제 글자 크기·가독성 경고를 구현했다. Node 33건 PASS. 공개 Vercel에서 편집 30건·폰트 41건·백업 12건·큰 사진 및 반복 복원 13건 PASS. 새 비로그인 격리 브라우저에서 결과물·전체 커밋 공개 접근을 확인했다. 새로고침 후 큰 사진·템플릿 3개 유지. 로컬 이전/복구/이미지 경계 검증은 docs/STORAGE.md, QA.md 참조.

사용자 요청으로 Sites에서 Vercel로 이전했다. .openai/hosting.json과 sites Git remote는 과거 배포 기록이므로 이번 프로젝트를 Sites로 다시 배포하지 않는다. 새 배포는 vercel.json을 사용하고 .vercel/project.json의 기존 프로젝트를 재사용한다. 이전 Sites의 저장 자료는 JSON 백업/복원으로 이동한다.

## 실행 명령

`npm start` → http://127.0.0.1:8003. `npm test`. `npm run build`는 public의 앱 파일과 폰트·라이선스를 배포 디렉터리 dist에 복사한다. Vercel은 `npm test && npm run build` 실행 뒤 dist를 배포한다. API 키 불필요.

## 통과 검사

docs/QA.md 참조. 브라우저는 gstack `/browse`를 사용한다. 설치된 Windows 실행 파일은 C:/Users/Administrator/.agents/skills/gstack/browse/dist/browse.exe. 실행 작업 디렉터리는 이 프로젝트 루트. tests/browser.js는 전용 테스트 브라우저 데이터만 변경한다.

## 남은 문제

GitHub CLI의 기존 로그인 만료는 일반 git의 Windows Credential Manager 인증과 별개다. 사용자가 공개 저장소를 만들고 이름 앞 하이픈을 제거한 최종 주소를 알려 주었으며, 일반 git push는 성공했다. origin은 수정된 주소이다. Sites 소스 저장소는 GitHub 제출 URL 대체가 아니다.

사용자가 시스템 기본 테마·수동 전환과 매뉴얼에 맞춘 Vercel 이전을 직접 요청했으므로 해당 실제 판단을 제출 문안에 반영했다. 2026-09-21 사용자가 모든 검사를 직접 수행했고 최종 완성 이미지를 확인했다고 전달했다. 직접 검사와 최종 확인 완료를 보고서·제출 문안·QA·이미지 제작 기록에 반영했다.

## 다음 행동

제출 문안 docs/SUBMISSION-READY.txt를 해당 입력란에 복사하면 된다. 실제 제출 버튼은 누르지 않았다. 소스를 수정하면 관련 검사 후 Vercel 재배포하고 제출 전체 커밋 URL과 공개 접근 검증을 갱신한다. 코드 변경 없이 문서만 정리할 때는 기존 검증 소스 커밋을 유지한다. GitHub 저장소는 Vercel과 연결되어 있다.

## 제출 준비 결과 — 2026-09-21

최신 학생용 매뉴얼 v6를 확인하고 공통 가이드·템플릿의 제출 규칙을 동기화했다. T03은 주소 두 개·확인 4줄·판단 3줄을 제출한다. docs/SUBMISSION.md와 SUBMISSION-READY.txt가 해당 내용이며, 검증된 앱의 전체 커밋 URL을 유지했다.

별도 보관용 보고서: docs/VERIFICATION-REPORT.md 및 output/pdf/T03-verification-report.pdf(5쪽). 기준별 근거, 12개 극단 입력, 동일 E04 입력의 구 알고리즘 재구성 FAIL/현재 PASS, 후속 수정 다섯 건, 완성 이미지 세 개를 포함한다. PDF는 플랫폼 허용 형식이지만 T03 필수 첨부로 추가하지 않는다. Node 33건을 다시 확인했고 공개 96건 및 로컬 14건의 실제 기록을 대조했다. 자동 검사 기록과 별개로 학생 본인의 직접 전체 검사·최종 이미지 확인 완료를 기록했다.

## 건드리지 말 것

다른 과제 폴더를 변경하지 않는다. public이 원본이며 빌드 산출물로 삭제하지 않는다. qa 원본은 실제 검사 근거라 조작하지 않는다. 토큰·계정 정보는 저장소나 제출 문안에 넣지 않는다. 세부 기준에는 C02가 없으며 임의의 통과 항목을 만들지 않는다.
