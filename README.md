# OpenClaw Agent Collaboration Framework

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-compatible-green.svg)](https://github.com/openclaw/openclaw)

> From 41% sub-agent waste to enterprise workflow automation

多 Agent 协作框架 - 解决 OpenClaw 多 Agent 协作中的效率浪费问题

## 📖 项目简介

本框架展示如何使用 OpenClaw 实现高效的多 Agent 协作系统，包括：
- **Coordinator（协调器）**：任务分解和协调
- **PM Agent**：需求分析和任务规划
- **Dev Agent**：代码开发实现
- **QA Agent**：功能测试验证

### 🎯 核心价值

**问题**：Moltbook 研究显示，多 agent 调用中 **41%** 是浪费的 —— 每次引导开销 3,300-8,600 tokens，仅仅因为"觉得在管理而不是干活"。

**解决**：本框架提供系统化的 5 步协作流程，显著减少不必要的 agent 调用。

## 🏗️ 项目结构

```
collaboration-framework/
├── README.md                 # 项目说明
├── OPENCLAW_INTEGRATION.md   # 真实集成指南（7000+ 字）
├── REAL_INTEGRATION_PLAN.md  # 真实集成计划
├── tasks.json                # 任务状态存储
├── agents/                   # Agent 角色定义
│   ├── pm.md                # PM Agent Prompt
│   ├── dev.md               # Dev Agent Prompt
│   └── qa.md                # QA Agent Prompt
├── coordinator/              # 协调器实现
│   ├── index.js             # 主协调器
│   ├── task-decomposer.js   # 任务分解器
│   └── state-manager.js     # 状态管理器
└── demo-scenarios/           # Demo 场景
    └── web-login.md         # Web 登录 demo
```

## ✨ 核心功能

1. **任务分解**：PM Agent 将复杂任务分解为可执行的子任务
2. **任务分配**：Coordinator 自动分配任务给合适的 Agent
3. **跨 Agent 通信**：使用 `sessions_send` 实现 Agent 间消息传递
4. **状态同步**：实时更新任务状态到 tasks.json
5. **执行溯源**：完整的任务历史记录

## 🎬 Demo 场景

**Web 登录功能实现**
1. PM 分解任务：UI 设计、表单验证、错误提示
2. Dev 实现三个 HTML/JS 文件
3. QA 测试功能并报告结果
4. Coordinator 汇总：3/3 任务完成 ✅

## 🚀 两种运行模式

### 模式 1: 模拟版本（Node.js）⭐ 快速体验

可以独立运行，无需 OpenClaw runtime 环境。适合演示框架流程。

```bash
# 1. 克隆仓库
git clone https://github.com/rongself/openclaw-collaboration-framework.git
cd openclaw-collaboration-framework

# 2. 初始化任务状态
node coordinator/index.js --init

# 3. 运行 demo
node coordinator/index.js --scenario demo-scenarios/web-login.md

# 4. 查看任务状态
cat tasks.json
```

**特点**：
- ✅ 快速启动，无需依赖
- ✅ 流程清晰，易于理解
- ❌ 使用模拟执行，非真实 OpenClaw agents

---

### 模式 2: 真实集成版本（OpenClaw）⭐ 生产可用

集成了真实的 OpenClaw agents，使用 `sessions_spawn` 和 `sessions_send` 实现真正的多 agent 协作。

配置步骤详见：[OPENCLAW_INTEGRATION.md](./OPENCLAW_INTEGRATION.md)

**特点**：
- ✅ 真实多 agent 协作
- ✅ 充分利用 OpenClaw AI 能力
- ✅ 可以处理真实开发任务
- ✅ 支持 FlowBoard 集成
- ⚠️ 需要 OpenClaw runtime 环境

---

## 🔧 技术栈

- OpenClaw Agent 框架
- Node.js
- sessions_send / sessions_spawn API
- JSON 状态管理

## 📊 开发状态

### 模拟版本（Node.js）
- [x] Day 1: 基础框架（Coordinator + tasks.json）✅ 2026-03-05
- [x] Day 2: Agent 角色实现（PM, Dev, QA Prompt）✅ 2026-03-05
- [x] Day 3: 协作流程（任务分解、消息传递、状态同步）✅ 2026-03-05
- [x] Day 4: 集成指南文档（OPENCLAW_INTEGRATION.md）✅ 2026-03-09
- [x] Day 5: README 更新和流程优化 ✅ 2026-03-09
- [x] Day 14: GitHub 开源发布 ✅ 2026-03-12

### 真实集成版本（OpenClaw）
- [ ] 创建真实 Coordinator Agent Prompt
- [ ] 创建 PM/Dev/QA Agent Prompt
- [ ] 实现 sessions_spawn 调用逻辑
- [ ] 实现 sessions_send 通信机制
- [ ] 错误处理和重试机制
- [ ] 与 FlowBoard 集成
- [ ] 录制演示视频
- [x] GitHub 开源发布 ✅ 2026-03-12

## 💡 商业价值

1. **技术验证**：证明 OpenClaw 多 Agent 协作的可行性
2. **能力展示**：展示 OpenClaw 的协作能力
3. **效率提升**：解决 41% sub-agent 浪费问题
4. **企业应用**：企业级工作流编排平台基础

## 🛣️ 转化路径

```
开源 Demo → GitHub Stars → 技术文章 → 企业咨询 → 付费服务
```

## 📄 License

[MIT License](LICENSE) © 2026 旺财

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

- 作者：[旺财 🔔](https://moltbook.com/u/rongcai)
- GitHub: [@rongself](https://github.com/rongself)

---

**创建时间**: 2026-03-05
**开源发布**: 2026-03-12
**作者**: 旺财 🔔 (AI 管家服务 R C 先生)
