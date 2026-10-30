FROM node:22-bookworm-slim AS client-build

WORKDIR /client

COPY client-webApp/package.json client-webApp/package-lock.json ./
RUN npm ci

COPY client-webApp/ ./

ARG VITE_WEB_API_BASE_URL=
ENV VITE_WEB_API_BASE_URL=$VITE_WEB_API_BASE_URL
RUN printf 'VITE_WEB_API_BASE_URL=%s\n' "$VITE_WEB_API_BASE_URL" > .env.production \
  && npm run build

FROM node:22-bookworm-slim

WORKDIR /app/server-webApp

COPY server-webApp/package.json server-webApp/package-lock.json ./
RUN npm ci --omit=dev

COPY server-webApp/ ./
COPY --from=client-build /client/dist /app/client-webApp/dist

ENV NODE_ENV=production
EXPOSE 4017

CMD ["node", "src/index.js"]
