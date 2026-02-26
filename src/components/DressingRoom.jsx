// src/components/DressingRoom.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModelViewerWrapper from './ModelViewer';
import VoicePlayer from './VoicePlayer';
import AIAssistant from './AIAssistant';
import MusicPlayer from './MusicPlayer';
import PosterGenerator from './PosterGenerator';
import { getHostDialog } from '../services/hostDialog';
import musicService from '../services/musicService';

function DressingRoom() {
  const navigate = useNavigate();
  const { style } = useParams();
  const [selectedOutfit, setSelectedOutfit] = useState('A');
  const [isPlayingIntroduction, setIsPlayingIntroduction] = useState(false);
  const [musicStatus, setMusicStatus] = useState({ isPlaying: false });
  const [showPosterModal, setShowPosterModal] = useState(false);
  
  // 添加refs用于截图
  const modelViewerRef = useRef(null);
  const hostViewerRef = useRef(null);

  const outfits = ['A', 'B', 'C', 'D', 'E', 'F'];
  const styleNames = {
    '日常': '日常风',
    '古装': '古装风',
    '晚宴': '晚宴风'
  };

  const styleColors = {
    '日常': '#4ECDC4',
    '古装': '#FF6B6B',
    '晚宴': '#C779D0'
  };

  // 监听音乐状态
  useEffect(() => {
    const unsubscribe = musicService.addListener((status) => {
      setMusicStatus(status);
    });
    return unsubscribe;
  }, []);

  // 当风格改变时自动播放对应风格的音乐
  useEffect(() => {
    console.log('风格改变:', style);
    setSelectedOutfit('A');
    setIsPlayingIntroduction(true);
    
    // 播放对应风格的音乐
    if (style) {
      // 延迟一点播放，避免与其他音频冲突
      const timer = setTimeout(() => {
        musicService.playMusic(style);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [style]);

  // 当选择服装时自动播放介绍
  useEffect(() => {
    if (selectedOutfit) {
      console.log('服装选择:', selectedOutfit);
      setIsPlayingIntroduction(true);
    }
  }, [selectedOutfit]);

  const handleSelectOutfit = (outfit) => {
    console.log('点击服装:', outfit);
    setSelectedOutfit(outfit);
  };

  // 获取图片路径
  const getImagePath = (style, outfit) => {
    return `/images/${style}/${outfit}.png`;
  };

  // 处理生成海报
  const handleGeneratePoster = () => {
    setShowPosterModal(true);
  };

  // 关闭海报模态框
  const handleClosePoster = () => {
    setShowPosterModal(false);
  };

  return (
    <div className="dressing-room">
      {/* 音乐播放器 */}
      <MusicPlayer 
        style={style} 
        autoPlay={true}
        showControls={true}
      />

      {/* 可选的音乐控制快捷按钮（仅当需要时显示） */}
      {musicStatus.isPlaying && musicStatus.currentStyle !== style && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          background: 'rgba(255, 107, 107, 0.9)',
          color: 'white',
          padding: '8px 15px',
          borderRadius: '20px',
          fontSize: '12px',
          zIndex: 999,
          cursor: 'pointer',
          backdropFilter: 'blur(5px)'
        }}
        onClick={() => musicService.playMusic(style)}
        >
          切换到当前风格音乐
        </div>
      )}

      <button 
        className="btn btn-back"
        onClick={() => {
          // 返回时停止音乐
          musicService.stopMusic();
          navigate('/style-selection');
        }}
      >
        返回
      </button>

      <h1 className="title" style={{ marginTop: '20px', color: styleColors[style] }}>
        {styleNames[style]} 换装间
      </h1>

      <div className="stage" style={{ height: '70vh' }}>
        {/* 左侧主持人区域 */}
        <div className="host-area" style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }}>
          {/* 主持人模型 */}
          <div style={{
            width: '100%',
            height: '40%',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '15px',
            position: 'relative',
            background: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{ width: '100%', height: '100%' }}>
              <ModelViewerWrapper 
                ref={hostViewerRef}
                modelType="host"
                showControls={false}
                cameraPosition={[0, 1.5, 3]}
              />
            </div>
          </div>
          
          {/* 主持人语音播放器 */}
          <div style={{ marginBottom: '15px' }}>
            <VoicePlayer 
              type={selectedOutfit ? "clothingIntroduction" : "styleIntroduction"}
              style={style}
              outfit={selectedOutfit}
              autoPlay={isPlayingIntroduction}
              onPlayStart={() => {
                // 开始介绍时降低音乐音量
                musicService.setVolume(0.1);
              }}
              onPlayEnd={() => {
                // 介绍结束时恢复音乐音量
                musicService.setVolume(0.5);
                setIsPlayingIntroduction(false);
              }}
            />
          </div>
          
          {/* 显示当前话术文本 */}
          <div style={{
            color: 'white',
            fontSize: '14px',
            textAlign: 'left',
            lineHeight: '1.6',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '12px',
            borderRadius: '10px',
            minHeight: '80px',
            marginBottom: '15px',
            overflowY: 'auto',
            flexShrink: 0
          }}>
            {selectedOutfit 
              ? getHostDialog(style, null, selectedOutfit)
              : getHostDialog('styleIntroduction', style)
            }
          </div>

          {/* AI助手区域 - 可滚动 */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            marginTop: '5px'
          }}>
            <AIAssistant 
              style={style}
              outfit={selectedOutfit}
              sessionId={`room-${style}-${selectedOutfit}`}
            />
          </div>
        </div>

        {/* 右侧模特区域 */}
        <div className="model-area" style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          <div style={{
            width: '100%',
            height: '70%',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden',
            background: 'rgba(0, 0, 0, 0.2)'
          }}>
            {/* 模特+衣服3D模型 */}
            <div style={{ width: '100%', height: '100%' }}>
              <ModelViewerWrapper 
                ref={modelViewerRef}
                modelType="human-clothing"
                style={style}
                outfit={selectedOutfit}
                showControls={true}
                cameraPosition={[0, 1.2, 3]}
              />
            </div>
          </div>

          {/* 生成海报按钮 */}
          <button
            className="btn"
            onClick={handleGeneratePoster}
            style={{
              width: '80%',
              padding: '15px',
              fontSize: '18px',
              background: styleColors[style],
              margin: '0 auto 10px'
            }}
            disabled={!selectedOutfit}
          >
            {selectedOutfit 
              ? `生成 ${styleNames[style]} ${selectedOutfit} 款海报`
              : '请先选择一套衣服'
            }
          </button>
          
          <div style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '12px',
            textAlign: 'center'
          }}>
            * 点击按钮生成包含3D模特截图的精美海报
          </div>
        </div>
      </div>

      {/* 衣服选择区域 - 6列布局 */}
      <div style={{
        padding: '20px',
        margin: '20px 20px 30px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{
          color: 'white',
          marginBottom: '20px',
          fontSize: '24px',
          textAlign: 'left',
          paddingLeft: '10px'
        }}>
          选择服装款式
          <span style={{
            fontSize: '14px',
            marginLeft: '15px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 'normal'
          }}>
            共 {outfits.length} 款
          </span>
        </h2>
        
        {/* 6列网格布局 - 保持原有代码不变 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '15px',
          padding: '10px'
        }}>
          {outfits.map(outfit => (
            <div
              key={outfit}
              onClick={() => handleSelectOutfit(outfit)}
              style={{
                background: `linear-gradient(135deg, ${styleColors[style]}20 0%, ${styleColors[style]}40 100%)`,
                border: selectedOutfit === outfit 
                  ? `3px solid ${styleColors[style]}` 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '15px 10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                boxShadow: selectedOutfit === outfit 
                  ? `0 0 20px ${styleColors[style]}80` 
                  : 'none',
                transform: selectedOutfit === outfit ? 'scale(1.02)' : 'scale(1)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 10px 20px ${styleColors[style]}60`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = selectedOutfit === outfit ? 'scale(1.02)' : 'scale(1)';
                e.currentTarget.style.boxShadow = selectedOutfit === outfit 
                  ? `0 0 20px ${styleColors[style]}80` 
                  : 'none';
              }}
            >
              {/* 衣服图片 */}
              <div style={{
                width: '100%',
                aspectRatio: '1/1.2',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <img 
                  src={getImagePath(style, outfit)}
                  alt={`${style}风格${outfit}款`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={e => {
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={e => {
                    e.target.style.transform = 'scale(1)';
                  }}
                  onError={(e) => {
                    // 图片加载失败时显示占位符
                    e.target.style.display = 'none';
                    const parent = e.target.parentNode;
                    const placeholder = document.createElement('div');
                    placeholder.style.cssText = `
                      width: 100%;
                      height: 100%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      background: ${styleColors[style]}30;
                      color: ${styleColors[style]};
                      font-size: 24px;
                      font-weight: bold;
                    `;
                    placeholder.textContent = outfit;
                    parent.appendChild(placeholder);
                  }}
                />
              </div>
              
              {/* 款式名称 */}
              <div style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center'
              }}>
                {styleNames[style]} {outfit}
              </div>
              
              {/* 操作按钮组 */}
              <div style={{
                display: 'flex',
                gap: '8px',
                width: '100%',
                justifyContent: 'center'
              }}>
                {/* 听介绍按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOutfit(outfit);
                    setIsPlayingIntroduction(true);
                    // 介绍时降低音乐音量
                    musicService.setVolume(0.1);
                  }}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '20px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flex: 1
                  }}
                  onMouseEnter={e => {
                    e.stopPropagation();
                    e.currentTarget.style.background = styleColors[style];
                    e.currentTarget.style.borderColor = styleColors[style];
                  }}
                  onMouseLeave={e => {
                    e.stopPropagation();
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                >
                  🔊 介绍
                </button>
                
                {/* 选择按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectOutfit(outfit);
                  }}
                  style={{
                    padding: '6px 12px',
                    background: selectedOutfit === outfit ? styleColors[style] : 'transparent',
                    color: 'white',
                    border: selectedOutfit === outfit ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '20px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flex: 1
                  }}
                  onMouseEnter={e => {
                    e.stopPropagation();
                    if (selectedOutfit !== outfit) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={e => {
                    e.stopPropagation();
                    if (selectedOutfit !== outfit) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {selectedOutfit === outfit ? '✓ 已选' : '选择'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 底部提示信息 */}
        <div style={{
          marginTop: '20px',
          padding: '10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            💡 点击图片可预览大图 | 点击款式卡片选择服装
          </span>
          <span style={{
            background: styleColors[style],
            padding: '4px 12px',
            borderRadius: '20px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            当前选中：{styleNames[style]} {selectedOutfit}
          </span>
        </div>
      </div>

      {/* 海报生成器模态框 */}
      {showPosterModal && selectedOutfit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(15px)',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {/* 关闭按钮 */}
            <button
              onClick={handleClosePoster}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                zIndex: 1
              }}
            >
              ✕
            </button>
            
            <h2 style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>
              生成您的专属海报
            </h2>
            
            <PosterGenerator
              style={style}
              outfit={selectedOutfit}
              onClose={handleClosePoster}
              modelViewerRef={modelViewerRef}
              hostViewerRef={hostViewerRef}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DressingRoom;