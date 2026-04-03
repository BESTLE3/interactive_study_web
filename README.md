# Interactive Study Web

> 테스트용으로 개발 중인 프로젝트입니다.

> 트랜스포머 아키텍처를 설명하는 인터랙티브 웹 기반 학습 앱

입력 토큰, 어텐션 헤드, 레이어 깊이, 디코더 마스킹을 직접 조작하면서  
트랜스포머의 핵심 개념을 시각적으로 이해할 수 있도록 만든 로컬 실행형 웹 앱입니다.

## Overview

| 항목 | 내용 |
| --- | --- |
| 목적 | 트랜스포머 구조를 인터랙티브하게 학습 |
| 실행 형태 | 로컬 브라우저 기반 앱 |
| 기본 브라우저 | Google Chrome |
| 공통 실행 로직 | `scripts/launcher.mjs` |
| 개발 스택 | React, Vite, Framer Motion, Node.js |

## Features

- `🧠` 트랜스포머 전체 흐름 소개
- `🔤` 시나리오별 토큰 입력 전환
- `🎯` 멀티 헤드 어텐션 시각화
- `📚` 레이어 깊이 조절 슬라이더
- `🔒` 디코더 마스킹 구조 표시
- `💻` 로컬 전용 실행

## Tech Stack

- `React`
- `Vite`
- `Framer Motion`
- `Node.js`

## Project Structure

```text
interactive_study_web/
├─ scripts/
│  └─ launcher.mjs
├─ 실행기/
│  ├─ 실행기.command
│  ├─ 실행기.sh
│  ├─ 실행기.bat
│  └─ 디버깅용 실행기.command
├─ src/
│  ├─ App.jsx
│  ├─ content.js
│  ├─ main.jsx
│  └─ styles.css
├─ index.html
├─ package.json
├─ vite.config.js
└─ README.md
```

## Run

### `🚀` 일반 사용자용 실행

OS에 맞는 실행 파일을 실행하면:

1. 의존성 확인
2. 정적 빌드 생성
3. 로컬 서버 실행
4. Chrome 앱 창으로 페이지 열기
5. 실행기가 연 localhost 창을 닫으면 서버 자동 종료

실행 파일 위치: `실행기/`

| 운영체제 | 실행 파일 |
| --- | --- |
| macOS | `실행기/실행기.command` |
| Linux | `실행기/실행기.sh` |
| Windows | `실행기/실행기.bat` |

> 참고: 실제 실행 검증은 현재 macOS 기준으로 완료되어 있습니다.

### `🛠️` 개발자용 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:4173` 를 열면 됩니다.

### `⚙️` 공통 런처 직접 실행

```bash
npm run launch
```

## Launcher Design

- `scripts/launcher.mjs` 가 공통 실행 로직을 담당합니다.
- OS별 실행기는 모두 얇은 wrapper 역할만 합니다.
- 실제 앱 실행, 로컬 서버 시작, Chrome 앱 창 실행은 공통 런처가 처리합니다.

## Debug

`실행기/디버깅용 실행기.command` 는 macOS 전용 디버깅 스크립트입니다.

- 터미널 기반으로 서버 상태를 확인하기 쉬움
- 일반 사용자용 실행기와 분리되어 있음

## Requirements

- `Node.js`
- `npm`
- `Google Chrome`

## Notes

- `🌐` Safari는 로컬 HTTP를 HTTPS 정책으로 막을 수 있어 일반 실행기는 Chrome 기준으로 구성했습니다.
- `📦` 이 프로젝트는 배포형 웹 서비스보다 로컬 실행형 학습 앱에 가깝습니다.
