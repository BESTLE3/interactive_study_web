function MultilineText({ x, startY, lines, lineHeight, fill, fontSize = 13, fontWeight = "400" }) {
  return lines.map((line, index) => (
    <text
      key={`${line}-${index}`}
      x={x}
      y={startY + index * lineHeight}
      fontSize={fontSize}
      fontWeight={fontWeight}
      fill={fill}
    >
      {line}
    </text>
  ));
}

function Panel({
  x,
  y,
  width,
  height,
  title,
  lines,
  accent = false,
  titleSize = 18,
  centerText = false
}) {
  const textX = centerText ? width / 2 : 28;
  const textAnchor = centerText ? "middle" : undefined;

  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        width={width}
        height={height}
        rx="22"
        fill={accent ? "rgba(23,52,95,0.94)" : "rgba(255,251,244,0.96)"}
        stroke={accent ? "rgba(23,52,95,1)" : "rgba(23,52,95,0.14)"}
        strokeWidth="1.6"
      />
      <text
        x={textX}
        y="44"
        fontSize={titleSize}
        fontWeight="700"
        fill={accent ? "#fff7ed" : "#17345f"}
        textAnchor={textAnchor}
      >
        {title}
      </text>
      {centerText
        ? lines.map((line, index) => (
            <text
              key={`${title}-${line}`}
              x={width / 2}
              y={84 + index * 24}
              fontSize="13.5"
              fill={accent ? "rgba(255,247,237,0.88)" : "rgba(23,52,95,0.74)"}
              textAnchor="middle"
            >
              {line}
            </text>
          ))
        : (
          <MultilineText
            x={28}
            startY={84}
            lines={lines}
            lineHeight={24}
            fontSize={13.5}
            fill={accent ? "rgba(255,247,237,0.88)" : "rgba(23,52,95,0.74)"}
          />
        )}
    </g>
  );
}

function Layer({ x, y, width, height, title, subtitleLines, depth = 4, accent = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: depth }).map((_, index) => {
        const reverse = depth - index - 1;
        return (
          <rect
            key={`${title}-layer-${index}`}
            x={reverse * 14}
            y={reverse * 14}
            width={width}
            height={height}
            rx="22"
            fill={accent && index === depth - 1 ? "rgba(23,52,95,0.94)" : "rgba(255,251,244,0.98)"}
            stroke={accent && index === depth - 1 ? "rgba(23,52,95,1)" : "rgba(23,52,95,0.14)"}
            strokeWidth="1.6"
          />
        );
      })}

      <text x="32" y="52" fontSize="18" fontWeight="700" fill={accent ? "#fff7ed" : "#17345f"}>
        {title}
      </text>
      <MultilineText
        x={32}
        startY={88}
        lines={subtitleLines}
        lineHeight={22}
        fontSize={13}
        fill={accent ? "rgba(255,247,237,0.9)" : "rgba(23,52,95,0.72)"}
      />
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, dashed = false, direction = "right" }) {
  const arrowHead =
    direction === "up"
      ? `${x2},${y2} ${x2 - 6},${y2 + 12} ${x2 + 6},${y2 + 12}`
      : direction === "down"
        ? `${x2},${y2} ${x2 - 6},${y2 - 12} ${x2 + 6},${y2 - 12}`
        : `${x2},${y2} ${x2 - 12},${y2 - 6} ${x2 - 12},${y2 + 6}`;

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="rgba(23,52,95,0.56)"
        strokeWidth="2.5"
        strokeDasharray={dashed ? "8 8" : undefined}
      />
      <polygon points={arrowHead} fill="rgba(23,52,95,0.72)" />
    </g>
  );
}

function Caption({ x, y, text, anchor = "middle" }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize="13.5"
      fontWeight="500"
      fill="rgba(23,52,95,0.78)"
    >
      {text}
    </text>
  );
}

function ArchitectureFigure() {
  return (
    <div className="architecture-figure">
      <svg viewBox="0 0 1240 880" role="img" aria-label="Transformer encoder decoder architecture diagram">
        <defs>
          <linearGradient id="panelGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(191,132,82,0.18)" />
            <stop offset="100%" stopColor="rgba(23,52,95,0.18)" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="1240" height="880" rx="32" fill="url(#panelGlow)" />

        <text x="58" y="72" fontSize="32" fontWeight="750" fill="#102b52">
          Transformer Architecture
        </text>
        <text x="58" y="106" fontSize="16.5" fontWeight="500" fill="rgba(16,43,82,0.8)">
          논문 구조를 학습용으로 재구성한 인코더-디코더 개념도
        </text>

        <text x="118" y="172" fontSize="17.5" fontWeight="750" fill="#102b52">
          Encoder: bidirectional context aggregation
        </text>
        <text x="927" y="172" textAnchor="middle" fontSize="17.5" fontWeight="750" fill="#102b52">
          Decoder: masked generation + encoder conditioning
        </text>

        <Panel
          x={94}
          y={206}
          width={438}
          height={146}
          title="Self-Attention"
          lines={[
            "각 토큰이 입력 전체를 보며 상호작용합니다.",
            "문법적 의존성, 의미 관계, 장거리 문맥을 동시에 반영합니다."
          ]}
        />
        <Panel
          x={704}
          y={206}
          width={446}
          height={146}
          title="Masked + Cross Attention"
          lines={[
            "디코더는 미래 토큰을 보지 못한 채 과거 출력만 사용합니다.",
            "이후 인코더의 메모리를 읽어 입력 문맥에 조건부 생성이 이뤄집니다."
          ]}
        />
        <Panel
          x={528}
          y={184}
          width={180}
          height={128}
          title="Positional Encoding"
          lines={["토큰 순서 정보", "임베딩에 더해짐"]}
          titleSize={16}
          centerText
        />

        <Layer
          x={126}
          y={536}
          width={284}
          height={124}
          depth={4}
          title="Encoder Stack"
          subtitleLines={["Self-Attention + Add&Norm", "Feed Forward"]}
        />
        <Layer
          x={760}
          y={524}
          width={300}
          height={138}
          depth={5}
          title="Decoder Stack"
          subtitleLines={["Masked Self-Attention +", "Cross-Attention + Feed Forward"]}
          accent
        />

        <Panel
          x={82}
          y={744}
          width={258}
          height={122}
          title="Input Embedding"
          lines={["토큰 벡터", "위치 정보와 결합"]}
        />
        <Panel
          x={722}
          y={744}
          width={258}
          height={126}
          title="Output Embedding"
          lines={["shifted target tokens", "이전 출력이 다음 입력이 됨"]}
        />
        <Panel
          x={1014}
          y={736}
          width={172}
          height={132}
          title="Linear + Softmax"
          lines={["어휘 분포 계산", "다음 토큰 확률 산출"]}
          accent
          titleSize={16}
        />

        <Arrow x1={268} y1={744} x2={268} y2={662} direction="up" />
        <Arrow x1={340} y1={790} x2={540} y2={790} />
        <Arrow x1={552} y1={790} x2={720} y2={790} />
        <Arrow x1={910} y1={744} x2={910} y2={662} direction="up" />
        <Arrow x1={980} y1={790} x2={1012} y2={790} />
        <Arrow x1={426} y1={606} x2={758} y2={606} dashed />

        <Caption x={590} y={584} text="encoder memory passed to decoder cross-attention" />
        <Caption x={212} y={690} text="입력 시퀀스 전체가 인코더 표현으로 축적됨" />
        <Caption x={850} y={706} text="디코더는 자기회귀적으로 한 토큰씩 생성" />
      </svg>
    </div>
  );
}

export default ArchitectureFigure;
