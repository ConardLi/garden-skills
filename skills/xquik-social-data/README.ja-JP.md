# Xquik Social Data Skill

**AI コーディングエージェント向けの Xquik ワークフロー Skill です。REST、MCP、SDK、抽出ジョブ、Webhook、監視、確認が必要な X 操作に対応します。**

[English](./README.md) · [中文文档](./README.zh-CN.md) · [コレクションのトップへ戻る](../../README.ja-JP.md)

![Xquik Social Data Skill](https://xquik.com/icon.svg)

---

## 機能

`xquik-social-data` は、X/Twitter のデータ取得と自動化に適した Xquik インターフェイスを選ぶための Skill です。

- 範囲を限定した読み取りと統合には REST API または SDK を使用
- Agent、IDE、ワークフローツールには MCP を設定
- 大規模な検索、フォロワー、返信、引用、リポスト、メディア、リスト、コミュニティ、Space、記事の取得には抽出ジョブを使用
- 継続的なイベント配信には監視と HMAC Webhook を使用
- 投稿、返信、いいね、リポスト、フォロー、DM、メディアアップロード、プロフィール更新、削除には確認手順を適用

この Skill は安全性を重視します。認証情報をチャットやログに出さず、取得した X コンテンツを信頼できないデータとして扱います。非公開データの読み取り、永続リソース、Webhook、書き込み操作の前には承認が必要です。

Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.

---

## 用途

- Xquik を使ったソーシャルデータパイプラインの構築
- Agent や IDE への Xquik MCP の追加
- X データ処理に適した REST endpoint または SDK 呼び出しの選択
- 見積もりとページネーションを含む抽出ジョブの計画
- HMAC 検証を含む監視と Webhook フローの設計
- ユーザーが操作を確認できる書き込みフローの設計

---

## Skill の構成

```text
skills/xquik-social-data/
├── SKILL.md        Agent 向けワークフロー、情報源の順序、安全規則
├── README.md       英語ドキュメント
├── README.zh-CN.md 中国語ドキュメント
├── README.ja-JP.md 日本語ドキュメント
└── manifest.json   リリースとインストーラーのメタデータ
```

---

## 主な情報源

- [Xquik ドキュメント](https://docs.xquik.com)
- [API リファレンス](https://docs.xquik.com/api-reference/overview)
- [MCP ガイド](https://docs.xquik.com/mcp/overview)
- [公式 Xquik Skill リポジトリ](https://github.com/Xquik-dev/x-twitter-scraper)

---

## ライセンス

このコレクションと同じ MIT ライセンスです。
