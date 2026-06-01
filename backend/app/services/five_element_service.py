from datetime import date

from app.schemas.five_element import (
    FiveElementAnalyzeResponse,
    FiveElementScore,
    FiveElementSummaryItem,
    Gender,
    MbtiType,
)

ELEMENT_META = {
    "wood": {"name": "木", "symbol": "生长、舒展、创造"},
    "fire": {"name": "火", "symbol": "表达、热情、行动"},
    "earth": {"name": "土", "symbol": "稳定、承载、协调"},
    "metal": {"name": "金", "symbol": "规则、判断、边界"},
    "water": {"name": "水", "symbol": "流动、感知、思考"},
}

ELEMENT_ORDER = ["wood", "fire", "earth", "metal", "water"]

MONTH_ELEMENT = {
    1: "water",
    2: "wood",
    3: "wood",
    4: "earth",
    5: "fire",
    6: "fire",
    7: "earth",
    8: "metal",
    9: "metal",
    10: "earth",
    11: "water",
    12: "water",
}

DAY_LAST_DIGIT_ELEMENT = {
    1: "wood",
    2: "wood",
    3: "fire",
    4: "fire",
    5: "earth",
    6: "earth",
    7: "metal",
    8: "metal",
    9: "water",
    0: "water",
}

YEAR_LAST_DIGIT_ELEMENT = {
    0: "metal",
    1: "metal",
    2: "water",
    3: "water",
    4: "wood",
    5: "wood",
    6: "fire",
    7: "fire",
    8: "earth",
    9: "earth",
}


class FiveElementService:
    def analyze(self, birth_date: date, gender: Gender, mbti_type: MbtiType | None = None) -> FiveElementAnalyzeResponse:
        raw_scores = dict.fromkeys(ELEMENT_ORDER, 8)
        raw_scores[MONTH_ELEMENT[birth_date.month]] += 50
        raw_scores[DAY_LAST_DIGIT_ELEMENT[birth_date.day % 10]] += 30
        raw_scores[YEAR_LAST_DIGIT_ELEMENT[birth_date.year % 10]] += 20

        total = sum(raw_scores.values())
        scores = {key: round(raw_scores[key] / total * 100) for key in ELEMENT_ORDER}
        self._rebalance_to_100(scores)

        elements = [
            FiveElementScore(
                key=key,
                name=ELEMENT_META[key]["name"],
                score=scores[key],
                symbol=ELEMENT_META[key]["symbol"],
            )
            for key in ELEMENT_ORDER
        ]

        dominant_key = max(ELEMENT_ORDER, key=lambda key: scores[key])
        weak_key = min(ELEMENT_ORDER, key=lambda key: scores[key])
        dominant_element = self._summary_item(dominant_key, scores[dominant_key])
        weak_element = self._summary_item(weak_key, scores[weak_key])

        summary = (
            "从传统五行理论角度看，"
            f"你的结构中{dominant_element.name}的比例较明显，"
            f"{weak_element.name}的比例相对轻一些。"
        )

        return FiveElementAnalyzeResponse(
            birth_date=birth_date,
            gender=gender,
            mbti_type=mbti_type,
            scores=scores,
            elements=elements,
            dominant_element=dominant_element,
            weak_element=weak_element,
            summary=summary,
            ai_markdown="",
        )

    def _summary_item(self, key: str, score: int) -> FiveElementSummaryItem:
        return FiveElementSummaryItem(
            key=key,
            name=ELEMENT_META[key]["name"],
            score=score,
        )

    def _rebalance_to_100(self, scores: dict[str, int]) -> None:
        diff = 100 - sum(scores.values())
        if diff == 0:
            return

        key = max(ELEMENT_ORDER, key=lambda item: scores[item])
        scores[key] += diff
