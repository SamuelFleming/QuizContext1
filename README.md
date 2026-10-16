# QuizContext1
Inspired by CareerContext's content management and AI outomces, and my own need for exam preparation tooling, and by the infrastrural need for Recall Radio project, QuizContext is a web platform where user;s can get AI-empowered study outcomes bounded to the subjects that they provide.

## Local development

Copy each `.env.example` to `.env` in the same folder. Start the three apps in separate terminals:

```bash
cd server-data && npm install && npm start
cd server-webApp && npm install && npm start
cd client-webApp && npm install && npm start
```

| App | URL |
| --- | --- |
| client-webApp | http://localhost:5017 |
| server-webApp | http://localhost:4017 |
| server-data | http://localhost:4007 |

Swagger for implemented routes: `http://localhost:4017/api/docs` and `http://localhost:4007/api/docs`.

MongoDB must be running for the connectivity check to report the database as ok. Use the same `INTERNAL_API_KEY` value in both server `.env` files.
