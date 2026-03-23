// 导入 Supabase 客户端
import { createClient } from '@supabase/supabase-js';

// 从 .env 文件读取环境变量（Vite 会自动加载）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 初始化 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 定义读取 tasks 表数据的函数
async function fetchTasks() {
  try {
    // 从 tasks 表查询所有数据（重点：读取测试数据）
    const { data, error } = await supabase
      .from('tasks') // 指定要查询的表名：tasks
      .select('*');  // 查询所有字段

    // 如果有错误，打印错误信息
    if (error) {
      console.error('❌ 查询数据失败：', error.message);
      return;
    }

    // 成功的话，打印数据到控制台
    console.log('✅ 成功读取 tasks 表数据：', data);
    
    // 专门筛选出 "完成网站原型开发" 这条数据
    const targetTask = data.find(task => task.content === '完成网站原型开发');
    if (targetTask) {
      console.log('🎉 找到测试数据：', targetTask);
    } else {
      console.log('⚠️ 未找到 "完成网站原型开发" 这条数据，但表中有其他数据：', data);
    }
  } catch (err) {
    console.error('❌ 接口请求异常：', err);
  }
}

// 执行函数
fetchTasks();