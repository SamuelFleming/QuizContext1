# Getting started locally (from scratch)

This guide is for someone who has an IDE (for example Cursor or VS Code), can open this project folder, and wants to run QuizContext on their own machine — even if they have not run a multi-app Node project before.

When you finish, you will have:

1. **MongoDB** storing data
2. **server-data** on http://localhost:4007 (database API)
3. **server-webApp** on http://localhost:4017 (business API)
4. **client-webApp** on http://localhost:5017 (the website you use in the browser)

You need **three terminal sessions** left running at the same time (one per Node app), plus MongoDB in the background.

---

## 0. Words used in this guide

| Term | Meaning here |
| --- | --- |
| Terminal / shell | A text window where you type commands (`npm start`, etc.). In Cursor/VS Code: **Terminal → New Terminal** |
| Folder / directory | A location on disk. `cd` means “change directory” (move into a folder) |
| `.env` file | Local secrets and settings. Not committed to git. Each app has its own |
| `npm` | Comes with Node.js. Installs libraries and runs start scripts |
| Port | A number on `localhost` that identifies which app is listening (5017, 4017, 4007) |

---

## 1. Install the major dependencies

Do these once on your computer. Links are official download pages; prefer the **LTS** (long-term support) option when offered.

### 1.1 Node.js (required)

Node.js runs the three QuizContext apps. Installing it also installs **npm**.

1. Open https://nodejs.org/
2. Download the **LTS** installer for your operating system
3. Run the installer; accept the defaults (include npm)
4. **Close and reopen** your IDE/terminal so the new PATH is picked up
5. Check it worked:

```bash
node -v
npm -v
```

You should see version numbers (for example `v22.x` and `10.x`). If you get “command not found”, Node is not on your PATH yet — restart the IDE, or reinstall Node and ensure the option to add it to PATH is enabled.

### 1.2 MongoDB Community (required)

MongoDB is the database. QuizContext expects a local instance by default.

**Option A — MongoDB Community Server (common for local dev)**

1. Open https://www.mongodb.com/try/download/community
2. Download **MongoDB Community Server** for your OS
3. Install with defaults. On Windows, leaving **Install as a Service** checked means MongoDB starts with your PC
4. Optionally install **MongoDB Compass** (GUI) from the same site if you want a visual browser for data

**Option B — MongoDB Atlas (cloud free tier)**  
Possible, but you must put your Atlas connection string into `server-data/.env` as `MONGODB_URI`. This guide assumes Option A and the default local URI.

**Check MongoDB is running**

- Windows: open Services and look for **MongoDB Server**, or try connecting with Compass to `mongodb://127.0.0.1:27017`
- macOS (Homebrew): `brew services start mongodb-community` (if you installed via Homebrew)
- If the data API later fails with a connection error, start or restart the MongoDB service first

Default URI used by this project:

```text
mongodb://127.0.0.1:27017/quizcontext
```

(`quizcontext` is the database name; MongoDB creates it when data is first written.)

### 1.3 Git (recommended)

If you cloned this repo from GitHub, you already have the files. If you only have a ZIP download, Git is optional for running the app.

- https://git-scm.com/downloads

### 1.4 A modern browser (required)

Chrome, Edge, Firefox, or similar. You will open http://localhost:5017

### 1.5 OpenAI API key (optional)

You can run the app, register, and manage content **without** AI. Quiz generation and AI evaluation need a key later — see [§6](#6-optional-turn-on-ai).

---

## 2. Open the project in your IDE

1. Open the **QuizContext1** folder as the workspace root (the folder that contains `client-webApp`, `server-webApp`, `server-data`, and this `docs` folder)
2. Open the integrated terminal (Cursor/VS Code: **Terminal → New Terminal**)
3. Confirm you are at the project root. You should see those three app folders when you list files:

```bash
# Windows PowerShell
dir

# macOS / Linux
ls
```

---

## 3. Create environment files

Each app reads a file named `.env` in its own folder. Start from the examples, then edit secrets.

### 3.1 Copy the examples

**Windows PowerShell** (from the project root):

```powershell
Copy-Item server-data\.env.example server-data\.env
Copy-Item server-webApp\.env.example server-webApp\.env
Copy-Item client-webApp\.env.example client-webApp\.env
```

**macOS / Linux / Git Bash:**

```bash
cp server-data/.env.example server-data/.env
cp server-webApp/.env.example server-webApp/.env
cp client-webApp/.env.example client-webApp/.env
```

### 3.2 Edit the secrets

Open each `.env` in the IDE and set at least the values below. Use a plain text editor — do not rename the file to `.env.txt`.

**Same value in both server files**

| Variable | Files | What to put |
| --- | --- | --- |
| `INTERNAL_API_KEY` | `server-data/.env` and `server-webApp/.env` | Any long random string, **identical** in both files (for example a password-manager random string) |

**`server-webApp/.env` only**

| Variable | What to put |
| --- | --- |
| `JWT_SECRET` | Another long random string (session signing) |
| `AI_KEY_ENCRYPTION_KEY` | 32 random bytes as base64 — generate with the command below |
| `AI_ENABLED` | Leave `false` for first run |
| `OPENAI_API_KEY` | Leave empty until you enable AI |

Generate `AI_KEY_ENCRYPTION_KEY` (needs Node installed):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the single line of output into `AI_KEY_ENCRYPTION_KEY=...` with no quotes.

**`server-data/.env`**

| Variable | Default / notes |
| --- | --- |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/quizcontext` is fine for local Community Server |
| `PORT` | `4007` |

**`client-webApp/.env`**

| Variable | Default / notes |
| --- | --- |
| `PORT` | `5017` |
| `VITE_WEB_API_BASE_URL` | `http://localhost:4017` |

You do not need to change the client defaults for a normal local setup.

---

## 4. Install packages and start the three apps

Install dependencies **once per app** (or again after pulling big dependency changes). Keep each `npm start` running in its own terminal.

### Terminal 1 — data API

```bash
cd server-data
npm install
npm start
```

Leave this running. You want it to stay up without exiting. Swagger (optional): http://localhost:4007/api/docs

### Terminal 2 — business API

Open a **new** terminal at the project root, then:

```bash
cd server-webApp
npm install
npm start
```

Swagger (optional): http://localhost:4017/api/docs

### Terminal 3 — website

Open another **new** terminal at the project root, then:

```bash
cd client-webApp
npm install
npm start
```

Vite will print a local URL. Open:

**http://localhost:5017**

Register a new user and sign in.

### Suggested start order

1. MongoDB service running  
2. `server-data`  
3. `server-webApp`  
4. `client-webApp`

---

## 5. Quick checks if something fails

| Symptom | Things to try |
| --- | --- |
| `node` / `npm` not found | Reinstall Node LTS; fully quit and reopen the IDE |
| Mongo / database connection errors | Confirm MongoDB service is running; check `MONGODB_URI` |
| `EADDRINUSE` / port in use | Another process is using 4007, 4017, or 5017 — stop the old terminal or free that port |
| Client cannot reach the API | Confirm `server-webApp` is running; check `VITE_WEB_API_BASE_URL` and `CLIENT_ORIGIN` |
| Internal / unauthorized errors between servers | `INTERNAL_API_KEY` must be **exactly** the same in both server `.env` files; restart both servers after editing |
| Changes to `.env` ignored | Stop the process (Ctrl+C) and `npm start` again |

To stop an app: focus its terminal and press **Ctrl+C**.

---

## 6. Optional: turn on AI

1. Create an API key at https://platform.openai.com/ (billing may be required by OpenAI)
2. In `server-webApp/.env` set:
   - `AI_ENABLED=true`
   - `OPENAI_API_KEY=sk-...` (your real key)
3. Restart `server-webApp` (Ctrl+C, then `npm start`)

Alternatively, leave the app key off and add a **user** OpenAI key in the app under Profile (stored encrypted using `AI_KEY_ENCRYPTION_KEY`).

Never commit `.env` files or paste keys into git, tickets, or chat logs you would not want shared.

---

## 7. Where to go next

| Want… | Read |
| --- | --- |
| Why the product exists, vision, core ideas | [core-scope/01-high-level-idea.md](core-scope/01-high-level-idea.md) |
| How the system is shaped (dual API, layers) | [core-scope/02_high-level-solution.md](core-scope/02_high-level-solution.md) |
| Product theory and context modes | [core-scope/03_product-theory.md](core-scope/03_product-theory.md) |
| Flows mapped to screens | [core-scope/04_flows-to-screens.md](core-scope/04_flows-to-screens.md) |
| Layer-specific patterns after it runs | [client-webApp/README.md](../client-webApp/README.md), [server-webApp/README.md](../server-webApp/README.md), [server-data/README.md](../server-data/README.md) |
| Repo overview | [README.md](../README.md) |

Layer READMEs assume the tools above are already installed; they focus on what each app owns and how its code is organised.
