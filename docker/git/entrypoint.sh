#!/bin/sh

# fcgiwrap を起動（git-http-backend 用）
spawn-fcgi -s /var/run/fcgiwrap.socket -u nginx -g nginx /usr/bin/fcgiwrap

# nginx をフォアグラウンドで起動
nginx -g "daemon off;"
