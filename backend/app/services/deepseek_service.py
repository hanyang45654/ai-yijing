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
