export type Gender = "male" | "female" | "other" | "unspecified";
export type ElementKey = "wood" | "fire" | "earth" | "metal" | "water";

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

export type FiveElementAnalyzeResponse = {
  birth_date: string;
  gender: Gender;
  scores: Record<ElementKey, number>;
  elements: FiveElementScore[];
  dominant_element: FiveElementSummaryItem;
  weak_element: FiveElementSummaryItem;
  summary: string;
  ai_markdown: string;
  note: string;
};

const API_BASE_URL = "/api/v1";

export async function analyzeFiveElements(
  birthDate: string,
  gender: Gender
): Promise<FiveElementAnalyzeResponse> {
  const response = await fetch(`${API_BASE_URL}/five-elements/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      birth_date: birthDate,
      gender
    })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail || "五行画像生成失败，请稍后再试");
  }

  return response.json();
}
