#!/usr/bin/env node

/**
 * OpenClaw Agent Collaboration Framework - Coordinator
 *
 * 协调器核心功能：
 * 1. 接收用户任务
 * 2. 分解任务为子任务
 * 3. 分配给合适的 Agent
 * 4. 监控任务状态
 * 5. 汇总结果
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const TASKS_FILE = path.join(__dirname, '../tasks.json');

/**
 * 主协调器类
 */
class Coordinator {
  constructor() {
    this.tasks = [];
    this.agents = {};
  }

  /**
   * 初始化协调器
   */
  async init() {
    console.log('🚀 Initializing OpenClaw Agent Collaboration Framework...\n');
    await this.loadTasks();
    this.printStatus();
  }

  /**
   * 加载任务状态
   */
  async loadTasks() {
    try {
      const data = await fs.readFile(TASKS_FILE, 'utf-8');
      const json = JSON.parse(data);
      this.tasks = json.tasks || [];
      this.agents = {};

      // 构建 agents 字典
      json.agents?.forEach(agent => {
        this.agents[agent.name] = agent;
      });

      console.log('✅ Tasks loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load tasks:', error.message);
      this.tasks = [];
    }
  }

  /**
   * 保存任务状态
   */
  async saveTasks() {
    try {
      const data = {
        meta: {
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          coordinator: 'collaboration-framework'
        },
        tasks: this.tasks,
        agents: Object.values(this.agents)
      };

      await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2));
      console.log('💾 Tasks saved successfully');
    } catch (error) {
      console.error('❌ Failed to save tasks:', error.message);
    }
  }

  /**
   * 处理用户任务
   */
  async processTask(taskDescription) {
    console.log(`\n📋 Processing task: ${taskDescription}\n`);
    console.log('=' .repeat(60));

    // 步骤 1: PM 分解任务
    await this.decomposeTask(taskDescription);

    // 步骤 2: 分配任务
    await this.assignTasks();

    // 步骤 3: 执行任务
    await this.executeTasks();

    // 步骤 4: QA 验证
    await this.validateTasks();

    // 步骤 5: 汇总结果
    await this.summarizeResults();
  }

  /**
   * 分解任务（调用 PM Agent）
   */
  async decomposeTask(taskDescription) {
    console.log('\n🔍 Step 1: Task Decomposition (PM Agent)');

    const pmAgent = this.agents['pm-agent'];
    if (!pmAgent) {
      console.error('❌ PM Agent not found');
      return;
    }

    // 更新 PM 状态
    pmAgent.status = 'busy';

    // 生成任务 ID
    const taskId = `task-${Date.now()}`;

    // 创建子任务（Demo 中使用预定义分解逻辑）
    const subtasks = this.generateSubtasks(taskDescription);

    // 保存分解后的任务
    subtasks.forEach((subtask, index) => {
      this.tasks.push({
        id: `${taskId}-${index}`,
        parentTask: taskId,
        title: subtask.title,
        description: subtask.description,
        status: 'pending',
        assignees: subtask.assignees,
        priority: subtask.priority,
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    await this.saveTasks();
    console.log(`   ✅ Task decomposed into ${subtasks.length} subtasks`);
    subtasks.forEach((st, i) => {
      console.log(`      ${i + 1}. [${st.priority}] ${st.title} → ${st.assignees.join(', ')}`);
    });

    // PM 完成
    pmAgent.status = 'idle';
  }

  /**
   * 分配任务给 Agents
   */
  async assignTasks() {
    console.log('\n📤 Step 2: Task Assignment');

    const pendingTasks = this.tasks.filter(t => t.status === 'pending');

    pendingTasks.forEach(task => {
      task.status = 'assigned';
      task.updatedAt = new Date().toISOString();

      task.assignees.forEach(agentName => {
        const agent = this.agents[agentName];
        if (agent) {
          agent.tasks.push(task.id);
          console.log(`   assigned "${task.title}" → ${agent.role} (${agentName})`);
        }
      });
    });

    await this.saveTasks();
  }

  /**
   * 执行任务
   */
  async executeTasks() {
    console.log('\n⚙️ Step 3: Task Execution');

    const assignedTasks = this.tasks.filter(t => t.status === 'assigned');

    for (const task of assignedTasks) {
      for (const agentName of task.assignees) {
        const agent = this.agents[agentName];
        if (agent) {
          agent.status = 'busy';
          console.log(`  Executing: "${task.title}" by ${agent.role}`);

          // 模拟任务执行（真实版本会调用 sessions_spawn）
          await this.simulateTaskExecution(task, agent);

          agent.status = 'idle';
          agent.tasks = agent.tasks.filter(t => t !== task.id);
        }
      }

      task.status = 'completed';
      task.updatedAt = new Date().toISOString();
      await this.saveTasks();
      console.log(`   ✅ Completed: "${task.title}"\n`);
    }
  }

  /**
   * 验证任务
   */
  async validateTasks() {
    console.log('🧪 Step 4: Task Validation (QA Agent)');

    const completedTasks = this.tasks.filter(t => t.status === 'completed');

    const qaAgent = this.agents['qa-agent'];
    qaAgent.status = 'busy';

    for (const task of completedTasks) {
      // 模拟 QA 验证
      console.log(`   Validating: "${task.title}"`);

      // Demo 中所有任务都通过
      task.status = 'verified';
      task.testResult = 'passed';
      task.updatedAt = new Date().toISOString();
      console.log(`   ✅ Passed: "${task.title}"\n`);
    }

    await this.saveTasks();
    qaAgent.status = 'idle';
  }

  /**
   * 汇总结果
   */
  async summarizeResults() {
    console.log('📊 Step 5: Summary');
    console.log('=' .repeat(60));

    const total = this.tasks.length;
    const verified = this.tasks.filter(t => t.status === 'verified').length;

    console.log(`\n   Total Tasks: ${total}`);
    console.log(`   ✅ Verified: ${verified}/${total}`);
    console.log(`   ✅ Success Rate: ${Math.round((verified / total) * 100)}%\n`);

    console.log('🎉 All tasks completed successfully!\n');

    // 清空任务（为下一次运行准备）
    this.tasks = [];
    await this.saveTasks();
  }

  /**
   * 生成子任务（Demo 版本的简化逻辑）
   */
  generateSubtasks(taskDescription) {
    // Demo: 使用预定义的 Web 登录任务分解
    return [
      {
        title: '设计登录页面 UI',
        description: '创建 HTML 表单，包含邮箱和密码输入框以及登录按钮',
        assignees: ['dev-agent'],
        priority: 'high'
      },
      {
        title: '实现表单验证逻辑',
        description: '使用 JavaScript 验证邮箱格式和密码强度',
        assignees: ['dev-agent'],
        priority: 'high'
      },
      {
        title: '添加错误提示功能',
        description: '实现用户友好的错误提示显示',
        assignees: ['dev-agent'],
        priority: 'medium'
      }
    ];
  }

  /**
   * 模拟任务执行（真实版本会调用 sessions_spawn）
   */
  async simulateTaskExecution(task, agent) {
    // 模拟执行时间
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Demo 中生成一些输出
    const outputs = {
      'dev-agent': 'Code implementation completed',
      'qa-agent': 'Test cases passed',
      'pm-agent': 'Task planning completed'
    };

    console.log(`      ${outputs[agent.name] || 'Task completed'}`);
  }

  /**
   * 打印当前状态
   */
  printStatus() {
    console.log('\n📊 Current Status:\n');
    console.log('   Agents:');
    Object.values(this.agents).forEach(agent => {
      console.log(`     - ${agent.role} (${agent.name}): ${agent.status}`);
    });
    console.log(`\n   Tasks: ${this.tasks.length}\n`);
    console.log('=' .repeat(60));
  }
}

/**
 * CLI 入口
 */
async function main() {
  const args = process.argv.slice(2);
  const coordinator = new Coordinator();

  if (args.includes('--init')) {
    await coordinator.init();
    return;
  }

  if (args.includes('--scenario')) {
    const scenarioIndex = args.indexOf('--scenario');
    const scenarioPath = args[scenarioIndex + 1];

    if (!scenarioPath) {
      console.error('❌ Please specify scenario file');
      return;
    }

    await coordinator.init();

    try {
      const scenarioContent = await fs.readFile(scenarioPath, 'utf-8');
      const taskDescription = scenarioContent;

      await coordinator.processTask(taskDescription);
    } catch (error) {
      console.error('❌ Failed to load scenario:', error.message);
    }

    return;
  }

  // 默认：初始化
  await coordinator.init();
}

// 运行
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

module.exports = Coordinator;
