# 開發文件

## 系統概述

Note Relation Generator 是一個命令列工具，用於協助使用者發現筆記之間的關聯性。系統使用 TypeScript 開發，主要分為兩個核心功能：索引建立與關聯查詢。

## 系統架構

### 1. 索引建立流程

1. **文件處理**
   - 讀取指定目錄下的所有 Markdown 文件
   - 使用 @langchain/textsplitters 的 RecursiveCharacterTextSplitter 進行文件切分
   - 每個區塊大小設定為 800 個字元，overlap 為 400 個字元
   - 針對中文內容使用適當的分割字元（如：。！？）

2. **向量化處理**
   - 使用 Embedding 模型將每個文字區塊轉換為向量
   - 使用 jinaai/jina-embeddings-v2-base-zh 模型
   - 模型會自動從 Hugging Face 下載

3. **資料儲存**
   - 使用 LanceDB 作為向量資料庫
   - 儲存文件的 metadata（檔名、路徑等）
   - 儲存每個區塊的向量資料

### 2. 關聯查詢流程

1. **查詢處理**
   - 接收使用者提供的查詢文件
   - 使用相同的切詞邏輯處理查詢文件
   - 將查詢文件轉換為向量

2. **相似度搜尋**
   - 在 LanceDB 中進行向量相似度搜尋
   - 使用餘弦相似度（Cosine Similarity）計算
   - 返回相似度最高的前 10 個結果

## 命令列介面

### 基本用法

```bash
# 顯示說明
note-relation --help

# 建立索引
note-relation index <directory>

# 查詢相關筆記
note-relation search <file>
```

### 子命令說明

1. **index**: 建立索引
   ```bash
   # 為指定目錄建立索引
   note-relation index ./notes
   
   # 使用自定義區塊大小
   note-relation index ./notes --chunk-size 500
   ```

2. **search**: 查詢相關筆記
   ```bash
   # 查詢與特定檔案相關的筆記
   note-relation search ./notes/my-note.md
   
   # 限制返回結果數量
   note-relation search ./notes/my-note.md --limit 5
   
   # 設定相似度閾值
   note-relation search ./notes/my-note.md --threshold 0.7

## 開發環境設定

1. 安裝相依套件：
   ```bash
   npm install
   ```

2. 執行開發版本：
   ```bash
   # 建立索引
   npm run dev -- index ./notes

   # 搜尋相關筆記
   npm run dev -- search ./notes/my-note.md
   ```

3. 建置專案：
   ```bash
   npm run build
   ```

## 注意事項

1. 首次使用前必須先建立索引
2. 索引建立過程可能需要較長時間，取決於文件數量與大小
3. 系統會在本機執行，不需要額外的 API Key
