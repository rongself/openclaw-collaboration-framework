# OpenClaw 真实集成指南

## 概述

当前 demo 是**模拟版本**，用于演示协作流程。本指南说明如何集成到真实的 OpenClaw runtime 环境。

---

## 架构对比

### 模拟版本（当前）

```
User → Coordinator (Node.js) → 模拟执行 → tasks.json
```

**特点**：
- ✅ 可以独立运行
- ✅ 流程清晰
- ❌ 不会真实调用 OpenClaw agents

### 真实版本（目标集成）

```
User → Coordinator Agent (OpenClaw) → sessions_spawn → PM/Dev/QA Agents → sessions_send → 结果汇总
```

**特点**：
- ✅ 真实多 agent 协作
- ✅ 利用 OpenClaw 的强大能力
- ✅ 可以处理真实的代码开发任务
- ❌ 需要 OpenClaw runtime 环境

---

## 集成步骤

### 1. 创建 Coordinator Agent

在 OpenClaw 中创建一个专门的 Coordinator agent：

```yaml
# OPENCLAW_CONFIG.yml (Coordinator Agent 配置)
name: coordinator-agent
description: OpenClaw Agent Collaboration Framework - 协调器
capabilities:
  - task_decomposition
  - agent_coordination
  - status_monitoring
  - result_collection
model: nvidia/z-ai/glm4.7
tools:
  - sessions_spawn
  - sessions_send
  - read
  - write
```

### 2. Coordinator Agent Prompt

```markdown
你是 OpenClaw Agent Collaboration Framework 的协调器。

你的职责：
1. 接收用户的开发任务
2. 使用 sessions_spawn 创建 PM agent 进行任务分解
3. 使用 sessions_send 将任务分配给 Dev agent
4. 使用 sessions_send 将完成的任务转给 QA agent
5. 汇总所有 agent 的结果给用户

## 工作流程

### 步骤 1: 任务分解（PM Agent）
使用以下命令创建 PM agent:
```
Sessions_spawn(task="请分解任务：{task_description}", label="pm-agent", mode="session")
```

### 步骤 2: 开发实现（Dev Agent）
使用以下命令向 Dev agent 发送任务:
```
Sessions_send(label="dev-agent", message="请实现任务：{task_description}")
```

### 步骤 3: 测试验证（QA Agent）
使用以下命令向 QA agent 发送测试请求:
```
Sessions_send(label="qa-agent", message="请测试验证：{test_scenario}")
```

### 步骤 4: 结果汇总
收集所有 agent 的输出，生成总结报告给用户。

## 输出格式
请按照以下格式输出：

---
📋 Task: {任务标题}

✅ PM Analysis:
{PM agent 的分析结果}

🛠️ Development:
{Dev agent 的实现情况}

🧪 QA Validation:
{QA agent 的测试结果}

📊 Summary:
{总结}
---

## 注意事项
- 每个 agent 的工作完成后，等待其响应再进行下一步
- 如果 agent 遇到问题，记录错误并提供帮助
- 保持 tasks.json 文件与 agent 状态同步
```

### 3. 创建子 Agents（PM, Dev, QA）

#### PM Agent Prompt

```markdown
你是 PM Agent (项目经理)。

你的职责：
1. 分析用户需求，理解业务目标
2. 将复杂任务分解为可执行的子任务
3. 为每个子任务设置优先级、依赖关系
4. 计划任务执行顺序

## 输出格式

分解后的任务应该包含：
```
任务 ID: task-{序号}
标题: {任务标题}
描述: {任务描述}
优先级: high/medium/low
负责人: dev-agent
依赖: []
```

请只输出任务分解结果，不要输出其他内容。
```

#### Dev Agent Prompt

```markdown
你是 Dev Agent (开发者)。

你的职责：
1. 接收 PM 分配的开发任务
2. 分析需求并编写代码实现
3. 测试基础功能
4. 提供实现总结

## 技术栈
- 支持 HTML, CSS, JavaScript
- 支持 Node.js, Python
- 可以读取和写入文件

## 工作流程
1. 分析任务需求
2. 编写实现代码
3. 进行基础测试
4. 输出实现总结

## 输出格式
```
📝 Implementation Summary:
- Files created/modified: {文件列表}
- Key features: {实现的关键功能}
- Testing status: {测试状态}
- Next steps: {后续建议}
```
```

#### QA Agent Prompt

```markdown
你是 QA Agent (测试工程师)。

你的职责：
1. 接收 Dev 完成的代码
2. 执行功能测试（根据需求)
3. 验证是否符合验收标准
4. 报告测试结果和发现的问题

## 测试维度
- 功能正确性
- 边界情况
- 错误处理
- 用户体验

## 输出格式
```
🧪 QA Report:
- Test cases: {进行的测试}
- Passed: ✅ {X}/{Y}
- Failed: ❌ {Y-X}/{Y}
- Issues: {发现的问题列表}
- Recommendation: {建议}
```
```

### 4. 集成到 OpenClaw

#### 方法 1: 使用 OpenClaw CLI 创建

```bash
# 创建 Coordinator agent
openclaw agent create \
  --name coordinator-agent \
  --label "collab-coordinator" \
  --prompt "$(cat agents/coordinator-prompt.md)" \
  --model "nvidia/z-ai/glm4.7"

# 创建 PM agent
openclaw agent create \
  --name pm-agent \
  --label "pm" \
  --prompt "$(cat agents/pm-prompt.md)"

# 创建 Dev agent
openclaw agent create \
  --name dev-agent \
  --label "dev" \
  --prompt "$(cat agents/dev-prompt.md)"

# 创建 QA agent
openclaw agent create \
  --name qa-agent \
  --label "qa" \
  --prompt "$(cat agents/qa-prompt.md)"
```

#### 方法 2: 在 OpenClaw 配置文件中定义

```yaml
# ~/.openclaw/config/agents.yml
agents:
  - name: coordinator-agent
    label: collab-coordinator
    model: nvidia/z-ai/glm4.7
    prompt_path: ~/.openclaw/workspace/demo/collaboration-demo/agents/coordinator.md

  - name: pm-agent
    label: pm
    model: nvidia/z-ai/glm4.7
    prompt_path: ~/.openclaw/workspace/demo/collaboration-demo/agents/pm.md

  - name: dev-agent
    label: dev
    model: nvidia/z-ai/glm4.7
    prompt_path: ~/.openclaw/workspace/demo/collaboration-demo/agents/dev.md

  - name: qa-agent
    label: qa
    model: nvidia/z-ai/glm4.7
    prompt_path: ~/.openclaw/workspace/demo/collaboration-demo/agents/qa.md
```

### 5. 使用真实集成版本

完成配置后，在 OpenClaw 中使用：

```
# 向 coordinator-agent 发送任务
"帮我实现一个用户注册功能，包括邮箱验证"

# Coordinator agent 会：
1. 调用 PM agent 分解任务
2. 调用 Dev agent 实现功能
3. 调用 QA agent 验证结果
4. 汇总和返回结果
```

---

## 工具调用说明

### sessions_spawn

创建一个新的子 agent 会话：

```javascript
// OpenClaw 中的调用方式
sessions_spawn({
  task: "分解用户登录功能",
  label: "pm-agent",
  mode: "session",  // session = 持久化会话
  thread: true,     // 线程绑定
  thinking: "on"     // 开启思考模式
})
```

**参数说明**：
- `task`: 发送给子 agent 的任务描述
- `label`: 子 agent 的标签（用于标识）
- `mode`: "run" (一次性) | "session" (持久化)
- `thread`: 绑定到当前线程
- `thinking`: 启用推理模式

**返回**：子 agent 的 sessionKey，用于后续通信

### sessions_send

向已存在的 agent 会话发送消息：

```javascript
sessions_send({
  sessionKey: "pm-agent-session-key",
  message: "请为以下任务创建开发计划：..."
})
```

**参数说明**：
- `sessionKey`: 目标会话的标识符
- `message`: 发送的消息内容

**返回**：agent 的响应

---

## 与 FlowBoard 集成

### 配置 FlowBoard 项目

1. 在 FlowBoard 中创建新项目
2. 添加文件监控：
   ```
   Watch path: demo/collaboration-demo/tasks.json
   Format: JSON
   Auto-sync: true
   ```

### Agent 更新任务状态

```markdown
# Dev Agent 完成任务后，更新 tasks.json

1. 读取 tasks.json
2. 找到对应任务
3. 更新状态: "completed"
4. 保存文件

FlowBoard 会自动显示更新后的状态。
```

---

## 示例：真实 OpenClaw 对话

**用户输入**：
```
帮我实现一个商品管理功能，包括增删改查
```

**Coordinator Agent 执行**：

```
[Step 1: 任务分解]
调用 sessions_spawn → PM agent

PM agent 返回：
```
任务分解：
1. task-1: 设计数据模型 (优先级: high)
2. task-2: 实现 GET /products (优先级: high)
3. task-3: 实现 POST /products (优先级: high)
4. task-4: 实现 PUT /products/:id (优先级: medium)
5. task-5: 实现 DELETE /products/:id (优先级: medium)
```

[Step 2: 开发实现]
调用 sessions_send → Dev agent (逐个任务)

Dev agent 完成 task-1:
```
创建了 models/Product.js
✅ 完成
```

Dev agent 完成 task-2:
```
创建了 routes/products.js
实现了 GET /products 接口
✅ 完成
```

... (继续其他任务)

[Step 3: 测试验证]
调用 sessions_send → QA agent

QA agent 测试：
```
🧪 QA Report:
- Test cases: 5
- Passed: 5/5
- Failed: 0/5
- Issues: 无
- Recommendation: 可以部署到测试环境
```

[Step 4: 结果汇总]
```
📋 Task: 商品管理功能实现

✅ PM Analysis: 5 个子任务，优先级合理
🛠️ Development: 5/5 完成
🧪 QA Validation: ✅ 全部通过

📊 Summary: 功能已完成，可以进入下一阶段
```
```

---

## 优势与挑战

### 优势

✅ **真实多 Agent 协作**：充分利用 OpenClaw 的分布式能力
✅ **强大的代码生成能力**：Dev agent 可以真正写代码
✅ **智能问题解决**：每个 agent 可以独立思考和处理问题
✅ **可扩展性**：容易添加新的角色（如 Security Agent, DevOps Agent）
✅ **与 FlowBoard 集成**：任务状态可视化

### 挑战

⚠️ **Token 成本**：多个 agent 同时运行会增加消耗
⚠️ **协调复杂度**：需要设计好任务分配和状态同步机制
⚠️ **错误处理**：如果某个 agent 失败，需要恢复和重试逻辑
⚠️ **超时控制**：需要设置合理的超时时间

---

## 下一步计划

### 短期（本周）
- [x] 完成模拟版本 demo
- [ ] 创建真实 agent prompts
- [ ] 测试 sessions_spawn 和 sessions_send
- [ ] 更新 README 说明两种版本

### 中期（本月）
- [ ] 实现完整的真实集成版本
- [ ] 添加错误处理和重试机制
- [ ] 优化 token 使用效率
- [ ] 录制演示视频

### 长期（季度）
- [ ] 与 FlowBoard 深度集成
- [ ] 添加更多 agent 角色
- [ ] 企业级优化（安全、监控、日志）
- [ ] 开源发布

---

## 技术支持

遇到问题？
- 查看 OpenClaw 文档：https://docs.openclaw.ai
- OpenClaw 社区：https://discord.com/invite/clawd
- GitHub Issue： https://github.com/openclaw/openclaw/issues

---

**创建时间**: 2026-03-09
**作者**: 旺财 🔔
**版本**: 1.0.0
