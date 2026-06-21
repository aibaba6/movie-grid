# MOVIEGRID

映画ポスターをドラッグ＆ドロップして、SNS用グリッド画像を作るツール。

**→ [ライブデモ](https://your-domain.vercel.app)**

## 機能

- ポスター画像をドロップしてグリッド生成
- 列・行をスライダーで自由に設定（1〜8）
- テーマカラーをカラーピッカーで自由に変更
- タイトル文字のサイズ・ウェイト・色を調整
- PNG 1440px 書き出し
- 設定の保存・復元
- 訪問者カウンター

## ローカル起動

```bash
npm install
npm run dev
```

## Vercelへのデプロイ

```bash
# 1. GitHubにpush
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_NAME/movie-grid.git
git push -u origin main

# 2. Vercel CLIでデプロイ
npm i -g vercel
vercel

# 3. 訪問者カウンター用にVercel KVを設定
# Vercel Dashboard > Storage > Create KV Database
# 環境変数 KV_REST_API_URL と KV_REST_API_TOKEN が自動で設定される
```

## 訪問者カウンターについて

`api/visitors.js` がVercel Edge Functionとして動作し、Vercel KVにカウントを保存します。  
KVを設定しない場合は訪問者数は非表示になります（ツール自体は正常動作します）。

## 技術スタック

- React 18 + Vite
- Vercel（ホスティング）
- Vercel KV（訪問者カウンター）
- localStorage（設定の永続化）
- Canvas API（PNG書き出し）
- Noto Sans JP（フォント）
