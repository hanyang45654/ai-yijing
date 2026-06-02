import { fetchWithAuth } from "./fetchWithAuth";

export type Gender = "male" | "female" | "other" | "unspecified";
export type ElementKey = "wood" | "fire" | "earth" | "metal" | "water";
export type MbtiType =
  | "INTJ" | "INTP" | "ENTJ" | "ENTP"
  | "INFJ" | "INFP" | "ENFJ" | "ENFP"
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ"
  | "ISTP" | "ISFP" | "ESTP" | "ESFP";

export type FiveElementScore = {
  key: ElementKey;
  name: string;
  score: number;
  symbol: string;
};

export type FiveElementSummaryItem = {
  key: ElementKey;
  name: string;
  score: number;
};

export type PersonalityTag = {
  label: string;
  combination: string;
  explanation: string;
  strengths: string;
  risks: string;
  suggestions: string;
};

export type FiveElementAnalyzeResponse = {
  birth_date: string;
  gender: Gender;
  mbti_type: MbtiType | null;
  scores: Record<ElementKey, number>;
  elements: FiveElementScore[];
  dominant_element: FiveElementSummaryItem;
  weak_element: FiveElementSummaryItem;
  summary: string;
  ai_markdown: string;
  fusion_markdown: string | null;
  personality_tag: PersonalityTag | null;
  record_id?: number;
  note: string;
};

export type FiveElementRecordItem = {
  id: number;
  birth_date: string;
  gender: Gender;
  mbti_type: MbtiType | null;
  dominant_key: ElementKey;
  dominant_name: string;
  created_at: string;
};

export async function analyzeFiveElements(
  birthDate: string,
  gender: Gender,
  mbtiType?: MbtiType
): Promise<FiveElementAnalyzeResponse> {
  const response = await fetchWithAuth("/five-elements/analyze", {
    method: "POST",
    body: JSON.stringify({
      birth_date: birthDate,
      gender,
      mbti_type: mbtiType ?? null,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail || "画像生成失败，请稍后再试");
  }

  return response.json();
}

export async function fetchRecords(): Promise<FiveElementRecordItem[]> {
  const response = await fetchWithAuth("/five-elements/records");
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail || "获取历史记录失败");
  }
  return response.json();
}

export async function fetchRecordById(id: number): Promise<FiveElementAnalyzeResponse> {
  const response = await fetchWithAuth(`/five-elements/records/${id}`);
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail || "获取记录详情失败");
  }
  return response.json();
}

export async function deleteRecord(id: number): Promise<void> {
  const response = await fetchWithAuth(`/five-elements/records/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail || "删除记录失败");
  }
}

const SHARED_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export async function fetchSharedResult(id: number): Promise<FiveElementAnalyzeResponse> {
  const response = await fetch(`${SHARED_BASE_URL}/shared/result/${id}`);
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail || "加载分享结果失败");
  }
  return response.json();
}
