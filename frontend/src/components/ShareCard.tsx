import { forwardRef } from "react";
import type { FiveElementAnalyzeResponse, ElementKey } from "../api/fiveElement";

const ELEMENT_COLOR: Record<ElementKey, string> = {
  wood: "#5a8a5a",
  fire: "#c94a3a",
  earth: "#b8923e",
  metal: "#8a8a8a",
  water: "#3a6f8a",
};

const ELEMENT_GRADIENT: Record<ElementKey, string> = {
  wood: "linear-gradient(90deg, #7ab87a, #5a8a5a)",
  fire: "linear-gradient(90deg, #e8735a, #c94a3a)",
  earth: "linear-gradient(90deg, #d4a94e, #b8923e)",
  metal: "linear-gradient(90deg, #c4b896, #a89870)",
  water: "linear-gradient(90deg, #5a9aba, #3a6f8a)",
};

const ELEMENT_POETIC: Record<ElementKey, string> = {
  wood: "条达",
  fire: "离明",
  earth: "稼穑",
  metal: "从革",
  water: "润下",
};

const ELEMENT_QUOTE: Record<ElementKey, string> = {
  wood: "木秀于林，根深者长青。",
  fire: "热情为灯，也需要静水深流。",
  earth: "厚德载物，沉静中自有力量。",
  metal: "金声玉振，锋芒亦可内敛。",
  water: "上善若水，柔韧而能穿石。",
};

type ShareCardProps = {
  result: FiveElementAnalyzeResponse;
};

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ result }, ref) {
    const dominantKey = result.dominant_element.key as ElementKey;
    const dominantColor = ELEMENT_COLOR[dominantKey];
    const poetic = ELEMENT_POETIC[dominantKey];
    const quote = ELEMENT_QUOTE[dominantKey];
    const trait =
      result.elements.find((e) => e.key === dominantKey)?.symbol ?? "";

    return (
      <div className="share-card-wrapper" ref={ref}>
        <div className="share-card">
          <div className="card-paper" />
          <div className="card-inner">
            {/* Header: brand */}
            <div className="card-top">
              <div className="card-brand">
                <div className="mini-seal">
                  <span>易</span>
                </div>
                <span className="card-brand-name">国学助手</span>
              </div>
              <span className="card-badge">五行画像</span>
            </div>

            {/* Hero: dominant element */}
            <span className="card-char" style={{ color: dominantColor }}>
              {result.dominant_element.name}
            </span>
            <div className="card-element-name">
              {result.dominant_element.name} · {poetic}
            </div>
            <div className="card-element-trait">{trait}</div>

            {/* Element distribution: horizontal gradient bars */}
            <div className="card-bars">
              {result.elements.map((item) => (
                <div className="card-bar-row" key={item.key}>
                  <span
                    className="card-bar-label"
                    style={{ color: ELEMENT_COLOR[item.key as ElementKey] }}
                  >
                    {item.name}
                  </span>
                  <span className="card-bar-track">
                    <span
                      className="card-bar-fill"
                      style={{
                        width: `${item.score}%`,
                        background:
                          ELEMENT_GRADIENT[item.key as ElementKey],
                      }}
                    />
                  </span>
                  <span className="card-bar-pct">{item.score}%</span>
                </div>
              ))}
            </div>

            {/* Summary + quote */}
            <p className="card-summary">
              {result.summary}
              <br />
              <em>{quote}</em>
            </p>

            {/* Footer */}
            <div className="card-footer">
              <span className="card-footer-text">
                传统文化解读与自我观察
                <br />
                不预测未来，不承诺结果
              </span>
              <span className="card-footer-divider" />
              <span className="card-footer-text">AI 国学助手</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
