# 과제 3 인수인계

## 목표

docs/ASSIGNMENT.md의 카드 1~5를 충족하는 무로그인 짤·카드 스튜디오. 제출에는 주소 2개·확인 4줄·판단 3줄만 남긴다.

## 현재 상태

편집·미리보기·PNG/JPEG 다운로드·1:1/4:5/9:16·템플릿 CRUD·JSON 백업 복원 구현. Node 18건 및 브라우저 assertion 30건 PASS. 실제 이모지 줄바꿈 결함의 수정 전후 기록 있음. 완성 이미지 3개는 qa에 로컬 보관.

Sites 공개 배포 완료: https://jjal-card-studio-aleph.ahs3810.chatgpt.site

공개 GitHub: https://github.com/PeterAhnn/SKT-ALEPH-Project-3-Studio

배포 기준 커밋: dda2b9f82703db7616b2428744725a5736dbe8db. 공개 편집기 및 전체 커밋 주소의 새 비로그인 격리 브라우저 확인 완료. .openai/hosting.json의 project_id를 재사용하고 새로 생성하지 않는다. 최종 검사 기록은 QA.md, 제출 문안은 SUBMISSION.md.

## 실행 명령

`npm start` → http://127.0.0.1:8003. `npm test`. `npm run build`는 원본 public 4개 파일을 배포 디렉터리 dist에 복사한다.

## 통과 검사

docs/QA.md 참조. 브라우저는 gstack `/browse`를 사용한다. 설치된 Windows 실행 파일은 C:/Users/Administrator/.agents/skills/gstack/browse/dist/browse.exe. 실행 작업 디렉터리는 이 프로젝트 루트. tests/browser.js는 전용 테스트 브라우저 데이터만 변경한다.

## 남은 문제

GitHub CLI의 기존 로그인 만료는 일반 git의 Windows Credential Manager 인증과 별개다. 사용자가 공개 저장소를 만들고 이름 앞 하이픈을 제거한 최종 주소를 알려 주었으며, 일반 git push는 성공했다. origin은 수정된 주소이다. Sites 소스 저장소는 GitHub 제출 URL 대체가 아니다.

사용자의 실제 판단 2줄과 완성본 검토가 아직 없다. 대신 지어 쓰지 않는다.

## 다음 행동

사용자의 직접 판단·AI 제안을 따르지 않은 실제 이유·완성본 확인을 받아 SUBMISSION.md를 확정한다. 소스를 수정하면 관련 검사 후 재배포하고 제출 전체 커밋 URL과 공개 접근 검증을 갱신한다. 코드 변경 없이 문서만 정리할 때는 기존 배포 기준 커밋을 유지한다.

## 건드리지 말 것

다른 과제 폴더를 변경하지 않는다. public이 원본이며 빌드 산출물로 삭제하지 않는다. qa 원본은 실제 검사 근거라 조작하지 않는다. 토큰·계정 정보는 저장소나 제출 문안에 넣지 않는다. 세부 기준에는 C02가 없으며 임의의 통과 항목을 만들지 않는다.
