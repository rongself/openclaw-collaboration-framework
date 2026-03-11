# Collaboration Framework 真实 OpenClaw 集成方案

**日期**: 2026-03-10
**目标**: 将 demo 中的"模拟执行"替换为真实的 OpenClaw `sessions_spawn` 调用

---

## 现状分析

### 当前实现（模拟模式）

**文件**: `coordinator/index.js`

**核心问题**:
```javascript
// 🔴 当前：模拟任务执行
async simulateTaskExecution(task, agent) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`      ${outputs[agent.name] || 'Task completed'}`);
}
```

**工作流程**:
1. PM 分解任务 → 生成子任务 JSON
2. 分配给 agents → 更新 tasks.json
3. 执行任务 → **模拟执行（不调用真实 agent）**
4. QA 验证 → **模拟验证**
5. 汇总结果 → 显示统计

**优点**:
- 可以独立运行，不依赖 OpenClaw 环境
- 易于测试和调试
- 展示协作流程

**缺点**:
- 无法验证真实 OpenClaw agent 调用
- sessions_spawn 能力未验证
- 无法展示真实的多 agent 消息传递

---

## 目标实现（真实集成）

### 集成方案

**方案 A：通过 OpenClaw CLI 调用**

```javascript
// ✅ 目标：使用真实的 OpenClaw CLI 调用
async executeTaskWithOpenClaw(task, agent) {
  const command = `openclaw agents spawn --runtime subagent \
    --agentId ${agent.name} \
    --task "${task.description}" \
    --cleanup delete`;

  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      timeout: 30000, // 30秒超时
    });

    console.log(`   ✅ Task completed: ${task.title}`);
    console.log(`      Result: ${result}`);

    return {
      success: true,
      output: result
    };
  } catch (error) {
    console.error(`   ❌ Task failed: ${task.title}`);
    console.error(`      Error: ${error.message}`);

    return {
      success: false,
      error: error.message
    };
  }
}
```

**方案 B：通过 Node.js 直接调用 OpenClaw API**

⚠️ **注意**: 需要 OpenClaw 提供 Node.js SDK 或 HTTP API

```javascript
// 如果 OpenClaw 提供 HTTP API
async executeTaskViaAPI(task, agent) {
  const response = await fetch(`${OPENCLAW_API}/agents/spawn`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`
    },
    body: JSON.stringify({
      runtime: 'subagent',
      agentId: agent.name,
      task: task.description,
      cleanup: 'delete'
    })
  });

  const result = await response.json();
  return result;
}
```

---

## 实现步骤

### Step 1: 修改 coordinator/index.js ✅

**文件**: `coordinator/index.js`

```javascript
// 添加 OpenClaw 导入
const { execSync } = require('child_process');

// 修改 executeTasks 方法
async executeTasks() {
  console.log('\n⚙️ Step 3: Task Execution (Real OpenClaw Agents)');

  const assignedTasks = this.tasks.filter(t => t.status === 'assigned');

  for (const task of assignedTasks) {
    for (const agentName of task.assignees) {
      const agent = this.agents[agentName];
      if (agent) {
        agent.status = 'busy';
        console.log(`  Executing: "${task.title}" by ${agent.role}`);

        // 🔴 替换为真实调用
        const result = await this.executeTaskWithOpenClaw(task, agent);

        if (result.success) {
          task.status = 'completed';
          task.output = result.output;
        } else {
          task.status = 'failed';
          task.error = result.error;
        }

        task.updatedAt = new Date().toISOString();
        await this.saveTasks();
        console.log(`   ${result.success ? '✅' : '❌'} ${task.title}\n`);

        agent.status = 'idle';
        agent.tasks = agent.tasks.filter(t => t !== task.id);
      }
    }
  }
}

// 新增：真实 OpenClaw 调用方法
async executeTaskWithOpenClaw(task, agent) {
  const command = `openclaw agents spawn \
    --runtime subagent \
    --agentId ${agent.name} \
    --task "${task.description}" \
    --cleanup delete`;

  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    return {
      success: true,
      output: result.trim()
    };
  } catch (error) {
    return {
      success: false,
      error: error.stderr || error.message
    };
  }
}
```

### Step 2: 修改 validateTasks 方法 ✅

```javascript
async validateTasks() {
  console.log('🧪 Step 4: Task Validation (Real QA Agent)');

  const completedTasks = this.tasks.filter(t => t.status === 'completed');
  const qaAgent = this.agents['qa-agent'];
  qaAgent.status = 'busy';

  for (const task of completedTasks) {
    console.log(`   Validating: "${task.title}"`);

    // 🔴 替换为真实 QA 调用
    const result = await this.validateTaskWithOpenClaw(task, qaAgent);

    if (result.success) {
      task.status = 'verified';
      task.testResult = 'passed';
    } else {
      task.status = 'verification-failed';
      task.testResult = 'failed';
      task.testError = result.error;
    }

    task.updatedAt = new Date().toISOString();
    await this.saveTasks();
    console.log(`   ${result.success ? '✅' : '❌'} ${task.title}\n`);
  }

  qaAgent.status = 'idle';
}

async validateTaskWithOpenClaw(task, agent) {
  const command = `openclaw agents spawn \
    --runtime subagent \
    --agentId ${agent.name} \
    --task "Validate the following task output:\n${task.output}" \
    --cleanup delete`;

  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      timeout: 30000
    });

    // 简单的验证：检查结果中是否包含"passed"或"OK"
    const passed = /pass|ok|success/i.test(result);

    return {
      success: passed,
      output: result.trim()
    };
  } catch (error) {
    return {
      success: false,
      error: error.stderr || error.message
    };
  }
}
```

### Step 3: 添加命令行参数控制模式 ✅

```javascript
// CLI 入口修改
async function main() {
  const args = process.argv.slice(2);
  const coordinator = new Coordinator();

  // 🔴 新增：支持真实/模拟模式切换
  const useRealAgents = args.includes('--real');

  if (useRealAgents) {
    console.log('🔥 Running in REAL AGENT mode');
    coordinator.useRealAgents = true;
  } else {
    console.log('🎭 Running in SIMULATION mode');
    coordinator.useRealAgents = false;
  }

  // ... 其余代码不变
}

class Coordinator {
  constructor() {
    this.tasks = [];
    this.agents = {};
    this.useRealAgents = false; // 🔴 新增
  }

  async executeTasks() {
    console.log('\n⚙️ Step 3: Task Execution');

    if (this.useRealAgents) {
      console.log('  Mode: Real OpenClaw Agents');
      await this.executeTasksReal();
    } else {
      console.log('  Mode: Simulation');
      await this.executeTasksSimulated();
    }
  }

  async executeTasksReal() {
    // 真实 OpenClaw agent 调用
    // ...
  }

  async executeTasksSimulated() {
    // 模拟执行（保留原有逻辑）
    // ...
  }
}
```

### Step 4: 创建 Agent Prompt 模板 ✅

**PM Agent 配置**:
```
agentId: pm-agent
role: Project Manager
职责: 分解任务、分配资源、跟踪进度
```

**Dev Agent 配置**:
```
agentId: dev-agent
role: Developer
职责: 实现代码、解决问题
```

**QA Agent 配置**:
```
agentId: qa-agent
role: Quality Assurance
职责: 测试验证、质量保证
```

---

## 测试计划

### 阶段 1: 真实环境测试

**前置条件**:
- 安装并配置 OpenClaw CLI
- 配置 subagent runtime
- 确保 `openclaw agents` 命令可用

**测试命令**:
```bash
# 初始化
node coordinator/index.js --init

# 真实 agent 模式运行
node coordinator/index.js --real --scenario demo-scenarios/web-login.md

# 模拟模式（对照测试）
node coordinator/index.js --scenario demo-scenarios/web-login.md
```

**预期结果**:
1. ✅ PM Agent 调用成功，任务分解正常
2. ✅ Dev Agent 接收并执行任务
3. ✅ QA Agent 验证输出
4. ✅ tasks.json 实时更新
5. ✅ 最终结果显示正确的统计信息

### 阶段 2: 错误处理测试

**测试场景**:
1. Agent 创建失败
2. 任务执行超时
3. 验证失败处理
4. 网络错误

**预期处理**:
- 失败任务标记为 failed
- 记录错误信息到 tasks.json
- 不影响其他任务的执行

---

## 技术挑战

### 挑战 1: Agent 同步 vs 异步

**问题**:
- `sessions_spawn` 是异步的
- 需要等待子 agent 完成才能继续

**解决方案**:
```javascript
// 使用 async/await 等待 spawn 完成
async executeTaskWithOpenClaw(task, agent) {
  // spawn 是异步的，需要等待完成
  const session = await spawnAgent(agent.name, task.description);
  const result = await session.wait();
  return result;
}
```

### 挑战 2: 结果解析

**问题**:
- OpenClaw agent 返回的格式可能不一致
- 需要标准化输出格式

**解决方案**:
```javascript
// 统一输出格式
function normalizeAgentOutput(rawOutput) {
  return {
    success: rawOutput.includes('success') || rawOutput.includes('completed'),
    output: rawOutput,
    timestamp: new Date().toISOString()
  };
}
```

### 挑战 3: 状态同步

**问题**:
- Agent 执行是并行的
- tasks.json 需要实时更新

**解决方案**:
- 每次任务完成立即保存
- 使用文件锁防止冲突

---

## 下一步行动

### 立即执行
- [x] ✅ 创建集成方案文档
- [ ] 修改 coordinator/index.js
- [ ] 测试真实 agent 调用
- [ ] 添加错误处理

### 后续优化
- [ ] 添加超时控制
- [ ] 支持任务重试
- [ ] 添加日志记录
- [ ] 优化性能

---

**创建时间**: 2026-03-10 09:00 CST
**状态**: 📋 方案就绪，等待实现
**下一步**: 修改代码，实现真实集成
