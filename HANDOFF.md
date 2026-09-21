# 과제 3 인수인계

## 목표

docs/ASSIGNMENT.md의 카드 1~5를 충족하는 무로그인 짤·카드 스튜디오. 제출에는 주소 2개·확인 4줄·판단 3줄만 남긴다.

## 현재 상태

편집·미리보기·PNG/JPEG 다운로드·1:1/4:5/9:16·템플릿 CRUD·JSON 백업 복원 구현. Node 18건 및 브라우저 assertion 30건 PASS. 실제 이모지 줄바꿈 결함의 수정 전후 기록 있음. 완성 이미지 3개는 qa에 로컬 보관.

Sites 등록 완료. .openai/hosting.json의 project_id를 재사용하고 새로 생성하지 않는다. 현재 공개 배포와 GitHub 소스 준비는 진행 중이며 완료 상태는 QA.md와 SUBMISSION.md를 다시 확인한다.

## 실행 명령

`npm start` → http://127.0.0.1:8003. `npm test`. 정적 공개 디렉터리 public, 빌드 불필요.

## 통과 검사

docs/QA.md 참조. 브라우저는 gstack `/browse`를 사용한다. 설치된 Windows 실행 파일은 C:/Users/Administrator/.agents/skills/gstack/browse/dist/browse.exe. 실행 작업 디렉터리는 이 프로젝트 루트. tests/browser.js는 전용 테스트 브라우저 데이터만 변경한다.

## 남은 문제

GitHub CLI의 기존 로그인 만료. 연결 GitHub 도구는 PeterAhnn 계정의 기존 저장소 접근은 가능하나 새 저장소 생성 기능이 없다. 사용자에게 빈 공개 저장소 SKT-ALEPH-Project-3-Studio 주소를 요청했다. 실제 소스 게시 전 전체 커밋 URL을 만들지 않는다. Sites 소스 저장소는 GitHub 제출 URL 대체가 아니다.

사용자의 실제 판단 2줄과 완성본 검토가 아직 없다. 대신 지어 쓰지 않는다.

## 다음 행동

공개 편집기 배포→새 시크릿 접근 확인→GitHub 소스 게시→검증한 배포 코드와 같은 전체 커밋 URL 확인→SUBMISSION.md 확정. 각 항목의 실제 완료 여부를 기록한다.

## 건드리지 말 것

다른 과제 폴더를 변경하지 않는다. public이 원본이며 빌드 산출물로 삭제하지 않는다. qa 원본은 실제 검사 근거라 조작하지 않는다. 토큰·계정 정보는 저장소나 제출 문안에 넣지 않는다. 세부 기준에는 C02가 없으며 임의의 통과 항목을 만들지 않는다.
