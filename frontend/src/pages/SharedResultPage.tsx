import { useEffect, useState } from "react";
import type { ElementKey, FiveElementAnalyzeResponse } from "../api/fiveElement";
import { fetchSharedResult } from "../api/fiveElement";
import { FiveElementRadar } from "../components/FiveElementRadar";
import { Logo } from "../components/Logo";
import { MarkdownView } from "../components/MarkdownView";

const ELEMENT_WASH: Record<ElementKey, string> = {
  wood: "rgba(74,124,89,0.07)",
  fire: "rgba(180,80,50,0.07)",
  earth: "rgba(184,146,62,0.07)",
  metal: "rgba(138,138,138,0.07)",
  water: "rgba(58,95,138,0.07)",
};

const ELEMENT_COLOR: Record<ElementKey, string> = {
  wood: "#5a8a5a",
  fire: "#c94a3a",
  earth: "#b8923e",
  metal: "#8a8a8a",
  water: "#3a6f8a",
};

const ELEMENT_POETIC: Record<ElementKey, string> = {
  wood: "条达",
  fire: "离明",
  earth: "稼穑",
  metal: "从革",
  water: "润下",
};

function ensureStr(v: unknown): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map((item) => String(item)).join("；");
  if (v === null || v === undefined) return "";
  return String(v);
}

export function SharedResultPage() {
  const [result, setResult] = useState<FiveElementAnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    if (!idParam) {
      setError("缺少分享记录 ID");
      setLoading(false);
      return;
    }
    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) {
      setError("无效的分享记录 ID");
      setLoading(false);
      return;
    }

    fetchSharedResult(id)
      .then((data) => setResult(data))
      .catch((err) => setError(err instanceof Error ? err.message : "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="shared-result-page">
        <div className="shared-loading">
          <Logo variant="icon" />
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="shared-result-page">
        <div className="shared-error">
          <Logo variant="icon" />
          <h2>无法加载分享内容</h2>
          <p>{error || "记录不存在或已被删除"}</p>
          <p className="shared-hint">请联系分享者重新发送链接</p>
        </div>
      </div>
    );
  }

  const tag = result.personality_tag;

  return (
    <div className="shared-result-page">
      <header className="shared-header">
        <Logo variant="horizontal" />
      </header>

      <section className="element-hero">
        <div
          className="hero-wash"
          style={{
            background: `radial-gradient(circle, ${ELEMENT_WASH[result.dominant_element.key]} 0%, ${ELEMENT_WASH[result.dominant_element.key].replace("0.07", "0.03")} 40%, transparent 70%)`,
          }}
        />
        <p className="hero-label">五行主元素</p>
        <span
          className="dominant-char"
          style={{ color: ELEMENT_COLOR[result.dominant_element.key] }}
        >
          {result.dominant_element.name}
        </span>
        <h2 className="dominant-name">
          {result.dominant_element.name} · {ELEMENT_POETIC[result.dominant_element.key]}
        </h2>
      </section>

      <h3 className="section-title">五行分布</h3>
      <div className="radar-card">
        <FiveElementRadar elements={result.elements} size={220} />
      </div>
      <div className="legend-row">
        {result.elements.map((item) => (
          <span className="legend-item" key={item.key}>
            <span className={`legend-dot ${item.key}`} />
            {item.name} {item.score}%
          </span>
        ))}
      </div>

      <div className="breakdown">
        {result.elements.map((item) => (
          <div className="breakdown-row" key={item.key}>
            <span className="elem-char" style={{ color: ELEMENT_COLOR[item.key] }}>
              {item.name}
            </span>
            <span className="elem-symbol">{item.symbol}</span>
            <span className="elem-track">
              <span
                className={`elem-fill ${item.key}`}
                style={{ width: `${item.score}%` }}
              />
            </span>
            <span className="elem-pct">{item.score}%</span>
          </div>
        ))}
        <p className="breakdown-note">{result.summary}</p>
      </div>

      <section className="ai-section">
        <div className="ai-header">
          <span className="ai-header-dot" />
          <span className="ai-header-label">AI 文化解读</span>
        </div>
        <article className="ai-letter">
          <MarkdownView markdown={result.ai_markdown} />
          <div className="ai-seal">—— 易境 · AI 解读</div>
        </article>
      </section>

      {tag && (
        <section className="tag-section">
          <div className="tag-section-header">
            <span className="tag-header-dot" />
            <span className="tag-header-label">易境人格标签</span>
            <span className="tag-header-note">五行 × MBTI 融合</span>
          </div>
          <div className="tag-card">
            <div className="tag-card-wash" />
            <div className="tag-corner-bl" />
            <div className="tag-label-hero">{tag.label}</div>
            <div className="tag-combination">{tag.combination}</div>
            <div className="tag-divider-ornament">
              <span className="tag-divider-ornament-dot" />
            </div>
            <p className="tag-explanation">{ensureStr(tag.explanation)}</p>
            <div className="tag-grid">
              <div className="tag-grid-item">
                <h4 className="tag-grid-heading strengths-heading">优势</h4>
                <p className="tag-grid-text">{ensureStr(tag.strengths)}</p>
              </div>
              <div className="tag-grid-item">
                <h4 className="tag-grid-heading risks-heading">潜在盲区</h4>
                <p className="tag-grid-text">{ensureStr(tag.risks)}</p>
              </div>
            </div>
            <div className="tag-suggestions">
              <h4 className="tag-grid-heading suggestions-heading">成长建议</h4>
              <p className="tag-grid-text">{ensureStr(tag.suggestions)}</p>
            </div>
            <div className="tag-card-seal">易境 · 人格观察</div>
          </div>
        </section>
      )}

      {result.fusion_markdown && (
        <section className="ai-section fusion-section">
          <div className="ai-header fusion-header">
            <span className="ai-header-dot fusion-dot" />
            <span className="ai-header-label">
              五行 × {result.mbti_type} 融合观察
            </span>
          </div>
          <article className="ai-letter fusion-letter">
            <MarkdownView markdown={result.fusion_markdown} />
          </article>
        </section>
      )}

      <footer className="shared-footer">
        <Logo variant="icon" />
        <p>以上内容为传统五行理论角度的文化解读与自我观察，不代表现实预测。</p>
      </footer>
    </div>
  );
}
