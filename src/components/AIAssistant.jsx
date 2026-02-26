// src/components/AIAssistant.jsx
import React, { useState, useRef, useEffect } from 'react';
import aiService from '../services/aiService';
import { getHostDialog } from '../services/hostDialog';

function AIAssistant({ style, outfit, sessionId = 'default' }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { 
      role: 'user', 
      content: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 获取当前服装的介绍
      const outfitInfo = outfit ? getHostDialog(style, null, outfit) : '';

      // 调用AI服务
      const result = await aiService.sendMessage(
        input, 
        style, 
        outfit, 
        sessionId
      );

      const assistantMessage = {
        role: 'assistant',
        content: result.reply,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('发送失败:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，我现在有点忙，稍后再问我吧！',
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理回车键
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 清除对话历史
  const clearHistory = () => {
    aiService.clearHistory(sessionId);
    setMessages([]);
  };

  // 根据角色获取样式
  const getMessageStyle = (role) => {
    return role === 'user' ? {
      alignSelf: 'flex-end',
      background: 'linear-gradient(135deg, #4CAF50, #45a049)',
      borderBottomRightRadius: '4px'
    } : {
      alignSelf: 'flex-start',
      background: 'rgba(255, 255, 255, 0.2)',
      borderBottomLeftRadius: '4px'
    };
  };

  return (
    <div className="ai-assistant" style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      padding: '20px',
      marginTop: '20px',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      {/* 标题栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>🤖</span>
          <h3 style={{ 
            color: 'white', 
            margin: 0,
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            娜比助手
          </h3>
          {style && (
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              color: 'white'
            }}>
              {style}顾问
            </span>
          )}
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            style={{
              background: 'rgba(255, 68, 68, 0.2)',
              border: '1px solid rgba(255, 68, 68, 0.3)',
              color: '#ff6b6b',
              padding: '4px 12px',
              borderRadius: '15px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.target.style.background = 'rgba(255, 68, 68, 0.3)';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'rgba(255, 68, 68, 0.2)';
            }}
          >
            清空对话
          </button>
        )}
      </div>

      {/* 消息列表 */}
      <div style={{
        height: '300px',
        overflowY: 'auto',
        marginBottom: '15px',
        padding: '15px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            padding: '40px 20px',
            fontSize: '14px'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>💬</div>
            <p>问问娜比助手关于穿搭的建议吧！</p>
            <p style={{ fontSize: '12px', marginTop: '10px' }}>
              例如："这件衣服适合什么场合？"
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '8px'
              }}
            >
              <div style={{
                maxWidth: '80%',
                padding: '10px 15px',
                borderRadius: '18px',
                ...getMessageStyle(msg.role),
                color: 'white',
                fontSize: '14px',
                lineHeight: '1.5',
                wordBreak: 'break-word',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}>
                {msg.content}
                <div style={{
                  fontSize: '10px',
                  marginTop: '4px',
                  opacity: 0.6,
                  textAlign: 'right'
                }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '8px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '12px 18px',
              borderRadius: '18px',
              borderBottomLeftRadius: '4px',
              color: 'white',
              fontSize: '14px'
            }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span style={{ animation: 'bounce 1s infinite' }}>.</span>
                <span style={{ animation: 'bounce 1s infinite 0.2s' }}>.</span>
                <span style={{ animation: 'bounce 1s infinite 0.4s' }}>.</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div style={{
        display: 'flex',
        gap: '10px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '25px',
        padding: '5px'
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`问问关于${style || '服装'}的问题...`}
          disabled={isLoading}
          rows="1"
          style={{
            flex: 1,
            padding: '12px 15px',
            borderRadius: '20px',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontSize: '14px',
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            background: isLoading ? '#666' : 
                       input.trim() ? 'linear-gradient(135deg, #FF6B6B, #FF8E53)' : '#444',
            color: 'white',
            border: 'none',
            cursor: isLoading || !input.trim() ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            transition: 'all 0.2s',
            boxShadow: input.trim() ? '0 2px 10px rgba(255,107,107,0.3)' : 'none'
          }}
        >
          {isLoading ? '⋯' : '➤'}
        </button>
      </div>

      {/* 添加动画样式 */}
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}

export default AIAssistant;