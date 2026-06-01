CREATE TABLE IF NOT EXISTS daily_signs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sign_no INTEGER NOT NULL UNIQUE,
    title VARCHAR(80) NOT NULL,
    original_text TEXT NOT NULL,
    plain_explanation TEXT NOT NULL,
    keywords JSON NOT NULL DEFAULT '[]',
    cultural_source VARCHAR(120) NOT NULL DEFAULT '易经意象',
    inspiration TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_daily_signs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_key VARCHAR(80) NOT NULL,
    sign_id INTEGER NOT NULL REFERENCES daily_signs(id),
    draw_date DATE NOT NULL,
    question TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_daily_sign_once UNIQUE (user_key, draw_date)
);

CREATE INDEX IF NOT EXISTS ix_daily_signs_sign_no ON daily_signs(sign_no);
CREATE INDEX IF NOT EXISTS ix_user_daily_signs_user_key ON user_daily_signs(user_key);
CREATE INDEX IF NOT EXISTS ix_user_daily_signs_draw_date ON user_daily_signs(draw_date);
