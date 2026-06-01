"""
Fixed personality tag library for 易境.

Maps (dominant element × MBTI cognitive group) → deterministic four-character label
so AI never invents labels — only fills the content fields.
"""

from app.schemas.five_element import ElementKey, MbtiType

MBTI_GROUPS: dict[str, str] = {
    # NT — Analysts: 战略/洞察/构建
    "INTJ": "NT",
    "INTP": "NT",
    "ENTJ": "NT",
    "ENTP": "NT",
    # NF — Diplomats: 共鸣/灵感/守护
    "INFJ": "NF",
    "INFP": "NF",
    "ENFJ": "NF",
    "ENFP": "NF",
    # SJ — Sentinels: 执行/秩序/笃行
    "ISTJ": "SJ",
    "ISFJ": "SJ",
    "ESTJ": "SJ",
    "ESFJ": "SJ",
    # SP — Explorers: 探索/感知/灵动
    "ISTP": "SP",
    "ISFP": "SP",
    "ESTP": "SP",
    "ESFP": "SP",
}

GROUP_POETIC: dict[str, str] = {
    "NT": "洞察 · 构建",
    "NF": "共鸣 · 灵感",
    "SJ": "秩序 · 笃行",
    "SP": "探索 · 灵动",
}

ELEMENT_CHAR: dict[ElementKey, str] = {
    "wood": "木",
    "fire": "火",
    "earth": "土",
    "metal": "金",
    "water": "水",
}

# 5 elements × 4 cognitive groups = 20 deterministic labels
#
# Label structure: [元素气质词] + [认知倾向词] + 型
#
# 木: 生长/舒展/向上
# 火: 热情/表达/照亮
# 土: 承载/稳定/包容
# 金: 规则/判断/清晰
# 水: 流动/感知/深邃

TAG_LABELS: dict[tuple[ElementKey, str], str] = {
    # 木
    ("wood", "NT"): "战略生长型",
    ("wood", "NF"): "灵感生长型",
    ("wood", "SJ"): "稳行生长型",
    ("wood", "SP"): "灵动生长型",
    # 火
    ("fire", "NT"): "明断燃动型",
    ("fire", "NF"): "共鸣燃动型",
    ("fire", "SJ"): "笃行燃动型",
    ("fire", "SP"): "自在燃动型",
    # 土
    ("earth", "NT"): "战略承载型",
    ("earth", "NF"): "守护承载型",
    ("earth", "SJ"): "稳域执行型",
    ("earth", "SP"): "随境承载型",
    # 金
    ("metal", "NT"): "明断构建型",
    ("metal", "NF"): "共鸣构建型",
    ("metal", "SJ"): "笃行构建型",
    ("metal", "SP"): "灵动构建型",
    # 水
    ("water", "NT"): "深流洞察型",
    ("water", "NF"): "深流感知型",
    ("water", "SJ"): "深流守护型",
    ("water", "SP"): "深流探索型",
}


def get_personality_label(element: ElementKey, mbti: MbtiType) -> str:
    """
    Return the deterministic four-character label for a given element + MBTI.
    Falls back to a generic label if mapping is somehow missing.
    """
    group = MBTI_GROUPS.get(mbti)
    if group is None:
        return _fallback_label(element)
    label = TAG_LABELS.get((element, group))
    return label if label else _fallback_label(element)


def get_combination(element: ElementKey, mbti: MbtiType) -> str:
    """Return a short 'element · MBTI' combination string."""
    elem = ELEMENT_CHAR.get(element, element)
    group = MBTI_GROUPS.get(mbti, "")
    poetic = GROUP_POETIC.get(group, mbti)
    return f"{elem} · {mbti}（{poetic}）"


def _fallback_label(element: ElementKey) -> str:
    fallbacks: dict[ElementKey, str] = {
        "wood": "舒展生长型",
        "fire": "热情表达型",
        "earth": "稳重承载型",
        "metal": "明断规则型",
        "water": "深邃感知型",
    }
    return fallbacks.get(element, "中和平衡型")
