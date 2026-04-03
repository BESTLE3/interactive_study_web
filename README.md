# Interactive Study Web

트랜스포머 아키텍처를 설명하는 인터랙티브 웹 기반 학습 앱입니다.  
입력 토큰, 어텐션 헤드, 레이어 깊이, 디코더 마스킹을 직접 조작하면서 트랜스포머의 핵심 개념을 시각적으로 이해할 수 있도록 구성했습니다.

## 주요 기능

- 트랜스포머 전체 흐름 소개
- 시나리오별 토큰 입력 전환
- 멀티 헤드 어텐션 강조 시각화
- 레이어 깊이 슬라이더
- 디코더 마스킹 구조 표시
- 로컬 전용 실행

## 기술 스택

- React
- Vite
- Framer Motion
- Node.js

## 프로젝트 구조

```text
interactive_study_web/
├─ 실행기/
│  ├─ 실행기.command
│  ├─ 실행기.sh
│  ├─ 실행기.bat
│  └─ 디버깅용 실행기.command
├─ src/
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles.css
├─ index.html
├─ package.json
├─ vite.config.js
├─ launcher.mjs
```

## 실행 방법

### 일반 사용자용 실행

공통 런처 구조를 사용합니다.  
OS에 맞는 실행 파일을 실행하면 빌드 후 로컬 서버가 켜지고 Chrome 앱 창으로 페이지가 열립니다.

- macOS: `실행기.command`
- Linux: `실행기.sh`
- Windows: `실행기.bat`

위 파일들은 모두 `실행기/` 폴더 안에 있습니다.

동작 방식:

1. 필요 시 의존성 설치
2. 정적 빌드 생성
3. 로컬 서버 실행
4. Chrome을 앱 창처럼 실행
5. Chrome 창을 닫으면 서버도 자동 종료

### 개발자용 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:4173` 를 열면 됩니다.

### 공통 런처 직접 실행

```bash
npm run launch
```

## 디버깅용 실행기

`실행기/디버깅용 실행기.command` 는 macOS 전용 디버깅 스크립트입니다.  
일반 실행기와 달리 터미널 기반으로 서버 상태를 확인하기 쉽게 남겨둔 파일입니다.

## 요구 사항

- Node.js
- npm
- Google Chrome

운영체제별 실행 파일은 다르지만, 실제 실행 로직은 `launcher.mjs` 에 공통으로 들어 있습니다.

## 참고

- Safari의 HTTPS 전용 정책 때문에 로컬 HTTP 접근이 막힐 수 있어, 일반 실행기는 Chrome 기준으로 동작하도록 설계했습니다.
- 이 프로젝트는 배포용 웹 서비스가 아니라 로컬 실행형 학습 앱에 가깝습니다.
