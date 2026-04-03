export const TOKEN_SETS = {
  translation: ["모델은", "문맥을", "바탕으로", "단어들을", "서로", "연결합니다"],
  summarization: ["어텐션은", "문장", "전체의", "핵심", "신호를", "유지합니다"],
  chatbot: ["디코더는", "이전", "출력을", "보고", "다음", "응답을", "만듭니다"]
};

function normalize(weights) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return weights.map((weight) => Number((weight / total).toFixed(4)));
}

function buildTokenPattern(length, focusIndex, emphasis = [], options = {}) {
  const { selfBias = 0.22, localBias = 0.1, distanceDecay = 0.035 } = options;
  const base = Array.from({ length }, (_, index) => {
    const distance = Math.abs(index - focusIndex);
    return Math.max(0.02, localBias - distance * distanceDecay);
  });

  base[focusIndex] += selfBias;

  emphasis.forEach(([targetIndex, weight]) => {
    if (targetIndex >= 0 && targetIndex < length) {
      base[targetIndex] += weight;
    }
  });

  return normalize(base);
}

export const STAGES = [
  {
    id: "embed",
    label: "입력 임베딩",
    detail: "문장을 이루는 각 토큰을 고정 길이 벡터로 바꿔, 단어의 의미를 계산 가능한 숫자 표현으로 바꿉니다."
  },
  {
    id: "position",
    label: "위치 인코딩",
    detail: "어텐션은 기본적으로 순서를 모른다는 약점이 있으므로, 각 토큰에 위치 신호를 더해 앞뒤 관계를 학습하게 만듭니다."
  },
  {
    id: "attention",
    label: "멀티-헤드 어텐션",
    detail: "각 토큰이 다른 토큰을 얼마나 참고해야 하는지 가중치를 계산해, 문장 전체의 관계 구조를 병렬적으로 읽어냅니다."
  },
  {
    id: "ffn",
    label: "피드포워드 네트워크",
    detail: "어텐션으로 모은 정보를 각 위치별 비선형 변환에 통과시켜, 표현을 더 풍부하고 추상적인 특징으로 정제합니다."
  },
  {
    id: "decode",
    label: "오토리그레시브 디코딩",
    detail: "이미 본 입력과 지금까지 생성한 출력만을 사용해 다음 토큰의 확률분포를 계산하고, 그중 가장 적절한 후보를 선택합니다."
  }
];

export const HEAD_PATTERNS = {
  translation: [
    [
      buildTokenPattern(6, 0, [[5, 0.3], [3, 0.18], [1, 0.08]], { selfBias: 0.14 }),
      buildTokenPattern(6, 1, [[2, 0.3], [5, 0.16], [0, 0.1]], { selfBias: 0.12 }),
      buildTokenPattern(6, 2, [[1, 0.26], [5, 0.18], [3, 0.12]], { selfBias: 0.1 }),
      buildTokenPattern(6, 3, [[5, 0.34], [4, 0.14], [0, 0.08]], { selfBias: 0.12 }),
      buildTokenPattern(6, 4, [[5, 0.36], [3, 0.18], [2, 0.08]], { selfBias: 0.1 }),
      buildTokenPattern(6, 5, [[0, 0.16], [1, 0.16], [3, 0.24], [4, 0.12]], { selfBias: 0.1 })
    ],
    [
      buildTokenPattern(6, 0, [[1, 0.18], [2, 0.08]], { selfBias: 0.24, localBias: 0.12 }),
      buildTokenPattern(6, 1, [[0, 0.16], [2, 0.2], [3, 0.08]], { selfBias: 0.22, localBias: 0.12 }),
      buildTokenPattern(6, 2, [[1, 0.18], [3, 0.18], [4, 0.08]], { selfBias: 0.2, localBias: 0.12 }),
      buildTokenPattern(6, 3, [[2, 0.16], [4, 0.2], [5, 0.1]], { selfBias: 0.22, localBias: 0.12 }),
      buildTokenPattern(6, 4, [[3, 0.18], [5, 0.22]], { selfBias: 0.18, localBias: 0.12 }),
      buildTokenPattern(6, 5, [[4, 0.18], [3, 0.14]], { selfBias: 0.24, localBias: 0.12 })
    ],
    [
      buildTokenPattern(6, 0, [[1, 0.18], [3, 0.14], [5, 0.18]], { selfBias: 0.16, localBias: 0.08 }),
      buildTokenPattern(6, 1, [[0, 0.18], [3, 0.16], [5, 0.18]], { selfBias: 0.14, localBias: 0.08 }),
      buildTokenPattern(6, 2, [[0, 0.14], [1, 0.18], [5, 0.22]], { selfBias: 0.12, localBias: 0.08 }),
      buildTokenPattern(6, 3, [[0, 0.14], [1, 0.18], [5, 0.24]], { selfBias: 0.14, localBias: 0.08 }),
      buildTokenPattern(6, 4, [[3, 0.18], [5, 0.24], [1, 0.12]], { selfBias: 0.12, localBias: 0.08 }),
      buildTokenPattern(6, 5, [[0, 0.14], [1, 0.18], [3, 0.2], [4, 0.14]], { selfBias: 0.12, localBias: 0.08 })
    ],
    [
      buildTokenPattern(6, 0, [[5, 0.38], [3, 0.16]], { selfBias: 0.08, localBias: 0.07 }),
      buildTokenPattern(6, 1, [[2, 0.22], [5, 0.26], [3, 0.12]], { selfBias: 0.08, localBias: 0.07 }),
      buildTokenPattern(6, 2, [[5, 0.3], [3, 0.14], [4, 0.1]], { selfBias: 0.08, localBias: 0.07 }),
      buildTokenPattern(6, 3, [[5, 0.32], [4, 0.18], [2, 0.1]], { selfBias: 0.08, localBias: 0.07 }),
      buildTokenPattern(6, 4, [[5, 0.34], [3, 0.18]], { selfBias: 0.08, localBias: 0.07 }),
      buildTokenPattern(6, 5, [[3, 0.24], [4, 0.16], [1, 0.14]], { selfBias: 0.08, localBias: 0.07 })
    ]
  ],
  summarization: [
    [
      buildTokenPattern(6, 0, [[5, 0.3], [2, 0.14], [4, 0.16]], { selfBias: 0.14 }),
      buildTokenPattern(6, 1, [[2, 0.26], [5, 0.12], [0, 0.08]], { selfBias: 0.12 }),
      buildTokenPattern(6, 2, [[3, 0.24], [4, 0.18], [5, 0.12]], { selfBias: 0.12 }),
      buildTokenPattern(6, 3, [[4, 0.26], [5, 0.16], [2, 0.14]], { selfBias: 0.12 }),
      buildTokenPattern(6, 4, [[3, 0.28], [5, 0.18], [2, 0.12]], { selfBias: 0.12 }),
      buildTokenPattern(6, 5, [[0, 0.18], [3, 0.18], [4, 0.18]], { selfBias: 0.12 })
    ],
    [
      buildTokenPattern(6, 0, [[1, 0.18], [2, 0.12]], { selfBias: 0.24, localBias: 0.12 }),
      buildTokenPattern(6, 1, [[0, 0.16], [2, 0.2], [3, 0.08]], { selfBias: 0.22, localBias: 0.12 }),
      buildTokenPattern(6, 2, [[1, 0.18], [3, 0.2], [4, 0.08]], { selfBias: 0.22, localBias: 0.12 }),
      buildTokenPattern(6, 3, [[2, 0.18], [4, 0.2], [5, 0.08]], { selfBias: 0.22, localBias: 0.12 }),
      buildTokenPattern(6, 4, [[3, 0.18], [5, 0.22]], { selfBias: 0.2, localBias: 0.12 }),
      buildTokenPattern(6, 5, [[4, 0.2], [3, 0.14]], { selfBias: 0.24, localBias: 0.12 })
    ],
    [
      buildTokenPattern(6, 0, [[2, 0.18], [3, 0.18], [5, 0.16]], { selfBias: 0.14, localBias: 0.08 }),
      buildTokenPattern(6, 1, [[0, 0.14], [2, 0.18], [5, 0.16]], { selfBias: 0.14, localBias: 0.08 }),
      buildTokenPattern(6, 2, [[0, 0.16], [3, 0.2], [5, 0.18]], { selfBias: 0.12, localBias: 0.08 }),
      buildTokenPattern(6, 3, [[0, 0.16], [2, 0.18], [4, 0.2], [5, 0.16]], { selfBias: 0.12, localBias: 0.08 }),
      buildTokenPattern(6, 4, [[0, 0.14], [3, 0.2], [5, 0.18]], { selfBias: 0.12, localBias: 0.08 }),
      buildTokenPattern(6, 5, [[0, 0.18], [2, 0.14], [3, 0.18], [4, 0.14]], { selfBias: 0.12, localBias: 0.08 })
    ],
    [
      buildTokenPattern(6, 0, [[5, 0.34], [3, 0.14], [4, 0.14]], { selfBias: 0.08, localBias: 0.07 }),
      buildTokenPattern(6, 1, [[3, 0.18], [5, 0.24], [4, 0.12]], { selfBias: 0.08, localBias: 0.07 }),
      buildTokenPattern(6, 2, [[3, 0.22], [4, 0.16], [5, 0.18]], { selfBias: 0.08, localBias: 0.07 }),
      buildTokenPattern(6, 3, [[4, 0.22], [5, 0.24], [2, 0.12]], { selfBias: 0.08, localBias: 0.07 }),
      buildTokenPattern(6, 4, [[5, 0.28], [3, 0.2]], { selfBias: 0.08, localBias: 0.07 }),
      buildTokenPattern(6, 5, [[3, 0.2], [4, 0.18], [0, 0.12]], { selfBias: 0.08, localBias: 0.07 })
    ]
  ],
  chatbot: [
    [
      buildTokenPattern(7, 0, [[6, 0.28], [2, 0.14], [5, 0.12]], { selfBias: 0.14 }),
      buildTokenPattern(7, 1, [[2, 0.28], [3, 0.14], [6, 0.12]], { selfBias: 0.12 }),
      buildTokenPattern(7, 2, [[3, 0.22], [5, 0.16], [6, 0.14]], { selfBias: 0.12 }),
      buildTokenPattern(7, 3, [[2, 0.2], [4, 0.18], [6, 0.16]], { selfBias: 0.12 }),
      buildTokenPattern(7, 4, [[5, 0.22], [6, 0.18], [3, 0.12]], { selfBias: 0.12 }),
      buildTokenPattern(7, 5, [[6, 0.24], [4, 0.18], [2, 0.1]], { selfBias: 0.12 }),
      buildTokenPattern(7, 6, [[0, 0.14], [2, 0.16], [5, 0.22]], { selfBias: 0.12 })
    ],
    [
      buildTokenPattern(7, 0, [[1, 0.18], [2, 0.1]], { selfBias: 0.24, localBias: 0.12 }),
      buildTokenPattern(7, 1, [[0, 0.16], [2, 0.2], [3, 0.08]], { selfBias: 0.22, localBias: 0.12 }),
      buildTokenPattern(7, 2, [[1, 0.18], [3, 0.2], [4, 0.08]], { selfBias: 0.22, localBias: 0.12 }),
      buildTokenPattern(7, 3, [[2, 0.18], [4, 0.18], [5, 0.1]], { selfBias: 0.22, localBias: 0.12 }),
      buildTokenPattern(7, 4, [[3, 0.18], [5, 0.2], [6, 0.1]], { selfBias: 0.22, localBias: 0.12 }),
      buildTokenPattern(7, 5, [[4, 0.18], [6, 0.2]], { selfBias: 0.22, localBias: 0.12 }),
      buildTokenPattern(7, 6, [[5, 0.18], [4, 0.12]], { selfBias: 0.24, localBias: 0.12 })
    ],
    [
      buildTokenPattern(7, 0, [[2, 0.14], [5, 0.16], [6, 0.18]], { selfBias: 0.14, localBias: 0.08 }),
      buildTokenPattern(7, 1, [[0, 0.14], [2, 0.16], [6, 0.14]], { selfBias: 0.14, localBias: 0.08 }),
      buildTokenPattern(7, 2, [[0, 0.16], [5, 0.18], [6, 0.18]], { selfBias: 0.12, localBias: 0.08 }),
      buildTokenPattern(7, 3, [[0, 0.12], [2, 0.14], [5, 0.18], [6, 0.2]], { selfBias: 0.12, localBias: 0.08 }),
      buildTokenPattern(7, 4, [[2, 0.12], [5, 0.2], [6, 0.22]], { selfBias: 0.12, localBias: 0.08 }),
      buildTokenPattern(7, 5, [[0, 0.14], [2, 0.16], [6, 0.22]], { selfBias: 0.12, localBias: 0.08 }),
      buildTokenPattern(7, 6, [[0, 0.14], [2, 0.16], [5, 0.2]], { selfBias: 0.12, localBias: 0.08 })
    ],
    [
      buildTokenPattern(7, 0, [[6, 0.32], [5, 0.16]], { selfBias: 0.08, localBias: 0.07 }),
      buildTokenPattern(7, 1, [[3, 0.18], [6, 0.24], [5, 0.12]], { selfBias: 0.08, localBias: 0.07 }),
      buildTokenPattern(7, 2, [[5, 0.18], [6, 0.24], [3, 0.14]], { selfBias: 0.08, localBias: 0.07 }),
      buildTokenPattern(7, 3, [[4, 0.18], [5, 0.18], [6, 0.24]], { selfBias: 0.08, localBias: 0.07 }),
      buildTokenPattern(7, 4, [[5, 0.22], [6, 0.26]], { selfBias: 0.08, localBias: 0.07 }),
      buildTokenPattern(7, 5, [[6, 0.28], [4, 0.16]], { selfBias: 0.08, localBias: 0.07 }),
      buildTokenPattern(7, 6, [[5, 0.24], [2, 0.14], [0, 0.12]], { selfBias: 0.08, localBias: 0.07 })
    ]
  ]
};

export const HEAD_LABELS = ["문법 의존성", "국소 문맥", "전역 주제", "출력 예측 단서"];

export const PROCESS_CARDS = [
  {
    id: "embedding",
    step: "01",
    kicker: "입력 임베딩",
    title: "토큰을 연산 가능한 벡터 공간으로 올립니다.",
    summary: "각 토큰을 d_model 차원의 밀집 벡터로 바꿔 이후 모든 선형대수 연산의 입력으로 사용합니다.",
    details: [
      "트랜스포머의 시작점은 문장을 토큰 시퀀스로 나누고, 각 토큰을 고정 길이 벡터로 치환하는 일입니다.",
      "이 단계에서 얻는 입력 행렬 X는 시퀀스 길이를 n, 모델 차원을 d_model이라 할 때 X ∈ R^{n × d_model} 형태를 가집니다.",
      "학습 관점에서는 임베딩 테이블이 단순한 사전이 아니라, 의미적 근접성과 문맥적 사용 빈도를 압축한 매개변수 행렬로 이해하는 편이 맞습니다."
    ],
    formulas: [String.raw`X \in \mathbb{R}^{n \times d_{\mathrm{model}}}`]
  },
  {
    id: "position",
    step: "02",
    kicker: "위치 인코딩",
    title: "순서 정보가 없는 어텐션에 토큰 순서를 주입합니다.",
    summary: "임베딩 벡터에 위치 신호를 더해 같은 단어라도 문장 내 위치에 따라 다른 역할을 학습하게 만듭니다.",
    details: [
      "Self-attention은 구조적으로 집합 연산에 가깝기 때문에, 순서 정보를 추가로 주지 않으면 '앞뒤'를 알 수 없습니다.",
      "원 논문에서는 사인·코사인 기반 위치 인코딩을 사용했고, 현대 모델들은 학습형 위치 임베딩이나 rotary embedding을 쓰는 경우도 많습니다.",
      "핵심은 어떤 구현을 쓰느냐보다, 토큰 표현이 '의미 + 위치'를 함께 갖도록 만드는 것입니다."
    ],
    formulas: [
      String.raw`\tilde{X} = X + P`,
      String.raw`P_{(pos,2i)}=\sin\left(\frac{pos}{10000^{2i/d_{\mathrm{model}}}}\right),\quad P_{(pos,2i+1)}=\cos\left(\frac{pos}{10000^{2i/d_{\mathrm{model}}}}\right)`
    ]
  },
  {
    id: "qkv",
    step: "03",
    kicker: "Q · K · V 투영",
    title: "각 토큰을 Query, Key, Value 세 역할로 분해합니다.",
    summary: "같은 입력 벡터라도 '무엇을 찾는가', '무슨 특징을 가지는가', '무엇을 전달하는가'라는 서로 다른 선형 투영으로 바뀝니다.",
    details: [
      "트랜스포머는 입력 표현을 그대로 비교하지 않고, 학습된 행렬 W^Q, W^K, W^V를 통해 세 공간으로 투영합니다.",
      "이제 각 토큰은 '질문하는 벡터(Query)', '검색 키(Key)', '실제 내용(Value)'를 동시에 가지게 됩니다.",
      "차원 관점에서는 보통 Q, K는 n × d_k, V는 n × d_v가 되며, 멀티-헤드 구조에서는 d_k = d_v = d_model / h로 두는 경우가 많습니다."
    ],
    formulas: [
      String.raw`Q=\tilde{X}W^Q,\quad K=\tilde{X}W^K,\quad V=\tilde{X}W^V`,
      String.raw`W^Q,W^K \in \mathbb{R}^{d_{\mathrm{model}}\times d_k},\quad W^V \in \mathbb{R}^{d_{\mathrm{model}}\times d_v}`
    ]
  },
  {
    id: "attention",
    step: "04",
    kicker: "어텐션 점수",
    title: "토큰 간 관련도를 n × n 행렬로 계산합니다.",
    summary: "QK^T로 토큰 간 유사도를 만든 뒤 softmax로 정규화하여 각 토큰이 어디를 얼마나 참고할지 확률처럼 해석합니다.",
    details: [
      "QK^T는 각 토큰 쌍의 관련도를 담는 점수 행렬이며, 시퀀스 길이가 n이면 결과는 n × n입니다.",
      "d_k의 제곱근으로 나누는 이유는 내적값이 차원 증가에 따라 커지는 현상을 보정해 softmax가 지나치게 뾰족해지는 것을 막기 위해서입니다.",
      "softmax 이후 각 행의 합은 1이 되므로, '한 토큰이 다른 토큰들을 어떤 비율로 참고하는가'를 읽을 수 있습니다."
    ],
    formulas: [
      String.raw`S=\frac{QK^\top}{\sqrt{d_k}},\qquad A=\mathrm{softmax}(S)`,
      String.raw`QK^\top \in \mathbb{R}^{n \times n},\qquad A \in \mathbb{R}^{n \times n}`
    ]
  },
  {
    id: "multihead",
    step: "05",
    kicker: "멀티-헤드 결합",
    title: "여러 관계 패턴을 병렬로 읽은 뒤 다시 합칩니다.",
    summary: "각 head가 다른 부분공간에서 독립적으로 attention을 계산하고, 그 결과를 이어붙여 더 풍부한 표현을 만듭니다.",
    details: [
      "하나의 큰 attention만 쓰면 한 종류의 관계에만 과도하게 수렴할 수 있으므로, 트랜스포머는 표현 공간을 여러 head로 나눕니다.",
      "어떤 head는 인접 토큰, 어떤 head는 장거리 의존성, 어떤 head는 문장 전체 주제와 더 강하게 연결될 수 있습니다.",
      "병렬 attention 결과를 concat한 뒤 최종 선형 변환 W^O를 적용하면 다시 d_model 차원으로 복귀합니다."
    ],
    formulas: [
      String.raw`\mathrm{head}_i=\mathrm{Attention}(Q_i,K_i,V_i)`,
      String.raw`\mathrm{MultiHead}(Q,K,V)=\mathrm{Concat}(\mathrm{head}_1,\ldots,\mathrm{head}_h)W^O`
    ]
  },
  {
    id: "encoder",
    step: "06",
    kicker: "인코더 블록",
    title: "Self-attention과 FFN을 반복해 문맥 표현을 축적합니다.",
    summary: "인코더는 문장 전체를 양방향으로 읽으면서 각 위치의 표현을 점점 더 문맥적인 상태로 바꿉니다.",
    details: [
      "인코더 블록은 self-attention과 position-wise feed-forward network를 잔차 연결과 layer normalization으로 감싼 구조입니다.",
      "첫 번째 서브레이어는 토큰 간 관계를 섞고, 두 번째 서브레이어는 각 위치에서 비선형 변환을 수행해 표현력을 확장합니다.",
      "이 블록을 여러 층 반복하면 출력 H는 단순 단어 벡터가 아니라 문장 전체 문맥을 요약한 은닉 표현이 됩니다."
    ],
    formulas: [
      String.raw`H'=\mathrm{LayerNorm}(X+\mathrm{MHA}(X))`,
      String.raw`H=\mathrm{LayerNorm}(H'+\mathrm{FFN}(H'))`
    ]
  },
  {
    id: "decoder",
    step: "07",
    kicker: "디코더 블록",
    title: "마스킹된 자기회귀 문맥과 인코더 메모리를 함께 사용합니다.",
    summary: "디코더는 먼저 과거 출력만 보며 자기 문맥을 만들고, 그 다음 인코더 표현을 참조해 조건부 생성을 수행합니다.",
    details: [
      "디코더의 첫 attention은 masked self-attention이므로 아직 생성되지 않은 미래 토큰은 볼 수 없습니다.",
      "그 다음 cross-attention에서는 디코더 상태를 query로, 인코더 출력 H를 key/value로 사용해 입력 문장 조건을 읽어옵니다.",
      "따라서 디코더 블록은 '자기회귀성'과 '입력 조건부 생성'을 동시에 만족시키는 구조라고 볼 수 있습니다."
    ],
    formulas: [
      String.raw`S'=\mathrm{LayerNorm}(Y+\mathrm{MaskedMHA}(Y))`,
      String.raw`C=\mathrm{LayerNorm}(S'+\mathrm{MHA}(S',H))`,
      String.raw`O=\mathrm{LayerNorm}(C+\mathrm{FFN}(C))`
    ]
  },
  {
    id: "output",
    step: "08",
    kicker: "출력 투영",
    title: "최종 은닉 상태를 어휘 분포로 바꿔 다음 토큰을 선택합니다.",
    summary: "디코더 출력 O를 어휘 집합 크기 차원으로 투영한 뒤 softmax를 적용하면 다음 토큰의 확률분포가 만들어집니다.",
    details: [
      "각 시점 t에서 모델은 현재 디코더 상태를 기반으로 어휘 전체에 대한 logit을 계산합니다.",
      "softmax를 거치면 p(y_t | y_{<t}, x) 형태의 조건부 확률분포가 나오며, 실제 생성은 argmax 또는 sampling으로 이뤄집니다.",
      "학습 시에는 정답 토큰에 대한 음의 로그우도를 최소화하는 방식으로 이 분포가 갱신됩니다."
    ],
    formulas: [String.raw`p(y_t \mid y_{<t},x)=\mathrm{softmax}(OW_{\mathrm{vocab}}+b)`]
  }
];

export const STORY_POINTS = [
  "트랜스포머의 핵심은 단어를 순서대로 한 칸씩 읽는 것이 아니라, 문장 안의 모든 토큰 관계를 한 번에 계산하는 데 있습니다.",
  "멀티-헤드 어텐션은 하나의 관점만 쓰지 않고, 문법적 연결, 가까운 단어 관계, 문장 전체 주제 같은 서로 다른 패턴을 동시에 추적합니다.",
  "디코더는 미래 토큰을 보지 못하도록 마스킹을 적용하므로, 실제 생성 과정은 항상 '지금까지의 정보만으로 다음 단어를 예측'하는 형태가 됩니다."
];

export const EXPLAINERS = [
  {
    kicker: "Q · K · V",
    title: "Query, Key, Value는 어텐션을 수학적으로 구현하기 위한 세 가지 역할 분담입니다.",
    body: "직관적으로 말하면 Query는 '나는 지금 어떤 정보를 찾고 있는가', Key는 '나는 어떤 특징을 가진 정보인가', Value는 '실제로 전달할 내용은 무엇인가'에 해당합니다. 특정 토큰의 Query와 다른 토큰들의 Key를 비교해 유사도를 계산하고, 그 점수를 가중치로 사용해 Value를 섞으면 문맥을 반영한 새로운 표현이 만들어집니다."
  },
  {
    kicker: "Residual + Norm",
    title: "깊은 트랜스포머가 안정적으로 학습되는 이유는 잔차 연결과 정규화에 있습니다.",
    body: "잔차 연결은 각 블록의 출력에 원래 입력을 다시 더해 정보가 급격히 사라지지 않도록 하는 장치입니다. Layer Normalization은 벡터 값의 분포를 일정하게 유지해 학습을 안정화합니다. 쉽게 말하면 잔차 연결은 '지름길', 정규화는 '값의 균형 조정' 역할을 하며, 둘이 함께 작동해 깊은 네트워크도 무너지지 않게 만듭니다."
  }
];

export const MATH_BLOCKS = [
  {
    kicker: "Scaled Dot-Product Attention",
    title: "어텐션의 핵심 계산은 Query와 Key의 유사도를 구해 Value를 가중합하는 것입니다.",
    formula: String.raw`\mathrm{Attention}(Q,K,V)=\mathrm{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right)V`,
    body: "여기서 QK^T는 각 토큰 쌍의 관련도를 나타내는 점수 행렬입니다. d_k의 제곱근으로 나누는 이유는 차원이 커질수록 내적값이 지나치게 커져 softmax가 한쪽으로 과도하게 쏠리는 현상을 완화하기 위해서입니다. 그 뒤 softmax를 적용하면 각 행이 확률처럼 해석되는 가중치가 되고, 이 가중치로 Value를 섞으면 문맥을 반영한 새로운 표현이 만들어집니다."
  },
  {
    kicker: "Multi-Head Attention",
    title: "멀티-헤드는 하나의 큰 어텐션을 여러 작은 부분공간으로 분할해 동시에 학습하는 구조입니다.",
    formula: String.raw`\mathrm{MultiHead}(Q,K,V)=\mathrm{Concat}(\mathrm{head}_1,\ldots,\mathrm{head}_h)W^O`,
    body: "각 헤드는 서로 다른 가중치 행렬 W_i^Q, W_i^K, W_i^V를 사용해 Q, K, V를 별도 투영합니다. 그 결과 어떤 헤드는 문법 관계에, 다른 헤드는 장거리 의존성이나 주제어에 더 민감해질 수 있습니다. 마지막에는 각 head의 출력을 이어붙인 뒤 선형 변환을 거쳐 하나의 표현으로 합칩니다."
  },
  {
    kicker: "Position + Feed Forward",
    title: "트랜스포머는 순서를 위치 인코딩으로 보완하고, 비선형 변환으로 표현력을 높입니다.",
    formula: String.raw`\mathrm{FFN}(x)=W_2\,\sigma(W_1x+b_1)+b_2`,
    body: "위치 인코딩은 '몇 번째 토큰인가'를 벡터에 더해 순서 정보를 주입합니다. 이후 피드포워드 네트워크는 각 위치를 독립적으로 변환하면서 더 복잡한 특징을 학습합니다. 쉽게 말하면 어텐션이 '어디를 봐야 하는가'를 정한다면, FFN은 '본 정보를 어떻게 해석할 것인가'를 담당합니다."
  }
];

export const DIMENSION_BLOCKS = [
  {
    kicker: "입력 표현",
    title: "배치와 시퀀스를 포함한 기본 입력 행렬은 보통 X ∈ R^{n × d_model} 로 둡니다.",
    formula: String.raw`X \in \mathbb{R}^{n \times d_{\mathrm{model}}}`,
    body: "여기서 n은 토큰 개수, d_model은 각 토큰을 표현하는 임베딩 차원입니다. 예를 들어 문장 길이가 6이고 임베딩 차원이 512라면, 한 문장은 6×512 행렬로 표현됩니다. 실제 학습에서는 여기에 배치 차원 b가 추가되어 b×n×d_model 형태로 처리됩니다."
  },
  {
    kicker: "Q, K, V 차원",
    title: "각 head는 입력을 더 작은 차원으로 투영해 어텐션 계산을 수행합니다.",
    formula: String.raw`Q=XW^Q,\;K=XW^K,\;V=XW^V,\quad W^Q,W^K \in \mathbb{R}^{d_{\mathrm{model}}\times d_k}`,
    body: "입력 X가 n×d_model이면, 각 head에서 Q와 K는 n×d_k, V는 n×d_v가 됩니다. 보통 d_k = d_v = d_model / h 로 두어 h개의 head가 전체 표현 공간을 나눠 갖게 합니다. 이 차원 분할 덕분에 여러 head를 병렬로 계산해도 전체 계산량을 제어할 수 있습니다."
  },
  {
    kicker: "어텐션 점수 행렬",
    title: "QK^T는 토큰 대 토큰 관계를 나타내는 n × n 행렬입니다.",
    formula: String.raw`QK^\top \in \mathbb{R}^{n \times n},\qquad \mathrm{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right)\in \mathbb{R}^{n \times n}`,
    body: "각 행은 '한 토큰이 다른 모든 토큰을 얼마나 참고하는가'를 뜻합니다. 따라서 softmax 이후의 각 행의 합은 1이 되며, 이는 확률분포와 유사한 의미를 가집니다. 여기에 V를 곱하면 다시 n×d_v 형태의 문맥 반영 표현이 나옵니다."
  }
];

export const BLOCK_EQUATIONS = [
  {
    kicker: "Encoder Block",
    title: "인코더는 self-attention과 feed-forward를 잔차 연결로 감싼 반복 블록입니다.",
    formula: String.raw`H' = \mathrm{LayerNorm}\left(X + \mathrm{MHA}(X)\right),\qquad H = \mathrm{LayerNorm}\left(H' + \mathrm{FFN}(H')\right)`,
    body: "인코더의 목적은 입력 문장을 문맥적으로 풍부한 표현 H로 바꾸는 것입니다. 첫 번째 단계에서는 각 토큰이 문장 전체를 참고해 self-attention 출력을 만듭니다. 두 번째 단계에서는 피드포워드 네트워크를 통해 위치별 비선형 변환을 적용합니다. 잔차 연결과 LayerNorm은 깊은 네트워크에서도 정보 손실과 학습 불안정을 줄이는 역할을 합니다."
  },
  {
    kicker: "Decoder Block",
    title: "디코더는 masked self-attention, cross-attention, feed-forward를 차례로 통과합니다.",
    formula: String.raw`S' = \mathrm{LayerNorm}\left(Y + \mathrm{MaskedMHA}(Y)\right),\\ C = \mathrm{LayerNorm}\left(S' + \mathrm{MHA}(S', H)\right),\\ O = \mathrm{LayerNorm}\left(C + \mathrm{FFN}(C)\right)`,
    body: "여기서 Y는 지금까지 생성된 토큰 표현이고, H는 인코더 출력입니다. 먼저 masked self-attention으로 디코더 내부 문맥을 만들고, 그 다음 cross-attention으로 인코더 출력 H를 참조합니다. 마지막 FFN을 거친 O는 다음 토큰 분포를 계산하는 데 사용됩니다. 기계번역처럼 입력과 출력을 모두 쓰는 작업에서는 이 cross-attention 단계가 특히 중요합니다."
  },
  {
    kicker: "Output Projection",
    title: "최종 출력 벡터는 어휘 집합 크기만큼의 logit으로 투영되어 확률분포가 됩니다.",
    formula: String.raw`p(y_t \mid y_{<t}, x)=\mathrm{softmax}(OW_{\mathrm{vocab}} + b)`,
    body: "각 시점 t에서 모델은 어휘 전체에 대한 점수(logit)를 계산하고, softmax로 확률분포로 바꿉니다. 실제 생성은 이 분포에서 argmax를 택하거나, temperature와 sampling을 사용해 확률적으로 토큰을 선택하는 방식으로 진행됩니다."
  }
];

export const FLOW_STEPS = [
  {
    step: "01",
    title: "토큰화와 임베딩",
    body: "문장을 작은 단위의 토큰으로 나누고, 각 토큰을 고정 길이 벡터로 바꿉니다."
  },
  {
    step: "02",
    title: "위치 정보 주입",
    body: "단어 순서가 사라지지 않도록 위치 인코딩을 더해 앞뒤 관계를 표현합니다."
  },
  {
    step: "03",
    title: "Q, K, V 투영",
    body: "각 토큰 표현을 Query, Key, Value 세 공간으로 선형 변환합니다."
  },
  {
    step: "04",
    title: "어텐션 점수 계산",
    body: "Q와 K의 내적으로 토큰 간 관련도를 구하고 softmax로 가중치 행렬을 만듭니다."
  },
  {
    step: "05",
    title: "멀티-헤드 결합",
    body: "여러 head가 서로 다른 관계를 읽은 뒤, 출력을 합쳐 풍부한 표현을 만듭니다."
  },
  {
    step: "06",
    title: "잔차 연결과 정규화",
    body: "원래 입력을 더하고 분포를 정리해 정보 손실과 학습 불안정을 줄입니다."
  },
  {
    step: "07",
    title: "피드포워드 변환",
    body: "각 위치별 비선형 변환으로 더 추상적인 의미 특징을 형성합니다."
  },
  {
    step: "08",
    title: "다음 토큰 확률 계산",
    body: "디코더에서는 미래를 가린 상태로 다음 토큰의 확률분포를 만들고 하나를 선택합니다."
  }
];
