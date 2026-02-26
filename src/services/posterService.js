// src/services/posterService.js
import html2canvas from 'html2canvas';

class PosterService {
  /**
   * 生成海报
   * @param {Object} params - 海报参数
   * @param {string} params.style - 风格
   * @param {string} params.outfit - 服装款式
   * @param {string} params.description - 服装介绍
   * @param {string} params.hostImageUrl - 主持人图片（可选）
   * @param {string} params.modelImageUrl - 模特图片（可选）
   * @returns {Promise<string>} - 海报图片的DataURL
   */
  async generatePoster({ style, outfit, description, hostImageUrl, modelImageUrl }) {
    try {
      // 创建海报容器
      const posterContainer = this.createPosterElement({ style, outfit, description, hostImageUrl, modelImageUrl });
      
      // 临时添加到body
      document.body.appendChild(posterContainer);
      
      // 使用html2canvas转换为图片
      const canvas = await html2canvas(posterContainer, {
        scale: 2, // 高清输出
        backgroundColor: null,
        allowTaint: false,
        useCORS: true,
        logging: false
      });
      
      // 移除临时元素
      document.body.removeChild(posterContainer);
      
      // 返回图片数据
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('海报生成失败:', error);
      throw error;
    }
  }

  /**
   * 创建海报DOM元素
   */
  createPosterElement({ style, outfit, description, hostImageUrl, modelImageUrl }) {
    const container = document.createElement('div');
    container.id = 'poster-container';
    
    // 获取风格对应的颜色
    const styleColors = {
      '日常': '#4ECDC4',
      '古装': '#FF6B6B',
      '晚宴': '#C779D0'
    };
    
    const styleNames = {
      '日常': '日常风',
      '古装': '古装风',
      '晚宴': '晚宴风'
    };
    
    const mainColor = styleColors[style] || '#4CAF50';
    
    // 设置样式
    container.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 800px;
      height: 1100px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 30px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      font-family: 'Microsoft YaHei', sans-serif;
    `;
    
    // 构建海报内容
    container.innerHTML = `
      <!-- 装饰性元素 -->
      <div style="position: absolute; top: 20px; left: 20px; width: 100px; height: 100px; background: radial-gradient(circle, ${mainColor}40 0%, transparent 70%); border-radius: 50%;"></div>
      <div style="position: absolute; bottom: 20px; right: 20px; width: 150px; height: 150px; background: radial-gradient(circle, ${mainColor}30 0%, transparent 70%); border-radius: 50%;"></div>
      
      <!-- 标题 -->
      <div style="text-align: center; margin-bottom: 30px; z-index: 1;">
        <h1 style="color: white; font-size: 48px; margin: 0; text-shadow: 0 4px 10px rgba(0,0,0,0.3);">虚拟换装体验馆</h1>
        <div style="width: 200px; height: 4px; background: linear-gradient(90deg, transparent, ${mainColor}, transparent); margin: 15px auto;"></div>
      </div>
      
      <!-- 主持人区域 -->
      <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px; background: rgba(255,255,255,0.1); padding: 15px 30px; border-radius: 60px; backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.2);">
        <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid ${mainColor};">
          <img src="${hostImageUrl || '/images/host-avatar.png'}" alt="主持人" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2240%22%20r%3D%2240%22%20fill%3D%22%23${mainColor.substring(1)}%22%2F%3E%3Ctext%20x%3D%2240%22%20y%3D%2250%22%20font-size%3D%2230%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%20dy%3D%22.3em%22%3E👤%3C%2Ftext%3E%3C%2Fsvg%3E'"/>
        </div>
        <div style="color: white;">
          <div style="font-size: 20px; font-weight: bold;">娜比主持人</div>
          <div style="font-size: 14px; opacity: 0.8;">为您推荐 · ${styleNames[style]}</div>
        </div>
      </div>
      
      <!-- 模特区域（3D模型截图） -->
      <div style="position: relative; width: 400px; height: 400px; margin: 20px 0; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 30px rgba(0,0,0,0.5); border: 3px solid ${mainColor};">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, ${mainColor}20, ${mainColor}40); display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-size: 24px;">✨ 3D模特展示 ✨</span>
        </div>
        <!-- 这里可以放置3D模型截图，但实际需要从ModelViewer获取 -->
        <img src="${modelImageUrl || ''}" alt="3D Model" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'"/>
      </div>
      
      <!-- 服装信息 -->
      <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border-radius: 30px; padding: 30px; width: 90%; margin-top: 20px; border: 1px solid rgba(255,255,255,0.2);">
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
          <div style="background: ${mainColor}; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: bold; color: white;">
            ${outfit}
          </div>
          <div>
            <h2 style="color: white; margin: 0; font-size: 32px;">${styleNames[style]} · ${outfit}款</h2>
            <div style="color: ${mainColor}; font-size: 18px;">${style} STYLE</div>
          </div>
        </div>
        
        <!-- 服装介绍 -->
        <div style="color: white; font-size: 18px; line-height: 1.8; text-align: center; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 20px; margin: 15px 0;">
          "${description}"
        </div>
        
        <!-- 推荐场合 -->
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
          <span style="background: rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 25px; color: white; font-size: 14px;">✨ 推荐场合</span>
          <span style="background: ${mainColor}; padding: 8px 20px; border-radius: 25px; color: white; font-size: 14px;">
            ${style === '日常' ? '通勤 · 约会 · 日常' : style === '古装' ? '古风活动 · 写真 · 演出' : '晚宴 · 派对 · 庆典'}
          </span>
        </div>
      </div>
      
      <!-- 底部装饰 -->
      <div style="margin-top: 30px; color: rgba(255,255,255,0.3); font-size: 14px; display: flex; gap: 30px;">
        <span>✨ 虚拟换装体验馆 ✨</span>
        <span>${new Date().toLocaleDateString()}</span>
      </div>
      
      <!-- 二维码占位 -->
      <div style="position: absolute; bottom: 40px; left: 40px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.3);">
        QR
      </div>
    `;
    
    return container;
  }

  /**
   * 下载海报
   */
  downloadPoster(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  /**
   * 分享海报（Web Share API）
   */
  async sharePoster(dataUrl, title) {
    if (navigator.share) {
      try {
        // 将DataURL转换为Blob
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'poster.png', { type: 'image/png' });
        
        await navigator.share({
          title: title,
          text: '我在虚拟换装体验馆找到了一套超美的衣服！',
          files: [file]
        });
        return true;
      } catch (error) {
        console.log('分享取消或失败:', error);
        return false;
      }
    }
    return false;
  }
}

const posterService = new PosterService();
export default posterService;