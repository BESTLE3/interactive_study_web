import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import ArchitectureFigure from "./components/ArchitectureFigure";
import FormulaBlock from "./components/FormulaBlock";
import {
  EXPLAINERS,
  HEAD_LABELS,
  HEAD_PATTERNS,
  PROCESS_CARDS,
  STAGES,
  STORY_POINTS,
  TOKEN_SETS
} from "./content";

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
  const [activeProcessCard, setActiveProcessCard] = useState(null);
  const [activeProcessIndex, setActiveProcessIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const processViewportRef = useRef(null);
  const processTrackRef = useRef(null);

  const tokens = TOKEN_SETS[scenario];

  const attentionWeights = useMemo(() => {
    const scenarioPatterns = HEAD_PATTERNS[scenario] ?? [];
    const headPatterns = scenarioPatterns[selectedHead] ?? [];
    const selectedPattern = headPatterns[selectedToken];

    if (selectedPattern) {
      return selectedPattern;
    }

    return tokens.map(() => Number((1 / tokens.length).toFixed(4)));
  }, [scenario, selectedHead, selectedToken, tokens]);

  const currentStage = STAGES[Math.min(STAGES.length - 1, Math.floor(layerDepth / 2))];

  const getProcessCards = () => {
    const track = processTrackRef.current;

    if (!track) {
      return [];
    }

    return Array.from(track.querySelectorAll(".process-card"));
  };

  const updateProcessCarouselState = () => {
    const viewport = processViewportRef.current;
    const cards = getProcessCards();

    if (!viewport || cards.length === 0) {
      return;
    }

    const nextIndex = cards.reduce((closestIndex, card, index) => {
      const currentDistance = Math.abs(card.offsetLeft - viewport.scrollLeft);
      const closestDistance = Math.abs(cards[closestIndex].offsetLeft - viewport.scrollLeft);
      return currentDistance < closestDistance ? index : closestIndex;
    }, 0);
    const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);

    setActiveProcessIndex(Math.min(PROCESS_CARDS.length - 1, Math.max(0, nextIndex)));
    setCanScrollPrev(viewport.scrollLeft > 8);
    setCanScrollNext(viewport.scrollLeft < maxScrollLeft - 8);
  };

  const scrollToProcessCard = (index) => {
    const viewport = processViewportRef.current;
    const cards = getProcessCards();

    if (!viewport || cards.length === 0) {
      return;
    }

    const nextIndex = Math.min(PROCESS_CARDS.length - 1, Math.max(0, index));
    viewport.scrollTo({
      left: cards[nextIndex].offsetLeft,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    const session = new URLSearchParams(window.location.search).get("session");

    if (!session) {
      return undefined;
    }

    const heartbeatUrl = `/__heartbeat?session=${encodeURIComponent(session)}`;
    const closeUrl = `/__close?session=${encodeURIComponent(session)}`;

    const sendHeartbeat = () => {
      fetch(heartbeatUrl, {
        method: "POST",
        cache: "no-store",
        keepalive: true
      }).catch(() => {});
    };

    const sendClose = () => {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(closeUrl, "");
        return;
      }

      fetch(closeUrl, {
        method: "POST",
        cache: "no-store",
        keepalive: true
      }).catch(() => {});
    };

    sendHeartbeat();
    const intervalId = window.setInterval(sendHeartbeat, 5000);
    window.addEventListener("pagehide", sendClose);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("pagehide", sendClose);
    };
  }, []);

  useEffect(() => {
    updateProcessCarouselState();

    const handleResize = () => updateProcessCarouselState();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleProcessCardClick = (card) => {
    setActiveProcessCard(card);
  };

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">INTERACTIVE STUDY / TRANSFORMER ATLAS</p>
          <h1>트랜스포머가 문맥을 읽고 다음 토큰을 고르는 과정을 눈으로 따라갑니다.</h1>
          <p className="hero-body">
            이 페이지는 트랜스포머의 핵심 구성 요소인 임베딩, 위치 인코딩, 셀프 어텐션,
            멀티-헤드 구조, 피드포워드 네트워크, 오토리그레시브 디코딩을 한 흐름으로 설명합니다.
            대학 강의 수준의 개념은 유지하되, 각 단계가 무엇을 계산하는지 직관적으로 따라갈 수 있도록
            시각화와 조작 패널을 함께 배치했습니다.
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
          <h2>트랜스포머는 순서를 한 칸씩 처리하기보다, 관계를 행렬 형태로 한꺼번에 계산합니다.</h2>
        </div>
        <div className="story-points">
          {STORY_POINTS.map((point) => (
            <p key={point}>{point}</p>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="architecture-section"
        variants={SECTION_VARIANTS}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="architecture-copy">
          <p className="section-kicker">구조 도식</p>
        </div>
        <ArchitectureFigure />
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
          </div>
          <div className="control-row scenario-tabs">
            {Object.keys(TOKEN_SETS).map((key) => (
              <button
                key={key}
                type="button"
                className={scenario === key ? "is-selected" : ""}
                aria-pressed={scenario === key}
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
              <p>하나의 토큰을 기준으로 잡고, 그 토큰이 문맥을 해석할 때 어떤 단어에 더 큰 주의를 두는지 확인합니다.</p>
            </div>
            <div className="token-row">
              {tokens.map((token, index) => (
                <button
                  key={`${token}-${index}`}
                  type="button"
                  className={`token-chip ${selectedToken === index ? "active" : ""}`}
                  aria-pressed={selectedToken === index}
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
              <p>각 어텐션 헤드는 동일한 문장을 보더라도 서로 다른 통계적 관계 패턴을 학습할 수 있습니다.</p>
            </div>
            <div className="head-list">
              {[0, 1, 2, 3].map((head) => (
                <button
                  key={head}
                  type="button"
                  className={`head-button ${selectedHead === head ? "active" : ""}`}
                  aria-pressed={selectedHead === head}
                  onClick={() => setSelectedHead(head)}
                >
                  <span>Head {head + 1}</span>
                  <strong>{HEAD_LABELS[head]}</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <h3>Layer Depth</h3>
              <p>레이어가 깊어질수록 표현은 단순한 단어 수준에서 문장 구조와 의미 수준의 추상 표현으로 이동합니다.</p>
            </div>
            <div className="slider-block">
              <input
                type="range"
                min="2"
                max="12"
                step="2"
                value={layerDepth}
                aria-label="레이어 깊이"
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
              <p>생성 모델은 미래 정보를 미리 볼 수 없으므로, 마스킹을 통해 항상 과거와 현재 정보만 참조하도록 제한됩니다.</p>
            </div>
            <div className="mask-grid">
              {tokens.map((token, rowIndex) => (
                <div key={`${token}-mask`} className="mask-row">
                  {tokens.map((_, colIndex) => (
                    <span
                      key={`${rowIndex}-${colIndex}`}
                      aria-hidden="true"
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
        {EXPLAINERS.map((item) => (
          <div key={item.kicker} className="explainer">
            <p className="section-kicker">{item.kicker}</p>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
      </motion.section>

      <motion.section
        className="process-section"
        variants={SECTION_VARIANTS}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="process-header">
          <p className="section-kicker">수학적 작동 순서</p>
        </div>
        <div className="process-carousel">
          <div
            ref={processViewportRef}
            className="process-viewport"
            onScroll={updateProcessCarouselState}
          >
            <div ref={processTrackRef} className="process-flow">
              {PROCESS_CARDS.map((card) => (
                <article key={card.id} className="process-card">
                  <button
                    type="button"
                    className="process-card-button"
                    onClick={() => handleProcessCardClick(card)}
                  >
                    <span className="process-step">{card.step}</span>
                    <p className="section-kicker">{card.kicker}</p>
                    <h3>{card.title}</h3>
                    <p>{card.summary}</p>
                  </button>
                </article>
              ))}
            </div>
          </div>

          {canScrollPrev ? (
            <div className="process-nav-zone process-nav-zone-left">
              <button
                type="button"
                className="process-nav-button"
                aria-label="이전 카드 보기"
                onClick={() => scrollToProcessCard(activeProcessIndex - 1)}
              >
                ←
              </button>
            </div>
          ) : null}

          {canScrollNext ? (
            <div className="process-nav-zone process-nav-zone-right">
              <button
                type="button"
                className="process-nav-button"
                aria-label="다음 카드 보기"
                onClick={() => scrollToProcessCard(activeProcessIndex + 1)}
              >
                →
              </button>
            </div>
          ) : null}
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
        <h2>트랜스포머는 “단어를 차례로 읽는 장치”가 아니라 “토큰 사이 관계를 확률적으로 계산하는 구조”입니다.</h2>
        <p>
          따라서 트랜스포머를 이해한다는 것은 단순히 모델 이름을 아는 것이 아니라, 어텐션 가중치가 어떻게
          정보 흐름을 재구성하고 그 결과가 다음 토큰 예측으로 이어지는지를 이해하는 일에 가깝습니다.
        </p>
      </motion.section>

      {activeProcessCard ? (
        <div
          className="process-modal-backdrop"
          role="presentation"
          onClick={() => setActiveProcessCard(null)}
        >
          <section
            className="process-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="process-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="process-modal-close"
              aria-label="닫기"
              onClick={() => setActiveProcessCard(null)}
            >
              ×
            </button>
            <span className="process-step">{activeProcessCard.step}</span>
            <p className="section-kicker">{activeProcessCard.kicker}</p>
            <h3 id="process-modal-title">{activeProcessCard.title}</h3>
            <p className="process-modal-summary">{activeProcessCard.summary}</p>
            <div className="process-modal-formulas">
              {activeProcessCard.formulas.map((formula) => (
                <FormulaBlock key={formula} formula={formula} />
              ))}
            </div>
            <div className="process-modal-body">
              {activeProcessCard.details.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default App;
