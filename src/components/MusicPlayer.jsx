// src/components/MusicPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import musicService from '../services/musicService';

function MusicPlayer({ style, autoPlay = true, showControls = true }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStyle, setCurrentStyle] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [isMusicAvailable, setIsMusicAvailable] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const checkTimerRef = useRef(null);

  // 监听音乐服务状态
  useEffect(() => {
    const unsubscribe = musicService.addListener((status) => {
      setIsPlaying(status.isPlaying);
      setCurrentStyle(status.currentStyle);
      setVolume(status.volume);
    });

    return unsubscribe;
  }, []);

  // 当风格改变时自动播放音乐
  useEffect(() => {
    if (style && autoPlay) {
      // 延迟一下播放，避免与其他音频冲突
      const timer = setTimeout(() => {
        handlePlayMusic();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [style]);

  // 定期检查音乐是否可用
  useEffect(() => {
    if (style) {
      checkMusicAvailable();
      
      // 每30秒检查一次
      checkTimerRef.current = setInterval(() => {
        checkMusicAvailable();
      }, 30000);
    }

    return () => {
      if (checkTimerRef.current) {
        clearInterval(checkTimerRef.current);
      }
    };
  }, [style]);

  // 检查音乐文件可用性
  const checkMusicAvailable = async () => {
    if (style) {
      const available = await musicService.checkMusicAvailable(style);
      setIsMusicAvailable(available);
    }
  };

  // 播放音乐
  const handlePlayMusic = async () => {
    const result = await musicService.playMusic(style);
    if (!result.success) {
      console.warn(result.message);
    }
  };

  // 暂停音乐
  const handlePauseMusic = () => {
    musicService.pauseMusic();
  };

  // 停止音乐
  const handleStopMusic = () => {
    musicService.stopMusic();
  };

  // 音量控制
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    musicService.setVolume(newVolume);
  };

  // 获取风格对应的颜色
  const getStyleColor = () => {
    const colors = {
      '日常': '#4ECDC4',
      '古装': '#FF6B6B',
      '晚宴': '#C779D0'
    };
    return colors[style] || '#4CAF50';
  };

  // 获取风格对应的音乐名称
  const getMusicName = () => {
    const names = {
      '日常': '日常轻音乐',
      '古装': '古风雅韵',
      '晚宴': '华尔兹圆舞曲'
    };
    return names[style] || '背景音乐';
  };

  if (!showControls) {
    return null; // 如果不显示控件，则不渲染任何内容
  }

  return (
    <div className="music-player" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(10px)',
      borderRadius: '50px',
      padding: '8px 15px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease'
    }}>
      {/* 音乐图标和状态 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{
          fontSize: '20px',
          animation: isPlaying ? 'musicWave 1.5s infinite' : 'none'
        }}>
          {isPlaying ? '🎵' : '🎶'}
        </span>
        {style && (
          <div style={{
            display: 'flex',
            flexDirection: 'column'
          }}>
            <span style={{
              color: 'white',
              fontSize: '12px',
              opacity: 0.8
            }}>
              {getMusicName()}
            </span>
            {!isMusicAvailable && (
              <span style={{
                color: '#ff6b6b',
                fontSize: '10px'
              }}>
                音乐暂不可用
              </span>
            )}
          </div>
        )}
      </div>

      {/* 控制按钮组 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        {/* 播放/暂停按钮 */}
        {isPlaying ? (
          <button
            onClick={handlePauseMusic}
            style={buttonStyle}
            title="暂停音乐"
            disabled={!isMusicAvailable}
          >
            ⏸️
          </button>
        ) : (
          <button
            onClick={handlePlayMusic}
            style={buttonStyle}
            title="播放音乐"
            disabled={!isMusicAvailable}
          >
            ▶️
          </button>
        )}

        {/* 停止按钮 */}
        <button
          onClick={handleStopMusic}
          style={buttonStyle}
          title="停止音乐"
          disabled={!isMusicAvailable}
        >
          ⏹️
        </button>

        {/* 音量控制按钮 */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            style={buttonStyle}
            title="音量调节"
          >
            {volume === 0 ? '🔇' : volume < 0.5 ? '🔈' : '🔊'}
          </button>
          
          {/* 音量滑块 */}
          {showVolumeSlider && (
            <div style={{
              position: 'absolute',
              bottom: '40px',
              right: '0',
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              padding: '15px 10px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                style={{
                  width: '100px',
                  height: '4px',
                  WebkitAppearance: 'none',
                  background: `linear-gradient(90deg, ${getStyleColor()} 0%, ${getStyleColor()} ${volume * 100}%, rgba(255,255,255,0.3) ${volume * 100}%)`,
                  borderRadius: '2px',
                  outline: 'none'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 当前风格指示器 */}
      {currentStyle && currentStyle !== style && (
        <div style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.5)',
          maxWidth: '100px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          正在播放: {currentStyle}
        </div>
      )}

      {/* 动画样式 */}
      <style jsx>{`
        @keyframes musicWave {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// 按钮样式
const buttonStyle = {
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  transition: 'all 0.2s ease',
  padding: 0
};

export default MusicPlayer;