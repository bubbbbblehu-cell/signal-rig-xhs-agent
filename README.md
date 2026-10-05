# SIGNAL RIG — Xiaohongshu Agent MVP

把 1–8 张个人照片 + 一句话，变成一件克制、可被“搭出来”的数字艺术装置。

## MVP 流程

1. 用户输入一句话，并提供照片 URL（最多 8 张）。
2. `qwen-vl-plus` 读取文字与照片，输出一个唯一的装置概念：标题、短句、情绪/材质词、图像生成提示词。
3. `wan2.6-image` 根据该概念生成 Signal Rig 风格装置图。
4. Agent 先流式返回作品标题，再返回图像生成结果。

视觉规则在 `references/visual-language.md`，它是这个项目最重要的“审美资产”。

## 在小红书开放平台里启动

要求：Node.js >= 18。

```bash
npm i -g @vectorx/xhs-cloud-cli
rcb login
npm install
```

先在小红书开放平台创建智能体并获取 `Agent ID`（不是 Skill ID），再把 `project.config.json` 里的 `REPLACE_WITH_YOUR_XHS_AGENT_ID` 替换掉。详见 `SETUP_XHS.md`。

本地运行：

```bash
rcb agent dev -d . -o --use-ide
```

或者：

```bash
rcb agent dev --open true
```
