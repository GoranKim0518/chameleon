# CHAMELEON

설치 없이 웹 브라우저에서 사진을 편집하는 정적 이미지 효과 도구입니다. 사진에 글리치·블러·색보정·질감 효과를 여러 겹 적용하고, 여러 이미지를 레이어로 합성한 뒤 PNG로 저장할 수 있습니다. 사진은 서버에 올리지 않고 지금 쓰는 기기에서 바로 편집합니다.

## 기술 구성

- Vanilla JS
- WebGL2 기반 자체 이펙트 엔진
- HTML / CSS / JavaScript 정적 파일
- Vite는 로컬 개발 서버 용도만 사용합니다. 배포 과정에서 빌드할 필요는 없습니다.

## 로컬 실행

Node.js가 설치되어 있는 상태에서 프로젝트 폴더에서 실행합니다.

```bash
npm install
npm run dev
```

터미널에 표시되는 로컬 주소를 브라우저에서 엽니다.

## 파일 구조

```text
.
├── assets/
│   └── og-image.jpg       # 검색·공유 미리보기 대표 이미지
├── css/
│   └── style.css          # 화면 스타일
├── js/
│   ├── app.js             # 화면 동작과 이미지 편집 기능
│   └── engine.js          # WebGL 이펙트 엔진
├── index.html             # 페이지 구조와 SEO 메타데이터
├── robots.txt             # 검색 로봇 크롤링 정책
├── sitemap.xml            # 검색엔진에 알릴 페이지 목록
├── package.json           # 로컬 실행 명령
└── .gitignore             # Git에 올리지 않을 파일 목록
```

## 배포

이 프로젝트는 정적 사이트입니다. Netlify에서 저장소를 연결하거나, 프로젝트 루트를 배포하면 됩니다.

- Build command: 비워 둠
- Publish directory: 비워 둠 또는 프로젝트 루트
- `index.html`, `css/`, `js/`, `assets/`가 같은 구조로 배포되어야 합니다.

## 검색 노출 기본 설정

`index.html`에는 페이지 제목, 설명, canonical URL, Open Graph, Twitter Card, WebApplication 구조화 데이터가 들어 있습니다.

`robots.txt`와 `sitemap.xml`의 도메인은 실제 배포 주소와 일치해야 합니다. 새 도메인으로 배포했다면 아래 위치의 `https://chameleonn.netlify.app/`를 새 주소로 바꿉니다.

- `index.html`
- `robots.txt`
- `sitemap.xml`

대표 이미지는 `assets/og-image.jpg`입니다.

## Git에 올리지 않는 파일

`.gitignore`는 macOS 메타파일, 로컬 환경변수, Netlify 로컬 상태, `node_modules`, 개발 도구 설정을 제외합니다. `dist/`도 제외돼 있지만 이 프로젝트는 기본적으로 `dist` 폴더를 만들지 않습니다.

## 라이선스

배포하거나 공개하기 전에는 `LICENSE`의 라이선스 조건이 프로젝트 목적과 맞는지 확인하세요.
