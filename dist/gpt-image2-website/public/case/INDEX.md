# GPT Image 2 提示詞案例庫 · 總目錄索引

本目錄是為 `gpt-image-2` Skill 編寫的**典型提示詞案例庫**：每個 `references/` 下的模板都對應 `prompts/<category>/<template-name>/` 下的一個目錄，目錄裡給出 1–3 條可直接交給影象模型出圖的真實提示詞案例（每條一個獨立 JSON 檔案）。

**說明：** 本目錄不是模板本身，而是模板的「已填好引數、可直接複用」版本，可作為：

- 文章配圖素材（每條提示詞 → 一張文章配圖）
- 模板效果對照（用於評估與迴歸）
- 團隊內部 prompt benchmark

索引底部還附帶機器可讀的 [`_mapping.json`](./_mapping.json)，記錄「模板 ↔ JSON 檔案」的完整對映，可被指令碼直接消費。

---

## 總覽

| 分類 | 模板數 | 案例數 | 圖片進度 |
|---|---|---|---|
| ui-mockups | 5 | 13 | ✅ 13 / 13 |
| product-visuals | 5 | 10 | ✅ 10 / 10 |
| maps | 4 | 8 | ✅ 8 / 8 |
| slides-and-visual-docs | 4 | 8 | ✅ 8 / 8 |
| poster-and-campaigns | 4 | 8 | ✅ 8 / 8 |
| portraits-and-characters | 4 | 8 | ✅ 8 / 8 |
| scenes-and-illustrations | 4 | 8 | ✅ 8 / 8 |
| editing-workflows | 5 | 10 | ✅ 10 / 10 |
| avatars-and-profile | 5 | 10 | ✅ 10 / 10 |
| storyboards-and-sequences | 5 | 10 | ✅ 10 / 10 |
| grids-and-collages | 4 | 8 | ✅ 8 / 8 |
| branding-and-packaging | 4 | 8 | ✅ 8 / 8 |
| typography-and-text-layout | 2 | 4 | ✅ 4 / 4 |
| assets-and-props | 2 | 4 | ✅ 4 / 4 |
| academic-figures | 9 | 18 | ✅ 18 / 18 |
| infographics | 6 | 12 | ✅ 12 / 12 |
| technical-diagrams | 7 | 14 | ✅ 14 / 14 |
| **合計** | **79** | **161** | **✅ 161 / 161** |

模板根目錄：`<skill>/references/`  
提示詞根目錄：`prompts/`  
圖片根目錄：`prompts/`（與提示詞檔案同目錄、同名，僅副檔名為 `.png`）

---

## 1. UI Mockups（介面樣機）

各種「介面 + 內容」的樣機視覺。

### 1.1 電商直播 / 社交直播 UI 樣機

- **模板簡介**：電商 / 社交直播帶貨截圖樣機（主播 + 聊天區 + 禮物區 + 商品卡）。
- **模板路徑**：[`references/ui-mockups/live-commerce-ui.md`](../references/ui-mockups/live-commerce-ui.md)
- **提示詞目錄**：[`prompts/ui-mockups/live-commerce-ui/`](./ui-mockups/live-commerce-ui/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./ui-mockups/live-commerce-ui/1.json) | [`1.png`](./ui-mockups/live-commerce-ui/1.png) | Elon Musk 直播帶 Cybertruck（科技帶貨旗艦場景） | 典型的"科技公司創始人本人下場帶貨"場景，主播是 Elon Musk，商品是 Tesla Cybertruck，整體氛圍既像真實直播截圖，又有釋出會主視覺的高階感。是該模板最具代表性的旗艦用例。 |
  | 2 | [`2.json`](./ui-mockups/live-commerce-ui/2.json) | [`2.png`](./ui-mockups/live-commerce-ui/2.png) | Taylor Swift 直播開箱限定香水（明星個人 IP 帶貨） | 明星個人 IP 跨界美妝帶貨的典型場景。商品緊扣明星人設、聊天與禮物文案圍繞粉絲向語言展開，是該模板"明星 + 美妝 / 文創"方向的代表用例。 |

### 1.2 社交平臺介面樣機

- **模板簡介**：社交平臺動態詳情頁樣機（Twitter/X、小紅書、微博、Threads 等）。
- **模板路徑**：[`references/ui-mockups/social-interface-mockup.md`](../references/ui-mockups/social-interface-mockup.md)
- **提示詞目錄**：[`prompts/ui-mockups/social-interface-mockup/`](./ui-mockups/social-interface-mockup/)
- **圖片進度**：✅ 3 / 3
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./ui-mockups/social-interface-mockup/1.json) | [`1.png`](./ui-mockups/social-interface-mockup/1.png) | Elon Musk 在 X 上發火星殖民推文（Twitter / X 暗色模式） | 典型的"知名科技人物在 X 上釋出一條帶配圖的高互動推文"場景，深色模式 + 中文介面 + 多圖九宮格，是該模板最具傳播力的代表案例。 |
  | 2 | [`2.json`](./ui-mockups/social-interface-mockup/2.json) | [`2.png`](./ui-mockups/social-interface-mockup/2.png) | 小紅書風格上海 City Walk 筆記（淺色模式） | 典型小紅書圖文筆記詳情頁，親切、生活化、帶 4 張可滑動配圖。是該模板"內容創作者 + 生活方式"方向的代表案例。 |
  | 3 | [`3.json`](./ui-mockups/social-interface-mockup/3.json) | [`3.png`](./ui-mockups/social-interface-mockup/3.png) | Anthropic 官方賬號在 X 上釋出 Claude Opus 4.7（品牌官方公告） | 科技品牌賬號在 X 上釋出產品更新公告的典型場景，淺色模式 + 高互動量級 + 單圖釋出主視覺，是該模板"品牌官方賬號"方向的代表案例。 |

### 1.3 商品卡疊加樣機

- **模板簡介**：落地頁 hero / 詳情頁主圖（人物 + 商品 + 賣點 + 價格）。
- **模板路徑**：[`references/ui-mockups/product-card-overlay.md`](../references/ui-mockups/product-card-overlay.md)
- **提示詞目錄**：[`prompts/ui-mockups/product-card-overlay/`](./ui-mockups/product-card-overlay/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./ui-mockups/product-card-overlay/1.json) | [`1.png`](./ui-mockups/product-card-overlay/1.png) | DERMA CALM 敏感肌精華 — 臨床感落地頁 hero（女性向護膚） | 典型的"敏感肌護膚品牌"電商詳情頁主視覺，三欄結構 + 臨床感配色 + 模特 + 產品 + 賣點徽章，是該模板最具代表性的女性向護膚用例。 |
  | 2 | [`2.json`](./ui-mockups/product-card-overlay/2.json) | [`2.png`](./ui-mockups/product-card-overlay/2.png) | NEX SKIN 男士護膚暗色科技款落地頁（男性向數碼感） | 男士護膚品牌的暗色科技感 hero 主視覺，硬朗、專業、可信賴，底部帶銷量條。是該模板"男性向 / 數碼感"方向的代表用例。 |

### 1.4 聊天介面 / 對話氣泡場景

- **模板簡介**：聊天 / 對話介面樣機（微信、AI 助手、群聊）。
- **模板路徑**：[`references/ui-mockups/chat-interface-scene.md`](../references/ui-mockups/chat-interface-scene.md)
- **提示詞目錄**：[`prompts/ui-mockups/chat-interface-scene/`](./ui-mockups/chat-interface-scene/)
- **圖片進度**：✅ 3 / 3
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./ui-mockups/chat-interface-scene/1.json) | [`1.png`](./ui-mockups/chat-interface-scene/1.png) | 微信雙人聊天 — Elon Musk × Mark Zuckerberg "八角籠約架"對話 | 復刻 2023 年矽谷頂流梗——Elon 提出和 Zuck 在八角籠裡 cage match，Zuck 回覆 "send location"。這裡把它搬到中文微信場景：Elon Musk 用中英混合發挑釁，Zuck 一本正經技術宅式接招，包含文字、語音條、Cybertruck 自拍、定位卡片、表情包等典型微信元素。… |
  | 2 | [`2.json`](./ui-mockups/chat-interface-scene/2.json) | [`2.png`](./ui-mockups/chat-interface-scene/2.png) | 矽谷 CEO 微信群聊 — 「Tech CEO 互助會 (8)」深夜吐槽現場 | 把"產品組日常"升級成頂配名人群聊——Tim Cook、Sundar Pichai、Sam Altman、Jensen Huang、Mark Zuckerberg、Satya Nadella、Jeff Bezos 都在群裡，本機視角是 Elon Musk。內容是週五深夜大家互相吐槽：GPU 不夠用、Vision P… |
  | 3 | [`3.json`](./ui-mockups/chat-interface-scene/3.json) | [`3.png`](./ui-mockups/chat-interface-scene/3.png) | Claude Opus 4.7 AI 助手對話 — 幫 Elon Musk 整理"矽谷 CEO 群"週報 | 典型的 AI 助手桌面產品截圖，使用者視角是 Elon Musk，把案例 2 的群聊上下文丟給 Claude，讓它幫整理成"矽谷 drama 週報"。包含使用者提問、Claude 結構化回答、再次追問讓 Claude 改寫成 Twitter / X 推文。是該模板"AI 產品演示 + 名人使用場景"方向的代表案例。 |

### 1.5 短影片封面 / Stream 縮圖 UI

- **模板簡介**：短影片封面 / 直播縮圖（YouTube、抖音、B 站、VTuber stream）。
- **模板路徑**：[`references/ui-mockups/short-video-cover-ui.md`](../references/ui-mockups/short-video-cover-ui.md)
- **提示詞目錄**：[`prompts/ui-mockups/short-video-cover-ui/`](./ui-mockups/short-video-cover-ui/)
- **圖片進度**：✅ 3 / 3
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./ui-mockups/short-video-cover-ui/1.json) | [`1.png`](./ui-mockups/short-video-cover-ui/1.png) | 知識科普封面 — 「99% 的人都不知道的 Claude 用法」（高對比醒目風） | 典型的"知識科普 / 工具教程"短影片封面，深色漸變 + 高亮黃標題 + 主體人物 + 三條要點，是該模板最具代表性的"高點選率知識號"用例。 |
  | 2 | [`2.json`](./ui-mockups/short-video-cover-ui/2.json) | [`2.png`](./ui-mockups/short-video-cover-ui/2.png) | 可愛風 VTuber 直播預告封面 — 「櫻粉雜談直播」 | 典型的女性 VTuber 直播開播預告封面，粉色主調 + 卡通主播 + 多層文字絲帶，是該模板"VTuber / 主播預告"方向的代表案例。 |
  | 3 | [`3.json`](./ui-mockups/short-video-cover-ui/3.json) | [`3.png`](./ui-mockups/short-video-cover-ui/3.png) | 開箱評測封面 — 「我把 Vision Pro 2 拆了」（強誘因） | 典型的 YouTube 數碼博主開箱評測影片封面，主體半身 + 神秘包裝盒 + 強好奇感標題。是該模板"開箱評測"方向的代表案例。 |

---

## 2. Product Visuals（產品視覺）

以商品為視覺中心的圖。

### 2.1 產品爆炸檢視海報

- **模板簡介**：產品爆炸檢視海報（主體垂直堆疊 + callout + 頂部 logo + 底部品牌區）。
- **模板路徑**：[`references/product-visuals/exploded-view-poster.md`](../references/product-visuals/exploded-view-poster.md)
- **提示詞目錄**：[`prompts/product-visuals/exploded-view-poster/`](./product-visuals/exploded-view-poster/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./product-visuals/exploded-view-poster/1.json) | [`1.png`](./product-visuals/exploded-view-poster/1.png) | Tesla Cybertruck 工程結構爆炸主視覺 | 電動皮卡品類裡最具辨識度的不鏽鋼蒙皮與線控架構，適合作為「硬核工程 + 釋出會主視覺」的代表；九層垂直展開、左右雙語式技術標註，突出結構進化與品牌敘事。 |
  | 2 | [`2.json`](./product-visuals/exploded-view-poster/2.json) | [`2.png`](./product-visuals/exploded-view-poster/2.png) | Apple Vision Pro 2 頭顯光機與算力模組爆炸主視覺 | 空間計算品類的代表形態；Pancake 光路、眼動與透視感測器、M 系列繫留算力等分層，適合作為「近眼顯示 + 工程拆解」主視覺，與深紫極光背景形成科技儀式感。 |

### 2.2 白底產品圖

- **模板簡介**：電商純白底主圖（單品 / 多角度 / 極簡營銷疊層）。
- **模板路徑**：[`references/product-visuals/white-background-product.md`](../references/product-visuals/white-background-product.md)
- **提示詞目錄**：[`prompts/product-visuals/white-background-product/`](./product-visuals/white-background-product/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./product-visuals/white-background-product/1.json) | [`1.png`](./product-visuals/white-background-product/1.png) | AirPods Pro 3 單品白底主圖（數碼耳機典型） | TWS 降噪耳機類目裡最常見的上架主圖需求：充電盒與耳機本體的材質、合模線、閃電口與耳塞細節需清晰可辨，白底無道具，適合作為 Apple 系配件店與平臺首圖規範參考。 |
  | 2 | [`2.json`](./product-visuals/white-background-product/2.json) | [`2.png`](./product-visuals/white-background-product/2.png) | Dyson Supersonic Nural 吹風機白底主圖（小家電典型） | 高階小家電常需「科技灰 + 金屬環 + 進風口細節」在同一張白底裡交代清楚；本案例強調主機 + 磁吸風嘴組合，適合品牌旗艦店與京東家電首圖。 |

### 2.3 高階影棚商業產品圖

- **模板簡介**：高階影棚商業產品圖（雜誌廣告級氛圍）。
- **模板路徑**：[`references/product-visuals/premium-studio-product.md`](../references/product-visuals/premium-studio-product.md)
- **提示詞目錄**：[`prompts/product-visuals/premium-studio-product/`](./product-visuals/premium-studio-product/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./product-visuals/premium-studio-product/1.json) | [`1.png`](./product-visuals/premium-studio-product/1.png) | 海藍之謎（La Mer）經典面霜單頁主視覺 | 高階護膚面霜品類裡最具符號性的瓷瓶、薄荷綠與燙銀字，配合絲絨與暗角暖光，呈現「可上雜誌跨頁」的 luxury still life，強調質地敘事而非白底平鋪。 |
  | 2 | [`2.json`](./product-visuals/premium-studio-product/2.json) | [`2.png`](./product-visuals/premium-studio-product/2.png) | Rolex 星期日曆型 40 暗調金錶影棚主視覺 | 奢侈品腕錶在暗調高反差下的金殼、總統鏈與錶盤細節，是「影棚 + 無 lifestyle」的教科書級用例；適合官網 hero、平面投放與經銷商燈箱。 |

### 2.4 禮盒 / 包裝展示圖

- **模板簡介**：禮盒 / 包裝展示圖（外盒 + 內容物展示）。
- **模板路徑**：[`references/product-visuals/packaging-showcase.md`](../references/product-visuals/packaging-showcase.md)
- **提示詞目錄**：[`prompts/product-visuals/packaging-showcase/`](./product-visuals/packaging-showcase/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./product-visuals/packaging-showcase/1.json) | [`1.png`](./product-visuals/packaging-showcase/1.png) | iPhone 16 Pro 首發套裝式包裝展示 | 數碼旗艦常見「黑底白字 + 撕膜體驗」的禮盒敘事；本案例以深空黑硬盒、開蓋泡棉位與主機、線纜、說明卡同屏呈現，適合電商首屏與開箱活動主視覺。 |
  | 2 | [`2.json`](./product-visuals/packaging-showcase/2.json) | [`2.png`](./product-visuals/packaging-showcase/2.png) | 星巴克中國「冬悅」節日禮盒 | 食品零售節日檔典型「中國紅 + 咖啡綠 + 燙金」組合；本案例為雙杯裝咖啡豆 + 馬克杯 + 星禮卡，適合門店櫥窗與禮贈電商頁。 |

### 2.5 生活方式產品場景圖

- **模板簡介**：生活方式產品場景圖（商品出現在真實場景中）。
- **模板路徑**：[`references/product-visuals/lifestyle-product-scene.md`](../references/product-visuals/lifestyle-product-scene.md)
- **提示詞目錄**：[`prompts/product-visuals/lifestyle-product-scene/`](./product-visuals/lifestyle-product-scene/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./product-visuals/lifestyle-product-scene/1.json) | [`1.png`](./product-visuals/lifestyle-product-scene/1.png) | 便攜意式機與露營木桌（戶外咖啡季） | 戶外生活電器典型用法：晨間湖邊營地、手衝級儀式感但裝置為電動便攜機；無具體名人入畫，以器具與光營造「可上小紅書封面」的剋制雜誌感。 |
  | 2 | [`2.json`](./product-visuals/lifestyle-product-scene/2.json) | [`2.png`](./product-visuals/lifestyle-product-scene/2.png) | Apple Watch Ultra 2 與晨跑（LeBron James 運動背影） | 運動穿戴典型「跑道 + 腕部特寫可聯想」的構圖：以 LeBron James 晨跑中的背影與抬腕看錶動作為主敘事，錶盤朝讀者，品牌可讀，無正臉，符合運動社交傳播習慣。 |

---

## 3. Maps（地圖）

資訊密度較高的「地圖風」影象。

### 3.1 城市美食手繪地圖

- **模板簡介**：城市美食手繪地圖（編號點位 + 圖例 + 中心吉祥物）。
- **模板路徑**：[`references/maps/food-map.md`](../references/maps/food-map.md)
- **提示詞目錄**：[`prompts/maps/food-map/`](./maps/food-map/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./maps/food-map/1.json) | [`1.png`](./maps/food-map/1.png) | 上海武康路·梧桐區週末探吃地圖 | 法租界街區尺度小、店密、網感強，適合作為「單街區美食地圖片」的標杆：地標與輕食/咖啡/烘焙組合，配梧桐葉與武康大樓剪影，主標題突出 City Walk + 好味。 |
  | 2 | [`2.json`](./maps/food-map/2.json) | [`2.png`](./maps/food-map/2.png) | 東京新宿·深夜拉麵與居酒屋巷地圖 | 高密度夜間餐飲街區：以歌舞伎町與東口拉麵橫丁為精神原型，用「蒸汽、紅燈籠、丼、拉麵、燒鳥」為符號，配日式復古羊皮紙，適合日料自媒體與赴日攻略封面。 |

### 3.2 旅行路線圖

- **模板簡介**：旅行路線圖（多日行程 / 單日 city walk / 戶外路線）。
- **模板路徑**：[`references/maps/travel-route-map.md`](../references/maps/travel-route-map.md)
- **提示詞目錄**：[`prompts/maps/travel-route-map/`](./maps/travel-route-map/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./maps/travel-route-map/1.json) | [`1.png`](./maps/travel-route-map/1.png) | 京都三日古典慢走（機鐵 + 步行為主） | 關西最經典的「少城市跳點、多點寺廟庭園與町家」的三天節奏；東西向動線不回頭，適合作為旅行路線圖模板的代表：手繪羊皮紙、站點小插畫、側欄條列。 |
  | 2 | [`2.json`](./maps/travel-route-map/2.json) | [`2.png`](./maps/travel-route-map/2.png) | 美國 66 號公路七日西部段（公路片氣質） | 長距離自駕線模板代表：以芝加哥方向感為起點、洛杉磯方向感為收束的「中段西部七日」選段，強調路邊小鎮、汽旅文化與國家公園節點，用沙漠色與路牌符號強化識別。 |

### 3.3 城市風貌插畫地圖

- **模板簡介**：城市風貌插畫地圖（地標 + 江山 + 文化元素）。
- **模板路徑**：[`references/maps/illustrated-city-map.md`](../references/maps/illustrated-city-map.md)
- **提示詞目錄**：[`prompts/maps/illustrated-city-map/`](./maps/illustrated-city-map/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./maps/illustrated-city-map/1.json) | [`1.png`](./maps/illustrated-city-map/1.png) | 北京中軸線·從永定門到鐘鼓樓 | 以世界遺產中軸線為敘事主軸，突出故宮、天壇、鐘鼓樓與景山萬春亭的南北對位，國潮與 watercolor 可並存；是「單城文化推廣主視覺」的典型命題。 |
  | 2 | [`2.json`](./maps/illustrated-city-map/2.json) | [`2.png`](./maps/illustrated-city-map/2.png) | 成都·巷陌與煙火市井文化地圖 | 突出「無軸線城市」的向心平原與河網：以錦江為柔曲線骨架，寬窄巷子、望平街、青羊宮與東郊記憶為節點，配熊貓與茶碗符號，是西南休閒城市主視覺的常用結構。 |

### 3.4 品牌門店分佈圖

- **模板簡介**：品牌門店 / 服務覆蓋分佈圖。
- **模板路徑**：[`references/maps/store-distribution-map.md`](../references/maps/store-distribution-map.md)
- **提示詞目錄**：[`prompts/maps/store-distribution-map/`](./maps/store-distribution-map/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./maps/store-distribution-map/1.json) | [`1.png`](./maps/store-distribution-map/1.png) | Starbucks 星巴克中國門店網路（扁平招商風） | 全國性連鎖咖啡品牌典型「沿海與省會密度高、西部階梯遞減」的分佈節奏；用reserve 與普通門店分層級，色板為品牌綠，適合官網「關於我們」與加盟說明頁頭圖（示意為主）。 |
  | 2 | [`2.json`](./maps/store-distribution-map/2.json) | [`2.png`](./maps/store-distribution-map/2.png) | 海底撈全球服務網路與旗艦店錨點 | 中餐連鎖出海的代表：以中國大陸為核心、向東亞東南亞歐美擴散；適合「全球火鍋」主敘事，強調密度差與旗艦店城市，紅底與火鍋圖形符號為品牌資產。 |

---

## 4. Slides & Visual Docs（視覺檔案）

幻燈片 / 視覺報告 / 政務可視風格。

### 4.1 高密度講解 Slide

- **模板簡介**：Irasutoya × 霞關混合高密度講解 Slide。
- **模板路徑**：[`references/slides-and-visual-docs/dense-explainer-slides.md`](../references/slides-and-visual-docs/dense-explainer-slides.md)
- **提示詞目錄**：[`prompts/slides-and-visual-docs/dense-explainer-slides/`](./slides-and-visual-docs/dense-explainer-slides/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./slides-and-visual-docs/dense-explainer-slides/1.json) | [`1.png`](./slides-and-visual-docs/dense-explainer-slides/1.png) | 如何看懂一份大模型評測報告（公開課單頁） | 面向產品與技術讀者的「測評 literacy」一頁通：從榜單到指標拆解，用溫馨插畫＋分塊資訊，適合培訓開場或公眾號長圖首屏。是該模板在「技術科普 × 高資訊密度」方向的代表用例。 |
  | 2 | [`2.json`](./slides-and-visual-docs/dense-explainer-slides/2.json) | [`2.png`](./slides-and-visual-docs/dense-explainer-slides/2.png) | AI Agent 工作機制（分步與元件一頁通） | 用同一套版式把「感知—規劃—行動—工具—記憶」串成可講課的一頁，適合企業內訓與工程師向分享，突出流程而非口號。 |

### 4.2 政策風格 Slide

- **模板簡介**：政策 / 政府公告 / 白皮書風格說明 Slide。
- **模板路徑**：[`references/slides-and-visual-docs/policy-style-slide.md`](../references/slides-and-visual-docs/policy-style-slide.md)
- **提示詞目錄**：[`prompts/slides-and-visual-docs/policy-style-slide/`](./slides-and-visual-docs/policy-style-slide/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./slides-and-visual-docs/policy-style-slide/1.json) | [`1.png`](./slides-and-visual-docs/policy-style-slide/1.png) | 關於促進人工智慧產業高質量發展的若干措施（政策解讀單頁） | 典型的產業促進類政策一頁通：機構抬頭、分塊要點、資料高亮與底部溯源區齊全，主色政藍，適合白皮書摘要圖或內參封面拉頁。 |
  | 2 | [`2.json`](./slides-and-visual-docs/policy-style-slide/2.json) | [`2.png`](./slides-and-visual-docs/policy-style-slide/2.png) | 某控股年度戰略報告「封面拉頁式」單頁 | 用政策風的秩序感承載企業內部戰略摘要：對高管彙報與內刊封面通用，主色政紅增強「年初定調」感，突出里程碑數字。 |

### 4.3 視覺報告頁

- **模板簡介**：商業報告執行摘要 / 投資人簡報 / 年報概覽頁。
- **模板路徑**：[`references/slides-and-visual-docs/visual-report-page.md`](../references/slides-and-visual-docs/visual-report-page.md)
- **提示詞目錄**：[`prompts/slides-and-visual-docs/visual-report-page/`](./slides-and-visual-docs/visual-report-page/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./slides-and-visual-docs/visual-report-page/1.json) | [`1.png`](./slides-and-visual-docs/visual-report-page/1.png) | 蘋果 2025 財年 Q4 業績簡報執行摘要 | 消費硬體與軟服並重的典型單頁：四格 KPI、營收趨勢小圖、一句核心判斷，商業藍主色，適合投研社群傳播或內部戰報頭圖。 |
  | 2 | [`2.json`](./slides-and-visual-docs/visual-report-page/2.json) | [`2.png`](./slides-and-visual-docs/visual-report-page/2.png) | Tesla 2025 全球交付與經營一頁通 | 更偏汽車與能源業務的交付與平均售價結構敘事，黑銀冷色強調製造感，適合產經報道配圖或內部分享。 |

### 4.4 教學示意圖 Slide

- **模板簡介**：教學示意圖（概念 / 機制 / 流程分解）。
- **模板路徑**：[`references/slides-and-visual-docs/educational-diagram-slide.md`](../references/slides-and-visual-docs/educational-diagram-slide.md)
- **提示詞目錄**：[`prompts/slides-and-visual-docs/educational-diagram-slide/`](./slides-and-visual-docs/educational-diagram-slide/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./slides-and-visual-docs/educational-diagram-slide/1.json) | [`1.png`](./slides-and-visual-docs/educational-diagram-slide/1.png) | 光合作用如何運作（初高中銜接） | 經典理科示意：葉橫剖＋六步從光到糖，溫和學院配色，主圖錨定、步驟編號清晰，是教科補頁與公開課封面的高複用用例。 |
  | 2 | [`2.json`](./slides-and-visual-docs/educational-diagram-slide/2.json) | [`2.png`](./slides-and-visual-docs/educational-diagram-slide/2.png) | Transformer 自注意力一圖說清（大學 / 內訓向） | 用同一結構講「QKV—softmax—加權和」的直覺，主圖為序列與小矩陣示意，是工程師入職培訓中視覺化大模型的標配一頁。 |

---

## 5. Poster & Campaigns（海報與營銷主視覺）

面向傳播的視覺海報與主視覺。

### 5.1 品牌主海報

- **模板簡介**：品牌主海報（產品 / 人物 / 純文字主張）。
- **模板路徑**：[`references/poster-and-campaigns/brand-poster.md`](../references/poster-and-campaigns/brand-poster.md)
- **提示詞目錄**：[`prompts/poster-and-campaigns/brand-poster/`](./poster-and-campaigns/brand-poster/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./poster-and-campaigns/brand-poster/1.json) | [`1.png`](./poster-and-campaigns/brand-poster/1.png) | Apple 精神傳承 × Tim Cook（「再來一步」主視覺） | 在合法表述下用品牌氣質詞與人物肖像＋產品同框，主句短、色板與官網銀灰系一致，適合釋出會後社交首圖或線下燈箱。 |
  | 2 | [`2.json`](./poster-and-campaigns/brand-poster/2.json) | [`2.png`](./poster-and-campaigns/brand-poster/2.png) | Nike 體育精神 × LeBron James（城市晨跑主視覺） | 用籃球巨星人像與一句中文主張完成「人的意志」主敘事，黑紅經典對比，主視覺偏豎版、適合開屏與電梯海報。 |

### 5.2 Campaign Key Visual

- **模板簡介**：Campaign Key Visual + 衍生 layout 系統。
- **模板路徑**：[`references/poster-and-campaigns/campaign-kv.md`](../references/poster-and-campaigns/campaign-kv.md)
- **提示詞目錄**：[`prompts/poster-and-campaigns/campaign-kv/`](./poster-and-campaigns/campaign-kv/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./poster-and-campaigns/campaign-kv/1.json) | [`1.png`](./poster-and-campaigns/campaign-kv/1.png) | 可口可樂夏季暢爽季（全渠道 KV 系統圖） | 紅與白為主、單 anchor 大玻璃瓶裝視覺，claim 在中文夏促語境，下方 1:1、9:16、16:9 三格線框小稿展示同一系統延展。 |
  | 2 | [`2.json`](./poster-and-campaigns/campaign-kv/2.json) | [`2.png`](./poster-and-campaigns/campaign-kv/2.png) | Apple Vision 空間計算續章（產品季 KV） | 以「二代頭戴」為 anchor 的釋出季主視覺，冷銀＋空靈的介面霧氣，主 claim 雙行，下方三比例展陳同一材質語言。 |

### 5.3 Web Hero / Banner

- **模板簡介**：Web hero / 落地頁 / app banner（橫向構圖 + CTA）。
- **模板路徑**：[`references/poster-and-campaigns/banner-hero.md`](../references/poster-and-campaigns/banner-hero.md)
- **提示詞目錄**：[`prompts/poster-and-campaigns/banner-hero/`](./poster-and-campaigns/banner-hero/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./poster-and-campaigns/banner-hero/1.json) | [`1.png`](./poster-and-campaigns/banner-hero/1.png) | Notion 式「一塊白板裝下團隊記憶」（淺色 Hero） | 典型 SaaS 首屏：左列標題副標題雙 CTA，右列為「產品多區塊介面」的 3D 輕透視，米灰漸變＋低噪，適合 B 站落地與官網首屏 A/B 測試素底。 |
  | 2 | [`2.json`](./poster-and-campaigns/banner-hero/2.json) | [`2.png`](./poster-and-campaigns/banner-hero/2.png) | Linear 式暗色工程效率 Hero（全寬橫條） | 深色底＋高對比紫青點綴，主視覺為「問題列表＋Sprint 燃盡」抽象介面，強研發氣質，適合作業流 / DevOps 品類落地頁。 |

### 5.4 雜誌 / 出版物封面

- **模板簡介**：雜誌 / 期刊 / 出版物封面。
- **模板路徑**：[`references/poster-and-campaigns/editorial-cover.md`](../references/poster-and-campaigns/editorial-cover.md)
- **提示詞目錄**：[`prompts/poster-and-campaigns/editorial-cover/`](./poster-and-campaigns/editorial-cover/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./poster-and-campaigns/editorial-cover/1.json) | [`1.png`](./poster-and-campaigns/editorial-cover/1.png) | 《時代》式年度人物特輯 × Sam Altman | 高對比、紅框記憶點、封面中央肖像與底部導讀欄，主標題為中文專題名，期號用英文，整體像新聞週刊旗艦期。 |
  | 2 | [`2.json`](./poster-and-campaigns/editorial-cover/2.json) | [`2.png`](./poster-and-campaigns/editorial-cover/2.png) | 《Vogue 服飾與美容》中國版概念封面 × Taylor Swift | 時尚大刊的柔光時裝肖像，主標題豎排，一側豎欄英文刊名，整體暖金與米白，適合高奢與音樂跨界專題。 |

---

## 6. Portraits & Characters（人物視覺）

真實 / 虛擬人物的肖像與角色設定。

### 6.1 職業級商務肖像

- **模板簡介**：職業級商務肖像（LinkedIn / 團隊頁 / 媒體配圖）。
- **模板路徑**：[`references/portraits-and-characters/professional-portrait.md`](../references/portraits-and-characters/professional-portrait.md)
- **提示詞目錄**：[`prompts/portraits-and-characters/professional-portrait/`](./portraits-and-characters/professional-portrait/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./portraits-and-characters/professional-portrait/1.json) | [`1.png`](./portraits-and-characters/professional-portrait/1.png) | Tim Cook 風格企業領袖胸像 | 科技製造業 CEO 氣質：深海軍藍、銀髮、無誇張戲劇光，背板淺灰＋極弱環境交代，是「可上官網 About」級別的剋制用法。 |
  | 2 | [`2.json`](./portraits-and-characters/professional-portrait/2.json) | [`2.png`](./portraits-and-characters/professional-portrait/2.png) | Sundar Pichai 風格全球科技業務負責人畫像 | 偏技術決策者的暖灰背景、略休閒但仍有西裝結構，適合作業軟體品類或全球化團隊首頁。 |

### 6.2 創始人媒體大片肖像

- **模板簡介**：創始人媒體大片肖像（戲劇燈光 + 留標題位）。
- **模板路徑**：[`references/portraits-and-characters/founder-portrait.md`](../references/portraits-and-characters/founder-portrait.md)
- **提示詞目錄**：[`prompts/portraits-and-characters/founder-portrait/`](./portraits-and-characters/founder-portrait/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./portraits-and-characters/founder-portrait/1.json) | [`1.png`](./portraits-and-characters/founder-portrait/1.png) | Elon Musk 工業總部窗光半身影 | 科技製造跨界創始人：極簡辦公室＋大窗冷側光、暗部有細節，右上預留標題安全區，整體偏冷、略顆粒。 |
  | 2 | [`2.json`](./portraits-and-characters/founder-portrait/2.json) | [`2.png`](./portraits-and-characters/founder-portrait/2.png) | Sam Altman 暖側光＋書牆文獻風 | 偏「思想型創始人」的柔和側光＋書牆虛景，適合人物專訪長文、播客主視覺，預留左側豎排大引語位。 |

### 6.3 虛擬主播 / VTuber

- **模板簡介**：VTuber / 虛擬主播個人卡 + 直播預覽。
- **模板路徑**：[`references/portraits-and-characters/virtual-host.md`](../references/portraits-and-characters/virtual-host.md)
- **提示詞目錄**：[`prompts/portraits-and-characters/virtual-host/`](./portraits-and-characters/virtual-host/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./portraits-and-characters/virtual-host/1.json) | [`1.png`](./portraits-and-characters/virtual-host/1.png) | 櫻下川「初日」個人資料卡（9:16） | 春日系日系 anime 少女、和洋折衷服裝，debut 資訊與標籤完整，是「新 V 首曝」高複用規格。 |
  | 2 | [`2.json`](./portraits-and-characters/virtual-host/2.json) | [`2.png`](./portraits-and-characters/virtual-host/2.png) | 鐵犀「深潛」直播預告橫封（16:9） | 男性機甲風味 VTuber、復古管線與做舊金屬，大表情與主標題，適合 B 站與微信影片號直播預約封面雙裁。 |

### 6.4 角色綜合設定稿

- **模板簡介**：角色綜合設定稿（三檢視 + 表情 + 服裝 + 配色板）。
- **模板路徑**：[`references/portraits-and-characters/character-sheet.md`](../references/portraits-and-characters/character-sheet.md)
- **提示詞目錄**：[`prompts/portraits-and-characters/character-sheet/`](./portraits-and-characters/character-sheet/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./portraits-and-characters/character-sheet/1.json) | [`1.png`](./portraits-and-characters/character-sheet/1.png) | 沈霜辭「墨羽」古風女劍客人設表 | 中國古典武俠女俠方向：高馬尾、墨藍與月白、軟劍＋髮簪，三視比例嚴鎖，是古裝戰鬥向 gacha 與動畫常用的規格。 |
  | 2 | [`2.json`](./portraits-and-characters/character-sheet/2.json) | [`2.png`](./portraits-and-characters/character-sheet/2.png) | 阿瑟·克朗「霧都偵探」蒸汽朋克設定表 | 歐美維多利亞架空都市偵探：高帽、長風衣、機械左臂、齒輪放大鏡，表情的「推理興奮」與「被背叛」為劇情常用。 |

---

## 7. Scenes & Illustrations（氛圍 / 故事 / 情緒插畫）

氛圍 / 故事 / 情緒導向的插畫。

### 7.1 治癒系日常場景

- **模板簡介**：治癒系日常 / 季節場景插畫。
- **模板路徑**：[`references/scenes-and-illustrations/healing-scene.md`](../references/scenes-and-illustrations/healing-scene.md)
- **提示詞目錄**：[`prompts/scenes-and-illustrations/healing-scene/`](./scenes-and-illustrations/healing-scene/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./scenes-and-illustrations/healing-scene/1.json) | [`1.png`](./scenes-and-illustrations/healing-scene/1.png) | 京都春日·町屋咖啡館與 Taylor Swift 背影 | 以日本町屋木格窗、新綠與和紙燈光為底，美國知名藝人在靠窗高凳上看街景的柔和背影，貓或街景不搶戲；是「春櫻季 × 旅拍情緒」的治癒系代表配置。 |
  | 2 | [`2.json`](./scenes-and-illustrations/healing-scene/2.json) | [`2.png`](./scenes-and-illustrations/healing-scene/2.png) | 北海道初雪·木造小屋與橘貓 | 以雪、暖燈與圍爐意象構成「初雪天安心感」；無人物、僅動物，適合作為節氣海報與夜間推文配圖。 |

### 7.2 概念大場景 / IP key art

- **模板簡介**：電影感概念大場景 / IP key art。
- **模板路徑**：[`references/scenes-and-illustrations/concept-scene.md`](../references/scenes-and-illustrations/concept-scene.md)
- **提示詞目錄**：[`prompts/scenes-and-illustrations/concept-scene/`](./scenes-and-illustrations/concept-scene/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./scenes-and-illustrations/concept-scene/1.json) | [`1.png`](./scenes-and-illustrations/concept-scene/1.png) | 賽博朋克上海 2099·外灘雨夜 | 東方都會 × 高密霓虹的科幻母題；前景行人剪影、中景懸浮車道與江面航跡、遠景陸家嘴超巨構與全息廣告，色板為品紅+電青+雨霧灰，是概念場景模板在「近未來東亞都市」向的代表題。 |
  | 2 | [`2.json`](./scenes-and-illustrations/concept-scene/2.json) | [`2.png`](./scenes-and-illustrations/concept-scene/2.png) | 火星黎明·穹頂外骨骼工人面向太陽 | 太空拓荒史詩向：近景渺小火星服剪影、中景礦車軌跡與製氧站管線、穹頂外高壓橙霧與遠地平線上剛升起的蒼白太陽，是「非地球尺度」與「第一縷工業黎明」的命題。 |

### 7.3 童書 / 繪本內頁

- **模板簡介**：童書 / 繪本內頁 / 節日卡片。
- **模板路徑**：[`references/scenes-and-illustrations/picture-book-scene.md`](../references/scenes-and-illustrations/picture-book-scene.md)
- **提示詞目錄**：[`prompts/scenes-and-illustrations/picture-book-scene/`](./scenes-and-illustrations/picture-book-scene/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./scenes-and-illustrations/picture-book-scene/1.json) | [`1.png`](./scenes-and-illustrations/picture-book-scene/1.png) | 中秋夜·會飛的小狐狸與第一縷月華 | 中國傳統節日 + 夜空中童話飛行物：小狐狸乘月餅形雲舸掠過屋頂與河燈，畫面保留一句可親子朗讀的旁白，暖橙、薄靛、米白為板。 |
  | 2 | [`2.json`](./scenes-and-illustrations/picture-book-scene/2.json) | [`2.png`](./scenes-and-illustrations/picture-book-scene/2.png) | 兔子先生的下午茶與遲到的懷錶 | 經典童話感但不直接複製名著：高禮帽、三層層架點心與會冒氣的茶壺，以「時間遲到一點點也沒關係」的溫柔教訓為核心，適讀年齡 3–6。 |

### 7.4 極簡留白氛圍圖

- **模板簡介**：極簡留白氛圍圖 / 文學性桌布。
- **模板路徑**：[`references/scenes-and-illustrations/minimalist-mood-scene.md`](../references/scenes-and-illustrations/minimalist-mood-scene.md)
- **提示詞目錄**：[`prompts/scenes-and-illustrations/minimalist-mood-scene/`](./scenes-and-illustrations/minimalist-mood-scene/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./scenes-and-illustrations/minimalist-mood-scene/1.json) | [`1.png`](./scenes-and-illustrations/minimalist-mood-scene/1.png) | 雨夜東京·便利店氖光在積水裡走散 | 都市孤獨感與安全感並置：小主體為遠角便利店門廊的窄條暖光，大面積冷雨灰留白，配一句中文旁白，適合作為深夜推文尾圖與鎖屏情緒桌布。 |
  | 2 | [`2.json`](./scenes-and-illustrations/minimalist-mood-scene/2.json) | [`2.png`](./scenes-and-illustrations/minimalist-mood-scene/2.png) | 一個人的清晨咖啡·霧白與杯沿一線金 | 與雨夜對仗的「晨間獨處」：偏左上的一隻白杯與上升直線蒸汽，大面霧米白與一線暖金，適合清晨推送與產品無關的普適情緒品牌。 |

---

## 8. Editing Workflows（影象編輯工作流）

區域性修改、替換、移除、修圖等編輯型工作流。

### 8.1 背景替換

- **模板簡介**：背景替換（商品 / 人像 / 戶外 / 棚景）。
- **模板路徑**：[`references/editing-workflows/background-replacement.md`](../references/editing-workflows/background-replacement.md)
- **提示詞目錄**：[`prompts/editing-workflows/background-replacement/`](./editing-workflows/background-replacement/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./editing-workflows/background-replacement/1.json) | [`1.png`](./editing-workflows/background-replacement/1.png) | LeBron James 戶外半身照換紐約時代廣場夜景 | 典型的人像從日間戶外雜亂背景置換為標誌性城市夜景，需統一冷暖對比與重新生成與霓虹燈方向一致的邊緣光、地面反光，是體育明星肖像電商 / 社媒素材方向的代表任務。 |
  | 2 | [`2.json`](./editing-workflows/background-replacement/2.json) | [`2.png`](./editing-workflows/background-replacement/2.png) | 白底精拍 AirPods Pro 3 主圖換日落沙灘 | 典型電商主圖從影棚白底遷往生活方式場景，強調產品身份不變、新環境下陰影與亞克力充電盒反光的重算，是 3C 小電類目詳情頁最常用背景替換類需求。 |

### 8.2 區域性物件替換

- **模板簡介**：區域性物件替換（配合或不配合蒙版）。
- **模板路徑**：[`references/editing-workflows/local-object-replacement.md`](../references/editing-workflows/local-object-replacement.md)
- **提示詞目錄**：[`prompts/editing-workflows/local-object-replacement/`](./editing-workflows/local-object-replacement/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./editing-workflows/local-object-replacement/1.json) | [`1.png`](./editing-workflows/local-object-replacement/1.png) | Tesla Cybertruck 電單車展示圖，車身從不鏽鋼銀換為磨砂黑 | 典型車品 / 科技露出圖中僅更換車漆材質與色而不改車型輪廓與場景透視，是區域性物件替換裡對高光與金屬顆粒感重算要求最高的用例之一。 |
  | 2 | [`2.json`](./editing-workflows/local-object-replacement/2.json) | [`2.png`](./editing-workflows/local-object-replacement/2.png) | LeBron James 比賽上身照，球衣從湖人紫金換為邁阿密熱火紅黑 | 典型運動肖像中僅替換隊服主色而保留隊形、織紋與球員可識別性，對布料褶皺陰影與熱印號碼邊緣的貼合度要求高，屬於服飾類區域性替換代表場景。 |

### 8.3 雜物 / 路人去除

- **模板簡介**：雜物 / 路人 / 電線 / 瑕疵去除。
- **模板路徑**：[`references/editing-workflows/object-removal.md`](../references/editing-workflows/object-removal.md)
- **提示詞目錄**：[`prompts/editing-workflows/object-removal/`](./editing-workflows/object-removal/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./editing-workflows/object-removal/1.json) | [`1.png`](./editing-workflows/object-removal/1.png) | 大學畢業典禮草坪合影，去除畫面邊緣誤入路人 | 群體合影中保留主體排面完整、僅抹掉邊緣幹擾人物，是人物類雜物去除最典型、對「無接縫」要求極高的一類任務。 |
  | 2 | [`2.json`](./editing-workflows/object-removal/2.json) | [`2.png`](./editing-workflows/object-removal/2.png) | Oprah Winfrey 城市街拍，去除人行道旁電線杆與空中電線 | 單人人像街拍裡豎線杆與橫飛線對構圖切割感強，去除後需同時修補天空與路面透視，是街景類雜物去除代表用例。 |

### 8.4 產品精修

- **模板簡介**：產品精修（光澤 / 標籤 / 陰影 / 瑕疵）。
- **模板路徑**：[`references/editing-workflows/product-retouching.md`](../references/editing-workflows/product-retouching.md)
- **提示詞目錄**：[`prompts/editing-workflows/product-retouching/`](./editing-workflows/product-retouching/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./editing-workflows/product-retouching/1.json) | [`1.png`](./editing-workflows/product-retouching/1.png) | AirPods Pro 3 白底主圖質感與標籤銳化 | 小體積白色塑膠與開蓋結構在電商主圖中易顯灰霧與微痕，精修強調剋制的光澤提升與合模線淨化，是 3C 白底圖最典型精修路徑。 |
  | 2 | [`2.json`](./editing-workflows/product-retouching/2.json) | [`2.png`](./editing-workflows/product-retouching/2.png) | 香水瓶柱面與金屬蓋高光精修、液體通透感強化 | 玻璃、液體與金屬三材質交界處易出現髒點、焦散斷裂與標貼氣泡感，是美妝香氛精修中「質感升級不整容」的標杆場景。 |

### 8.5 人像區域性修改

- **模板簡介**：人像區域性修改（髮型 / 服裝 / 妝容 / 配飾）。
- **模板路徑**：[`references/editing-workflows/portrait-local-edit.md`](../references/editing-workflows/portrait-local-edit.md)
- **提示詞目錄**：[`prompts/editing-workflows/portrait-local-edit/`](./editing-workflows/portrait-local-edit/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./editing-workflows/portrait-local-edit/1.json) | [`1.png`](./editing-workflows/portrait-local-edit/1.png) | Taylor Swift 頭像級肖像，金長髮變為深冷棕中卷 | 髮色與卷度改變但保留面型與妝面結構，是髮型 / 髮色路徑下最典型、也最易踩「換臉」邊線的任務，需強約束燈向與髮際線自然度。 |
  | 2 | [`2.json`](./editing-workflows/portrait-local-edit/2.json) | [`2.png`](./editing-workflows/portrait-local-edit/2.png) | Elon Musk 胸像，增加整齊短絡腮鬍與上唇髭，其餘不變 | 須型為區域性毛髮增量編輯，在棚拍或釋出會風格肖像中常用來測試「更成熟 / 更親和」兩檔反饋，對下頜陰影重算與膚色一致性要求高。 |

---

## 9. Avatars & Profile（頭像 / 人設 / 貼紙）

頭像、人設、貼紙、3D 圖示等個人化視覺。

### 9.1 風格化頭像（Style Transfer Selfie）

- **模板簡介**：把參考圖人物轉成 cosplay / 哥特 / 復古膠片 / 偶像寫真等任意風格。
- **模板路徑**：[`references/avatars-and-profile/style-transfer-selfie.md`](../references/avatars-and-profile/style-transfer-selfie.md)
- **提示詞目錄**：[`prompts/avatars-and-profile/style-transfer-selfie/`](./avatars-and-profile/style-transfer-selfie/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./avatars-and-profile/style-transfer-selfie/1.json) | [`1.png`](./avatars-and-profile/style-transfer-selfie/1.png) | 將 Stephen Curry 參考照轉為雨夜賽博朋克城市場 | 高飽和霓虹、溼路面反射與機能風穿搭共同構成「次世代夜都市」標準審美，是風格轉換中場景與光比變化幅度大、但身份錨點須釘死的人像任務。 |
  | 2 | [`2.json`](./avatars-and-profile/style-transfer-selfie/2.json) | [`2.png`](./avatars-and-profile/style-transfer-selfie/2.png) | 將 Beyoncé 參考照轉為吉卜力工作室式手繪動畫風 | 柔線輪廓、平塗膚色與層疊田園雲隙光是吉卜力美術最具辨識度的組合，在名人肖像轉換中需弱化 Hollywood 硬修容、轉向手繪通透色階。 |

### 9.2 角色網格肖像

- **模板簡介**：同一角色 n×n 網格肖像（多職業 / 多表情 / 多朝代 / 多風格）。
- **模板路徑**：[`references/avatars-and-profile/character-grid-portrait.md`](../references/avatars-and-profile/character-grid-portrait.md)
- **提示詞目錄**：[`prompts/avatars-and-profile/character-grid-portrait/`](./avatars-and-profile/character-grid-portrait/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./avatars-and-profile/character-grid-portrait/1.json) | [`1.png`](./avatars-and-profile/character-grid-portrait/1.png) | Taylor Swift 3×3 古今形象肖像網格（自漢至現代九格） | 同一可識別名人在時間軸上切換衣冠與場域，是角色網格中「單維變數（時代）多檔位」的教科書式用法，對臉型一致與每格打光可區分的要求高。 |
  | 2 | [`2.json`](./avatars-and-profile/character-grid-portrait/2.json) | [`2.png`](./avatars-and-profile/character-grid-portrait/2.png) | Sam Altman 4×4 開發者人設與表情合輯 | 「同一公人物」在統一淺灰工位語境下以表情與微動作為主變數，是科技報道配圖與社媒條漫常用的 4×4 規格。 |

### 9.3 主題 3D 圖示式頭像

- **模板簡介**：Kawaii 3D / Minecraft / 擬物 3D 應用圖示式頭像。
- **模板路徑**：[`references/avatars-and-profile/themed-3d-icon.md`](../references/avatars-and-profile/themed-3d-icon.md)
- **提示詞目錄**：[`prompts/avatars-and-profile/themed-3d-icon/`](./avatars-and-profile/themed-3d-icon/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./avatars-and-profile/themed-3d-icon/1.json) | [`1.png`](./avatars-and-profile/themed-3d-icon/1.png) | Mark Zuckerberg 元宇宙創作者主題的 Kawaii 3D 擬貓胸像 | 將公眾人物的溫和氣質翻譯為低威脅 Q 版動物擬人 + 輕科技符號，是主題 3D 頭像裡品牌人格化、又不落入寫實像侵權的常見商業化落點。 |
  | 2 | [`2.json`](./avatars-and-profile/themed-3d-icon/2.json) | [`2.png`](./avatars-and-profile/themed-3d-icon/2.png) | Jensen Huang 為靈感的 Minecraft 體素 3D 皮套頭像 | 名人標誌性皮衣與釋出會手勢在降取樣體素中仍可被聯想，是主題 3D 與畫素體素兩風格交界處的輕量個人 IP 頭像方案。 |

### 9.4 貼紙套裝

- **模板簡介**：貼紙套裝 / 表情包合集（獨立元素 + 描邊 + 標籤）。
- **模板路徑**：[`references/avatars-and-profile/sticker-set.md`](../references/avatars-and-profile/sticker-set.md)
- **提示詞目錄**：[`prompts/avatars-and-profile/sticker-set/`](./avatars-and-profile/sticker-set/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./avatars-and-profile/sticker-set/1.json) | [`1.png`](./avatars-and-profile/sticker-set/1.png) | 微信場景 16 枚「打工人日常」Q 萌貼紙合圖 | 4×4 排布、白描邊、輕陰影、每格帶兩字或三字中文情緒標籤，是國內 IM 表情包投放最常用商業規格之一。 |
  | 2 | [`2.json`](./avatars-and-profile/sticker-set/2.json) | [`2.png`](./avatars-and-profile/sticker-set/2.png) | Taylor Swift 梗圖 9 枚 3×3 貼紙（簡筆 Q 版） | 以明星 public 形象做漫化二創梗圖時，強調「神似不寫真」與統一線色，避免侵犯肖像的寫實照片感；九格為專輯宣發 / 粉圈活動常見投放量。 |

### 9.5 文化 / 朝代肖像系列

- **模板簡介**：朝代 / 神話 / 文學 / 民族系列肖像。
- **模板路徑**：[`references/avatars-and-profile/cultural-portrait-series.md`](../references/avatars-and-profile/cultural-portrait-series.md)
- **提示詞目錄**：[`prompts/avatars-and-profile/cultural-portrait-series/`](./avatars-and-profile/cultural-portrait-series/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./avatars-and-profile/cultural-portrait-series/1.json) | [`1.png`](./avatars-and-profile/cultural-portrait-series/1.png) | 唐、宋、元、明、清五朝帝王胸像橫五聯 | 五聯長圖或橫排 banner 在教育類公眾號與博物館數字展陳中常見，格量少於九格時每格面積更大、服飾考據更顯眼。 |
  | 2 | [`2.json`](./avatars-and-profile/cultural-portrait-series/2.json) | [`2.png`](./avatars-and-profile/cultural-portrait-series/2.png) | 希臘神話十二主神胸像 4×3 格古典油畫 | 奧林匹斯十二神為英語世界通識教育固定組合，古典油畫厚塗 + 司職標籤是海外慕課與桌遊美術常採版式。 |

---

## 10. Storyboards & Sequences（敘事性序列）

多格漫畫 / 關鍵畫面 / 關係網等敘事性圖。

### 10.1 4 格漫畫

- **模板簡介**：4 格漫畫 / 諷刺漫畫 / 段子漫畫（起承轉合 + 對話氣泡）。
- **模板路徑**：[`references/storyboards-and-sequences/four-panel-comic.md`](../references/storyboards-and-sequences/four-panel-comic.md)
- **提示詞目錄**：[`prompts/storyboards-and-sequences/four-panel-comic/`](./storyboards-and-sequences/four-panel-comic/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./storyboards-and-sequences/four-panel-comic/1.json) | [`1.png`](./storyboards-and-sequences/four-panel-comic/1.png) | 程式設計師與「合併不了」的週一 | 網際網路打工人段子四格，主角是戴眼鏡的年輕男程式設計師，從滿懷信心到被現實打臉的反轉節奏，對話短、可截圖發微信群。 |
  | 2 | [`2.json`](./storyboards-and-sequences/four-panel-comic/2.json) | [`2.png`](./storyboards-and-sequences/four-panel-comic/2.png) | 週一早會上的 Tim Cook 梗四格 | 用會議室場景做職場諷刺，主角造型偏美式卡通，梗落在「PPT 很滿、結論很虛」，適合內部通訊或社媒長圖裁切。 |

### 10.2 漫畫跨頁

- **模板簡介**：單頁 / 跨頁漫畫分鏡（不規則格子 + 對話 + 心聲）。
- **模板路徑**：[`references/storyboards-and-sequences/manga-spread-page.md`](../references/storyboards-and-sequences/manga-spread-page.md)
- **提示詞目錄**：[`prompts/storyboards-and-sequences/manga-spread-page/`](./storyboards-and-sequences/manga-spread-page/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./storyboards-and-sequences/manga-spread-page/1.json) | [`1.png`](./storyboards-and-sequences/manga-spread-page/1.png) | 仙俠少年劍意初成（彩色跨頁 8 格） | 國產仙俠戰鬥頁，主角為束髮青衫少年，對手為霧中妖影，大格起勢、大格收刀，適合「連載漫畫」內頁或 PV 分鏡展示。 |
  | 2 | [`2.json`](./storyboards-and-sequences/manga-spread-page/2.json) | [`2.png`](./storyboards-and-sequences/manga-spread-page/2.png) | 校園走廊誤會-dialogue 6 格（黑白 + 網點） | 青春校園向，主角為短髮女生，與樓梯轉角男生擦肩而過引發一連串誤會，適合「少女漫畫單頁」式敘事，強調錶情特寫與空鏡。 |

### 10.3 動漫主視覺

- **模板簡介**：單圖動漫 KV / 輕小說封面 / IP 海報。
- **模板路徑**：[`references/storyboards-and-sequences/anime-key-visual.md`](../references/storyboards-and-sequences/anime-key-visual.md)
- **提示詞目錄**：[`prompts/storyboards-and-sequences/anime-key-visual/`](./storyboards-and-sequences/anime-key-visual/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./storyboards-and-sequences/anime-key-visual/1.json) | [`1.png`](./storyboards-and-sequences/anime-key-visual/1.png) | 國產仙俠遊《青麓行》首發 KV | 三人一獸的東方玄幻構圖，青綠主色與金色天光，標題區置頂，適合橫豎裁切，強調主角劍意與門派的史詩感。 |
  | 2 | [`2.json`](./storyboards-and-sequences/anime-key-visual/2.json) | [`2.png`](./storyboards-and-sequences/anime-key-visual/2.png) | 蒸汽朋克少女單角色強氛圍 KV | 單主視覺+極強逆光與齒輪城市場景，賽博與維多利亞混搭，適合女性向新番或音遊主宣。 |

### 10.4 角色關係圖

- **模板簡介**：角色關係圖海報（卡片 + 關係連線 + 圖例）。
- **模板路徑**：[`references/storyboards-and-sequences/character-relationship-diagram.md`](../references/storyboards-and-sequences/character-relationship-diagram.md)
- **提示詞目錄**：[`prompts/storyboards-and-sequences/character-relationship-diagram/`](./storyboards-and-sequences/character-relationship-diagram/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./storyboards-and-sequences/character-relationship-diagram/1.json) | [`1.png`](./storyboards-and-sequences/character-relationship-diagram/1.png) | 《三體》核心人物關係圖（9 人） | 以葉文潔、汪淼、史強、羅輯、章北海、程心、維德、智子擬人、雲天明為節點，用顏色與線型區分敵友、技術聯盟與執劍關係，適合科普與「入坑」長圖。 |
  | 2 | [`2.json`](./storyboards-and-sequences/character-relationship-diagram/2.json) | [`2.png`](./storyboards-and-sequences/character-relationship-diagram/2.png) | 科技巨頭「雲端理事會」卡通組織架構圖 | 以美國知名行業領袖為 Q 版頭像節點，用匯報線、產品協作、公開競爭三種關係，做一張可對內分享的趣味組織圖，非真實公司結構，僅供視覺創意。 |

### 10.5 食譜 / 流程步驟圖

- **模板簡介**：食譜 / 教程 / 流程步驟圖（編號 + 插圖 + 說明）。
- **模板路徑**：[`references/storyboards-and-sequences/recipe-process-flowchart.md`](../references/storyboards-and-sequences/recipe-process-flowchart.md)
- **提示詞目錄**：[`prompts/storyboards-and-sequences/recipe-process-flowchart/`](./storyboards-and-sequences/recipe-process-flowchart/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./storyboards-and-sequences/recipe-process-flowchart/1.json) | [`1.png`](./storyboards-and-sequences/recipe-process-flowchart/1.png) | 番茄炒蛋 5 分鐘家常版 | 5 步豎版食譜卡，食材區在右上，底部署成品，手繪水彩+米色紙感，色板與番茄/蛋一致。 |
  | 2 | [`2.json`](./storyboards-and-sequences/recipe-process-flowchart/2.json) | [`2.png`](./storyboards-and-sequences/recipe-process-flowchart/2.png) | 意式拿鐵（家庭半自動）6 步流程 | 從磨豆到拉花簡易心形的拿鐵製作流程，偏扁平插畫風，適合咖啡角選單或教程海報。 |

---

## 11. Grids & Collages（多面板網格 / 拼貼）

Lookbook、Banner 網格、Pitch Board 等拼貼佈局。

### 11.1 2×2 營銷 Banner 套裝

- **模板簡介**：2×2 營銷 banner 套裝（一次出 4 張統一系列設計）。
- **模板路徑**：[`references/grids-and-collages/banner-grid-2x2.md`](../references/grids-and-collages/banner-grid-2x2.md)
- **提示詞目錄**：[`prompts/grids-and-collages/banner-grid-2x2/`](./grids-and-collages/banner-grid-2x2/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./grids-and-collages/banner-grid-2x2/1.json) | [`1.png`](./grids-and-collages/banner-grid-2x2/1.png) | Apple Vision Pro 第二代·空間計算四象限 | 以「沉浸辦公 / 協奏創作 / 空間健身 / 遠端在場」為四格主題，統一蘋果式留白與無襯線標題，每格 4:5 內區，可拆成四張社交投放。 |
  | 2 | [`2.json`](./grids-and-collages/banner-grid-2x2/2.json) | [`2.png`](./grids-and-collages/banner-grid-2x2/2.png) | 星巴克中國「四季特飲」2×2 | 春櫻 / 夏冷萃 / 秋楓拿鐵 / 冬焙茶四主題，同品牌色帶與字系，每格一飲品 hero + 場景光，適朋友圈與小程式金剛位。 |

### 11.2 Lookbook 網格

- **模板簡介**：7 日 lookbook / 9 宮 self-care / TOP N 清單圖。
- **模板路徑**：[`references/grids-and-collages/lookbook-grid.md`](../references/grids-and-collages/lookbook-grid.md)
- **提示詞目錄**：[`prompts/grids-and-collages/lookbook-grid/`](./grids-and-collages/lookbook-grid/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./grids-and-collages/lookbook-grid/1.json) | [`1.png`](./grids-and-collages/lookbook-grid/1.png) | Taylor Swift 時代巡演風「7 日穿搭」靈感板 | 以 Taylor Swift 公開造型語言為靈感的 7 套全身搭配，同一女性模特造型延續（風格化、非肖像寫實），上四下三錯位，適合音樂粉向穿搭賬號。 |
  | 2 | [`2.json`](./grids-and-collages/lookbook-grid/2.json) | [`2.png`](./grids-and-collages/lookbook-grid/2.png) | 9 宮格 self-care 日常（治癒插畫） | 3×3 無敘事清單，每格一圖示+短句，柔粉與鼠尾草綠，可列印為打卡表或發社群。 |

### 11.3 多風格拼貼

- **模板簡介**：多風格混合拼貼（同一主體不同畫風演繹）。
- **模板路徑**：[`references/grids-and-collages/mixed-style-multi-panel.md`](../references/grids-and-collages/mixed-style-multi-panel.md)
- **提示詞目錄**：[`prompts/grids-and-collages/mixed-style-multi-panel/`](./grids-and-collages/mixed-style-multi-panel/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./grids-and-collages/mixed-style-multi-panel/1.json) | [`1.png`](./grids-and-collages/mixed-style-multi-panel/1.png) | 同一中國女性五畫風肖像（攝影 / 日漫 / 水墨 / 油畫 / 賽博） | 28 歲齊肩黑髮、米白襯衫為跨格識別錨；中央大格為影棚柔光攝影，四角依次為日式 anime、大寫意水墨、倫勃朗式古典油畫、賽博霓虹氛圍，一圖展示同一面容的媒介實驗牆。 |
  | 2 | [`2.json`](./grids-and-collages/mixed-style-multi-panel/2.json) | [`2.png`](./grids-and-collages/mixed-style-multi-panel/2.png) | LeBron James 運動姿態「五連畫風」牆貼 | 以籃球運動員突破上籃為統一點，中央大格為賽場攝影，四格為 anime、美漫厚塗、畫素遊戲、3D 卡通，適合體育自媒體頭圖。人物為可辨識公眾人物，採用風格化、非商業代言寫實。 |

### 11.4 二次元立項 Pitch Board

- **模板簡介**：動漫 / 遊戲 / 影視立項 pitch board（KV + 角色 + 世界觀 + 文案）。
- **模板路徑**：[`references/grids-and-collages/anime-pitch-board.md`](../references/grids-and-collages/anime-pitch-board.md)
- **提示詞目錄**：[`prompts/grids-and-collages/anime-pitch-board/`](./grids-and-collages/anime-pitch-board/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./grids-and-collages/anime-pitch-board/1.json) | [`1.png`](./grids-and-collages/anime-pitch-board/1.png) | 國產二次元 RPG《星樞編年史》立項板 | 近未來東方城邦 + 星軌神話，三人隊伍 + 機甲與符籙混搭，KV 占上半 60%，左下三角色卡，右下地圖與系統關鍵詞，底部工作室落款。 |
  | 2 | [`2.json`](./grids-and-collages/anime-pitch-board/2.json) | [`2.png`](./grids-and-collages/anime-pitch-board/2.png) | 都市玄幻網路動畫《江聲異聞錄》IP 板 | 當代重慶霧都與水下古城交織，主角為青年律師兼兼職「契印人」，主視覺為江面裂隙與樓群剪影，偏懸疑治癒調。 |

---

## 12. Branding & Packaging（品牌識別 / 包裝設計）

品牌識別板、包裝與吉祥物視覺。

### 12.1 品牌識別系統板

- **模板簡介**：品牌識別系統板（logo + 配色 + 字型 + 應用 mockup）。
- **模板路徑**：[`references/branding-and-packaging/brand-identity-board.md`](../references/branding-and-packaging/brand-identity-board.md)
- **提示詞目錄**：[`prompts/branding-and-packaging/brand-identity-board/`](./branding-and-packaging/brand-identity-board/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./branding-and-packaging/brand-identity-board/1.json) | [`1.png`](./branding-and-packaging/brand-identity-board/1.png) | 草本茶新中式品牌「清籬」 | 定位 25–40 歲注重養生的都市白領，標誌為籬形葉片與茶湯漣漪幾何化，主色松煙綠 + 米湯白，配名片、外帶杯與線上海報 mockup。 |
  | 2 | [`2.json`](./branding-and-packaging/brand-identity-board/2.json) | [`2.png`](./branding-and-packaging/brand-identity-board/2.png) | 獨立咖啡館「磚縫光」 | 社群小館定位，主色燧石黑與窯變橙，字標強調磚縫與光束負形，含杯套、門牌、小程式碼卡片 mockup。 |

### 12.2 吉祥物品牌套裝

- **模板簡介**：吉祥物多面板品牌識別套裝（主形象 + 三檢視 + 表情 + 應用）。
- **模板路徑**：[`references/branding-and-packaging/mascot-brand-kit.md`](../references/branding-and-packaging/mascot-brand-kit.md)
- **提示詞目錄**：[`prompts/branding-and-packaging/mascot-brand-kit/`](./branding-and-packaging/mascot-brand-kit/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./branding-and-packaging/mascot-brand-kit/1.json) | [`1.png`](./branding-and-packaging/mascot-brand-kit/1.png) | 故宮建築精靈「小脊獸蹲蹲」 | 以太和殿脊獸為靈感的 Q 版黃色琉璃小獸，頭頂迷你屋脊線，6 個常用表情 + 文創膠帶、書籤、導覽易拉寶應用格。 |
  | 2 | [`2.json`](./branding-and-packaging/mascot-brand-kit/2.json) | [`2.png`](./branding-and-packaging/mascot-brand-kit/2.png) | 美團外賣小袋鼠速達強化版 Brand Kit | 在品牌已有袋鼠認知基礎上做「30 分鐘必達」子 IP 變體，黃黑主色，三檢視、6 表情、頭盔配送箱與電動車遮罩、小程式開屏、保溫袋大印刷位。 |

### 12.3 化妝品包裝

- **模板簡介**：化妝品 / 護膚品單瓶 / 系列 / 禮盒包裝。
- **模板路徑**：[`references/branding-and-packaging/cosmetic-packaging.md`](../references/branding-and-packaging/cosmetic-packaging.md)
- **提示詞目錄**：[`prompts/branding-and-packaging/cosmetic-packaging/`](./branding-and-packaging/cosmetic-packaging/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./branding-and-packaging/cosmetic-packaging/1.json) | [`1.png`](./branding-and-packaging/cosmetic-packaging/1.png) | 國貨高階護膚「雲紋瓷」光感修護系列禮盒 | 品牌名「東籬」，定位東方極簡高奢，莫蘭迪青灰瓷瓶 + 細腰曲線，禮盒半開露出一瓶一罐，真絲底與柔光，適合天旗艦店首屏。 |
  | 2 | [`2.json`](./branding-and-packaging/cosmetic-packaging/2.json) | [`2.png`](./branding-and-packaging/cosmetic-packaging/2.png) | 男士剃鬚理容套裝（潔面 + 須泡 + 須後 + 皮套刀架） | 深海軍藍 + 冷銀，直立擠壓管與金屬蓋，外盒為抽拉式，攝影臺偏冷，強調清晨浴室理性氣質。 |

### 12.4 飲料標籤設計

- **模板簡介**：飲料 / 食品 / 調味品標籤設計（國潮 / 日式 / 西式）。
- **模板路徑**：[`references/branding-and-packaging/beverage-label-design.md`](../references/branding-and-packaging/beverage-label-design.md)
- **提示詞目錄**：[`prompts/branding-and-packaging/beverage-label-design/`](./branding-and-packaging/beverage-label-design/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./branding-and-packaging/beverage-label-design/1.json) | [`1.png`](./branding-and-packaging/beverage-label-design/1.png) | 國潮氣泡水「荔潮」 | 透明玻瓶+金屬旋蓋，米白主標水墨荔枝與金線，底部配料與營養成分條帶，配竹編墊與切半荔枝靜物，4:5 商拍。 |
  | 2 | [`2.json`](./branding-and-packaging/beverage-label-design/2.json) | [`2.png`](./branding-and-packaging/beverage-label-design/2.png) | 精釀「霧港 IPA」酒標 | 470ml 棕色長頸瓶+側招紙標，主插畫為夜航燈塔與海霧，IBU 與酒精度在正面下半，背標故事區，配橡木條與開瓶器場景，偏美式西海岸 IPA 調性但中文溝通。 |

---

## 13. Typography & Text Layout（字面 / 雙語版式）

以文字本身為主體的版式視覺。

### 13.1 大字主張型海報

- **模板簡介**：大字主張型海報（日式高能量 / 瑞士極簡 / 復古印刷）。
- **模板路徑**：[`references/typography-and-text-layout/title-safe-poster.md`](../references/typography-and-text-layout/title-safe-poster.md)
- **提示詞目錄**：[`prompts/typography-and-text-layout/title-safe-poster/`](./typography-and-text-layout/title-safe-poster/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./typography-and-text-layout/title-safe-poster/1.json) | [`1.png`](./typography-and-text-layout/title-safe-poster/1.png) | 春季城市馬拉松公益勸募（日式高能量） | 硃紅＋米黃＋半色調網點，主標四字佔幅超半，下緣英文與主辦方小字，適合地鐵燈箱與通欄下刊。 |
  | 2 | [`2.json`](./typography-and-text-layout/title-safe-poster/2.json) | [`2.png`](./typography-and-text-layout/title-safe-poster/2.png) | 建築事務所開年論壇（瑞士極簡字即圖） | 純黑字白底、僅一條線做節奏，全幅留白大於 60%，適合作業現場圍擋與主屏待機。 |

### 13.2 中英 / 中日雙語版式

- **模板簡介**：中英 / 中日雙語版式視覺（文化 / 學術 / 跨文化品牌）。
- **模板路徑**：[`references/typography-and-text-layout/bilingual-layout-visual.md`](../references/typography-and-text-layout/bilingual-layout-visual.md)
- **提示詞目錄**：[`prompts/typography-and-text-layout/bilingual-layout-visual/`](./typography-and-text-layout/bilingual-layout-visual/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./typography-and-text-layout/bilingual-layout-visual/1.json) | [`1.png`](./typography-and-text-layout/bilingual-layout-visual/1.png) | 東西互鑑當代工藝展（中英對照） | 中文主標題最大，英文為氣質副行，下附展期與場館，主視覺在右下為抽象山水幾何切割，硃砂紅＋古紙色，美術館投放通用。 |
  | 2 | [`2.json`](./typography-and-text-layout/bilingual-layout-visual/2.json) | [`2.png`](./typography-and-text-layout/bilingual-layout-visual/2.png) | 靜岡 × 福鼎「一葉渡海」茶與器聯展（中日對照） | `main_en` 排印日文書名「海を越える一葉」，`main_zh` 為中文並列名；`subtitle_en` 內為日文副行。和紙底＋靛與若草，主視覺為茶碗與單葉。 |

---

## 14. Assets & Props（成套素材 / 遊戲資產）

圖示資產、遊戲內截圖等成套素材。

### 14.1 擬物 / Y2K / 畫素圖示集

- **模板簡介**：擬物 / Y2K / 畫素圖示集（成套統一風格）。
- **模板路徑**：[`references/assets-and-props/retro-skeuomorphic-icons.md`](../references/assets-and-props/retro-skeuomorphic-icons.md)
- **提示詞目錄**：[`prompts/assets-and-props/retro-skeuomorphic-icons/`](./assets-and-props/retro-skeuomorphic-icons/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./assets-and-props/retro-skeuomorphic-icons/1.json) | [`1.png`](./assets-and-props/retro-skeuomorphic-icons/1.png) | iOS 擬物風 12 應用圖示集（4×3 網格） | 亮面玻璃、皮紋、金屬倒角與統一 24% 圓角方底，是千年代末高階智慧手機主題包最具辨識度的「一眼擬物」配方。 |
  | 2 | [`2.json`](./assets-and-props/retro-skeuomorphic-icons/2.json) | [`2.png`](./assets-and-props/retro-skeuomorphic-icons/2.png) | Y2K Aero 風水晶玻璃音樂主題 8 圖示（2×4） | 透明折射、高飽和品紅與電青、鍍鉻描邊是 Windows Vista / 早期媒體播放器皮膚常用的 Y2K 水晶系語言，與扁平時代形成強反差，適合歌單 / 電音向視覺包。 |

### 14.2 遊戲內截圖樣機

- **模板簡介**：遊戲內截圖 mockup（HUD + 字幕 + 任務面板）。
- **模板路徑**：[`references/assets-and-props/game-screenshot-mockup.md`](../references/assets-and-props/game-screenshot-mockup.md)
- **提示詞目錄**：[`prompts/assets-and-props/game-screenshot-mockup/`](./assets-and-props/game-screenshot-mockup/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./assets-and-props/game-screenshot-mockup/1.json) | [`1.png`](./assets-and-props/game-screenshot-mockup/1.png) | 開放世界奇幻 RPG 黃昏雪原越肩視角 | 左下資源條、右下技能輪、左上小地圖與右上任務追蹤是現代 3A 開放世界預設 HUD 四分法，本例用女性遊俠背身強化「正在玩」臨場感。 |
  | 2 | [`2.json`](./assets-and-props/game-screenshot-mockup/2.json) | [`2.png`](./assets-and-props/game-screenshot-mockup/2.png) | 國產仙俠 MMO 雲端浮島鬥法（第三人稱略高機位） | 血條在頭頂、右側豎向技能欄、左下聊天與系統飄字是 PC 仙俠 MMO 常見佈局；本例突出「御劍近身 + 法寶光效」以區隔西幻。 |

---

## 15. Academic Figures（學術配圖）

論文 / 頂會投稿 / 學術海報 / 答辯 PPT 配圖。整體偏白底 + 出版物字型 + 幾何精確。

### 15.1 方法 Pipeline 總覽

- **模板簡介**：方法總覽圖 / pipeline figure（多 stage 塊 + 資料流）。
- **模板路徑**：[`references/academic-figures/method-pipeline-overview.md`](../references/academic-figures/method-pipeline-overview.md)
- **提示詞目錄**：[`prompts/academic-figures/method-pipeline-overview/`](./academic-figures/method-pipeline-overview/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./academic-figures/method-pipeline-overview/1.json) | [`1.png`](./academic-figures/method-pipeline-overview/1.png) | RAG-based Long-Context QA pipeline | 檢索增強長上下文問答的端到端流程，從原始檔案到最終答案，適合 ACL / NeurIPS 式 method overview。五階段串聯、標籤全英文、適合雙欄版式。 |
  | 2 | [`2.json`](./academic-figures/method-pipeline-overview/2.json) | [`2.png`](./academic-figures/method-pipeline-overview/2.png) | 影象擴散模型訓練 pipeline（4 階段） | 文生圖擴散模型在訓練階段的模組級總覽，從圖文對到可生成權重的四階段前向。強調資料、噪聲、U-Net 與 VAE 的角色分工，無訓練 loss 支路、純推理式佈局。 |

### 15.2 神經網路架構圖

- **模板簡介**：神經網路架構圖（layer 塊 + tensor shape + 跳連）。
- **模板路徑**：[`references/academic-figures/neural-network-architecture.md`](../references/academic-figures/neural-network-architecture.md)
- **提示詞目錄**：[`prompts/academic-figures/neural-network-architecture/`](./academic-figures/neural-network-architecture/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./academic-figures/neural-network-architecture/1.json) | [`1.png`](./academic-figures/neural-network-architecture/1.png) | Encoder-only Transformer（12 層，768-d，8-head） | 典型 BERT / RoBERTa 系編碼器，用於下游分類或表示學習。自注意力堆疊、殘差與層歸一化可辨，張量從 token 到池化後 logits。 |
  | 2 | [`2.json`](./academic-figures/neural-network-architecture/2.json) | [`2.png`](./academic-figures/neural-network-architecture/2.png) | Vision Transformer (ViT-B/16) 分類架構 | 從影象到 patch 序列、經 Transformer encoder 與 [CLS] 分類頭，張量隨空間 token 與模型寬度展開，含 PatchEmbed 與位置編碼。適合 CVPR 論文 model figure。 |

### 15.3 定性對比網格

- **模板簡介**：多方法 qualitative 對比網格（行 = 樣本，列 = 方法）。
- **模板路徑**：[`references/academic-figures/qualitative-comparison-grid.md`](../references/academic-figures/qualitative-comparison-grid.md)
- **提示詞目錄**：[`prompts/academic-figures/qualitative-comparison-grid/`](./academic-figures/qualitative-comparison-grid/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./academic-figures/qualitative-comparison-grid/1.json) | [`1.png`](./academic-figures/qualitative-comparison-grid/1.png) | 三種影象生成模型 × 四個固定 Prompt | 同一文字提示下對比 DALL·E 3、Midjourney v6、Stable Diffusion XL 與 Ours，四行文字提示、五列（含 Input 為 prompt 文字卡片）。適用於生成類論文 supplementary。 |
  | 2 | [`2.json`](./academic-figures/qualitative-comparison-grid/2.json) | [`2.png`](./academic-figures/qualitative-comparison-grid/2.png) | Cityscapes 語義分割 — 四方法與 Ground Truth 對比 | 同一張街景輸入下比較經典 FCN、DeepLabV3+、Mask2Former 與 Ours，首列為 Input RGB，一列為 GT，最後一列為 Ours。單元格為彩色 overlay 或側-by-side 小圖。適用於 CVPR 分割論文。 |

### 15.4 科學示意圖

- **模板簡介**：概念 / 原理 / 實驗裝置示意圖（自由度高，自然語言模板）。
- **模板路徑**：[`references/academic-figures/scientific-schematic.md`](../references/academic-figures/scientific-schematic.md)
- **提示詞目錄**：[`prompts/academic-figures/scientific-schematic/`](./academic-figures/scientific-schematic/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.txt`](./academic-figures/scientific-schematic/1.txt) | [`1.png`](./academic-figures/scientific-schematic/1.png) | CRISPR-Cas9 靶向雙鏈斷裂與非同源末端連線 | 以 guide RNA 與目標 DNA 配對、Cas9 切割、NHEJ 或 HDR 為敘事主線，白底、標註線與基因序列樣式符號，適合作 Nature Methods 風格圖注或綜述插圖。 |
  | 2 | [`2.txt`](./academic-figures/scientific-schematic/2.txt) | [`2.png`](./academic-figures/scientific-schematic/2.png) | 雙光子與糾纏光子對產生的簡化實驗光路 | 泵浦鐳射、非線性 BBO 晶體中的自發參量下轉換、分束與符合計數，帶角度標註，適合 PRL 式 optics schematic，強調幾何與波長標註。 |

### 15.5 Publication-Ready 資料圖表

- **模板簡介**：publication-ready 資料圖表（bar / line / scatter / heatmap / box）。
- **模板路徑**：[`references/academic-figures/publication-chart.md`](../references/academic-figures/publication-chart.md)
- **提示詞目錄**：[`prompts/academic-figures/publication-chart/`](./academic-figures/publication-chart/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./academic-figures/publication-chart/1.json) | [`1.png`](./academic-figures/publication-chart/1.png) | SWE-Bench Verified 上多代理系統的 Resolve Rate 對比 | 軟體工程基準 SWE-Bench 上的方法對比，縱軸為 resolve rate、橫軸為公開代理系統名稱，Ours 用強調色。適合系統論文主文圖或附錄表圖。 |
  | 2 | [`2.json`](./academic-figures/publication-chart/2.json) | [`2.png`](./academic-figures/publication-chart/2.png) | LLM 預訓練「Scaling law」雙對數曲線（Test loss vs. compute C） | 縱軸為測試交叉熵、橫軸為訓練算力 C（FLOP，log₁₀），多系列等參放大麴線與趨勢線，體現冪律區段。採用折線模板變體，論文常見 NeurIPS 式。 |

### 15.6 論文圖形摘要 Graphical Abstract

- **模板簡介**：期刊投稿用 Graphical Abstract / 圖形摘要 / 投稿封面圖（4 段式 / 中心展開 / 方形 / 豎版）。
- **模板路徑**：[`references/academic-figures/graphical-abstract.md`](../references/academic-figures/graphical-abstract.md)
- **提示詞目錄**：[`prompts/academic-figures/graphical-abstract/`](./academic-figures/graphical-abstract/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./academic-figures/graphical-abstract/1.json) | [`1.png`](./academic-figures/graphical-abstract/1.png) | 橫向 4 段式 — 大模型長上下文檢索增強問答 | 面向 ACL / EMNLP / TPAMI 風格的 Graphical Abstract，把"長上下文 QA 中的檢索-排序-推理"壓縮成 Problem → Method → Mechanism → Outcome 四段式，比例 2:1，全英標註，灰藍主色 + 單一暖色提示重點結果。 |
  | 2 | [`2.json`](./academic-figures/graphical-abstract/2.json) | [`2.png`](./academic-figures/graphical-abstract/2.png) | 方形 1:1 — 鋰電池矽碳負極迴圈穩定性 | 面向 ACS Energy Letters / Journal of Power Sources 等要求方形 Graphical Abstract 的期刊。2×2 網格佈局：左上為研究問題（矽負極體積膨脹），右上為方法（梯度孔徑矽碳複合材料），左下為關鍵機制（柔性 SEI 緩衝），右下為定性結果（容量保持率柱圖）。 |

### 15.7 學術機理示意圖

- **模板簡介**：論文機制 / 機理 / 反應路徑 / 演化機制圖（中心物件 + 多階段 / 三段式 / 迴圈 / 多分支）。
- **模板路徑**：[`references/academic-figures/mechanism-diagram.md`](../references/academic-figures/mechanism-diagram.md)
- **提示詞目錄**：[`prompts/academic-figures/mechanism-diagram/`](./academic-figures/mechanism-diagram/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./academic-figures/mechanism-diagram/1.json) | [`1.png`](./academic-figures/mechanism-diagram/1.png) | 矽碳負極迴圈過程中的體積膨脹與 SEI 演化機理 | 典型工程類期刊機制圖。中心是矽碳複合顆粒的簡化剖面，周圍按"嵌鋰 → 體積膨脹 → SEI 應力累積 → SEI 破裂 → 新 SEI 重構"五階段展開，第 3、4 階段疊加低飽和暖色作為應力 / 失效高亮。可直接用於論文正文 mechanism figure 或答辯 PPT 機制說明頁。 |
  | 2 | [`2.json`](./academic-figures/mechanism-diagram/2.json) | [`2.png`](./academic-figures/mechanism-diagram/2.png) | 三段式因果鏈 — 光催化降解水中有機汙染物機制 | 環境 / 化工類機制圖變體 1（左 → 中 → 右 三段式因果鏈）。左側為初始體系（光催化劑 + 汙染物 + 紫外光），中間為多階段反應機制（電子-空穴對生成 → 自由基產生 → 汙染物開環 → 礦化），右側為最終產物（CO₂ + H₂O + 無機離子）。整圖保持期刊正文 figure 風格。 |

### 15.8 多工況 / 多條件結果對比圖

- **模板簡介**：同一研究物件在不同工況 / 條件下的多面板結果對比圖（2×2 / 1×N / 雙因子矩陣 / 定性場圖）。
- **模板路徑**：[`references/academic-figures/multi-condition-comparison.md`](../references/academic-figures/multi-condition-comparison.md)
- **提示詞目錄**：[`prompts/academic-figures/multi-condition-comparison/`](./academic-figures/multi-condition-comparison/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./academic-figures/multi-condition-comparison/1.json) | [`1.png`](./academic-figures/multi-condition-comparison/1.png) | 2×2 — 不同進風係數 λ 下的爐膛溫度場分佈對比（定性場圖） | 燃燒 / 能源工程方向典型 result figure。同一爐膛縱剖面在 4 種過量空氣係數下的溫度場對比，4 個 panel 共享同一 viridis-like 色標，標籤 (a)(b)(c)(d) 嚴格統一。無真實 CFD 資料，按定性場圖渲染（色標只顯示 low → high，無數值刻度）。 |
  | 2 | [`2.json`](./academic-figures/multi-condition-comparison/2.json) | [`2.png`](./academic-figures/multi-condition-comparison/2.png) | 1×4 橫向 — 不同退火溫度下鎳基合金微觀組織對比（micrograph） | 材料科學方向 result figure 橫向變體。一行 4 個 SEM micrograph，對比 700 / 800 / 900 / 1000 ℃ 退火後的 γ' 相形貌。所有 panel 共享同一比例尺，labels (a)(b)(c)(d) 位置統一。無真實影象資料，按定性 micrograph 風格渲染（… |

### 15.9 開題 / 答辯 / 彙報研究總覽圖

- **模板簡介**：開題 / 中期 / 終期答辯首頁 + 論文匯報 + 組會引導頁的研究總覽圖（上中下三層 / 中心輻射 / 雙欄 / 極簡）。
- **模板路徑**：[`references/academic-figures/research-overview-poster.md`](../references/academic-figures/research-overview-poster.md)
- **提示詞目錄**：[`prompts/academic-figures/research-overview-poster/`](./academic-figures/research-overview-poster/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./academic-figures/research-overview-poster/1.json) | [`1.png`](./academic-figures/research-overview-poster/1.png) | 中文碩士開題答辯首頁 — 鋰電池熱失控早期預警 | 碩士開題答辯 PPT 首頁用研究總覽圖，主題是"基於多源感測資料的鋰電池熱失控早期預警"。上方主標題 + 副標題，中間為"背景 → 目標 → 三個研究模組（機理 / 模型 / 驗證）"層級結構，下方為預期成果帶，全部中文標註，模組嚴格等大，色調剋制（深藍 + 灰藍 + 黑灰），可直接放進碩士開題答辯首頁。 |
  | 2 | [`2.json`](./academic-figures/research-overview-poster/2.json) | [`2.png`](./academic-figures/research-overview-poster/2.png) | 左右雙欄（變體 2）— 博士中期答辯 · 多模態大模型輔助醫療影像診斷 | 博士中期答辯首頁 + 專案進度，左欄 = 4 個研究內容模組（垂直堆疊），右欄 = 極簡 gantt 時間表（按學期劃分里程碑）。中英雙語，主標題英文 + 中文副標題，色調保持深藍 / 灰藍 / 黑灰，時間軸用細線 + 節點圓。 |

---

## 16. Infographics（資訊圖）

資訊圖 / 高密度科普 / 手繪資訊圖 / KPI 儀表盤。

### 16.1 高圖例密度科普圖

- **模板簡介**：高圖例密度科普 / 因果鏈 / 演化 / 解剖圖（雙語）。
- **模板路徑**：[`references/infographics/legend-heavy-infographic.md`](../references/infographics/legend-heavy-infographic.md)
- **提示詞目錄**：[`prompts/infographics/legend-heavy-infographic/`](./infographics/legend-heavy-infographic/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./infographics/legend-heavy-infographic/1.json) | [`1.png`](./infographics/legend-heavy-infographic/1.png) | 氣候變化對全球主糧作物的因果鏈 | 以半剖面地球 / 農區為視覺錨，輻射狀編號塊解釋升溫、CO₂ 施肥效應、水分脅迫、病蟲害與價格傳導，適合環境經濟學課堂或機構科普長圖主視覺。 |
  | 2 | [`2.json`](./infographics/legend-heavy-infographic/2.json) | [`2.png`](./infographics/legend-heavy-infographic/2.png) | 大語言模型關鍵演化 2017–2026 時間系譜 | 以水平時間鏈 / 系譜樹為心，從 Transformer 到 GPT、開源 Llama 系列、多模態與推理 o1 類，強調「架構、資料、算力、對齊」四標籤，適合技術部落格頭圖或課程講義。 |

### 16.2 手繪風資訊圖

- **模板簡介**：手繪風資訊圖（macaron / morandi / 黑板 / 牛皮紙；自然語言模板）。
- **模板路徑**：[`references/infographics/hand-drawn-infographic.md`](../references/infographics/hand-drawn-infographic.md)
- **提示詞目錄**：[`prompts/infographics/hand-drawn-infographic/`](./infographics/hand-drawn-infographic/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.txt`](./infographics/hand-drawn-infographic/1.txt) | [`1.png`](./infographics/hand-drawn-infographic/1.png) | 如何在家自制希臘酸奶 | 廚房手賬感、豎版 3:4，適合公眾號或小紅書。步驟 6 條，材料與時長寫清，無電腦字型要求。 |
  | 2 | [`2.txt`](./infographics/hand-drawn-infographic/2.txt) | [`2.png`](./infographics/hand-drawn-infographic/2.png) | 番茄紅素的益處與攝入要點（馬卡龍手賬風） | 偏科普+生活方式，用柔和粉綠配色與 macaron 風，分條寫抗氧化語境、脂溶性、食物來源、吸收小貼士，不宣稱醫療功效。 |

### 16.3 便當格資訊圖

- **模板簡介**：便當格模組化資訊圖（高密度多模組 widget 排布）。
- **模板路徑**：[`references/infographics/bento-grid-infographic.md`](../references/infographics/bento-grid-infographic.md)
- **提示詞目錄**：[`prompts/infographics/bento-grid-infographic/`](./infographics/bento-grid-infographic/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./infographics/bento-grid-infographic/1.json) | [`1.png`](./infographics/bento-grid-infographic/1.png) | iPhone 16 Pro 全方位解析（便當格 8 模組） | Apple Newsroom 式淺灰白底、一大塊 hero 放鈦原色機背與「為何值得換」三條，其餘為規格對比、算力/影像晶片、價格段、系統亮點與選購提示。適合數碼自媒體一圖流。 |
  | 2 | [`2.json`](./infographics/bento-grid-infographic/2.json) | [`2.png`](./infographics/bento-grid-infographic/2.png) | Tesla Model Y 改款全面盤點 | 面向「考慮換電車」的讀者，bento 強調續航區間、電耗、空間、FSD/輔助駕駛、充電與價格帶，不採用過分促銷語氣。 |

### 16.4 二元 / 多元對比資訊圖

- **模板簡介**：二元 / 多元對比資訊圖（A vs B / 套餐檔位 / 誤區 vs 正解）。
- **模板路徑**：[`references/infographics/comparison-infographic.md`](../references/infographics/comparison-infographic.md)
- **提示詞目錄**：[`prompts/infographics/comparison-infographic/`](./infographics/comparison-infographic/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./infographics/comparison-infographic/1.json) | [`1.png`](./infographics/comparison-infographic/1.png) | iPhone 16 Pro 與三星 Galaxy S25 Ultra 誰更適合你 | 從螢幕形態、長焦、錄影、系統生態、維修與起售價看差異，避免攻擊品牌，用「你更看重什麼」作結。3:4 豎版、淺暖底、中央 VS 符號可細線可幾何。 |
  | 2 | [`2.json`](./infographics/comparison-infographic/2.json) | [`2.png`](./infographics/comparison-infographic/2.png) | 燕麥奶 Oat 飲 vs 全脂牛奶 | 從蛋白品質、脂溶性營養、價格、升糖/飽腹、環境足跡到咖啡拉花適配，幫助乳糖不耐與健身人群自判。不宣稱醫療功效，語氣科普。 |

### 16.5 步驟教程資訊圖

- **模板簡介**：步驟教程資訊圖（插畫感、溫暖；非工程流程圖）。
- **模板路徑**：[`references/infographics/step-by-step-infographic.md`](../references/infographics/step-by-step-infographic.md)
- **提示詞目錄**：[`prompts/infographics/step-by-step-infographic/`](./infographics/step-by-step-infographic/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./infographics/step-by-step-infographic/1.json) | [`1.png`](./infographics/step-by-step-infographic/1.png) | 新手家庭健身 7 步入門 | 無器械起步，從熱身、呼吸、分部位訓練到拉伸與恢復，配色薄荷+珊瑚+深棕，適合運動小白跟練海報。 |
  | 2 | [`2.json`](./infographics/step-by-step-infographic/2.json) | [`2.png`](./infographics/step-by-step-infographic/2.png) | 10 分鐘戚風備料+烘烤(家用 6 寸模) | 把稱量、分蛋、打蛋白、翻拌、入爐、倒扣冷卻濃縮為 6 步，時間軸是「你動手的前 10 分鐘 + 烤時另計」。暖橙+鼠尾草色，烤箱與打蛋器小插畫。 |

### 16.6 KPI 儀表盤資訊圖

- **模板簡介**：KPI 儀表盤式資訊圖（年度回顧 / Wrapped / 業務 dashboard）。
- **模板路徑**：[`references/infographics/kpi-dashboard-infographic.md`](../references/infographics/kpi-dashboard-infographic.md)
- **提示詞目錄**：[`prompts/infographics/kpi-dashboard-infographic/`](./infographics/kpi-dashboard-infographic/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./infographics/kpi-dashboard-infographic/1.json) | [`1.png`](./infographics/kpi-dashboard-infographic/1.png) | Northwind AI 的 2025 年度關鍵指標一頁 | B2B SaaS 風暗色底，主標 ARR 與 NRR，附 pipeline、客訴、上雲與員工人數，像投資人會前「一頁快覽」而非正式年報。所有金額與百分比為**示意**。 |
  | 2 | [`2.json`](./infographics/kpi-dashboard-infographic/2.json) | [`2.png`](./infographics/kpi-dashboard-infographic/2.png) | 個人 2025 讀書報告 Wrapped | 類 Spotify Wrapped 的年度閱讀快照：總本數、總頁、體裁分佈、最長一本、最忙閱讀月、豆瓣均分(示意)與想讀佇列縮減，暖亮底+紫粉強調。適合匯出為一張圖**發到微信朋友圈**或收藏。 |

---

## 17. Technical Diagrams（技術工程示意圖）

系統架構 / 流程圖 / 時序 / 狀態機 / ER / 思維導圖 / 網路拓撲等工程示意圖。

### 17.1 系統架構圖

- **模板簡介**：系統架構圖（前端 + 後端 + DB + 快取 + 佇列 + 外部）。
- **模板路徑**：[`references/technical-diagrams/system-architecture.md`](../references/technical-diagrams/system-architecture.md)
- **提示詞目錄**：[`prompts/technical-diagrams/system-architecture/`](./technical-diagrams/system-architecture/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./technical-diagrams/system-architecture/1.json) | [`1.png`](./technical-diagrams/system-architecture/1.png) | 多租戶 AI 客服 SaaS 生產架構 | React/Next.js 公網入口、Kong 閘道器、FastAPI 業務層、Postgres+Redis+Kafka+Qdrant 資料面，以及 OpenAI、Stripe、Twilio 等外部依賴分割槽清晰，是 ToB 智慧客服產線最常被引用的一類「全棧+向量檢索+計費等」總覽圖。 |
  | 2 | [`2.json`](./technical-diagrams/system-architecture/2.json) | [`2.png`](./technical-diagrams/system-architecture/2.png) | 區域電商節秒殺下單鏈路（CDN + 微服務 + 主從 + MQ） | 高併發讀路徑經 CDN 與 Nginx 進入訂單域，庫存與訂單解耦、RabbitMQ 削峰、MySQL 主從與 Redis 熱點庫存，是業務側和基礎設施同學對齊時的標準「大促架構」一屏講清版。 |

### 17.2 流程圖 / 決策圖

- **模板簡介**：流程圖 / 決策圖（BPMN 形狀語義 + Yes/No 分支）。
- **模板路徑**：[`references/technical-diagrams/flowchart-decision.md`](../references/technical-diagrams/flowchart-decision.md)
- **提示詞目錄**：[`prompts/technical-diagrams/flowchart-decision/`](./technical-diagrams/flowchart-decision/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./technical-diagrams/flowchart-decision/1.json) | [`1.png`](./technical-diagrams/flowchart-decision/1.png) | 使用者註冊（簡訊驗證碼 + 郵箱驗證 + 風控分支） | 從提交手機號與密碼到傳送簡訊、人機校驗、device_id 行為評分分支，郵箱驗證連結 24h 內有效；未透過風控進入人工複核佇列（子流程塊）。`exception_branch` 控制異常顏色邊。 |
  | 2 | [`2.json`](./technical-diagrams/flowchart-decision/2.json) | [`2.png`](./technical-diagrams/flowchart-decision/2.png) | 訂單退款稽核（原路退 / 部分退 / 財務駁回） | BPMN 泳道標清使用者、商戶 BFF、訂單服務、支付適配、財務。含「已超售後期」「風控命中」「部分退款金額>剩餘」等決策；啟用泳道。 |

### 17.3 時序圖

- **模板簡介**：時序圖（actor + lifeline + 訊息箭頭 + 啟用條）。
- **模板路徑**：[`references/technical-diagrams/sequence-diagram.md`](../references/technical-diagrams/sequence-diagram.md)
- **提示詞目錄**：[`prompts/technical-diagrams/sequence-diagram/`](./technical-diagrams/sequence-diagram/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./technical-diagrams/sequence-diagram/1.json) | [`1.png`](./technical-diagrams/sequence-diagram/1.png) | OAuth 2.0 授權碼 + PKCE（User / Web / Keycloak / Resource） | 瀏覽器端機密公開場景下的標準四角色握手，從 `/authorize` 到 `code` 換 `access_token` 再帶 `Bearer` 調業務 API，是內部 IdP 遷移說明裡引用頻率最高的一段時序。 |
  | 2 | [`2.json`](./technical-diagrams/sequence-diagram/2.json) | [`2.png`](./technical-diagrams/sequence-diagram/2.png) | 微信 Native 支付「統一下單—調起微信—支付結果」（使用者 / 商戶 / 微信） | 使用者在微信內 H5/小程式外跳 Native 的常規三線模型：商戶統一下單拿 prepay_id，客戶端 `chooseWXPay` 調起，非同步 notify 與查詢補償閉環，適合貼進對接章節。 |

### 17.4 狀態機 / 生命週期圖

- **模板簡介**：狀態機 / 生命週期圖（state + transition + guard / action）。
- **模板路徑**：[`references/technical-diagrams/state-machine.md`](../references/technical-diagrams/state-machine.md)
- **提示詞目錄**：[`prompts/technical-diagrams/state-machine/`](./technical-diagrams/state-machine/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./technical-diagrams/state-machine/1.json) | [`1.png`](./technical-diagrams/state-machine/1.png) | B2C 主單 OMS 狀態機（從建立到終態含補償） | 含「配貨中」與微信/對公等支付後履約分支、超時關單與整單退款終態，與 `order_status` 列舉、冪等重試在評審裡一一對齊，是交易域最常用的「一張圖對齊全倉」主單機。 |
  | 2 | [`2.json`](./technical-diagrams/state-machine/2.json) | [`2.png`](./technical-diagrams/state-machine/2.png) | 內容平臺 `Article` 稽核與上下架狀態機 | 覆蓋草稿、機審、人審、已釋出、使用者舉報後的下架、以及軟刪與從下架恢復，滿足「信安 + 產品」對 `visibility` 與 `review_job_id` 聯動的說明需求。 |

### 17.5 ER 圖 / 資料模型圖

- **模板簡介**：ER 圖 / 資料模型圖（實體 + 欄位 + PK/FK + crow's foot 關係）。
- **模板路徑**：[`references/technical-diagrams/er-diagram.md`](../references/technical-diagrams/er-diagram.md)
- **提示詞目錄**：[`prompts/technical-diagrams/er-diagram/`](./technical-diagrams/er-diagram/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./technical-diagrams/er-diagram/1.json) | [`1.png`](./technical-diagrams/er-diagram/1.png) | 電商核心資料模型（使用者 · 地址 · 商品 · 訂單 · 券） | 覆蓋 `users` 到 `orders`、`order_items`、`skus`，以及 `payments`、`coupons` 與多對多 `coupon_redemptions`。型別使用 PostgreSQL 習慣（`uuid`、`timestamptz`、`numeric(12,2)`），與典型 Pris… |
  | 2 | [`2.json`](./technical-diagrams/er-diagram/2.json) | [`2.png`](./technical-diagrams/er-diagram/2.png) | 多作者部落格平臺（分類 · 標籤 · 評論 · 點贊） | `posts` 多對多 `tags` 經 `post_tags`，`categories` 樹形自關聯；`comments` 支援二級回覆 `parent_id`；`likes` 以 `(user_id, post_id)` 保證唯一。適合檔案站與社群輕量 CMS。 |

### 17.6 技術主題思維導圖

- **模板簡介**：技術主題思維導圖（中央 + 放射式分支）。
- **模板路徑**：[`references/technical-diagrams/mind-map-tech.md`](../references/technical-diagrams/mind-map-tech.md)
- **提示詞目錄**：[`prompts/technical-diagrams/mind-map-tech/`](./technical-diagrams/mind-map-tech/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./technical-diagrams/mind-map-tech/1.json) | [`1.png`](./technical-diagrams/mind-map-tech/1.png) | 前端工程師必備技能譜（TypeScript 生態為軸） | 從語言/執行時到構建、可觀測、端側與體驗指標，對齊全鏈路交付責任，適合「高階工程師」與「全棧化前端」自評時一張圖說清能力邊界。 |
  | 2 | [`2.json`](./technical-diagrams/mind-map-tech/2.json) | [`2.png`](./technical-diagrams/mind-map-tech/2.png) | Kubernetes 知識全景（自叢集到可觀測的閉環） | 以叢集生命週期、工作負載、網路、安全、儲存、交付與 SRE 觀測六扇面展開，覆蓋 CNI/Cilium、Gateway API、OPA 與 HPA/VPA/CA，是平臺組新人「八週上手」的導航圖。 |

### 17.7 網路拓撲圖

- **模板簡介**：網路拓撲圖（裝置 glyph + zone / VPC + 頻寬 / 協議標）。
- **模板路徑**：[`references/technical-diagrams/network-topology.md`](../references/technical-diagrams/network-topology.md)
- **提示詞目錄**：[`prompts/technical-diagrams/network-topology/`](./technical-diagrams/network-topology/)
- **圖片進度**：✅ 2 / 2
- **案例**：

  | # | 提示詞 | 圖片 | 案例標題 | 簡介 |
  |---|---|---|---|---|
  | 1 | [`1.json`](./technical-diagrams/network-topology/1.json) | [`1.png`](./technical-diagrams/network-topology/1.png) | AWS 多可用區生產 VPC（ALB + WAF、NAT、RDS、ElastiCache、ECS） | 公網子網內 ALB+WAF、Private 子網內 ECS/任務與多 AZ 資料面，ElastiCache 與 RDS 的跨子網、NAT 出口與 IGW/CloudFront 入站路徑一眼區分，是電商平臺雲上網路評審裡最常見的定稿圖。 |
  | 2 | [`2.json`](./technical-diagrams/network-topology/2.json) | [`2.png`](./technical-diagrams/network-topology/2.png) | 企業 SD-WAN：總部雙機熱備 + 分支 CPE 與 雲專線融合 | 總部與兩地分支經 MPLS+Internet 雙上行（Active/Active）、hub 級防火牆、控制器納管、以及一條至 VPC 的 VPN/Direct Connect 匯流，是零售或製造總部「一張網管門店」HLD 常見形態。 |

---