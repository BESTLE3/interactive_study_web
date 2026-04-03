import { useMemo, useState } from "react";
import { motion } from "framer-motion";

const TOKEN_SETS = {
  translation: ["The", "model", "links", "words", "by", "context"],
  summarization: ["Attention", "keeps", "global", "signals", "alive"],
  chatbot: ["How", "does", "the", "decoder", "respond", "?"]
};

const STAGES = [
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

const HEAD_PATTERNS = [
  [0.46, 0.18, 0.12, 0.1, 0.08, 0.06],
  [0.14, 0.36, 0.16, 0.14, 0.12, 0.08],
  [0.08, 0.14, 0.42, 0.18, 0.1, 0.08],
  [0.08, 0.1, 0.18, 0.38, 0.18, 0.08]
];

const SECTION_VARIANTS = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  }
};

function App() {
  const [scenario, setScenario] = useState("translation");
  const [selectedToken, setSelectedToken] = useState(0);
  const [selectedHead, setSelectedHead] = useState(0);
  const [layerDepth, setLayerDepth] = useState(6);

  const tokens = TOKEN_SETS[scenario];

  const attentionWeights = useMemo(() => {
    const base = HEAD_PATTERNS[selectedHead];
    return tokens.map((_, index) => {
      const raw = base[index] ?? 0.08;
      const distanceBoost = Math.max(0, 0.12 - Math.abs(selectedToken - index) * 0.025);
      return Number(Math.min(0.82, raw + distanceBoost).toFixed(2));
    });
  }, [selectedHead, selectedToken, tokens]);

  const currentStage = STAGES[Math.min(STAGES.length - 1, Math.floor(layerDepth / 2))];

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">INTERACTIVE STUDY / TRANSFORMER ATLAS</p>
          <h1>트랜스포머가 문맥을 읽고 다음 토큰을 고르는 과정을 눈으로 따라갑니다.</h1>
          <p className="hero-body">
            입력 벡터, 위치 정보, 셀프 어텐션, 멀티 헤드, 피드포워드, 디코더 출력을 한 화면에서
            조작하면서 구조를 이해할 수 있게 설계했습니다.
          </p>
          <div className="hero-actions">
            <a href="#lab" className="primary-link">
              실험 시작
            </a>
            <span className="inline-note">로컬 브라우저에서만 실행됩니다.</span>
          </div>
        </div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="visual-grid">
            {STAGES.map((stage, index) => (
              <motion.div
                key={stage.id}
                className={`visual-node ${index <= Math.floor(layerDepth / 2) ? "active" : ""}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{stage.label}</strong>
              </motion.div>
            ))}
          </div>
          <div className="visual-caption">
            <p>현재 레이어 강조</p>
            <strong>{currentStage.label}</strong>
          </div>
        </motion.div>
      </section>

      <motion.section
        className="story-strip"
        variants={SECTION_VARIANTS}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div>
          <p className="section-kicker">핵심 개념</p>
          <h2>트랜스포머는 순차 처리보다 관계 계산을 우선합니다.</h2>
        </div>
        <div className="story-points">
          <p>모든 토큰이 서로를 동시에 바라보며 의미 네트워크를 만듭니다.</p>
          <p>멀티-헤드는 문법, 주제, 거리, 예측 힌트를 서로 다른 관점으로 나눠 읽습니다.</p>
          <p>디코더는 미래 토큰을 가리지 못하도록 마스킹해 다음 단어만 예측하게 만듭니다.</p>
        </div>
      </motion.section>

      <motion.section
        id="lab"
        className="lab"
        variants={SECTION_VARIANTS}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <div className="lab-header">
          <div>
            <p className="section-kicker">실험 패널</p>
            <h2>입력과 헤드를 바꾸면 어텐션 지도가 즉시 바뀝니다.</h2>
          </div>
          <div className="control-row scenario-tabs">
            {Object.keys(TOKEN_SETS).map((key) => (
              <button
                key={key}
                type="button"
                className={scenario === key ? "is-selected" : ""}
                onClick={() => {
                  setScenario(key);
                  setSelectedToken(0);
                }}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="lab-grid">
          <section className="panel panel-wide">
            <div className="panel-heading">
              <h3>Token Stream</h3>
              <p>하나의 토큰을 선택해 어떤 단어를 강하게 참고하는지 확인합니다.</p>
            </div>
            <div className="token-row">
              {tokens.map((token, index) => (
                <button
                  key={`${token}-${index}`}
                  type="button"
                  className={`token-chip ${selectedToken === index ? "active" : ""}`}
                  onClick={() => setSelectedToken(index)}
                >
                  <span>{String(index).padStart(2, "0")}</span>
                  <strong>{token}</strong>
                </button>
              ))}
            </div>
            <div className="attention-map">
              {tokens.map((token, index) => (
                <div key={`${token}-weight`} className="attention-bar-wrap">
                  <div className="attention-meta">
                    <span>{token}</span>
                    <span>{Math.round(attentionWeights[index] * 100)}%</span>
                  </div>
                  <motion.div
                    className={`attention-bar ${selectedToken === index ? "focus" : ""}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${attentionWeights[index] * 100}%` }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <h3>Head Selector</h3>
              <p>각 헤드는 다른 종류의 관계를 포착합니다.</p>
            </div>
            <div className="head-list">
              {[0, 1, 2, 3].map((head) => (
                <button
                  key={head}
                  type="button"
                  className={`head-button ${selectedHead === head ? "active" : ""}`}
                  onClick={() => setSelectedHead(head)}
                >
                  <span>Head {head + 1}</span>
                  <strong>{["주어-서술어", "인접 문맥", "핵심 주제", "출력 단서"][head]}</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <h3>Layer Depth</h3>
              <p>레이어 수가 늘수록 더 추상적인 표현이 만들어집니다.</p>
            </div>
            <div className="slider-block">
              <input
                type="range"
                min="2"
                max="12"
                step="2"
                value={layerDepth}
                onChange={(event) => setLayerDepth(Number(event.target.value))}
              />
              <div className="slider-readout">
                <strong>{layerDepth} layers</strong>
                <span>{currentStage.detail}</span>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <h3>Decoder Note</h3>
              <p>생성 시점에는 미래 토큰을 볼 수 없습니다.</p>
            </div>
            <div className="mask-grid">
              {tokens.map((token, rowIndex) => (
                <div key={`${token}-mask`} className="mask-row">
                  {tokens.map((_, colIndex) => (
                    <span
                      key={`${rowIndex}-${colIndex}`}
                      className={colIndex <= rowIndex ? "open" : "blocked"}
                    />
                  ))}
                </div>
              ))}
            </div>
          </section>
        </div>
      </motion.section>

      <motion.section
        className="explainers"
        variants={SECTION_VARIANTS}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="explainer">
          <p className="section-kicker">Q · K · V</p>
          <h3>Query, Key, Value는 “무엇을 찾고, 무엇과 비교하며, 무엇을 가져올지”를 분리합니다.</h3>
          <p>
            선택한 토큰은 Query가 되고, 나머지 토큰의 Key와 유사도를 계산합니다. 점수가 높을수록 해당
            Value를 더 많이 섞어 새로운 표현을 만듭니다.
          </p>
        </div>
        <div className="explainer">
          <p className="section-kicker">Residual + Norm</p>
          <h3>깊어져도 학습이 안정적인 이유는 지름길 연결과 정규화에 있습니다.</h3>
          <p>
            각 블록 출력만 쓰지 않고 입력을 다시 더해 원래 정보가 남도록 유지합니다. 그 뒤 정규화해
            분포를 안정시키면 깊은 레이어에서도 학습이 덜 흔들립니다.
          </p>
        </div>
      </motion.section>

      <motion.section
        className="footer-cta"
        variants={SECTION_VARIANTS}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        <p className="section-kicker">요약</p>
        <h2>트랜스포머는 “순서대로 읽는 모델”이 아니라 “관계를 한 번에 계산하는 모델”입니다.</h2>
        <p>
          이 페이지는 발표 자료, 개인 학습, 수업 데모 용도로 로컬에서 바로 실행할 수 있게 구성했습니다.
        </p>
      </motion.section>
    </main>
  );
}

export default App;
