CREATE TABLE IF NOT EXISTS "User" (
    id SERIAL PRIMARY KEY,  -- Changed INTEGER to SERIAL for auto-increment
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT,  -- hashed
                    -- password can be NULL iff auth_provider == 'google'
    auth_provider TEXT NOT NULL 
        CHECK (auth_provider IN ('local', 'google')),
    oauth_id TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS "RefreshToken" (
    id SERIAL PRIMARY KEY,  -- Changed INTEGER to SERIAL
    user_id INTEGER,  -- Renamed 'user' to 'user_id' to avoid keyword conflict
    token TEXT NOT NULL UNIQUE,
    revoked BOOLEAN DEFAULT FALSE,  -- Changed INTEGER to BOOLEAN
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(id)
);

CREATE TABLE IF NOT EXISTS "Exam" (
    examId SERIAL PRIMARY KEY,  -- Changed INTEGER to SERIAL
    name TEXT NOT NULL,
    date TEXT NOT NULL,  -- store dates as ISO8601 strings
    owner INTEGER NOT NULL,
    color TEXT,  -- hex
    description TEXT,
    public BOOLEAN DEFAULT FALSE,  -- Changed INTEGER to BOOLEAN
    num_fav INTEGER DEFAULT 0,  -- how many times this exam has been favourited
    FOREIGN KEY (owner) REFERENCES "User"(id)
);

CREATE TABLE IF NOT EXISTS "Question" (
    questionId SERIAL PRIMARY KEY,  -- Changed INTEGER to SERIAL
    number INTEGER,
    exam INTEGER NOT NULL,
    question TEXT NOT NULL,
    FOREIGN KEY (exam) REFERENCES "Exam"(examId)
);

CREATE TABLE IF NOT EXISTS "Answer" (
    answerId SERIAL PRIMARY KEY,  -- Changed INTEGER to SERIAL
    question INTEGER NOT NULL,
    answer TEXT NOT NULL,
    confidence REAL,  -- percentage
    FOREIGN KEY (question) REFERENCES "Question"(questionId)
);

CREATE TABLE IF NOT EXISTS "Favourite" (
    userId INTEGER,
    examId INTEGER,
    PRIMARY KEY (userId, examId),  -- Changed UNIQUE constraint to PRIMARY KEY
    FOREIGN KEY (userId) REFERENCES "User"(id),
    FOREIGN KEY (examId) REFERENCES "Exam"(examId)
); 