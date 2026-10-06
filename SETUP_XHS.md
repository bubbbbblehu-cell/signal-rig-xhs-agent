# 上传小红书「小工具」

1. 执行 `npm ci && npm run pack`。
2. 登录 https://creator.xiaohongshu.com/，进入 Builder Hub → 小工具；先复制上传页当前的完整改写口令核对版本，再上传 `release/signal-rig-minitool.zip`。不要上传仓库压缩包，不需要 Agent ID。
3. 在模拟器和手机测试：打开显示装置；点击屏幕选择照片；拖动旋转；SHUFFLE；BUILD；SAVE。
4. 分别测试相册授权成功、拒绝和再次尝试，以及 iOS/Android、1 张/8 张/大图/取消选图。
5. 确认显示与保存正确后，再走平台的提交审核/发布流程。

官方依据（核对日 2026-10-06）：
https://miniapp-sandbox.xiaohongshu.com/minitool/doc

本包符合已核对的离线资源、根入口、脚本外置、文件类型及 JSBridge 参数要求。构建按保守预算检查：ZIP < 5MiB、单文件 < 2MiB；是否存在额外平台审核要求，以你账号当前上传页为准。

- 入口 `index.html`；只打包 HTML、CSS、JS。原 GLB 及构建工具不进入 ZIP。
- 不联网、无 CDN、无 iframe、无动态执行、无 Worker/WASM。原图经 FileReader 在本地读取。
- 无 SDK：生成 PNG 预览，提示浏览器右键/长按保存；不调用容器禁止的 a[download]。
- 有 SDK：点击保存后 `writeTempFile({data: 完整dataURI})`，再 `saveImageToPhotosAlbum({filePath})`；缺少临时文件 API 时直接传 data URI。
- API 失败不会显示保存成功，不自动发布笔记。
- 当前在线文档的最低基线为 Android 8.1 / Chrome 61、iOS 18.4；CSS 与真机兼容性未实测。
- 输出脚本转译至 Chrome 61 / Safari 12；Three.js r160 保留 WebGL1 支持。无法创建 WebGL 时，用 Canvas 投影原模型提供旋转/导出；最终应急降级为平面模式。

本次未连接小红书容器，不声明真机通过、已上传或已审核。

2026-10-06 复核：已下载官方 CDN 的 minitool-zip-builder-1.7.0.skill（内部 metadata 仍标 1.6.0），并读取 2026-09-22 在线能力文档。修复旧内核 CSS、安全区变量、移除自建 CSP。官方 Python 体积审计通过，0 警告。上传页当前口令仍需在账号内确认，不将第三方文章引用的下载版本认定为你账号的当前版本。
