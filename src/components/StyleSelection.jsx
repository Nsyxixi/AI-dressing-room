import React from 'react';
import { useNavigate } from 'react-router-dom';

function StyleSelection() {
  const navigate = useNavigate();
  const styles = [
    {
      id: '日常',
      name: '日常风',
      description: '休闲舒适的日常装扮',
      color: '#4ECDC4'
    },
    {
      id: '古装',
      name: '古装风',
      description: '古典优雅的传统服饰',
      color: '#FF6B6B'
    },
    {
      id: '晚宴',
      name: '晚宴风',
      description: '华丽优雅的晚宴礼服',
      color: '#C779D0'
    }
  ];

  return (
    <div className="style-selection-screen">
      <button 
        className="btn btn-back"
        onClick={() => navigate('/')}
      >
        返回
      </button>

      <h1 className="title" style={{ marginTop: '80px' }}>
        选择您喜欢的风格
      </h1>
      
      <p className="subtitle">
        点击下方卡片开始换装体验
      </p>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '40px',
        marginTop: '50px',
        padding: '0 20px'
      }}>
        {styles.map(style => (
          <div
            key={style.id}
            className="style-card"
            onClick={() => navigate(`/dressing-room/${style.id}`)}
            style={{
              width: '300px',
              height: '400px',
              background: `linear-gradient(135deg, ${style.color} 0%, #${style.color.substring(1)}80 100%)`,
              borderRadius: '20px',
              padding: '30px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
            }}
          >
            <div style={{
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ 
                color: 'white', 
                fontSize: '48px',
                fontWeight: 'bold'
              }}>
                {style.name.charAt(0)}
              </span>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ 
                color: 'white', 
                fontSize: '32px',
                marginBottom: '10px'
              }}>
                {style.name}
              </h2>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '16px'
              }}>
                {style.description}
              </p>
            </div>
            
            <div style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '25px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              点击进入
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StyleSelection;