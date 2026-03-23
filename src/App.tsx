import React, { useEffect, useState } from 'react';
import './App.css';
// 导入后端封装的核心功能
import { fetchTasks, getAIAdvice, getStatusColor } from './ai-logic';

// 任务卡片组件（复用你已封装的逻辑）
interface TaskItemProps {
  title: string;
  progress: number;
  time: string;
  status: string;
  colorClass: string;
}

const TaskItem: React.FC<TaskItemProps> = ({
  title,
  progress,
  time,
  status,
  colorClass
}) => {
  return (
    <div className="task-item bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <span className="text-xs font-medium text-gray-500">{time}</span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="w-full bg-gray-100 rounded-full h-2 mr-4">
          {/* 进度条颜色对接 getStatusColor 逻辑 */}
          <div 
            className={`h-2 rounded-full ${colorClass}`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="text-xs font-bold text-gray-600">{progress}%</span>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${
        status === '进行中' ? 'bg-orange-100 text-orange-600' : 
        status === '已完成' ? 'bg-green-100 text-green-600' : 
        'bg-gray-100 text-gray-600'
      }`}>
        {status}
      </span>
    </div>
  );
};

// 主应用组件（接入所有业务逻辑）
function App() {
  // 定义状态存储任务数据和AI建议
  const [tasks, setTasks] = useState<any[]>([]);
  const [aiMessage, setAiMessage] = useState('正在同步学习数据...');

  // 初始化：加载任务 + 获取AI建议
  useEffect(() => {
    async function initProject() {
      try {
        // 1. 从数据库获取任务列表
        const taskData = await fetchTasks();
        setTasks(taskData || []);

        // 2. 如果有任务，调用AI生成建议；无任务则提示添加
        if (taskData && taskData.length > 0) {
          const advice = await getAIAdvice(
            taskData[0].title, 
            taskData[0].progress
          );
          setAiMessage(advice);
        } else {
          setAiMessage('还没有任务哦，快去添加一个吧！');
        }
      } catch (error) {
        // 异常处理：避免页面崩溃
        console.error('数据加载失败：', error);
        setAiMessage('数据加载失败，请刷新重试～');
        setTasks([]);
      }
    }

    initProject();
  }, []);

  return (
    <div className="app min-h-screen bg-gray-50 p-6 md:p-10">
      {/* 页面头部 */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">StudyWithMe</h1>
        <p className="text-gray-500">AI 驱动的学习任务管理助手</p>
      </header>

      {/* AI 建议区域 */}
      <div className="ai-tip bg-white p-4 rounded-lg shadow-sm border border-orange-100 mb-6">
        <p className="text-sm text-gray-700">
          <span className="font-bold text-orange-500">AI 建议：</span>
          {aiMessage}
        </p>
      </div>

      {/* 任务列表区域 */}
      <section className="task-section">
        <h2 className="text-xl font-bold text-gray-800 mb-4">我的学习任务</h2>
        <div className="task-list space-y-4">
          {/* 循环渲染任务卡片 */}
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskItem
                key={task.id || Date.now() + Math.random()} // 兼容无id的情况
                title={task.title}
                progress={task.progress}
                time={task.time || '暂无时间'}
                status={task.status || '待开始'}
                colorClass={getStatusColor(task.deadline)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              暂无任务数据，快去添加你的第一个学习任务吧！
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;