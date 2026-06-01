import { useState } from "react";

type HomePageProps = {
  onNavigate: (page: "daily-sign" | "five-elements") => void;
};

export function HomePage({ onNavigate }: HomePageProps) {
  const [showIntro, setShowIntro] = useState(false);

  return (
    <div className="home-page">
      <div className="seal-wrapper">
        <div className="brand-seal">
          <div className="brand-seal-border" />
          <div className="brand-seal-corner tl" />
          <div className="brand-seal-corner tr" />
          <div className="brand-seal-corner bl" />
          <div className="brand-seal-corner br" />
          <span className="brand-seal-char">易</span>
        </div>
      </div>

      <h1 className="brand-title">易境</h1>
      <p className="brand-subtitle">
        东方智慧<span className="dot-sep" />现代心理学<span className="dot-sep" />自我认知
      </p>

      {/* Product intro */}
      <div className={`intro-card${showIntro ? " intro-expanded" : ""}`}>
        <button
          className="intro-toggle"
          onClick={() => setShowIntro(!showIntro)}
          aria-expanded={showIntro}
        >
          <span className="intro-toggle-icon" aria-hidden="true">
            {showIntro ? "−" : "+"}
          </span>
          <span>什么是易境</span>
        </button>
        {showIntro && (
          <div className="intro-body">
            <p>
              易境以《易经》与五行学说为底色，融合MBTI现代心理学视角，打造专属人格观察系统。用传统文化的光，照见现代人的自我认知之路。
            </p>
            <p>
              这里没有答案，只有回响。没有预测，只有觉察。没有标签，只有理解。
            </p>
            <div className="intro-pillars">
              <span className="intro-pillar">
                <em>观</em>传统
              </span>
              <span className="intro-pillar-sep" />
              <span className="intro-pillar">
                <em>识</em>自我
              </span>
              <span className="intro-pillar-sep" />
              <span className="intro-pillar">
                <em>见</em>当下
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="home-btn-area">
        {/* Primary: 易境人格系统 */}
        <button
          className="entry-btn primary"
          onClick={() => onNavigate("five-elements")}
        >
          <span className="btn-icon">境</span>
          <span className="btn-label">
            易境画像
            <span className="btn-desc">五行入画 · 人格可见</span>
          </span>
          <span className="btn-tag">人格系统</span>
        </button>

        <button
          className="entry-btn secondary"
          onClick={() => onNavigate("daily-sign")}
        >
          <span className="btn-icon">签</span>
          <span className="btn-label">
            今日一签
            <span className="btn-desc">每日一签 · AI解签</span>
          </span>
        </button>
      </div>

      <footer className="home-footer">
        <p>传统文化解读与自我观察<br />不预测未来，不承诺结果</p>
      </footer>
    </div>
  );
}
