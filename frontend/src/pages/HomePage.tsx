type HomePageProps = {
  onNavigate: (page: "daily-sign" | "five-elements") => void;
};

export function HomePage({ onNavigate }: HomePageProps) {
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

      <h1 className="brand-title">国学助手</h1>
      <p className="brand-subtitle">
        传统文化<span className="dot-sep" />AI解读<span className="dot-sep" />自我观察
      </p>

      <div className="home-btn-area">
        <button
          className="entry-btn primary"
          onClick={() => onNavigate("daily-sign")}
        >
          <span className="btn-icon">签</span>
          <span className="btn-label">
            今日一签
            <span className="btn-desc">每日一签 · AI解签</span>
          </span>
        </button>

        <button
          className="entry-btn secondary"
          onClick={() => onNavigate("five-elements")}
        >
          <span className="btn-icon">五</span>
          <span className="btn-label">
            五行画像
            <span className="btn-desc">观其五行 · 知己知彼</span>
          </span>
        </button>
      </div>

      <footer className="home-footer">
        <p>传统文化解读与自我观察<br />不预测未来，不承诺结果</p>
      </footer>
    </div>
  );
}
