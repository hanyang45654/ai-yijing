import { FormEvent, useRef, useState } from "react";
import {
  analyzeFiveElements,
  FiveElementAnalyzeResponse,
  Gender,
  ElementKey,
  MbtiType,
} from "../api/fiveElement";
import { FiveElementRadar } from "../components/FiveElementRadar";
import { MarkdownView } from "../components/MarkdownView";
import { ShareCard } from "../components/ShareCard";
import { HistoryPanel } from "./HistoryPanel";

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

const genderOptions: Array<{ value: Gender; label: string }> = [
  { value: "unspecified", label: "不透露" },
  { value: "female", label: "女性" },
  { value: "male", label: "男性" },
  { value: "other", label: "其他" },
];

const mbtiOptions: Array<{ value: MbtiType | ""; label: string }> = [
  { value: "", label: "不选择" },
  { value: "INTJ", label: "INTJ" },
  { value: "INTP", label: "INTP" },
  { value: "ENTJ", label: "ENTJ" },
  { value: "ENTP", label: "ENTP" },
  { value: "INFJ", label: "INFJ" },
  { value: "INFP", label: "INFP" },
  { value: "ENFJ", label: "ENFJ" },
  { value: "ENFP", label: "ENFP" },
  { value: "ISTJ", label: "ISTJ" },
  { value: "ISFJ", label: "ISFJ" },
  { value: "ESTJ", label: "ESTJ" },
  { value: "ESFJ", label: "ESFJ" },
  { value: "ISTP", label: "ISTP" },
  { value: "ISFP", label: "ISFP" },
  { value: "ESTP", label: "ESTP" },
  { value: "ESFP", label: "ESFP" },
];

type FiveElementPageProps = {
  onBack: () => void;
};

export function FiveElementPage({ onBack }: FiveElementPageProps) {
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender>("unspecified");
  const [mbti, setMbti] = useState<MbtiType | "">("");
  const [view, setView] = useState<"form" | "result" | "history">("form");
  const [result, setResult] = useState<FiveElementAnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingImage, setSavingImage] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!birthDate) {
      setError("请先选择出生日期");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await analyzeFiveElements(birthDate, gender, mbti || undefined);
      setResult(data);
      setView("result");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "画像生成失败，请稍后再试"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveImage() {
    if (!shareCardRef.current) return;
    setSavingImage(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) {
        setError("图片生成失败，请重试");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "易境画像.png";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "图片保存失败，请稍后再试"
      );
    } finally {
      setSavingImage(false);
    }
  }

  async function handleShareImage() {
    console.log("[分享] 开始执行");
    if (!shareCardRef.current) {
      console.log("[分享] 分享卡片 ref 不存在，退出");
      return;
    }
    setSavingImage(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      console.log("[分享] blob 生成完成，大小:", blob?.size ?? 0, "bytes");
      if (!blob) {
        console.log("[分享] blob 为空，降级到保存图片");
        return handleSaveImage();
      }

      console.log("[分享] navigator.share 存在:", !!navigator.share);
      if (navigator.share) {
        const file = new File([blob], "易境画像.png", { type: "image/png" });
        console.log("[分享] File 创建完成，大小:", file.size, "bytes");
        console.log("[分享] navigator.canShare 存在:", typeof navigator.canShare);
        if (navigator.canShare) {
          const canShareResult = navigator.canShare({ files: [file] });
          console.log("[分享] navigator.canShare({ files: [file] }) 结果:", canShareResult);
        } else {
          console.log("[分享] navigator.canShare 方法不存在");
        }
        try {
          console.log("[分享] 调用 navigator.share...");
          await navigator.share({
            title: "我的易境画像",
            files: [file],
          });
          console.log("[分享] navigator.share 成功");
          return;
        } catch (shareErr) {
          console.log("[分享] navigator.share 失败:", shareErr);
          // User cancelled or share API failed — fall through to download
        }
      }

      console.log("[分享] 降级到下载");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "易境画像.png";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      console.log("[分享] 下载触发完成");
    } catch (err) {
      console.log("[分享] 外层异常:", err);
      setError(
        err instanceof Error ? err.message : "图片分享失败，请稍后再试"
      );
    } finally {
      setSavingImage(false);
    }
  }

  return (
    <>
      <nav className="result-top-nav">
        <button className="back-btn" onClick={onBack}>
          ← 首页
        </button>
        <span className="nav-title">易境画像</span>
        <button
          className="nav-history-btn"
          onClick={() => { setView("history"); setError(""); }}
        >
          历史
        </button>
      </nav>

      {view === "history" && (
        <HistoryPanel onViewResult={(r) => { setResult(r); setView("result"); }} />
      )}

      {view === "form" && (
        <form className="five-form" onSubmit={handleSubmit}>
          <label className="field-block">
            <span>出生日期</span>
            <input
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
          </label>

          <div className="field-block">
            <span>性别（可选）</span>
            <div className="segment-group">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={
                    gender === option.value ? "segment active" : "segment"
                  }
                  onClick={() => setGender(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="field-block">
            <span>MBTI 类型（可选）</span>
            <select
              className="mbti-select"
              value={mbti}
              onChange={(event) => setMbti(event.target.value as MbtiType | "")}
            >
              {mbtiOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="field-hint">
              选择后可触发五行 × MBTI 融合分析
            </span>
          </label>

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "正在生成画像" : "生成画像"}
          </button>
          <p className="note">
            仅作传统文化解读与自我观察，不用于预测未来。
          </p>
        </form>
      )}

      {view === "result" && result && (
        <>
          {/* Dominant Element Hero */}
          <section className="element-hero">
            <div
              className="hero-wash"
              style={{
                background: `radial-gradient(circle, ${ELEMENT_WASH[result.dominant_element.key]} 0%, ${ELEMENT_WASH[result.dominant_element.key].replace("0.07", "0.03")} 40%, transparent 70%)`,
              }}
            />
            <p className="hero-label">你的五行主元素</p>
            <span
              className="dominant-char"
              style={{ color: ELEMENT_COLOR[result.dominant_element.key] }}
            >
              {result.dominant_element.name}
            </span>
            <h2 className="dominant-name">
              {result.dominant_element.name} ·{" "}
              {ELEMENT_POETIC[result.dominant_element.key]}
            </h2>
            <p className="dominant-trait">
              {result.elements.find((e) => e.key === result.dominant_element.key)
                ?.symbol ?? ""}
            </p>
            <div className="ceremony-stamp">
              <span className="stamp-dot" />
              <span className="stamp-text">易境专属画像</span>
            </div>
          </section>

          {/* Radar */}
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

          {/* Element Breakdown */}
          <div className="breakdown">
            {result.elements.map((item) => (
              <div className="breakdown-row" key={item.key}>
                <span
                  className="elem-char"
                  style={{ color: ELEMENT_COLOR[item.key] }}
                >
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

          {/* AI Interpretation */}
          <section className="ai-section">
            <div className="ai-header">
              <span className="ai-header-dot" />
              <span className="ai-header-label">AI 文化解读</span>
              <span className="ai-header-note">{result.note}</span>
            </div>
            <article className="ai-letter">
              <MarkdownView markdown={result.ai_markdown} />
              <div className="ai-seal">—— 易境 · AI 解读</div>
            </article>
          </section>

          {/* Personality Tag Card */}
          {result.personality_tag && (
            <section className="tag-section">
              <div className="tag-section-header">
                <span className="tag-header-dot" />
                <span className="tag-header-label">易境人格标签</span>
                <span className="tag-header-note">五行 × MBTI 融合</span>
              </div>
              <div className="tag-card">
                <div className="tag-card-wash" />
                <div className="tag-corner-bl" />
                <div className="tag-label-hero">
                  {result.personality_tag.label}
                </div>
                <div className="tag-combination">
                  {result.personality_tag.combination}
                </div>
                <div className="tag-divider-ornament">
                  <span className="tag-divider-ornament-dot" />
                </div>
                <p className="tag-explanation">
                  {result.personality_tag.explanation}
                </p>
                <div className="tag-grid">
                  <div className="tag-grid-item">
                    <h4 className="tag-grid-heading strengths-heading">优势</h4>
                    <p className="tag-grid-text">
                      {result.personality_tag.strengths}
                    </p>
                  </div>
                  <div className="tag-grid-item">
                    <h4 className="tag-grid-heading risks-heading">潜在盲区</h4>
                    <p className="tag-grid-text">
                      {result.personality_tag.risks}
                    </p>
                  </div>
                </div>
                <div className="tag-suggestions">
                  <h4 className="tag-grid-heading suggestions-heading">成长建议</h4>
                  <p className="tag-grid-text">
                    {result.personality_tag.suggestions}
                  </p>
                </div>
                <div className="tag-card-seal">易境 · 人格观察</div>
              </div>
            </section>
          )}

          {/* MBTI + Five Elements Extended Reading */}
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

          {/* Share Buttons */}
          <div className="share-row">
            <button
              className="share-btn"
              onClick={handleSaveImage}
              disabled={savingImage}
            >
              {savingImage ? "生成中..." : "保存图片"}
            </button>
            <button
              className="share-btn primary-action"
              onClick={handleShareImage}
              disabled={savingImage}
            >
              分享画像
            </button>
          </div>

          {/* Offscreen share card for html2canvas */}
          <ShareCard ref={shareCardRef} result={result} />
        </>
      )}

      {error && <p className="error-text">{error}</p>}
    </>
  );
}
