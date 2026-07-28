FROM node:22.22.0

WORKDIR /frontend

# package.json と package-lock.json をコピー
COPY package*.json ./

# lockファイルを利用して依存関係をインストール
RUN npm ci

EXPOSE 5173