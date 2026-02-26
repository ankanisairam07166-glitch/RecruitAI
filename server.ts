import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("recruitai.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'mcq' or 'coding'
    content TEXT NOT NULL,
    options TEXT, -- JSON array for MCQs
    correct_answer TEXT,
    points INTEGER DEFAULT 1,
    FOREIGN KEY (exam_id) REFERENCES exams(id)
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    questions TEXT NOT NULL, -- JSON array of questions for this session
    answers TEXT NOT NULL, -- JSON object
    score INTEGER,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/exams", (req, res) => {
    const exams = db.prepare(`
      SELECT e.*, COUNT(s.id) as candidate_count 
      FROM exams e 
      LEFT JOIN submissions s ON e.id = s.exam_id 
      GROUP BY e.id 
      ORDER BY e.created_at DESC
    `).all();

    // Fetch questions for each exam
    const examsWithQuestions = exams.map((exam: any) => {
      const questions = db.prepare("SELECT * FROM questions WHERE exam_id = ?").all(exam.id).map((q: any) => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : []
      }));
      return { ...exam, questions };
    });

    res.json(examsWithQuestions);
  });

  app.get("/api/exams/:id", (req, res) => {
    const exam = db.prepare("SELECT * FROM exams WHERE id = ?").get(req.params.id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });
    
    const questions = db.prepare("SELECT * FROM questions WHERE exam_id = ?").all(req.params.id).map((q: any) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : []
    }));
    res.json({ ...exam, questions });
  });

  app.post("/api/exams", (req, res) => {
    const { id, title, description, duration, questions } = req.body;
    
    const insertExam = db.prepare("INSERT INTO exams (id, title, description, duration) VALUES (?, ?, ?, ?)");
    const insertQuestion = db.prepare("INSERT INTO questions (id, exam_id, type, content, options, correct_answer, points) VALUES (?, ?, ?, ?, ?, ?, ?)");

    const transaction = db.transaction(() => {
      insertExam.run(id, title, description, duration);
      for (const q of questions) {
        insertQuestion.run(q.id, id, q.type, q.content, JSON.stringify(q.options), q.correct_answer, q.points);
      }
    });

    transaction();
    res.json({ success: true });
  });

  app.post("/api/submissions", (req, res) => {
    const { id, exam_id, candidate_name, candidate_email, questions, answers } = req.body;
    
    let totalPoints = 0;
    let earnedPoints = 0;

    for (const q of questions) {
      totalPoints += q.points || 0;
      const candidateAnswer = answers[q.id];
      if (q.type === 'mcq' && candidateAnswer === q.correct_answer) {
        earnedPoints += q.points || 0;
      }
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    const insert = db.prepare("INSERT INTO submissions (id, exam_id, candidate_name, candidate_email, questions, answers, score, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    insert.run(id, exam_id, candidate_name, candidate_email, JSON.stringify(questions), JSON.stringify(answers), score, 'completed');
    res.json({ success: true, score });
  });

  app.get("/api/submissions/:exam_id", (req, res) => {
    const submissions = db.prepare("SELECT * FROM submissions WHERE exam_id = ?").all(req.params.exam_id).map((s: any) => ({
      ...s,
      questions: s.questions ? JSON.parse(s.questions) : [],
      answers: s.answers ? JSON.parse(s.answers) : {}
    }));
    res.json(submissions);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
