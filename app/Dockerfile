FROM node:22

WORKDIR /app

# 依存関係
COPY package*.json ./
#npm ci は「ロックファイル前提」
RUN npm ci

COPY prisma ./prisma
# Prisma生成
RUN npx prisma generate

# アプリ全体コピー
COPY . .

#RUN npm run build

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

CMD ["/docker-entrypoint.sh"]

