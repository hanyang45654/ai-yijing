import json
import re

import httpx

from app.core.config import settings
from app.models import DailySign

BANNED_WORDS = [
    "必定",
    "注定",
    "保证",
    "财运一定提升",
    "桃花一定出现",
    "命中注定",
    "一定发财",
    "一定升职",
    "保证成功",
]


class DeepSeekConfigError(RuntimeError):
    pass


class DeepSeekServiceError(RuntimeError):
    pass


class DeepSeekService:
    def interpret_sign(self, sign: DailySign) -> str:
        if not settings.deepseek_api_key:
            raise DeepSeekConfigError("DeepSeek API Key 未配置，请设置 DEEPSEEK_API_KEY")

        payload = {
            "model": settings.deepseek_model,
            "messages": [
                {
                    "role": "system",
                    "content": self._system_prompt(),
                },
                {
                    "role": "user",
                    "content": self._user_prompt(sign),
                },
            ],
            "temperature": 0.7,
        }

        try:
            with httpx.Client(timeout=30) as client:
                response = client.post(
                    settings.deepseek_api_url,
                    headers={
                        "Authorization": f"Bearer {settings.deepseek_api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise DeepSeekServiceError(f"DeepSeek API 返回错误：{exc.response.status_code}") from exc
        except httpx.HTTPError as exc:
            raise DeepSeekServiceError("DeepSeek API 请求失败，请稍后再试") from exc

        data = response.json()
        try:
            content = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise DeepSeekServiceError("DeepSeek API 返回格式异常") from exc

        return self._sanitize_response(content)

    def interpret_five_elements_mbti(self, analysis: dict, mbti_type: str) -> dict:
        if not settings.deepseek_api_key:
            raise DeepSeekConfigError("DeepSeek API Key 未配置，请设置 DEEPSEEK_API_KEY")

        payload = {
            "model": settings.deepseek_model,
            "messages": [
                {
                    "role": "system",
                    "content": self._five_element_mbti_system_prompt(),
                },
                {
                    "role": "user",
                    "content": self._five_element_mbti_user_prompt(analysis, mbti_type),
                },
            ],
            "temperature": 0.7,
        }

        try:
            with httpx.Client(timeout=60) as client:
                response = client.post(
                    settings.deepseek_api_url,
                    headers={
                        "Authorization": f"Bearer {settings.deepseek_api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise DeepSeekServiceError(f"DeepSeek API 返回错误：{exc.response.status_code}") from exc
        except httpx.HTTPError as exc:
            raise DeepSeekServiceError("DeepSeek API 请求失败，请稍后再试") from exc

        data = response.json()
        try:
            content = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise DeepSeekServiceError("DeepSeek API 返回格式异常") from exc

        sanitized = self._sanitize_response(content)
        return self._parse_fusion_response(sanitized)

    def interpret_five_elements(self, analysis: dict) -> str:
        if not settings.deepseek_api_key:
            raise DeepSeekConfigError("DeepSeek API Key 未配置，请设置 DEEPSEEK_API_KEY")

        payload = {
            "model": settings.deepseek_model,
            "messages": [
                {
                    "role": "system",
                    "content": self._five_element_system_prompt(),
                },
                {
                    "role": "user",
                    "content": self._five_element_user_prompt(analysis),
                },
            ],
            "temperature": 0.7,
        }

        try:
            with httpx.Client(timeout=30) as client:
                response = client.post(
                    settings.deepseek_api_url,
                    headers={
                        "Authorization": f"Bearer {settings.deepseek_api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise DeepSeekServiceError(f"DeepSeek API 返回错误：{exc.response.status_code}") from exc
        except httpx.HTTPError as exc:
            raise DeepSeekServiceError("DeepSeek API 请求失败，请稍后再试") from exc

        data = response.json()
        try:
            content = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise DeepSeekServiceError("DeepSeek API 返回格式异常") from exc

        return self._sanitize_response(content)

    def _system_prompt(self) -> str:
        return """
你是一名年轻化、克制、懂传统文化的国学解读助手。

你的任务是基于签文做文化解读，而不是算命或预测未来。

必须遵守：
- 禁止预测未来。
- 禁止承诺现实结果。
- 禁止使用“必定”“注定”“保证”“财运一定提升”“桃花一定出现”等绝对化表述。
- 统一采用“从传统文化角度看”“该签通常象征”“可以理解为”等温和表述。
- 不提供医疗、投资、法律、婚恋决策结论。
- 输出 Markdown。

请严格按以下结构输出：

## 签文释义

## 传统文化出处

## 象征意义

## 现代生活启示
""".strip()

    def _user_prompt(self, sign: DailySign) -> str:
        keywords = "、".join(sign.keywords)
        return f"""
请解读以下签文：

签号：第 {sign.sign_no} 签
签名：{sign.title}
签文：{sign.original_text}
关键词：{keywords}
已有传统解释：{sign.plain_explanation}
文化依据：{sign.cultural_source}
今日启发：{sign.inspiration}

请避免玄学化、恐吓式、绝对化表达。内容要适合年轻用户阅读，温柔、有趣、清醒。
""".strip()

    def _five_element_system_prompt(self) -> str:
        return """
你是一名年轻化、克制、懂传统五行文化的国学解读助手。

你的任务是基于五行比例做传统文化解读，而不是算命或预测未来。

必须遵守：
- 禁止财运预测、婚姻预测、升职预测。
- 禁止承诺现实结果。
- 禁止使用“必定”“注定”“命中注定”“保证”“保证成功”“一定发财”“一定升职”“财运一定提升”“桃花一定出现”等绝对化表述。
- 统一采用“从传统五行理论角度看”“通常象征”“可以理解为”等温和表达。
- 不提供医疗、投资、法律、婚恋决策结论。
- 输出 Markdown。

请严格按以下结构输出：

## 五行结构说明

## 传统文化中的象征意义

## 性格倾向分析

## 成长建议
""".strip()

    def _five_element_user_prompt(self, analysis: dict) -> str:
        element_lines = "\n".join(
            f"- {item['name']}：{item['score']}%，通常象征{item['symbol']}"
            for item in analysis["elements"]
        )
        return f"""
请基于以下五行画像做文化解读：

出生日期：{analysis["birth_date"]}
性别：{analysis["gender"]}
五行比例：
{element_lines}

主元素：{analysis["dominant_element"]["name"]}（{analysis["dominant_element"]["score"]}%）
相对较弱元素：{analysis["weak_element"]["name"]}（{analysis["weak_element"]["score"]}%）
结构摘要：{analysis["summary"]}

请避免玄学化、恐吓式、绝对化表达。内容要适合18-35岁年轻用户阅读，温柔、清醒、有启发。
""".strip()

    def _five_element_mbti_system_prompt(self) -> str:
        return """
你是一名兼具传统文化功底和现代心理学素养的解读助手，服务于"易境"平台。

你的任务是基于用户的五行画像和MBTI类型，生成一份融合人格分析。你必须在回复的开头输出一个严格的JSON对象，然后是Markdown格式的分析文章。

## JSON 输出格式（严格放在 ```json 代码块中，作为回复的第一部分）

```json
{
  "label": "四字标签名",
  "combination": "五行+MBTI组合描述（10字以内）",
  "explanation": "人格解释（2-3句）",
  "strengths": "核心优势（2-3条）",
  "risks": "潜在盲区（2-3条）",
  "suggestions": "成长建议（2-3条）"
}
```

## 标签命名规则
- 标签必须为四个汉字，有文化感，如同一句浓缩的自我描述
- 前两字体现五行主元素的气质：木→生长/舒展/向上，火→热情/表达/照亮，土→承载/稳定/包容，金→规则/判断/清晰，水→流动/感知/深邃
- 后两字体现MBTI的核心认知倾向：如 战略/灵感/执行/感知/守护/探索/构建/创造/洞察 等
- 示例：战略生长型、灵感燃动型、深流感知型、稳域执行型、明断构建型

## Markdown 分析文章格式
在JSON代码块之后，用自然优美的中文写一篇融合分析短文，结构如下：

## 五行 × MBTI 融合观察
从"文化 × 心理"的交叉视角，将五行主元素的特质与MBTI的认知偏好互相印证或形成张力的地方，给出2-3个具体观察。使用比喻和意象。

## 优势与盲区
五行+MBTI组合中自然展现的积极倾向，以及可能出现的盲区或失衡倾向。

## 成长建议
2-3条具体、可操作的生活或成长建议。

最后另起一行附上 `—— 易境 · 人格观察`

## 必须遵守的规则
- 这不是算命，不是性格测试，而是传统文化与现代心理学的交叉观察
- 禁止财运预测、婚姻预测、升职预测
- 禁止使用"必定""注定""命中注定""保证"等绝对化表述
- 统一采用"从五行与MBTI的交叉角度看""可以理解为""倾向于"等温和表达
- 文字温柔、清醒、有启发，适合18-35岁年轻用户阅读
""".strip()

    def _five_element_mbti_user_prompt(self, analysis: dict, mbti_type: str) -> str:
        element_lines = "\n".join(
            f"- {item['name']}：{item['score']}%，通常象征{item['symbol']}"
            for item in analysis["elements"]
        )
        return f"""
请基于以下五行画像和MBTI类型，生成融合人格标签和分析文章：

【五行画像】
出生日期：{analysis["birth_date"]}
性别：{analysis["gender"]}
五行比例：
{element_lines}

主元素：{analysis["dominant_element"]["name"]}（{analysis["dominant_element"]["score"]}%）
相对较弱元素：{analysis["weak_element"]["name"]}（{analysis["weak_element"]["score"]}%）

【MBTI 类型】
{mbti_type}

请先输出JSON代码块（包含四字标签和结构化字段），然后输出Markdown分析文章。标签名要有文化感，避免玄学化表达。
""".strip()

    def _parse_fusion_response(self, content: str) -> dict:
        json_match = re.search(r"```json\s*(.*?)\s*```", content, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
            markdown = content[json_match.end():].strip()
        else:
            maybe_json = content.strip()
            if maybe_json.startswith("{"):
                json_str = maybe_json.split("\n}", 1)[0] + "\n}" if "\n}" in maybe_json else maybe_json
                markdown = ""
            else:
                return {"personality_tag": None, "fusion_markdown": content}

        try:
            tag_data = json.loads(json_str)
            return {
                "personality_tag": {
                    "label": tag_data.get("label", ""),
                    "combination": tag_data.get("combination", ""),
                    "explanation": tag_data.get("explanation", ""),
                    "strengths": tag_data.get("strengths", ""),
                    "risks": tag_data.get("risks", ""),
                    "suggestions": tag_data.get("suggestions", ""),
                },
                "fusion_markdown": markdown or content,
            }
        except (json.JSONDecodeError, TypeError):
            return {"personality_tag": None, "fusion_markdown": content}

    def _sanitize_response(self, content: str) -> str:
        replacements = {
            "必定": "通常会",
            "注定": "可以理解为",
            "保证": "有助于",
            "财运一定提升": "对资源与机会的观察会更清楚",
            "桃花一定出现": "在人际关系中更容易保持开放",
            "命中注定": "从传统文化角度可以理解为",
            "一定发财": "对资源与机会的观察会更清楚",
            "一定升职": "在成长路径上更有方向感",
            "保证成功": "有助于靠近更稳定的结果",
        }
        sanitized = content
        for banned_word in BANNED_WORDS:
            sanitized = sanitized.replace(banned_word, replacements[banned_word])
        return sanitized
