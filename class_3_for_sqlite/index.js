const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, '..')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'fitness_workshop_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000,
    httpOnly: true,
    sameSite: 'lax'
  }
}));

const dbPath = path.join(__dirname, 'test_user.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS user (
    帳號 TEXT NOT NULL,
    信箱 TEXT,
    密碼 TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    duration REAL,
    equipment TEXT,
    equipment_satisfied TEXT,
    equipment_comments TEXT,
    courses TEXT,
    teacher_satisfied TEXT,
    age_group TEXT,
    general_comment TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  )`);
});

// ─── 路由 ─────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.redirect('/start.html');
});

app.get('/loginpage', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'Login.html'));
});

app.get('/user', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'Sign.html'));
});

// 需要登入才能查看使用者列表
app.get('/users', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  db.all('SELECT 帳號, 信箱 FROM user', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    res.json({ user: rows });
  });
});

app.post('/addUser', (req, res) => {
  const { 帳號, 信箱, 密碼 } = req.body;
  if (!帳號 || !密碼) {
    return res.status(400).json({ success: false, message: '帳號和密碼為必填欄位' });
  }
  if (帳號.length > 50 || 密碼.length > 100) {
    return res.status(400).json({ success: false, message: '帳號或密碼長度超出限制' });
  }

  // 先確認帳號是否已存在
  db.get('SELECT 帳號 FROM user WHERE 帳號 = ?', [帳號], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: '伺服器錯誤' });
    if (row) return res.status(409).json({ success: false, message: '帳號已存在' });

    bcrypt.hash(密碼, 10, (hashErr, hash) => {
      if (hashErr) return res.status(500).json({ success: false, message: '伺服器錯誤' });
      db.run(
        'INSERT INTO user (帳號, 信箱, 密碼) VALUES (?, ?, ?)',
        [帳號, 信箱 || '', hash],
        function(insertErr) {
          if (insertErr) return res.status(500).json({ success: false, message: '新增失敗' });
          res.redirect('/loginpage');
        }
      );
    });
  });
});

app.post('/login', (req, res) => {
  const { 帳號, 密碼 } = req.body;
  if (!帳號 || !密碼) {
    return res.status(400).json({ success: false, message: '請輸入帳號和密碼' });
  }

  db.get('SELECT * FROM user WHERE 帳號 = ?', [帳號], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Internal server error.' });
    if (!row) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    bcrypt.compare(密碼, row.密碼, (compareErr, match) => {
      if (compareErr || !match) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }
      req.session.user = { 帳號: row.帳號, 信箱: row.信箱 };
      res.json({ success: true, message: 'Login successful.', user: { 帳號: row.帳號 } });
    });
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/loginpage');
  });
});

app.get('/session-user', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// ─── 問卷回饋 ─────────────────────────────────────────────

app.post('/submitFeedback', (req, res) => {
  const body = req.body;
  const equipment = Array.isArray(body.equipment)
    ? body.equipment.join(', ')
    : (body.equipment || '');
  const courses = Array.isArray(body.courses)
    ? body.courses.join(', ')
    : (body.courses || '');

  const query = `INSERT INTO feedback
    (date, duration, equipment, equipment_satisfied, equipment_comments,
     courses, teacher_satisfied, age_group, general_comment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    body.date || '',
    parseFloat(body.duration) || 0,
    equipment,
    body.equipment_satisfied || '',
    body.equipment_comments || '',
    courses,
    body.teacher_satisfied || '',
    body['age-group'] || '',
    body.general_comment || ''
  ];

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).send(`
        <div style="text-align:center;margin-top:80px;font-family:Arial">
          <h2>儲存失敗，請重試</h2>
          <a href="/connection/connection1.html">返回聯絡頁面</a>
        </div>`);
    }
    res.send(`
      <!DOCTYPE html>
      <html lang="zh-Hant">
      <head><meta charset="UTF-8"><title>感謝回饋</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; }
        .box { max-width: 500px; margin: 100px auto; background: #fff;
               padding: 40px; border-radius: 10px; text-align: center;
               box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h2 { color: #1D3124; }
        a { color: #0f9b8e; text-decoration: none; font-size: 16px; }
        a:hover { text-decoration: underline; }
      </style>
      </head>
      <body>
        <div class="box">
          <h2>感謝您的回饋！</h2>
          <p>您的意見已成功儲存，我們將持續改善服務品質。</p>
          <a href="/connection/connection1.html">返回聯絡頁面</a>
        </div>
      </body>
      </html>`);
  });
});

// ─── 器材購買 ─────────────────────────────────────────────

app.get('/equipment', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'equipment.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'cart.html'));
});

// ─── 啟動 ─────────────────────────────────────────────────

process.on('exit', () => db.close());

app.listen(port, () => {
  console.log(`健身工作坊伺服器啟動：http://localhost:${port}`);
});
