# 무료 한글 폰트

2026-09-21 사용자 요청: 널리 알려진 무료 한글 폰트로 글꼴 선택 폭을 넓힌다. 정확한 인기 순위라고 주장하지 않으며, 프리텐다드와 Google Fonts에 배포된 나눔·배민·제목용 글꼴 중 용도가 다른 7종을 선정했다.

## 출처와 사용 조건

공식 배포 저장소에서 라이선스를 확인했다. 모든 추가 폰트는 SIL Open Font License 1.1. 상업용 이미지 제작·웹 임베딩·소프트웨어와 함께 재배포가 허용된다. 저작권이 없는 폰트라는 뜻은 아니다. 단독 폰트 판매 금지, 원래 저작권과 라이선스 동봉, 수정본의 예약 이름 등 OFL 조건은 유지된다. 이 프로젝트는 글꼴 파일의 내부 데이터·이름을 수정하지 않았다.

| 선택 이름 | 포함 파일/굵기 | 출처 |
|---|---|---|
| 프리텐다드 | Pretendard-Bold.woff2 / 700 | https://github.com/orioncactus/pretendard |
| 나눔고딕 | NanumGothic-Bold.ttf / 700 | https://github.com/google/fonts/tree/main/ofl/nanumgothic |
| 나눔명조 | NanumMyeongjo-Bold.ttf / 700 | https://github.com/google/fonts/tree/main/ofl/nanummyeongjo |
| 검은고딕 | BlackHanSans-Regular.ttf / 400 | https://github.com/google/fonts/tree/main/ofl/blackhansans |
| 주아체 | Jua-Regular.ttf / 400 | https://github.com/google/fonts/tree/main/ofl/jua |
| 도현체 | DoHyeon-Regular.ttf / 400 | https://github.com/google/fonts/tree/main/ofl/dohyeon |
| 나눔손글씨 펜 | NanumPenScript-Regular.ttf / 400 | https://github.com/google/fonts/tree/main/ofl/nanumpenscript |

확인한 소스 리비전: Pretendard `7aeb0698819be2b4097dae8ec8fe6a795e5cf3ae`, Google Fonts `e44c4b011a820c2cbe2fd2cfa8052037d7edb571`. 각 폰트와 라이선스 원문은 public/fonts에 함께 포함한다. 편집기에서 「무료 폰트 사용 안내」로 원문을 읽을 수 있다. 나머지 기기 기본 글꼴 3종은 기존 템플릿 호환을 위해 유지하며 파일을 배포하지 않는다.

## 동작

폰트 파일은 편집기와 같은 Vercel 출처에서 선택한 것만 불러온다. 파일 전체를 제공하므로 일반 한글·영문 입력에 사용할 수 있으며, 포함되지 않은 이모지나 문자는 기기 대체 글꼴로 표시될 수 있다. 임의로 굵게 만들지 않고 배포된 실제 굵기로 Canvas를 그린다.

FontFace 로드 완료 후 문구를 다시 배치한다. 내려받기는 폰트 준비 뒤 같은 Canvas를 저장한다. 폰트 선택·템플릿 불러오기·JSON 복원 시 파일을 불러오지 못하면 기존 편집을 유지하고 오류를 안내한다. 저장된 편집을 처음 열 때 로드 실패 시 미리보기는 대체 글꼴일 수 있음을 오류로 알리고, 내려받기는 폰트 재시도가 성공해야 진행한다.

새 폰트 ID도 템플릿·현재 작업 JSON에 저장된다. 기존 sans/serif/mono 값과 이전 JSON 백업은 계속 지원한다. 이름과 파일 경로는 앱의 허용 목록에 고정되어 있으며 JSON으로 외부 폰트를 주입할 수 없다.
