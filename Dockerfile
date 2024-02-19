#production
FROM node:20.10.0-alpine

RUN addgroup -S app && adduser -S app -G app
USER app

WORKDIR /app
COPY --chown=app:node package*.json .
RUN npm install
COPY --chown=app:node . .


CMD ["npm", "start"]
