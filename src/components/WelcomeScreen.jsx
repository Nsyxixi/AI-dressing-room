import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModelViewerWrapper from './ModelViewer';
import VoicePlayer from './VoicePlayer';
import ttsService from '../services/ttsService';

function WelcomeScreen() {
  const navigate = useNavigate();

  // 组件加载时预加载常用语音
  useEffect(() => {
    const preloadSpeech = async () => {
      try {
        await ttsService.preloadCommonSpeech();
      } catch (error) {
        console.warn('语音预加载失败:', error);
      }
    };
    
    preloadSpeech();
  }, []);

  return (
    <div className="welcome-screen">
      {/* 招牌 */}
      <div className="title" style={{
        marginTop: '50px',
        fontSize: '64px',
        background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        换装体验馆
      </div>

      <div className="stage" style={{ flexDirection: 'column' }}>
        {/* 主持人区域 */}
        <div className="host-area" style={{
          width: '100%',
          height: '70vh',
          marginBottom: '30px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '100%',
            height: '60%',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            position: 'relative'
          }}>
            {/* 3D主持人模型 */}
            <div style={{ width: '100%', height: '100%' }}>
              <ModelViewerWrapper 
                modelType="host"
                showControls={false}
                cameraPosition={[0, 1, 4]}
              />
            </div>
          </div>
          
          {/* 主持人语音播放器 */}
          <div style={{
            marginBottom: '20px',
            padding: '0 20px'
          }}>
            <VoicePlayer 
              type="welcome"
              autoPlay={true}
              onPlayStart={() => console.log('开场白开始播放')}
              onPlayEnd={() => console.log('开场白播放结束')}
            />
          </div>
          
          <div style={{
            color: 'white',
            fontSize: '18px',
            textAlign: 'center',
            lineHeight: '1.8',
            padding: '0 20px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '10px',
            padding: '15px'
          }}>
            <p>欢迎来到虚拟换装体验馆！</p>
            <p>在这里，您可以尝试各种风格的服装，</p>
            <p>从日常休闲到古典优雅，再到晚宴华丽，</p>
            <p>总有一套适合您的风格！</p>
          </div>
        </div>

        {/* 开始体验按钮 */}
        <button 
          className="btn"
          onClick={() => navigate('/style-selection')}
          style={{
            padding: '15px 50px',
            fontSize: '24px',
            marginTop: '20px'
          }}
        >
          开始体验
        </button>
      </div>
    </div>
  );
}

export default WelcomeScreen;