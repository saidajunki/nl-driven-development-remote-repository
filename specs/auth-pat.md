# 認証（NextAuth）と PAT（Personal Access Token）

## 目的

- Web UI のユーザー管理を行う。
- Git の push（書き込み）を **PAT によって認可**できるようにする。

## Web UI 認証

- Web アプリは NextAuth でログインを提供する。
- ログイン済みユーザーだけが PAT を発行/管理できる。

## PAT 発行（UI）

- UI から「PAT 作成/一覧/失効」ができる。
- PAT は作成時にランダム生成し、**平文は作成時に 1 回だけ表示**する。
- DB には平文を保存せず、**ハッシュのみ保存**する（照合のため）。

## Git push の認証方式

- HTTPS push は **Basic 認証**を使う。
  - 例: `https://<user>:<PAT>@host/<owner>/<repo>.git`
  - あるいは `git credential` で PAT をパスワードとして保存する運用
- 認可判定は「PAT が有効であること」を最低条件とする。

## スコープ（権限）

- MVP では「PAT を持つユーザーは push 可能」から開始してよい。
- 将来は PAT にスコープを持たせる（例: 特定 repo のみ write など）。

## セキュリティ最低限

- PAT のレート制限（総当たり対策）
- 失効/期限切れの PAT を拒否
- `lastUsedAt` の更新（監査/把握用）
- PAT の表示・ログ出力に平文を残さない

