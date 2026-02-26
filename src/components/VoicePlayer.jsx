import React, { useState, useEffect, useRef } from 'react';
import ttsService from '../services/ttsService';
import { getHostDialog } from '../services/hostDialog';

function VoicePlayer({ 
  text = null, 
  type = 'custom',
  style = null, 
  outfit = null,
  autoPlay = true,
  onPlayStart = () => {},
  onPlayEnd = () => {},
  onError = () => {}
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  // 根据参数获取要播放的文本 - 修复逻辑
  const getPlayText = () => {
    if (text) return text;
    
    console.log('VoicePlayer参数:', { type, style, outfit }); // 添加调试日志
    
    switch (type) {
      case 'welcome':
        return getHostDialog('welcome');
      case 'styleIntroduction':
        return getHostDialog('styleIntroduction', style);
      case 'clothingIntroduction':
        // 关键修复：style 是风格名，outfit 是服装代码
        return getHostDialog(style, null, outfit);
      default:
        return text || getHostDialog('common', 'selectPrompt');
    }
  };

  

  // 播放语音
  const playSpeech = async () => {
    try {
      setIsLoading(true);
      onPlayStart();
      
      const playText = getPlayText();
      
      console.log('播放文本:', playText);
      
      if (!playText.trim()) {
        throw new Error('没有可播放的文本');
      }
      
      setCurrentText(playText);
      
      // 生成语音
      const audioBlob = await ttsService.generateSpeech(playText);
      
      // 创建音频URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;
      
      // 播放音频
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      audioRef.current.src = audioUrl;
      audioRef.current.onended = () => {
        setIsPlaying(false);
        onPlayEnd();
      };
      
      audioRef.current.onerror = (error) => {
        console.error('音频播放错误:', error);
        setIsPlaying(false);
        onError(error);
      };
      
      await audioRef.current.play();
      setIsPlaying(true);
      setIsLoading(false);
      
    } catch (error) {
      console.error('播放语音失败:', error);
      setIsLoading(false);
      onError(error);
    }
  };

  // 停止播放
  const stopSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    onPlayEnd();
  };

  // 修改自动播放逻辑
  useEffect(() => {
    if (autoPlay && !isPlaying && !isLoading) {
      const timer = setTimeout(() => {
        const playText = getPlayText();
        if (playText && playText.trim()) {
          console.log('自动播放:', playText.substring(0, 30));
          playSpeech();
        }
      }, 800); // 增加延迟到800ms
      
      return () => clearTimeout(timer);
    }
  }, [autoPlay, style, outfit, type, getPlayText()]); // 添加依赖

  // 清理音频URL
  useEffect(() => {
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playText = getPlayText();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
      marginTop: '10px'
    }}>
      {/* 播放/停止按钮 */}
      <button
        onClick={isPlaying ? stopSpeech : playSpeech}
        disabled={isLoading || !playText.trim()}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: isLoading ? '#FFD700' : 
                     isPlaying ? '#FF4444' : '#4CAF50',
          color: 'white',
          border: 'none',
          cursor: isLoading ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px'
        }}
      >
        {isLoading ? '⏳' : isPlaying ? '⏹️' : '▶️'}
      </button>

      {/* 状态显示 */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '14px',
          color: 'white',
          marginBottom: '5px'
        }}>
          {isLoading ? '生成语音中...' : 
           isPlaying ? '正在播放...' : 
           '点击播放主持人介绍'}
        </div>
        
        {/* 当前播放文本（缩略） */}
        <div style={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.7)',
          maxWidth: '300px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {currentText.substring(0, 50)}
          {currentText.length > 50 ? '...' : ''}
        </div>
      </div>

      {/* 文本长度提示 */}
      <div style={{
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.5)',
        minWidth: '60px',
        textAlign: 'center'
      }}>
        {playText.length}字
      </div>
    </div>
  );
}

export default VoicePlayer;