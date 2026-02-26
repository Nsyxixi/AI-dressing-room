// src/services/musicService.js
import axios from 'axios';

class MusicService {
  constructor() {
    // 从环境变量读取配置
    this.apiUrl = process.env.REACT_APP_MUSIC_API_URL || 'http://localhost:3002/api/music';
    this.volume = parseFloat(process.env.REACT_APP_MUSIC_VOLUME) || 0.7;
    
    // 音乐状态
    this.audioContext = null;
    this.audioElement = null;
    this.currentStyle = null;
    this.isPlaying = false;
    this.audioBlobUrl = null;
    
    // 事件监听器
    this.listeners = new Set();
    
    // 风格对应的音乐提示词
    this.stylePrompts = {
      '日常': '轻松愉快的流行轻音乐，节奏舒缓，适合日常休闲场景',
      '古装': '中国风古典音乐，使用古筝、二胡等传统乐器，古风韵味',
      '晚宴': '优雅的钢琴曲或爵士乐，高端大气，适合晚宴场合'
    };
    
    // 缓存生成的音乐
    this.musicCache = new Map();
  }

  /**
   * 初始化音频上下文
   */
  initAudioContext() {
    if (!this.audioContext) {
      try {
        // 兼容不同浏览器
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
      } catch (error) {
        console.error('初始化音频上下文失败:', error);
        // 降级使用HTML5 Audio
        this.audioElement = new Audio();
        this.audioElement.volume = this.volume;
      }
    }
  }

  /**
   * 生成风格对应的音乐
   * @param {string} style - 风格类型（日常/古装/晚宴）
   * @returns {Blob} 音频Blob对象
   */
  async generateMusic(style) {
    if (!style || !this.stylePrompts[style]) {
      throw new Error(`不支持的风格类型: ${style}`);
    }

    // 检查缓存
    if (this.musicCache.has(style)) {
      console.log(`使用缓存的${style}风格音乐`);
      return this.musicCache.get(style);
    }

    try {
      console.log(`=== 生成${style}风格音乐开始 ===`);
      console.log('请求URL:', this.apiUrl);
      console.log('生成提示词:', this.stylePrompts[style]);

      const response = await axios.post(
        this.apiUrl,
        {
          prompt: this.stylePrompts[style],
          duration: 30, // 生成30秒音乐
          style: style,
          mood: 'positive'
        },
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 音乐生成可能需要更长时间
        }
      );

      console.log('音乐生成响应状态:', response.status);
      
      if (!response.data || !(response.data instanceof Blob)) {
        throw new Error('音乐服务返回的不是有效的音频数据');
      }

      // 缓存生成的音乐
      this.musicCache.set(style, response.data);
      console.log(`=== ${style}风格音乐生成成功 ===`);

      return response.data;

    } catch (error) {
      console.error(`=== ${style}风格音乐生成失败 ===`);
      console.error('错误详情:', error);
      
      let errorMsg = `生成${style}风格音乐失败`;
      
      if (error.response) {
        errorMsg = `${errorMsg} (${error.response.status})`;
      } else if (error.request) {
        errorMsg = `${errorMsg}：无法连接到音乐服务器`;
      } else {
        errorMsg = `${errorMsg}：${error.message}`;
      }
      
      throw new Error(errorMsg);
    }
  }

  /**
   * 播放指定风格的音乐
   * @param {string} style - 风格类型
   * @param {boolean} loop - 是否循环播放
   */
  async playMusic(style, loop = true) {
    try {
      // 如果当前正在播放相同风格的音乐，直接返回
      if (this.isPlaying && this.currentStyle === style) {
        console.log(`${style}风格音乐已在播放`);
        this.notifyListeners();
        return;
      }

      // 停止当前播放的音乐
      if (this.isPlaying) {
        await this.stopMusic();
      }

      this.currentStyle = style;
      this.initAudioContext();

      // 生成或获取音乐
      const musicBlob = await this.generateMusic(style);
      
      // 清理之前的Blob URL
      if (this.audioBlobUrl) {
        URL.revokeObjectURL(this.audioBlobUrl);
      }

      // 创建新的Blob URL
      this.audioBlobUrl = URL.createObjectURL(musicBlob);

      if (this.audioContext) {
        // 使用Web Audio API播放
        const response = await fetch(this.audioBlobUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = loop;
        
        // 创建音量控制
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = this.volume;
        
        // 连接节点
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 播放
        source.start(0);
        
        // 保存引用以便后续控制
        this.audioSource = source;
        this.gainNode = gainNode;
        
      } else if (this.audioElement) {
        // 降级使用HTML5 Audio
        this.audioElement.src = this.audioBlobUrl;
        this.audioElement.loop = loop;
        await this.audioElement.play();
      }

      this.isPlaying = true;
      console.log(`${style}风格音乐开始播放`);
      this.notifyListeners();

    } catch (error) {
      console.error(`播放${style}风格音乐失败:`, error);
      this.isPlaying = false;
      this.notifyListeners();
      throw error;
    }
  }

  /**
   * 停止播放音乐
   */
  async stopMusic() {
    try {
      if (this.isPlaying) {
        if (this.audioSource) {
          // 停止Web Audio API播放
          this.audioSource.stop();
          this.audioSource = null;
        } else if (this.audioElement) {
          // 停止HTML5 Audio播放
          this.audioElement.pause();
          this.audioElement.currentTime = 0;
        }

        this.isPlaying = false;
        console.log(`停止播放${this.currentStyle}风格音乐`);
        
      }
    } catch (error) {
      console.error('停止音乐失败:', error);
    } finally {
      this.notifyListeners();
    }
  }

  /**
   * 暂停/恢复播放
   */
  togglePlay() {
    if (this.isPlaying) {
      this.pauseMusic();
    } else if (this.currentStyle) {
      this.resumeMusic();
    }
    this.notifyListeners();
  }

  /**
   * 暂停播放
   */
  pauseMusic() {
    if (this.isPlaying) {
      if (this.audioContext) {
        this.audioContext.suspend();
      } else if (this.audioElement) {
        this.audioElement.pause();
      }
      this.isPlaying = false;
      console.log('暂停播放音乐');
      this.notifyListeners();
    }
  }

  /**
   * 恢复播放
   */
  async resumeMusic() {
    if (!this.isPlaying && this.currentStyle) {
      if (this.audioContext) {
        await this.audioContext.resume();
      } else if (this.audioElement) {
        await this.audioElement.play();
      }
      this.isPlaying = true;
      console.log(`恢复播放${this.currentStyle}风格音乐`);
      this.notifyListeners();
    }
  }

  /**
   * 设置音量
   * @param {number} volume - 音量值（0-1）
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    } else if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    
    console.log(`音乐音量设置为: ${this.volume}`);
    this.notifyListeners();
  }

  /**
   * 获取当前音乐状态
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentStyle: this.currentStyle,
      volume: this.volume,
      hasAudioContext: !!this.audioContext
    };
  }

  /**
   * 添加状态监听器
   */
  addListener(listener) {
    if (typeof listener === 'function') {
      this.listeners.add(listener);
      // 立即调用一次，传递当前状态
      listener(this.getStatus());
    }
    
    // 返回取消监听的函数
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 通知所有监听器状态变化
   */
  notifyListeners() {
    const status = this.getStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('音乐状态监听器执行失败:', error);
      }
    });
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.stopMusic();
    
    // 清理Blob URL
    if (this.audioBlobUrl) {
      URL.revokeObjectURL(this.audioBlobUrl);
      this.audioBlobUrl = null;
    }
    
    // 清理缓存
    this.musicCache.clear();
    
    // 关闭音频上下文
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    // 清理监听器
    this.listeners.clear();
    
    this.currentStyle = null;
    this.isPlaying = false;
    
    console.log('音乐服务资源已清理');
  }
}

const musicService = new MusicService();
export default musicService;