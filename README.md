# Signal Rig · 小红书照片装置

打开即看到原版八屏 3D 装置。点击屏幕选择照片，拖动旋转；SHUFFLE 重新分配照片，BUILD 生成 1200 × 1600 PNG，SAVE 保存到相册。

## 开发与打包

```sh
npm ci
npm run pack
npm start
```

浏览器打开 `http://localhost:4173`。产物：`release/signal-rig-minitool.zip`。ZIP 根目录直接包含 `index.html`，其余资源全部包内相对引用。`npm run dev` 可用 Vite 预览已构建的 `dist`。

## 照片行为

- 一次选取最多 8 张，首张进入点选屏幕，其余优先匹配屏幕横竖比。
- 不足 8 张时循环填满屏幕；已有照片后单选只替换点选屏幕。
- 多选会替换当前整组照片。照片在本地缩放到最长边 1280px，保留原图方向；屏幕采用居中裁切。
- 旋转只改变观察角度，SHUFFLE 只改变照片分配，BUILD 按当前角度生成装置图。
- 未实现持久化草稿；退出或刷新会清空照片。不会上传照片，也不会调用 AI 或后端。
- WebGL 不可用时使用 Canvas 2D 投影原模型，仍能旋转与导出；渲染初始化完全失败或上下文丢失时再切换平面应急模式。

## 原版还原

源自用户既有 `Bubble Hu — Signal Rig Prototype`，源提交 `fa1bcd67f424edeb4c2067bf4e3530c7e68a7377`。

- `references/signal-rig-geometry.glb.gz`：原 Blender 模型的几何归档（移除旧照片），494 个节点，三横五竖。
- `app/refine-rig.ts`：原版材质/紧固件/缩小背板处理。
- `scripts/extract-rig.py`：从 GLB 提取几何、层级、UV；排除全部原作品照片，生成分块 JS 数据。运行时无需下载模型、解析 GLB 或请求网络。
- `app/model.js`：用同一份原始模型数据恢复装置，未重画替代品。

当前 Cloudflare 作品集首页为复古电视版本；本工具复用的是找回的 Signal Rig 3D 源码。

## 容器与验证边界

见 [SETUP_XHS.md](SETUP_XHS.md)。不使用 AgentRuntime、Red Skill、Agent ID 或云函数。普通浏览器缺少小红书 SDK 时展示图片供手动保存；小红书内使用官方 `writeTempFile` / `saveImageToPhotosAlbum`。

端 API 的真实行为、相册权限与平台上传审核，必须在小红书模拟器/真机验证，构建校验不能代替真机验收。
