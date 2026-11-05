# fuwa.dad

후와(2016년 3월생 페르시안) 홈페이지. 정적 사이트 — Cloudflare Pages 가 이 저장소를 그대로 배포한다(빌드 없음, 출력 폴더 `/`).

- `photos.json` 사진 목록(날짜·크기·대표 여부)
- `img/t/` 목록용 작은 사진, `img/l/` 크게 보기용. 둘 다 WebP, 위치 정보 등 메타데이터 없음
- `index.html` 첫 화면(밤 테마 연출판). 스타일·스크립트·캐릭터(`v2/chara/`, GPT 가 그린 움직이는 그림 12종 480px WebP + 정지본)는 `v2/` 에 있다. 옛 주소 `/v2/` 는 `_redirects` 로 `/` 에 보낸다
- `v1/` 처음 만든 차분한 판. 링크 없이 숨겨 둠(noindex). `style.css`·`app.js` 가 그 판의 것
- 브라우저가 css·js 를 4시간 캐시한다(존 설정). 고친 뒤 커밋 전에 raspi `/root/fuwa/tools/bust.sh` 로 `?v=해시` 를 갱신할 것
- `assets/` — 도트 후와 에셋 모음(fuwa.dad/assets/, noindex). `assets/fuwa/still` 원본 PNG 12종, `anim` 움직이는 GIF·WebP(640px, 4프레임), `frames` 문 긁기 프레임. 전부 GPT 가 up.fuwa.dad 로 올린 원본 그대로(같은 파일 중복 2개만 뺌). `assets/cats/<이름>/<이름>-{1,2,3}cell.png` 게임 고양이 8마리 원본 512px(fuwa 후와·shuri 슈리·nabi 나비·dubu 두부·bongbong 봉봉·roro 로로·kkomi 꼬미·namu 나무).
- `assets/ref/` — **고양이 실사 기준 그림**(생김새 기준). `/root/fuwa/tools/build_ref.py` 가 `/root/fuwa/ref-src/` 원본으로 만든다: `ref/<id>/<id>-<방향>.png`(앞·옆·뒤·위·아래·3/4) + `<id>-pose-<자세>.png`, 미리보기 `s/*.webp`, `index.json`·`README.md`(AI용 목록), 그리고 `assets/index.html` 의 REF:START~END 정적 HTML. 새 그림이 오면 ref-src 에 넣고 다시 돌린다. 루트 `llms.txt` 가 이 목록을 가리킨다.
