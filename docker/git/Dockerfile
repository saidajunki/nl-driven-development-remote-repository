FROM alpine:3.19

# Git と nginx、fcgiwrap をインストール
RUN apk add --no-cache \
    git \
    nginx \
    fcgiwrap \
    spawn-fcgi

# Git リポジトリ用ディレクトリ作成
RUN mkdir -p /var/git/repos && \
    chown -R nginx:nginx /var/git/repos

# nginx 設定
COPY nginx.conf /etc/nginx/nginx.conf

# 起動スクリプト
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
