import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';

// ===================== 类型定义（核心：消除TS报错）=====================
// 定义任务数据结构
export interface Task {
  id?: number;
  title: string;
  progress: number;
  time?: string;
  status?: '进行中' | '已完成' | '待开始' | string;
  deadline: string;
}

// ===================== 初始化 Supabase 和 Gemini AI =====================
// 类型断言确保环境变量不为空（或添加空值检查）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

// 空值检查：避免环境变量缺失导致崩溃
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 环境变量未配置！请检查 .env 文件');
}
if (!geminiApiKey) {
  console.error('Gemini API Key 未配置！请检查 .env 文件');
}

// 初始化 Supabase 客户端
const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// 初始化 Google Gemini AI
const genAI = new GoogleGenerativeAI(geminiApiKey);

// ===================== 核心功能函数（补全类型）=====================

/**
 * 【功能 1】：注册新用户
 * @param phone 手机号
 * @param password 密码
 */
export const signUp = async (phone: string, password: string) => {
  // Supabase 注册需要邮箱和密码，我们这里用手机号作为邮箱地址
  const email = `${phone}@example.com`; // 将手机号转换为唯一的邮箱格式
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    alert('注册失败：' + error.message);
    return null;
  }
  alert('注册成功！');
  return data.user;
};

/**
 * 【功能 2】：用户登录
 * @param phone 手机号
 * @param password 密码
 */
export const signIn = async (phone: string, password: string) => {
  // 临时登录逻辑：任何手机号和密码都可以登录
  console.log(`正在尝试用手机号 ${phone} 和密码 ${password} 登录...`);
  alert('登录成功！');
  window.location.href = 'match_home.html'; // 跳转到主页
  return {
    id: 'mock-user-id',
    phone: phone,
  };
  
  // 真实的 Supabase 登录逻辑（暂时注释掉）
  /*
  const email = `${phone}@example.com`;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  
  if (error) {
    alert('登录失败：' + error.message);
    return null;
  }
  alert('登录成功！');
  window.location.href = 'match_home.html'; // 跳转到主页
  return data.user;
  */
};


/**
 * 【功能 3】：获取当前登录用户的个人资料
 */
export const getUserProfile = async () => {
  // 1. 先检查当前有没有人登录
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 2. 去 profiles 表里找对应 ID 的资料
  const { data, error } = await supabase.from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 3. 处理错误：如果有错，打印出来并返回空
  if (error) {
    console.warn('未找到该用户的 Profile 资料，可能需要引导用户填写。', error.message);
    return null;
  }

  return data;
};


/**
 * 【功能 4】：统计今日学习数据
 * 自动计算数据库里今天创建了多少个任务
 */
export const getTodayStats = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { count, error } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`);

  return error ? 0 : count;
};


/**
 * 【功能 5】：从 Supabase 数据库获取任务列表
 * @returns Task[] | null 任务数组（失败返回null）
 */
export const getMyTasks = async (): Promise<Task[] | null> => {
  try {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) {
      console.log('读取出错:', error);
      return null;
    }
    return data as Task[]; // 断言为 Task 类型
  } catch (err) {
    console.error('获取任务异常:', err);
    return null;
  }
};

/**
 * 【功能 6】：升级版 AI 寄语（认出用户并以守护者身份说话）
 */
export const getStudyInspiration = async (taskTitle: string, progress: number): Promise<string> => {
  // 1. 自动获取当前登录人的昵称和守护者名字
  const profile = await getUserProfile();
  const name = profile?.nickname || '同学';
  const guardian = profile?.guardian_name || '智慧猫';

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // 2. 更有温度的 Prompt
    const prompt = `你是守护者【${guardian}】。你的用户【${name}】正在学习【${taskTitle}】，目前进度是 ${progress}%。
    请根据这个进度，给${name}写一句不到 50 字的专属鼓励，语气要亲切、有力量。`;

    const result = await model.generateContent(prompt);
    // 3. 这里的 .text() 已经包含了最新的调用逻辑
    const text = result.response.text(); 
    return text || `加油${name}，离目标又近了一步！`;
  } catch (err) {
    console.error('AI 生成建议失败:', err);
    return `加油${name}，守护者${guardian}一直在你身边！`;
  }
};

/**
 * 【功能 7】：根据截止日期返回进度条颜色类名
 * @param deadline 截止日期（格式：YYYY-MM-DD）
 * @returns string Tailwind 颜色类名
 */
export const getTaskStatusColor = (deadline: string): string => {
  if (!deadline) return 'bg-[#F98C53]'; // 无截止日期，默认品牌橙色

  try {
    const now = new Date();
    const targetDate = new Date(deadline);
    
    // 校验日期格式是否合法
    if (isNaN(targetDate.getTime())) {
      return 'bg-[#F98C53]';
    }

    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return 'bg-red-500'; // 已过期 → 红色
    } else if (diffDays <= 3) {
      return 'bg-[#FCCEB4]'; // 剩余≤3天 → 浅橙色/粉色
    } else {
      return 'bg-[#F98C53]'; // 时间充足 → 品牌橙色
    }
  } catch (err) {
    console.error('计算进度条颜色失败:', err);
    return 'bg-[#F98C53]'; // 异常时返回默认色
  }
};

// ===================== 兼容旧命名（可选：对接之前的 App.tsx）=====================
// 如果 App.tsx 里还是用 fetchTasks/getAIAdvice/getStatusColor，添加别名兼容
export const fetchTasks = getMyTasks;
export const getAIAdvice = getStudyInspiration;
export const getStatusColor = getTaskStatusColor;

/**
 * 【功能 8】：将用户在网页输入的新任务存入 Supabase 数据库
 * @param title 任务标题
 * @param deadline 截止日期 (YYYY-MM-DD)
 * @returns 成功返回新任务对象，失败返回 null
 */
export const addTask = async (title: string, deadline: string): Promise<Task | null> => {
  // 1. 基础校验：防止存入空数据
  if (!title || !deadline) {
    console.error('任务标题或日期不能为空！');
    return null;
  }

  try {
    // 2. 构造要存入的数据（进度默认为 0，状态默认为 进行中）
    const newTask = {
      title: title,
      deadline: deadline,
      progress: 0,
      status: '进行中',
      created_at: new Date().toISOString()
    };

    // 3. 执行数据库插入操作
    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select(); // .select() 是为了让数据库返回刚创建的那条数据

    if (error) {
      console.error('数据库写入失败:', error.message);
      return null;
    }

    // 4. 返回插入成功的第一个对象
    return data ? (data[0] as Task) : null;
  } catch (err) {
    console.error('添加任务异常:', err);
    return null;
  }
};