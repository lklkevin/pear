CREATE TABLE IF NOT EXISTS User (
    id INTEGER PRIMARY KEY,  -- separate from username for performance
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

CREATE TABLE IF NOT EXISTS RefreshToken (
    id INTEGER PRIMARY KEY,
    user INTEGER,
    token TEXT NOT NULL UNIQUE,
    revoked INTEGER DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS Exam (
    examId INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    date TEXT NOT NULL,  -- store dates as ISO8601 strings
    owner INTEGER NOT NULL,
    color TEXT,  -- hex
    description TEXT,
    public INTEGER DEFAULT FALSE,
    FOREIGN KEY (owner) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS Question (
    questionId INTEGER PRIMARY KEY,
    number INTEGER,
    exam INTEGER NOT NULL,
    question TEXT NOT NULL,
    FOREIGN KEY (exam) REFERENCES exam(examId)
);

CREATE TABLE IF NOT EXISTS Answer (
    answerId INTEGER PRIMARY KEY,
    question INTEGER NOT NULL,
    answer TEXT NOT NULL,
    confidence REAL,  -- percentage
    FOREIGN KEY (question) REFERENCES question(questionId)
);

CREATE TABLE IF NOT EXISTS Favourite (
    userId INTEGER,
    examId INTEGER,
    FOREIGN KEY (userId) REFERENCES User(id),
    FOREIGN KEY (examId) REFERENCES Exam(examId)
);