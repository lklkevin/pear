CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY,  -- separate from username for performance
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL  -- hashed
);

CREATE TABLE IF NOT EXISTS exam (
    examId INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    date TEXT NOT NULL,  -- store dates as ISO8601 strings
    owner INTEGER NOT NULL,
    color TEXT,  -- hex
    description TEXT,
    public BOOLEAN DEFAULT 0,  -- 0 for private, 1 for public
    FOREIGN KEY (owner) REFERENCES user(id)
);

CREATE TABLE IF NOT EXISTS question (
    questionId INTEGER PRIMARY KEY,
    number INTEGER,
    exam INTEGER NOT NULL,
    question TEXT NOT NULL,
    FOREIGN KEY (exam) REFERENCES exam(examId)
);

CREATE TABLE IF NOT EXISTS answer (
    answerId INTEGER PRIMARY KEY,
    question INTEGER NOT NULL,
    answer TEXT NOT NULL,
    confidence REAL  -- percentage
    FOREIGN KEY (question) REFERENCES question(questionId)
);