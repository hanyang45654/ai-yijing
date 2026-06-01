# AI Yijing - 今日一签 MVP

当前只实现第一阶段的「今日一签」模块。

数据库已切换为 SQLite，数据文件会生成在项目根目录：

```text
ai_yijing.db
```

## 后端启动

1. 进入后端目录：

```bash
cd backend
```

2. 安装依赖：

```bash
pip install -r requirements.txt
```

3. 配置 DeepSeek API Key：

PowerShell：

```powershell
$env:DEEPSEEK_API_KEY="你的 DeepSeek API Key"
```

也可以在 `backend/.env` 中配置：

```text
DEEPSEEK_API_KEY=你的 DeepSeek API Key
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
DEEPSEEK_MODEL=deepseek-chat
```

4. 初始化 SQLite 数据库和 20 条示例签文：

```bash
python scripts/init_db.py
```

5. 启动 FastAPI：

```bash
uvicorn app.main:app --reload
```

后端默认地址：

```text
http://localhost:8000
```

接口地址：

- `GET /health`
- `GET /api/v1/daily-signs`
- `GET /api/v1/daily-signs/today?user_key=guest`
- `POST /api/v1/daily-signs/draw`
- `POST /api/v1/ai/interpret-sign`

## 前端启动

新开一个终端：

```bash
cd frontend
npm install
npm run dev
```

前端默认访问：

```text
http://localhost:5173
```

## 可选：使用 SQLite SQL 脚本

如果你想手动执行 SQL，也可以使用：

```bash
sqlite3 ai_yijing.db < backend/sql/001_daily_signs.sql
sqlite3 ai_yijing.db < backend/sql/002_seed_daily_signs.sql
```

但日常开发推荐使用：

```bash
cd backend
python scripts/init_db.py
```
