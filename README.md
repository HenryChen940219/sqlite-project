# 健身工作坊 Fitness Workshop

一個以 Node.js + SQLite 為後端、Vanilla HTML/CSS/JS 為前端的健身房網站，包含課程瀏覽、器材購買、會員系統與問卷回饋等完整功能。

---

## 截圖展示

| 頁面 | 說明 |
|------|------|
| ![首頁](screenshots/01_homepage.png) | **首頁** — 英雄區塊、統計數據、快速導覽 |
| ![教練列表](screenshots/02_coaches_list.png) | **關於我們** — 4 位教練卡片總覽 |
| ![教練個人頁](screenshots/03_coach_detail.png) | **教練個人頁** — 照片、簡介、專業領域標籤 |
| ![課程介紹](screenshots/04_courses.png) | **課程介紹** — 5 大課程分類，可加入購物車 |
| ![器材購買](screenshots/05_equipment.png) | **器材購買** — 分類篩選、商品卡片 |
| ![登入](screenshots/06_login.png) | **登入頁面** — 賽博龐克風格，bcrypt 驗證 |
| ![註冊](screenshots/07_signup.png) | **註冊頁面** — 帳號、信箱、密碼 |
| ![儀表板](screenshots/08_dashboard.png) | **會員儀表板** — 歡迎訊息、快速功能卡片 |
| ![購物車](screenshots/09_cart.png) | **購物車** — 商品明細、折扣碼、訂單摘要 |
| ![結帳成功](screenshots/10_checkout_success.png) | **結帳成功** — 模擬訂單編號 |
| ![VIP儀表板](screenshots/11_dashboard_vip.png) | **VIP 儀表板** — 累計消費、近期活動紀錄 |
| ![問卷](screenshots/12_feedback_form.png) | **問卷回饋** — 多選題、滿意度評分 |
| ![問卷成功](screenshots/13_feedback_success.png) | **問卷送出成功** — 資料已存入 SQLite |
| ![DB結構](screenshots/14a_db_structure.png) | **資料庫結構** — user、feedback 資料表定義 |
| ![DB使用者](screenshots/14b_db_user.png) | **user 資料表** — 帳號、信箱、bcrypt 加密密碼 |
| ![DB問卷](screenshots/14c_db_feedback.png) | **feedback 資料表** — 實際問卷回饋紀錄 |

---

## 技術棧

| 層級 | 技術 |
|------|------|
| 後端 | Node.js, Express.js |
| 資料庫 | SQLite3 |
| 身份驗證 | express-session + bcryptjs |
| 前端 | HTML5, CSS3, Vanilla JavaScript |
| 狀態管理 | localStorage（購物車、訂單、活動紀錄） |

---

## 專案結構

```
資料庫專題/
├── start.html                  # 首頁
├── index1.html                 # 關於我們（教練總覽）
├── equipment.html              # 器材購買
├── cart.html                   # 購物車與結帳
├── class/
│   ├── course.html             # 課程介紹總覽
│   ├── upper1~3.html           # 上半身訓練課程
│   ├── lower1~3.html           # 下半身訓練課程
│   ├── main1~2.html            # 核心訓練課程
│   ├── air1~2.html             # 有氧訓練課程
│   └── other1~3.html           # 其他課程（瑜珈、皮拉提斯）
├── coach/
│   ├── Johnny.html             # Johnny 醫師（運動營養師）
│   ├── Yuchen.html             # Yuchen 教練（有氧運動專家）
│   ├── Ethan.html              # Ethan 教練（重量訓練專家）
│   └── Henry.html              # Henry 教練（體態雕塑教練）
├── connection/
│   ├── connection1.html        # 聯絡我們
│   └── comment.html            # 問卷回饋
├── screenshots/                # 功能截圖
└── class_3_for_sqlite/
    ├── index.js                # Express 後端伺服器（主程式）
    ├── package.json
    ├── test_user.db            # SQLite 資料庫（自動建立，不上傳 GitHub）
    └── views/
        ├── Login.html          # 登入頁面
        ├── Sign.html           # 註冊頁面
        └── start1.html         # 會員儀表板
```

---

## 資料庫結構

### user 資料表
| 欄位 | 型態 | 說明 |
|------|------|------|
| 帳號 | TEXT NOT NULL | 使用者帳號 |
| 信箱 | TEXT | 電子信箱（選填）|
| 密碼 | TEXT NOT NULL | bcryptjs 雜湊後的密碼 |

### feedback 資料表
| 欄位 | 型態 | 說明 |
|------|------|------|
| id | INTEGER PK | 自動遞增主鍵 |
| date | TEXT | 到訪日期 |
| duration | REAL | 使用時長（小時）|
| equipment | TEXT | 使用器材（逗號分隔）|
| equipment_satisfied | TEXT | 器材滿意度 |
| equipment_comments | TEXT | 器材建議 |
| courses | TEXT | 參與課程（逗號分隔）|
| teacher_satisfied | TEXT | 教練滿意度 |
| age_group | TEXT | 年齡層 |
| general_comment | TEXT | 整體建議 |
| created_at | TEXT | 建立時間（自動）|

---

## API 路由

| 方法 | 路由 | 說明 |
|------|------|------|
| GET | `/` | 導向首頁 |
| GET | `/loginpage` | 登入頁面 |
| GET | `/user` | 註冊頁面 |
| GET | `/users` | 取得所有使用者（需登入）|
| POST | `/addUser` | 新增帳號（密碼 bcrypt 加密）|
| POST | `/login` | 驗證登入，建立 session |
| GET | `/logout` | 登出，清除 session |
| GET | `/session-user` | 查詢目前登入狀態 |
| POST | `/submitFeedback` | 儲存問卷回饋至資料庫 |
| GET | `/equipment` | 器材購買頁面 |
| GET | `/cart` | 購物車頁面 |

---

## 主要功能

### 購物車系統
- 課程與器材皆可加入購物車（localStorage `fw_cart`）
- 支援數量調整與刪除
- 折扣碼：`FIT10`（九折）、`WELCOME`（八五折）
- 模擬結帳流程，產生訂單編號（FW + 8碼）

### 會員系統
- 帳號註冊與登入（express-session，Cookie 有效期 1 小時）
- 密碼以 bcryptjs 加密後儲存於 SQLite
- 登入後進入會員儀表板，顯示累計消費金額
- 消費滿 $10,000 自動升級為 VIP 會員
- VIP 進度條即時顯示距門檻差距

### 活動紀錄
- 每次結帳自動寫入 localStorage `fw_activity`
- 儀表板「近期活動紀錄」動態顯示最近 6 筆

### 問卷回饋
- 多選題（器材、課程）、單選題（滿意度）、下拉（年齡層）
- 送出後儲存至 SQLite `feedback` 資料表

---

## 安裝與啟動

### 環境需求
- Node.js v20.x
- npm

### 安裝步驟

```bash
# 進入後端目錄
cd class_3_for_sqlite

# 安裝依賴套件
npm install

# 啟動伺服器
node index.js
```

伺服器啟動後，開啟瀏覽器前往：

```
http://localhost:3000
```

### 依賴套件

```json
{
  "bcryptjs": "^2.4.3",
  "express": "^4.18.2",
  "express-session": "^1.17.3",
  "sqlite3": "^5.1.6"
}
```

---

## 測試流程

1. 啟動伺服器（見上方說明）
2. 前往 `http://localhost:3000` → 自動導向首頁
3. 點選「登入 / 註冊」→ 建立帳號 → 登入
4. 瀏覽課程或器材，加入購物車
5. 前往購物車，輸入折扣碼（選填），完成結帳
6. 回到會員儀表板，確認消費金額與活動紀錄更新
7. 填寫問卷回饋表單，驗證儲存成功

---

## 授權

Copyright (c) 2026 CHI-YU, CHEN (HenryChen940219)  
詳見 [LICENSE](LICENSE) 檔案。
