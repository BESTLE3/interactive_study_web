export const TOKEN_SETS = {
  translation: ["The", "model", "links", "words", "by", "context"],
  summarization: ["Attention", "keeps", "global", "signals", "alive"],
  chatbot: ["How", "does", "the", "decoder", "respond", "?"]
};

export const STAGES = [
  {
    id: "embed",
    label: "입력 임베딩",
    detail: "토큰을 벡터 공간으로 보내 의미를 수치화합니다."
  },
  {
    id: "position",
    label: "위치 인코딩",
    detail: "순서 정보가 사라지지 않도록 위치 신호를 더합니다."
  },
  {
    id: "attention",
    label: "멀티-헤드 어텐션",
    detail: "여러 시점에서 토큰 사이 관계를 동시에 읽습니다."
  },
  {
    id: "ffn",
    label: "피드포워드 네트워크",
    detail: "각 위치를 독립적으로 변환해 표현을 더 정교하게 만듭니다."
  },
  {
    id: "decode",
    label: "오토리그레시브 디코딩",
    detail: "이전까지 생성한 토큰을 바탕으로 다음 토큰을 예측합니다."
  }
];

export const HEAD_PATTERNS = [
  [0.46, 0.18, 0.12, 0.1, 0.08, 0.06],
  [0.14, 0.36, 0.16, 0.14, 0.12, 0.08],
  [0.08, 0.14, 0.42, 0.18, 0.1, 0.08],
  [0.08, 0.1, 0.18, 0.38, 0.18, 0.08]
];

export const HEAD_LABELS = ["주어-서술어", "인접 문맥", "핵심 주제", "출력 단서"];

export const EXPLAINERS = [
  {
    kicker: "Q · K · V",
    title: "Query, Key, Value는 “무엇을 찾고, 무엇과 비교하며, 무엇을 가져올지”를 분리합니다.",
    body: "선택한 토큰은 Query가 되고, 나머지 토큰의 Key와 유사도를 계산합니다. 점수가 높을수록 해당 Value를 더 많이 섞어 새로운 표현을 만듭니다."
  },
  {
    kicker: "Residual + Norm",
    title: "깊어져도 학습이 안정적인 이유는 지름길 연결과 정규화에 있습니다.",
    body: "각 블록 출력만 쓰지 않고 입력을 다시 더해 원래 정보가 남도록 유지합니다. 그 뒤 정규화해 분포를 안정시키면 깊은 레이어에서도 학습이 덜 흔들립니다."
  }
];
