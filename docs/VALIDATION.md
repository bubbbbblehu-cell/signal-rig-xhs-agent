# Validation · 2026-10-05

Verified in browser:
- Recovered original mesh displays on first open using Canvas fallback (test browser disables WebGL).
- Two user-owned sample photos selected together populate all eight screen assignments.
- Direct screen hit opens image chooser; single-image selection replaces that screen.
- Drag rotates original mesh; reset returns to the opening angle.
- Shuffle changes photo assignments, keeping physical structure.
- Build opens a decoded PNG with naturalWidth 1200 and naturalHeight 1600.
- Without SDK, save shows browser instructions and never reports native success.
- 390×844 and 320×640 embedded test viewports show model, eight selectors and all three actions without horizontal clipping.

Automated checks:
- `npm run pack`: one root index.html; only allowed file types; relative resources; external scripts; all referenced files present; no network/Worker/eval calls in application bundle.
- No AgentRuntime dependencies. Each output file <2MiB and compressed ZIP <5MiB (conservative budgets).
- `node scripts/test-save.mjs`: mock success payloads, missing SDK fallback, missing temp API, invalid temp path, and rejected permission.

Not verified:
- Actual Xiaohongshu container JSBridge / real album permission.
- WebGL on iOS and Android (browser environment has GL disabled).
- Platform upload acceptance, review or publication.
- Low-end hardware performance and full EXIF-format/device matrix.

Browser QA used user-owned sample images; those photos and the preview screenshot are excluded from GitHub. QA photos, screenshots, source geometry and QA shell are NOT shipped in release ZIP. The production tool starts with empty screens. `scripts/preview-qa.mjs` generates a temporary QA page after build; `npm run pack` rebuilds dist and excludes it.

## 2026-10-06 容器规范补充复核

- 官方在线文档（最后更新 2026-09-22）：https://miniapp-sandbox.xiaohongshu.com/minitool/doc
- 下载包：https://fe-static.xhscdn.com/minitool/20260923133933/minitool-zip-builder-1.7.0.skill （包内 metadata 1.6.0）。未确认账号上传页的当前口令。
- CSS 修复：物理定位替代 inset、margin 替代 Flex gap、grid-gap、focus 基线、安全区容器变量与 env 增强。移除自建 CSP，由小红书容器管理。
- 原装置 WebGL 静态硬件按材质合并，保留八张独立照片与原始点击层级。静态可见网格由 838 减至 20，三角形 61,576；这不是实测 draw call 或 FPS。
- 初始 DPR ≤ 1.5、画布 ≤ 200 万像素。连续 12 次绘制超过 45ms 后降低至 DPR ≤ 1、100 万像素并隐藏透明件/发光硬件（47,156 三角形）；仍持续缓慢时转平面编辑。照片纹理最长边 768。
- 页面隐藏取消待绘制帧；context lost 进入轻量视图。导出时临时画布 1200×1290，结束恢复。
- 单条模型 Base64 最大解码 44,928 bytes，低于 100KiB 提示阈值。
- 官方 Python 包体审计通过：8 个文件，0 警告；相册桥接 mock 测试通过。
- 本轮 CSS 与 WebGL 合批未在真实 Chrome 61、小红书模拟器、Android 或 iOS 上实测；之前普通浏览器验证不能代替容器验收。

## 2026-10-06 真机反馈修正

- 单张上传（包含首次）只修改所选屏幕，不再自动复制填满。
- 新增批量入口，最多 8 张，优先按横竖比例填入空屏，空屏不足再替换已有屏幕；每个文件只分配一次。
- 增加深绿、奶白、浅蓝、淡粉背景，页面与导出共用色板；浅色背景搭配深色文字。
- 回归用例：首次单张、替换、批量保留已有照片、取消、满屏批量替换。构建与相册 mock 测试通过；新版仍需用户扫码进行真机视觉与相册验收。

## 2026-10-06 装置优先布局

- 移除首屏大标题、说明块和编号选屏栏；装置视口延伸到页面底部 96px 工具区以上，背景和生成/保存收入更多菜单。
- 默认缓慢自动旋转，拖动暂停、松手 2.5 秒后恢复；可手动暂停。遵循系统减少动态效果设置。
- 选图处理、结果弹层、更多菜单与页面隐藏时暂停自动旋转；隐藏页取消动画任务。
- 构建、离线检查、照片分配及保存 mock 测试通过；新版布局和旋转需手机扫码验收。
