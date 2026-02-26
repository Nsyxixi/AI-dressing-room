// src/services/ttsService.js
import axios from 'axios';

class TTSService {
  constructor() {
    // 从环境变量读取配置
    this.apiUrl = process.env.REACT_APP_TTS_API_URL || 'http://localhost:3001/api/tts';
    this.voiceType = process.env.REACT_APP_TTS_VOICE_TYPE || 'female';
    this.speed = parseFloat(process.env.REACT_APP_TTS_SPEED) || 1.0;
    this.volume = parseFloat(process.env.REACT_APP_TTS_VOLUME) || 1.0;
    
    // 预加载的语音缓存
    this.preloadedSpeech = new Map();
  }

  /**
   * 生成语音
   * @param {string} text - 要转换的文本
   * @param {object} options - TTS选项
   * @returns {Blob} 音频Blob对象
   */
  async generateSpeech(text, options = {}) {
    if (!text || text.trim() === '') {
      throw new Error('生成语音失败：文本不能为空');
    }

    // 使用缓存的语音（如果有）
    const cacheKey = `${text}-${options.voiceType || this.voiceType}-${options.speed || this.speed}`;
    if (this.preloadedSpeech.has(cacheKey)) {
      console.log('使用预加载的语音缓存:', cacheKey);
      return this.preloadedSpeech.get(cacheKey);
    }

    try {
      console.log('=== TTS服务调用开始 ===');
      console.log('请求URL:', this.apiUrl);
      console.log('文本内容:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));

      // 合并默认选项和传入选项
      const ttsOptions = {
        voiceType: options.voiceType || this.voiceType,
        speed: options.speed || this.speed,
        volume: options.volume || this.volume,
        ...options
      };

      // 发送TTS请求
      const response = await axios.post(
        this.apiUrl,
        {
          text: text,
          voice_type: ttsOptions.voiceType,
          speed: ttsOptions.speed,
          volume: ttsOptions.volume
        },
        {
          responseType: 'blob', // 重要：接收二进制数据
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      console.log('TTS响应状态:', response.status);
      
      // 验证响应是音频Blob
      if (!response.data || !(response.data instanceof Blob)) {
        throw new Error('TTS服务返回的不是有效的音频数据');
      }

      // 缓存生成的语音（短文本）
      if (text.length < 200) {
        this.preloadedSpeech.set(cacheKey, response.data);
      }

      console.log('=== TTS服务调用成功 ===');
      return response.data;

    } catch (error) {
      console.error('=== TTS服务调用失败 ===');
      console.error('错误详情:', error);
      
      let errorMsg = '生成语音失败，请稍后再试。';
      
      if (error.response) {
        console.error('错误状态:', error.response.status);
        errorMsg = `TTS服务错误 (${error.response.status})`;
      } else if (error.request) {
        errorMsg = '无法连接到TTS服务器，请检查网络或服务地址。';
      } else {
        errorMsg = `TTS请求错误：${error.message}`;
      }
      
      throw new Error(errorMsg);
    }
  }

  /**
   * 预加载常用语音
   */
  async preloadCommonSpeech() {
    try {
      console.log('开始预加载常用语音...');
      
      const { getHostDialog } = await import('./hostDialog');
      
      // 预加载欢迎语
      const welcomeText = getHostDialog('welcome');
      if (welcomeText) {
        const welcomeSpeech = await this.generateSpeech(welcomeText);
        this.preloadedSpeech.set(`welcome-${this.voiceType}-${this.speed}`, welcomeSpeech);
      }
      
      // 预加载风格介绍提示语
      const stylePrompt = getHostDialog('common', 'selectPrompt');
      if (stylePrompt) {
        const styleSpeech = await this.generateSpeech(stylePrompt);
        this.preloadedSpeech.set(`style-prompt-${this.voiceType}-${this.speed}`, styleSpeech);
      }
      
      console.log('常用语音预加载完成');
      return true;
      
    } catch (error) {
      console.warn('语音预加载失败:', error);
      return false;
    }
  }

  /**
   * 清除语音缓存
   */
  clearCache() {
    this.preloadedSpeech.clear();
    console.log('已清除TTS缓存');
  }

  /**
   * 获取TTS配置信息
   */
  getConfig() {
    return {
      apiUrl: this.apiUrl,
      voiceType: this.voiceType,
      speed: this.speed,
      volume: this.volume
    };
  }

  /**
   * 更新TTS配置
   */
  updateConfig(config) {
    if (config.apiUrl) this.apiUrl = config.apiUrl;
    if (config.voiceType) this.voiceType = config.voiceType;
    if (config.speed) this.speed = parseFloat(config.speed);
    if (config.volume) this.volume = parseFloat(config.volume);
    
    // 更新配置后清除缓存
    this.clearCache();
    console.log('TTS配置已更新:', this.getConfig());
  }
}

const ttsService = new TTSService();
export default ttsService;