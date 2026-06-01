import { useMemo, useState } from "react";
import { interpretSign, InterpretSignResponse } from "../api/aiInterpretation";
import { drawTodaySign, TodaySignResponse } from "../api/dailySign";
import { MarkdownView } from "../components/MarkdownView";

function getLocalUserKey() {
  const storageKey = "ai-yijing-user-key";
  const existing = localStorage.getItem(storageKey);
  if (existing) {
    return existing;
  }
  const created = `guest-${crypto.randomUUID()}`;
  localStorage.setItem(storageKey, created);
  return created;
}

type DailySignPageProps = {
  onBack: () => void;
};

export function DailySignPage({ onBack }: DailySignPageProps) {
  const [result, setResult] = useState<TodaySignResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiResult, setAiResult] = useState<InterpretSignResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const todayText = useMemo(() => {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "long",
      day: "numeric",
      weekday: "long"
    }).format(new Date());
  }, []);

  async function handleDraw() {
    setLoading(true);
    setError("");
    try {
      const data = await drawTodaySign(getLocalUserKey());
      setResult(data);
      setAiResult(null);
      setAiError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "抽签失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  async function handleInterpretSign() {
    if (!result) {
      return;
    }

    setAiLoading(true);
    setAiError("");
    try {
      const data = await interpretSign(result.sign.id);
      setAiResult(data);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI 解签失败，请稍后再试");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <>
      <nav className="result-top-nav">
        <button className="back-btn" onClick={onBack}>
          ← 首页
        </button>
        <span className="nav-title">今日一签</span>
        <span className="nav-empty" />
      </nav>

      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">{todayText}</p>
          <h1>今日一签</h1>
          <p className="subtitle">从传统文化里取一束光，照一照今天的心绪。</p>
        </div>

        <div className="seal" aria-hidden="true">
          签
        </div>
      </section>

      <section className="draw-stage">
        {!result ? (
          <div className="intro-block">
            <p>每日只取一签，不问未来，只观当下。</p>
            <button className="primary-button" onClick={handleDraw} disabled={loading}>
              {loading ? "正在取签" : "取今日签"}
            </button>
          </div>
        ) : (
          <article className="sign-card">
            <div className="card-topline">
              <span>第 {result.sign.sign_no} 签</span>
              <span>{result.draw_date}</span>
            </div>
            <h2>{result.sign.title}</h2>
            <p className="original-text">{result.sign.original_text}</p>
            <div className="keyword-row">
              {result.sign.keywords.map((keyword) => (
                <span key={keyword}>{keyword}</span>
              ))}
            </div>
            <div className="content-block">
              <h3>传统解读</h3>
              <p>{result.sign.plain_explanation}</p>
            </div>
            <div className="content-block">
              <h3>今日启发</h3>
              <p>{result.sign.inspiration}</p>
            </div>
            <p className="source">文化依据：{result.sign.cultural_source}</p>
            <p className="note">{result.note}</p>
            <div className="action-row">
              <button className="secondary-button" onClick={handleInterpretSign} disabled={aiLoading}>
                {aiLoading ? "AI 解签中" : "AI 解签"}
              </button>
            </div>

            {aiError && <p className="error-text">{aiError}</p>}

            {aiResult && (
              <section className="ai-panel">
                <div className="ai-panel-header">
                  <span>AI 解签</span>
                  <small>{aiResult.note}</small>
                </div>
                <MarkdownView markdown={aiResult.markdown} />
              </section>
            )}
          </article>
        )}

        {error && <p className="error-text">{error}</p>}
      </section>
    </>
  );
}
