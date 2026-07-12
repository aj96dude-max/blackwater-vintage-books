# ❖ Blackwater & Co. Vintage Bookstore ❖

A responsive, full-stack web application built for a boutique vintage bookstore (**Blackwater & Co.**), featuring an authentic **RDR2-inspired leather ledger interface**, a hopeful violet-blue atmospheric design system, a secured **Admin Portal with CRUD inventory management**, and an automated **Discrete Variation Search & Requisition System**.

---

## ✨ Features & Architecture

### 1. Hopeful Violet-Blue Palette & Western Typography
- **Atmospheric Colors**: Deep violet-blues (`#2E234E` to `#4A3B7A`) paired with soft lavender (`#B8A9DF`) and periwinkle (`#8DA4E2`) highlights.
- **Western Slab & Serif Fonts**: Condensed western headers (`Rye` & `Alfa Slab One`) contrasted with high-contrast, elegant serif body text (`Crimson Text` / `Playfair Display`).
- **Authentic Ledger Details**: Aged parchment textures (`#F6F2E8`), dark espresso ink (`#2A2421`), typewriter catalog numbers (`#CAT-1899-001`), and western drop caps (`::first-letter`).

### 2. Storefront Gallery & Two-Page Ledger Reading Modal
- Browse volumes filtered by genre (`Western & Frontier`, `Crime & Syndicate`, `High Fantasy`, etc.).
- Clicking any book card opens a **two-page leather-bound ledger modal** complete with spine crease shadows, book cover art, historical synopsis, reading excerpts, and realistic rubber stamps (`IN STOCK`, `RESERVED`, `OUT OF STOCK`).

### 3. Discrete Variation Search Engine (Hit/Miss Automation)
- **Hit Logic**: Immediately queries the SQLite catalog and presents the matched volume to the reader.
- **Miss Logic (Automation Hook)**:
  1. **User Telegram Alert**: Triggers a styled RDR2 telegram notification modal confirming: *"Not currently in stock, but available soon — Requisition Filed."*
  2. **Automated Logging**: Records the exact discrete variation string (`QueryString`) and increments the query `requestCount` if searched repeatedly.
  3. **Live Admin Alert**: Emits a real-time Server-Sent Events (SSE) notification to any active Admin Portal tab (`🔔 NEW REQUISITION FILED`).

### 4. Proprietor's Admin Portal (`/admin`)
- **Full Inventory CRUD**: Add new volumes, update pricing/descriptions, toggle stock status, and delete items from the catalog.
- **Discrete Variation Requisition Deck**: Track and prioritize user search demand sorted by popularity (`requestCount DESC`).
- **⚡ 1-Click Quick-Add Workflow**: Clicking **Requisition & Add to Catalog** beside any `Pending` search query opens the Create Volume form pre-filled with the exact queried string (`QueryString`). Saving the book automatically updates the discrete search log's status from `Pending` to `Added` (`ADDED TO CATALOG`), seamlessly closing the user requisition loop!

---

## 🏗️ Project Structure

```
blackwater-vintage-books/
├── package.json
├── test_api.js                  # Automated verification & workflow test suite
├── server/
│   ├── index.js                 # Express server & API routing
│   ├── database/
│   │   ├── db.js                # Universal sql.js & better-sqlite3 engine wrapper
│   │   └── seed.js              # Initial volume catalog & requisition seed script
│   ├── models/
│   │   ├── Book.js              # Book inventory database model
│   │   └── SearchLog.js         # Discrete variation miss query model
│   └── routes/
│       ├── books.js             # /api/books CRUD endpoints
│       ├── search.js            # /api/search Hit/Miss automation engine
│       └── admin.js             # /api/admin search logs & SSE alerts
└── client/
    ├── index.html               # Storefront & Telegram Modals
    ├── admin.html               # Proprietor CMS & Requisition Deck
    ├── css/
    │   ├── design-system.css    # Violet-blue theme & western typography
    │   ├── rdr2-ledger.css      # Leather journal, aged parchment & rubber stamps
    │   └── admin.css            # Vintage tables & forms
    └── js/
        ├── api.js               # REST client & SSE event listener
        ├── app.js               # Main storefront controller
        ├── admin.js             # CMS inventory controller & quick-add workflow
        └── components/
            ├── Navbar.js        # Global search input & requisition dispatcher
            ├── Catalog.js       # Book gallery grid & tabs filter
            ├── LedgerModal.js   # Two-page leather reading view
            └── MissModal.js     # Telegram alert popup for missing books
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Installation & Run

1. **Clone the repository and install dependencies**:
   ```bash
   git clone https://github.com/aj96dude-max/blackwater-vintage-books.git
   cd blackwater-vintage-books
   npm install
   ```

2. **Initialize & seed the SQLite database**:
   ```bash
   npm run seed
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   - **Storefront Catalog**: [http://localhost:3000](http://localhost:3000)
   - **Admin Portal CMS**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🧪 Testing

To run the automated verification suite against the live API and Discrete Variation search workflow:
```bash
node test_api.js
```

---

## 📜 License
This project is licensed under the MIT License. EST. 1899 Blackwater & Co.
