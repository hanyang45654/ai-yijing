# 易境（YiJing）

<p align="center">
  <em>AI 东方人格探索系统</em>
</p>

<p align="center">
  以《易经》与五行学说为底色，融合 MBTI 现代心理学视角<br/>
  用传统文化的光，照见现代人的自我认知之路
</p>

<p align="center">
  <strong>不预测未来 · 不承诺结果 · 没有答案，只有回响</strong>
</p>

---

## 项目简介

易境是一款将中国传统文化与现代 AI 技术结合的 Web 应用。它基于五行学说和《易经》智慧，通过 DeepSeek 大模型提供个性化的文化解读，帮助 18-35 岁年轻用户进行自我观察与内在探索。

与常见的算命/运势类应用不同，易境始终坚持**非玄学化**原则——不做预测、不贴标签、不承诺结果。我们提供的是传统文化视角下的启发与回响。

## 核心功能

### 今日一签

基于《易经》六十四卦体系的每日签文抽取。

- 64 签数据库，每签包含原文、释义、关键词、文化出处
- AI 驱动个性化解签，以"传统文化解读 + 现代生活启示"结构输出
- 温和克制的语言风格，禁止绝对化预测表述

### 易境画像（五行人格分析）

通过出生日期计算个人五行比例，生成专属元素画像。

- 天干地支计算引擎，精确推算五行权重
- 雷达图可视化五行分布
- 主元素大字 Hero 展示 + 细线元素条拆解
- AI 生成四段式文化解读：结构说明 → 象征意义 → 性格倾向 → 成长建议
- 朱砂印章式"易境专属画像"认证标识

### MBTI 融合人格标签

五行 × MBTI 交叉分析，生成独一无二的四字人格标签。

- 支持 16 种 MBTI 类型选择
- 固定标签库（5 元素 × 4 认知组 = 20 种标签），避免 AI 命名漂移
- 结构化输出：标签名 → 五行+MBTI 组合 → 人格解释 → 优势 → 潜在盲区 → 成长建议
- 传统纹样装饰卡片视觉设计
- AI 融合分析 Markdown 文章（五行 × MBTI 交叉观察）

### 分享卡导出

一键生成精美分享图片，适合社交平台传播。

- html2canvas 动态加载，零初始包体积影响
- 双布局自适应：有人格标签时以标签为中心，否则展示元素条形图
- 五行元素圆点可视化（尺寸映射分数）
- Web Share API 优先，降级为下载
- 2x 分辨率 PNG 输出

## 技术栈

### 前端

| 技术 | 说明 |
|------|------|
| React 19 | 函数组件 + Hooks |
| TypeScript 5.7 | 严格模式，全量类型覆盖 |
| Vite 6 | 开发服务器 + 生产构建 |
| html2canvas 1.4 | 分享卡截图（动态导入） |
| CSS 原生 | 无第三方 UI 库，手工国风样式 |

### 后端

| 技术 | 说明 |
|------|------|
| FastAPI 0.115 | 异步 Web 框架 |
| SQLAlchemy 2.0 | ORM + 数据库抽象 |
| SQLite | 零配置嵌入式数据库 |
| Pydantic 2.10 | 请求/响应模型校验 |
| DeepSeek API | AI 文本生成（签文解读 + 五行分析 + MBTI 融合） |

## 系统架构

```
┌─────────────────────────────────────────┐
│                   用户                    │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│            Vercel (前端静态托管)           │
│  React 19 + TypeScript + Vite            │
│  - HomePage / DailySignPage              │
│  - FiveElementPage / ShareCard           │
│  - FiveElementRadar / MarkdownView        │
└─────────────────────────────────────────┘
                    │ HTTP
                    ▼
┌─────────────────────────────────────────┐
│          Railway (后端 API)               │
│  FastAPI + SQLite                        │
│  ┌─────────────────────────────────┐     │
│  │  /api/v1/daily-signs/*  签文API  │     │
│  │  /api/v1/five-elements/* 五行API │     │
│  │  /api/v1/ai/*            AI解读  │     │
│  │  /health                 健康检查 │     │
│  └─────────────────────────────────┘     │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│            DeepSeek API                   │
│  - 签文文化解读                            │
│  - 五行画像分析                            │
│  - 五行 × MBTI 融合分析                   │
└─────────────────────────────────────────┘
```

## 项目截图

> *部署后可在此处放置应用截图*

| 首页 | 易境画像 | 今日一签 | 人格标签 | 分享卡 |
|------|----------|----------|----------|--------|
| ![首页](screenshots/home.png) | ![画像](screenshots/portrait.png) | ![签文](screenshots/sign.png) | ![标签](screenshots/tag.png) | ![分享](screenshots/share.png) |

## 本地开发

### 环境要求

- Python 3.11+
- Node.js 18+
- DeepSeek API Key（[申请地址](https://platform.deepseek.com)）

### 后端启动

```bash
# 克隆项目
git clone https://github.com/hanyang45654/ai-yijing.git
cd ai-yijing

# 配置 API Key
cp backend/.env.example backend/.env
# 编辑 backend/.env，填入你的 DEEPSEEK_API_KEY

# 安装依赖
cd backend
pip install -r requirements.txt

# 启动服务（自动建表，无需手动初始化）
uvicorn app.main:app --reload
```

后端运行在 `http://localhost:8000`，访问 `/health` 验证启动状态。

### 前端启动

```bash
# 新开终端
cd frontend
npm install
npm run dev
```

前端运行在 `http://localhost:5173`，开发环境下自动代理 API 请求到后端。

### API 接口一览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| POST | `/api/v1/daily-signs/draw` | 抽取今日签文 |
| POST | `/api/v1/ai/interpret-sign` | AI 解读签文 |
| POST | `/api/v1/five-elements/analyze` | 五行画像分析（含 MBTI 融合） |

## 部署

### Railway（后端）

1. 在 [Railway](https://railway.app) 创建项目，关联 GitHub 仓库
2. 配置环境变量：
   - `DEEPSEEK_API_KEY` — DeepSeek API Key
   - `CORS_ORIGINS` — Vercel 前端域名（如 `https://yi-jing.vercel.app`）
   - `DATA_DIR` — `/data`
3. Railway 自动读取 `railway.json` 完成构建与启动
4. 服务自动建表，无需手动迁移

### Vercel（前端）

1. 在 [Vercel](https://vercel.com) 导入 GitHub 仓库
2. 配置 Build Settings：
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. 配置环境变量：
   - `VITE_API_BASE_URL` — Railway 后端地址（如 `https://yi-jing-api.up.railway.app/api/v1`）
4. 部署完成后，将 Vercel 域名填入 Railway 的 `CORS_ORIGINS`

## 项目路线图

- [x] 今日一签 — 64 签数据库 + AI 解签
- [x] 易境画像 — 五行计算引擎 + 雷达图 + AI 解读
- [x] MBTI 融合 — 交叉分析 + 20 种固定人格标签库
- [x] 分享卡 — html2canvas 截图 + Web Share API
- [x] 国风视觉 — 朱砂印、纸质纹理、楷体排版
- [x] 非玄学化过滤 — 禁止预测性表述
- [x] 移动端响应式适配
- [x] 部署就绪 — Railway + Vercel 配置
- [ ] 多签文对比解读
- [ ] 五行历史记录与变化趋势
- [ ] 用户账户系统
- [ ] PWA 离线支持
- [ ] i18n 国际化（英文版）

## 设计理念

> **非预测、非算命、非标签化**
>
> 易境的每一次解读都是一次文化观察，而非性格裁定。
> 传统文化是镜子，不是模具；是回响，不是答案。
>
> 所有 AI 输出均经过关键词过滤，禁止使用"必定""注定""命中注定"等绝对化表述，
> 统一采用"从传统文化角度看""可以理解为""倾向于"等温和措辞。

## 开源协议

MIT License
