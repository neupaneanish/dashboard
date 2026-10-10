FROM node:24-alpine AS build

WORKDIR app/

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs24-debian13:nonroot AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

COPY --from=build --chown=nonroot:nonroot /app/dist ./dist

USER nonroot

EXPOSE 4321

CMD ["./dist/server/entry.mjs"]