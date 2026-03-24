// vite.config.ts (项目根目录)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// 导出 Vite 配置
export default defineConfig({
  // 启用 React 插件
  plugins: [react()],
  // 构建配置（核心：多页面打包）
  build: {
    rollupOptions: {
      // 配置所有 HTML 页面入口
      input: {
        index: resolve(__dirname, 'index.html'),                  // 密码账号登录页
        login_wechat: resolve(__dirname, 'login_wechat.html'),    // 微信扫码登录页
        login_captcha: resolve(__dirname, 'login_captcha.html'),  // 验证码快捷登录页
        register: resolve(__dirname, 'register.html'),            // 用户注册页
        profile: resolve(__dirname, 'profile.html'),              // 个人中心
        guardian_profile: resolve(__dirname, 'guardian_profile.html'), // 学习守护者详情
        data_cumulative: resolve(__dirname, 'data_cumulative.html'),   // 累计学习数据
        data_today: resolve(__dirname, 'data_today.html'),        // 今日专注数据
        data_week: resolve(__dirname, 'data_week.html'),          // 本周趋势
        study_session: resolve(__dirname, 'study_session.html'),  // 沉浸式学习页
        toolbox: resolve(__dirname, 'toolbox.html'),              // 学习工具箱
        messages: resolve(__dirname, 'messages.html'),            // 消息中心
        match_home: resolve(__dirname, 'match_home.html'),        // 找学伴匹配首页
        ai_match: resolve(__dirname, 'ai_match.html'),            // AI 智能匹配页
        ai_help: resolve(__dirname, 'ai_help.html')               // AI 智能答疑页
      }
    }
  }
})