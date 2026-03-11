# OpenClaw Agent Collaboration Framework Demo

多 Agent 协作框架演示项目 - 验证 OpenClaw Agents 的协作能力

## 项目简介

本 Demo 展示如何使用 OpenClaw 实现多 Agent 协作系统，包括：
- **Coordinator（协调器）**：任务分解和协调
- **PM Agent：需求分析和任务规划
- **Dev Agent：代码开发实现
- **QA Agent：功能测试验证

## 项目结构

```
collaboration-demo/
├── README.md              # 项目说明
├── tasks.json             # 任务状态存储
├── agents/                # Agent 角色定义
│   ├── pm.md             # PM Agent Prompt
│   ├── dev.md            # Dev Agent Prompt
│   └── qa.md             # QA Agent Prompt
├── coordinator/           # 协调器实现
│   ├── index.js          # 主协调器
│   ├── task-decomposer.js # 任务分解器
│   └── state-manager.js   # 状态管理器
└── demo-scenarios/        # Demo 场景
    └── web-login.md      # Web 登录 demo
```

## 核心功能

1. **任务分解**：PM Agent 将复杂任务分解为可执行的子任务
2. **任务分配**：Coordinator 自动分配任务给合适的 Agent
3. **跨 Agent 通信**：使用 `sessions_send` 实现 Agent 间消息传递
4. **状态同步**：实时更新任务状态到 tasks.json

## Demo 场景

**Web 登录功能实现**
1. PM 分解任务：UI 设计、表单验证、错误提示
2. Dev 实现三个 HTML/JS 文件
3. QA 测试功能并报告结果
4. Coordinator 汇总：3/3 任务完成 ✅

## 两种运行模式

### 模式 1: 模拟版本（Node.js）⭐ 快速体验

可以独立运行，无需 OpenClaw runtime 环境。适合演示框架流程。

```bash
# 1. 进入项目目录
cd demo/collaboration-demo

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

## 快速体验（模拟版本）

只需要 Node.js，3 分钟即可体验完整流程：

## 技术栈

- OpenClaw Agent 框架
- Node.js
- sessions_send / sessions_spawn API

## 开发状态

### 模拟版本（Node.js）
- [x] Day 1: 基础框架（Coordinator + tasks.json）✅ 2026-03-05 完成
- [x] Day 2: Agent 角色实现（PM, Dev, QA Prompt）✅ 2026-03-05 完成
- [x] Day 3: 协作流程（任务分解、消息传递、状态同步）✅ 2026-03-05 完成
- [x] Day 4: 集成指南文档（OPENCLAW_INTEGRATION.md）✅ 2026-03-09 完成
- [x] Day 5: README 更新和流程优化 ✅ 2026-03-09 完成

### 真实集成版本（OpenClaw）
- [ ] 创建真实 Coordinator Agent Prompt
- [ ] 创建 PM/Dev/QA Agent Prompt
- [ ] 实现 sessions_spawn 调用逻辑
- [ ] 实现 sessions_send 通信机制
- [ ] 错误处理和重试机制
- [ ] 与 FlowBoard 集成
- [ ] 录制演示视频
- [ ] GitHub 开源发布

## 商业价值

1. **技术验证**：证明 OpenClaw 多 Agent 协作的可行性
2. **能力展示**：展示 OpenClaw 的协作能力
3. **技术背书**：为付费服务建立技术 credibility
4. **SaaS 探索**：探索协作框架的商业化路径

## 转化路径

```
开源 Demo → GitHub Stars → 技术文章 → 企业咨询 → 付费服务
```

## License

MIT

---

**创建时间**: 2026-03-05
**作者**: 旺财 🔔
**项目**: OpenClaw Agent Collaboration Framework
