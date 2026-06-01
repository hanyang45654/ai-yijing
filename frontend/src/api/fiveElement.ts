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
  note: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export async function analyzeFiveElements(
  birthDate: string,
  gender: Gender,
  mbtiType?: MbtiType
): Promise<FiveElementAnalyzeResponse> {
  const response = await fetch(`${API_BASE_URL}/five-elements/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      birth_date: birthDate,
      gender,
      mbti_type: mbtiType ?? null,
    })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail || "画像生成失败，请稍后再试");
  }

  return response.json();
}
