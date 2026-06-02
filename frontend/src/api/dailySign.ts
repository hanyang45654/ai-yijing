import { fetchWithAuth } from "./fetchWithAuth";

export type DailySign = {
  id: number;
  sign_no: number;
  title: string;
  original_text: string;
  plain_explanation: string;
  keywords: string[];
  cultural_source: string;
  inspiration: string;
};

export type TodaySignResponse = {
  draw_date: string;
  sign: DailySign;
  note: string;
};

export async function drawTodaySign(userKey: string): Promise<TodaySignResponse> {
  const response = await fetchWithAuth("/daily-signs/draw", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ user_key: userKey })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "抽签失败，请稍后再试");
  }

  return response.json();
}
