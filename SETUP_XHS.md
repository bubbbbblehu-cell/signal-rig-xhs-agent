# 小红书接入步骤

## 现在需要的不是 Skill ID，而是 Agent ID

在小红书开放平台创建一个智能体后，平台会给你一个 `agentId`。

拿到后，把它替换到：
- `project.config.json` → `agentId`

`agent-cloudbase-functions.json` 里的 `agentId` 是可选的。

## 推荐顺序

1. 登录小红书开放平台。
2. 控制台 → 智能体 → 创建智能体。
3. 名称建议：`SIGNAL RIG`。
4. 复制创建后的 `agentId`。
5. 替换 `project.config.json` 中的占位符。
6. 安装依赖并本地调试：

```bash
npm install
npm run check
rcb agent dev --open true
```

后续做成站内可点开的体验，还需要小程序/小组件前端，通过 `xhs.cloud.AI.createAgent({ agentId })` 连接这个 Agent。
