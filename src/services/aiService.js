// src/services/aiService.js
import axios from 'axios';

class AIService {
  constructor() {
    // 从环境变量读取配置
    this.apiUrl = process.env.REACT_APP_AI_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    this.apiKey = process.env.REACT_APP_AI_API_KEY || '';
    this.model = process.env.REACT_APP_AI_MODEL || 'glm-4v-plus';
    this.conversations = new Map();
  }

  /**
   * 生成系统提示词
   */
  getSystemPrompt(style, outfit, outfitInfo) {
    return `你是一个虚拟换装间的智能助手，名叫"娜比助手"，正在帮助用户挑选服装。
当前场景：${style || '未选择'}风格换装间
当前选中款式：${outfit || '未选择'}
当前款式的介绍：${outfitInfo || '暂无'}

请用热情、友好的语气回答用户问题。你可以：
1. 给出穿搭建议和风格解析
2. 推荐适合的场合
3. 提供搭配建议
4. 回答关于服装的任何问题

回答要简洁明了，控制在100字以内，语气要像亲切的店员。`;
  }

  /**
   * 发送消息给AI
   */
  async sendMessage(message, style = null, outfit = null, sessionId = 'default') {
    // 验证必要配置
    if (!this.apiUrl || !this.apiKey) {
      console.error('AI服务配置不完整，请检查.env文件');
      return {
        success: false,
        reply: 'AI服务配置未完成，请联系管理员。'
      };
    }

    try {
      console.log('=== AI服务调用开始 ===');
      console.log('请求URL:', this.apiUrl);
      console.log('消息内容:', message);

      // 获取当前服装的介绍
      let outfitInfo = '';
      if (style && outfit) {
        try {
          const { getHostDialog } = await import('./hostDialog');
          outfitInfo = getHostDialog(style, null, outfit);
        } catch (e) {
          console.warn('无法获取服装介绍:', e);
        }
      }

      // 获取或创建对话历史
      if (!this.conversations.has(sessionId)) {
        this.conversations.set(sessionId, []);
      }
      const history = this.conversations.get(sessionId);

      // 构建消息列表
      const messages = [
        {
          role: 'system',
          content: this.getSystemPrompt(style, outfit, outfitInfo)
        },
        ...history.slice(-10), // 只保留最近10轮对话
        {
          role: 'user',
          content: message
        }
      ];

      // 准备请求数据
      const requestData = {
        model: this.model,
        messages: messages,
        temperature: 0.8,
        top_p: 0.7,
        max_tokens: 500,
        stream: false
      };

      console.log('请求数据:', JSON.stringify(requestData, null, 2));

      // 发送请求
      const response = await axios.post(this.apiUrl, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 30000
      });

      console.log('响应状态:', response.status);
      console.log('响应数据:', response.data);

      // 解析响应
      let reply = '';
      if (response.data.choices && response.data.choices.length > 0) {
        reply = response.data.choices[0].message.content;
      } else {
        throw new Error('响应格式错误，未找到choices字段');
      }

      // 保存到历史
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: reply });

      console.log('AI回复:', reply);
      console.log('=== AI服务调用成功 ===');

      return {
        success: true,
        reply: reply,
        history: history
      };

    } catch (error) {
      console.error('=== AI服务调用失败 ===');
      console.error('错误详情:', error);
      
      let errorMsg = '抱歉，AI服务暂时不可用，请稍后再试。';
      
      if (error.response) {
        console.error('错误状态:', error.response.status);
        console.error('错误数据:', error.response.data);
        
        if (error.response.status === 401) {
          errorMsg = 'AI服务认证失败，请检查API密钥。';
        } else if (error.response.status === 429) {
          errorMsg = 'AI服务请求过于频繁，请稍后再试。';
        } else {
          errorMsg = `AI服务错误 (${error.response.status})：${JSON.stringify(error.response.data)}`;
        }
      } else if (error.request) {
        console.error('请求已发送但无响应:', error.request);
        errorMsg = '无法连接到AI服务器，请检查网络或服务地址。';
      } else {
        console.error('请求配置错误:', error.message);
        errorMsg = `请求错误：${error.message}`;
      }
      
      return {
        success: false,
        reply: errorMsg
      };
    }
  }

  /**
   * 清除对话历史
   */
  clearHistory(sessionId = 'default') {
    this.conversations.delete(sessionId);
    console.log('已清除对话历史:', sessionId);
  }

  /**
   * 获取当前对话历史
   */
  getHistory(sessionId = 'default') {
    return this.conversations.get(sessionId) || [];
  }
}

const aiService = new AIService();
export default aiService;