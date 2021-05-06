FROM node:14-alpine

WORKDIR /app

COPY . .

RUN npm config set update-notifier false
RUN npm i -g npm@^7
RUN npm install --only=production

RUN adduser -S -D -H -h /app -s /sbin/nologin gsi
USER gsi

EXPOSE 8080

STOPSIGNAL SIGTERM
# HEALTHCHECK --interval=60s --timeout=30s --start-period=30s --retries=3 \
# 	CMD curl -f http://localhost/ || exit 1

CMD node backend/main.js
