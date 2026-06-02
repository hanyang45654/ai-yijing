import { fetchWithAuth } from "./fetchWithAuth";

export type InterpretSignResponse = {
  sign_id: number;
  markdown: string;
  note: string;
};

export async function interpretSign(signId: number): Promise<InterpretSignResponse> {
  const response = await fetchWithAuth("/ai/interpret-sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sign_id: signId })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail || "AI 解签失败，请稍后再试");
  }

  return response.json();
}
