// src/components/PosterGenerator.jsx
import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { getHostDialog } from '../services/hostDialog';

function PosterGenerator({ style, outfit, onClose, onGenerated, modelViewerRef, hostViewerRef }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [posterUrl, setPosterUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [modelScreenshot, setModelScreenshot] = useState(null);
  const [hostScreenshot, setHostScreenshot] = useState(null);

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

  // 获取风格对应的图标
  const getStyleIcon = () => {
    const icons = {
      '日常': '☀️',
      '古装': '🏯',
      '晚宴': '🥂'
    };
    return icons[style] || '👔';
  };

  // 获取场合推荐
  const getOccasions = () => {
    const occasions = {
      '日常': '通勤 · 约会 · 日常出行 · 朋友聚会',
      '古装': '古风活动 · 写真拍摄 · 演出表演 · 文化节',
      '晚宴': '正式晚宴 · 派对 · 庆典 · 红毯活动'
    };
    return occasions[style] || '多种场合';
  };

  // 从3D模型截图
  const captureScreenshots = async () => {
    try {
      let modelImage = null;
      if (modelViewerRef?.current) {
        modelImage = modelViewerRef.current.captureScreenshot();
        setModelScreenshot(modelImage);
      }

      let hostImage = null;
      if (hostViewerRef?.current) {
        hostImage = hostViewerRef.current.captureScreenshot();
        setHostScreenshot(hostImage);
      }

      return { modelImage, hostImage };
    } catch (error) {
      console.error('截图失败:', error);
      return { modelImage: null, hostImage: null };
    }
  };

  // 创建海报DOM元素
  const createPosterElement = (modelImage, hostImage) => {
    const container = document.createElement('div');
    container.id = 'poster-container';
    
    const mainColor = styleColors[style] || '#4CAF50';
    const description = getHostDialog(style, null, outfit);
    
    container.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 800px;
      height: 1100px;
      background: linear-gradient(145deg, #0f0c1f 0%, #1a1a2e 50%, #16213e 100%);
      border-radius: 40px;
      padding: 40px;
      box-shadow: 0 30px 60px rgba(0,0,0,0.7);
      display: flex;
      flex-direction: column;
      align-items: center;
      font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
      position: relative;
      overflow: hidden;
    `;
    
    container.innerHTML = `
      <!-- 装饰性背景元素 -->
      <div style="position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; background: radial-gradient(circle, ${mainColor}30 0%, transparent 70%); border-radius: 50%;"></div>
      <div style="position: absolute; bottom: -50px; left: -50px; width: 250px; height: 250px; background: radial-gradient(circle, ${mainColor}20 0%, transparent 70%); border-radius: 50%;"></div>
      
      <!-- 顶部光效 -->
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, transparent, ${mainColor}, white, ${mainColor}, transparent);"></div>
      
      <!-- 标题区域 -->
      <div style="text-align: center; margin-bottom: 30px; z-index: 2; width: 100%;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
          <span style="font-size: 40px;">✨</span>
          <h1 style="color: white; font-size: 48px; margin: 0; text-shadow: 0 4px 15px rgba(0,0,0,0.5); letter-spacing: 4px; background: linear-gradient(135deg, white, ${mainColor}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">换装体验馆</h1>
          <span style="font-size: 40px;">✨</span>
        </div>
        <div style="width: 300px; height: 3px; background: linear-gradient(90deg, transparent, ${mainColor}, white, ${mainColor}, transparent); margin: 10px auto;"></div>
        <p style="color: rgba(255,255,255,0.8); font-size: 18px; margin-top: 10px; letter-spacing: 2px;">VIRTUAL DRESSING ROOM</p>
      </div>

      <!-- 主持人区域 -->
      <div style="position: absolute; top: 140px; left: 30px; width: 120px; text-align: center; z-index: 3;">
        <div style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; border: 3px solid ${mainColor}; box-shadow: 0 10px 20px rgba(0,0,0,0.3); margin: 0 auto 10px; background: #1a1a2e;">
          ${hostImage ? `<img src="${hostImage}" style="width: 100%; height: 100%; object-fit: cover;" />` : 
            `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: ${mainColor}40; font-size: 40px;">🎤</div>`}
        </div>
        <div style="color: white; font-weight: bold; font-size: 16px;">娜比主持人</div>
        <div style="color: ${mainColor}; font-size: 12px; margin-top: 5px;">时尚顾问</div>
      </div>

      <!-- 3D模特主图区域 -->
      <div style="position: relative; width: 500px; height: 500px; margin: 20px auto 30px; border-radius: 30px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); border: 4px solid ${mainColor}; z-index: 2;">
        <div style="position: absolute; top: -10px; left: -10px; right: -10px; bottom: -10px; border: 2px solid ${mainColor}60; border-radius: 40px; pointer-events: none;"></div>
        
        ${modelImage ? 
          `<img src="${modelImage}" style="width: 100%; height: 100%; object-fit: cover;" />` : 
          `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, ${mainColor}30, ${mainColor}60); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white;">
            <span style="font-size: 80px; margin-bottom: 20px;">${getStyleIcon()}</span>
            <span style="font-size: 24px; font-weight: bold;">${styleNames[style]}</span>
            <span style="font-size: 18px; margin-top: 10px;">款式 ${outfit}</span>
          </div>`
        }
        
        <div style="position: absolute; top: 20px; right: 20px; background: ${mainColor}; color: white; padding: 8px 20px; border-radius: 30px; font-weight: bold; font-size: 18px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
          ${outfit} · 款
        </div>
        
        <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); color: white; padding: 8px 20px; border-radius: 30px; font-size: 16px; border: 1px solid ${mainColor};">
          ${getStyleIcon()} ${styleNames[style]}
        </div>
      </div>

      <!-- 服装介绍卡片 -->
      <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 30px; padding: 30px; width: 90%; margin-top: 20px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 15px 30px rgba(0,0,0,0.3); z-index: 2;">
        <p style="color: white; font-size: 20px; line-height: 1.8; text-align: center; margin: 10px 0 20px; font-style: italic;">
          ${description}
        </p>
        
        <div style="display: flex; gap: 15px; justify-content: center; margin-top: 25px; flex-wrap: wrap;">
          <span style="background: rgba(255,255,255,0.15); padding: 10px 25px; border-radius: 40px; color: white; font-size: 14px; border: 1px solid rgba(255,255,255,0.2);">
            ✨ 场合推荐
          </span>
          <span style="background: ${mainColor}; padding: 10px 25px; border-radius: 40px; color: white; font-size: 14px; font-weight: bold; box-shadow: 0 5px 15px ${mainColor}80;">
            ${getOccasions()}
          </span>
        </div>
      </div>

      <!-- 底部信息 -->
      <div style="position: absolute; bottom: 30px; right: 40px; color: rgba(255,255,255,0.3); font-size: 12px; display: flex; gap: 20px; z-index: 2;">
        <span>✨ 虚拟换装体验馆 ✨</span>
        <span>${new Date().toLocaleDateString('zh-CN')}</span>
      </div>
    `;
    
    return container;
  };

  // 生成海报
  const handleGeneratePoster = async () => {
    setIsGenerating(true);
    try {
      const { modelImage, hostImage } = await captureScreenshots();
      
      const posterElement = createPosterElement(modelImage, hostImage);
      document.body.appendChild(posterElement);
      
      const canvas = await html2canvas(posterElement, {
        scale: 2.5,
        backgroundColor: null,
        allowTaint: true,
        useCORS: true,
        logging: false,
        windowWidth: 800,
        windowHeight: 1100
      });
      
      document.body.removeChild(posterElement);
      
      const dataUrl = canvas.toDataURL('image/png');
      setPosterUrl(dataUrl);
      setShowPreview(true);
      
      if (onGenerated) onGenerated(dataUrl);
    } catch (error) {
      console.error('海报生成失败:', error);
      alert('海报生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 下载海报
  const handleDownload = () => {
    if (posterUrl) {
      const link = document.createElement('a');
      link.download = `${style}_${outfit}_海报.png`;
      link.href = posterUrl;
      link.click();
    }
  };

  // 微信分享
  const handleWeChatShare = () => {
    if (posterUrl) {
      const link = document.createElement('a');
      link.href = posterUrl;
      link.download = `${style}${outfit}.png`;
      link.click();
      alert('图片已保存，请在微信中点击"+"号选择相册发送');
    }
  };

  return (
    <>
      {/* 生成海报按钮 */}
      <button
        onClick={handleGeneratePoster}
        disabled={isGenerating}
        style={{
          padding: '12px 30px',
          background: isGenerating ? '#999' : `linear-gradient(135deg, ${styleColors[style]}, ${styleColors[style]}dd)`,
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: isGenerating ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: `0 5px 15px ${styleColors[style]}80`,
          width: '100%',
          marginBottom: '10px'
        }}
      >
        {isGenerating ? '生成中...' : '🎨 生成精美海报'}
      </button>

      {/* 全屏海报预览 */}
      {showPreview && posterUrl && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPreview(false);
            }
          }}
        >
          {/* 关闭按钮 */}
          <button
            onClick={() => setShowPreview(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(255, 68, 68, 0.2)',
              border: '2px solid rgba(255, 68, 68, 0.3)',
              color: '#ff6b6b',
              fontSize: '24px',
              cursor: 'pointer',
              zIndex: 10001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>

          {/* 海报大图 */}
          <div style={{
            maxWidth: '90vw',
            maxHeight: '80vh',
            overflow: 'hidden',
            borderRadius: '20px',
            boxShadow: `0 20px 40px ${styleColors[style]}40`,
            border: `3px solid ${styleColors[style]}`,
            marginBottom: '20px'
          }}>
            <img
              src={posterUrl}
              alt="海报"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>

          {/* 按钮组 */}
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleDownload}
              style={{
                padding: '15px 40px',
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 5px 15px rgba(76, 175, 80, 0.4)'
              }}
            >
              ⬇️ 下载海报
            </button>

            <button
              onClick={handleWeChatShare}
              style={{
                padding: '15px 40px',
                background: 'linear-gradient(135deg, #07C160, #06ad56)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 5px 15px rgba(7, 193, 96, 0.4)'
              }}
            >
              📱 微信分享
            </button>
          </div>

          {/* 简单提示 */}
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            marginTop: '20px',
            fontSize: '14px'
          }}>
            * 点击下载保存图片，然后在微信中发送
          </p>
        </div>
      )}
    </>
  );
}

export default PosterGenerator;