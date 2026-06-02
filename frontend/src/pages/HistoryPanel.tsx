import { useEffect, useState } from "react";
import type { FiveElementAnalyzeResponse, FiveElementRecordItem } from "../api/fiveElement";
import { deleteRecord, fetchRecordById, fetchRecords } from "../api/fiveElement";

const ELEMENT_COLOR: Record<string, string> = {
  wood: "#5a8a5a",
  fire: "#c94a3a",
  earth: "#b8923e",
  metal: "#8a8a8a",
  water: "#3a6f8a",
};

type HistoryPanelProps = {
  onViewResult: (result: FiveElementAnalyzeResponse) => void;
};

export function HistoryPanel({ onViewResult }: HistoryPanelProps) {
  const [records, setRecords] = useState<FiveElementRecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchRecords();
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("确定删除这条记录吗？")) return;
    try {
      await deleteRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  }

  async function handleClick(id: number) {
    try {
      const result = await fetchRecordById(id);
      onViewResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  if (loading) return <p className="history-loading">加载中...</p>;
  if (error) return <p className="history-error">{error}</p>;

  return (
    <div className="history-panel">
      {records.length === 0 ? (
        <p className="history-empty">暂无历史记录<br />生成一次易境画像后会自动保存</p>
      ) : (
        <ul className="history-list">
          {records.map((r) => (
            <li
              key={r.id}
              className="history-item"
              onClick={() => handleClick(r.id)}
            >
              <div className="history-item-left">
                <span
                  className="history-dot"
                  style={{ background: ELEMENT_COLOR[r.dominant_key] || "#8a8a8a" }}
                />
                <div className="history-item-info">
                  <span className="history-item-name">{r.dominant_name}</span>
                  <span className="history-item-date">{formatDate(r.created_at)}</span>
                </div>
              </div>
              <button
                className="history-delete"
                onClick={(e) => handleDelete(r.id, e)}
                title="删除"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
