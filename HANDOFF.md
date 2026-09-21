# 과제 3 인수인계

## 목표

docs/ASSIGNMENT.md의 카드 1~5를 충족하는 무로그인 짤·카드 스튜디오. 제출에는 주소 2개·확인 4줄·판단 3줄만 남긴다.

## 현재 상태

편집·미리보기·PNG/JPEG 다운로드·1:1/4:5/9:16·템플릿 CRUD·JSON 백업 복원 구현. Node 18건 및 브라우저 assertion 30건 PASS. 실제 이모지 줄바꿈 결함의 수정 전후 기록 있음. 완성 이미지 3개는 qa에 로컬 보관.

Vercel 공개 배포 완료: https://skt-aleph-project-3-studio.vercel.app

공개 GitHub: https://github.com/PeterAhnn/SKT-ALEPH-Project-3-Studio

최신 배포 검증 기준 커밋: 080d1047577b944727f246b7a313a00e4cf2bd4a. 시스템(기본)/라이트/다크 화면 테마와 OFL 한글 폰트 7종 추가. 기존 기기 글꼴 3종 유지. Node 29건, 로컬 기존 브라우저 검사 30건, 로컬·Vercel 폰트 브라우저 검사 각각 41건 PASS. Vercel에서 새로고침 후 선택 글꼴과 템플릿 복원 확인. 비로그인 브라우저에서 편집기·폰트 안내·전체 커밋 주소 접근 확인. docs/FONTS.md, QA.md, SUBMISSION.md 참고.

사용자 요청으로 Sites에서 Vercel로 이전했다. .openai/hosting.json과 sites Git remote는 과거 배포 기록이므로 이번 프로젝트를 Sites로 다시 배포하지 않는다. 새 배포는 vercel.json을 사용하고 .vercel/project.json의 기존 프로젝트를 재사용한다. 이전 Sites의 저장 자료는 JSON 백업/복원으로 이동한다.

## 실행 명령

`npm start` → http://127.0.0.1:8003. `npm test`. `npm run build`는 public의 앱 파일과 폰트·라이선스를 배포 디렉터리 dist에 복사한다. Vercel은 `npm test && npm run build` 실행 뒤 dist를 배포한다. API 키 불필요.

## 통과 검사

docs/QA.md 참조. 브라우저는 gstack `/browse`를 사용한다. 설치된 Windows 실행 파일은 C:/Users/Administrator/.agents/skills/gstack/browse/dist/browse.exe. 실행 작업 디렉터리는 이 프로젝트 루트. tests/browser.js는 전용 테스트 브라우저 데이터만 변경한다.

## 남은 문제

GitHub CLI의 기존 로그인 만료는 일반 git의 Windows Credential Manager 인증과 별개다. 사용자가 공개 저장소를 만들고 이름 앞 하이픈을 제거한 최종 주소를 알려 주었으며, 일반 git push는 성공했다. origin은 수정된 주소이다. Sites 소스 저장소는 GitHub 제출 URL 대체가 아니다.

사용자가 시스템 기본 테마·수동 전환과 매뉴얼에 맞춘 Vercel 이전을 직접 요청했으므로 해당 실제 판단을 제출 문안에 반영했다. 완성본에 대한 사용자 최종 검토는 아직 기록하지 않았다.

## 다음 행동

사용자의 완성본 확인을 받는다. 소스를 수정하면 관련 검사 후 Vercel 재배포하고 제출 전체 커밋 URL과 공개 접근 검증을 갱신한다. 코드 변경 없이 문서만 정리할 때는 기존 검증 소스 커밋을 유지한다. GitHub 저장소는 Vercel과 연결되어 있다.

## 건드리지 말 것

다른 과제 폴더를 변경하지 않는다. public이 원본이며 빌드 산출물로 삭제하지 않는다. qa 원본은 실제 검사 근거라 조작하지 않는다. 토큰·계정 정보는 저장소나 제출 문안에 넣지 않는다. 세부 기준에는 C02가 없으며 임의의 통과 항목을 만들지 않는다.
