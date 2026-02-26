// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // TTS服务代理
  app.use(
    '/api/tts',
    createProxyMiddleware({
      target: 'http://202.38.236.62:9880',
      changeOrigin: true,
      pathRewrite: {
        '^/api/tts': '/',
      }
    })
  );

  // AI服务代理
  app.use(
    '/api/ai',
    createProxyMiddleware({
      target: 'https://open.bigmodel.cn',
      changeOrigin: true,
      pathRewrite: {
        '^/api/ai': '/api/paas/v4',
      },
      onProxyReq: (proxyReq, req, res) => {
        if (req.headers['authorization']) {
          proxyReq.setHeader('Authorization', req.headers['authorization']);
        }
      }
    })
  );

  // 音乐文件服务代理 - 使用文件服务器端口 8001
  app.use(
    '/api/music',
    createProxyMiddleware({
      target: 'http://202.38.236.62:8002',  // 指向文件服务器端口
      changeOrigin: true,
      pathRewrite: {
        '^/api/music': '',  // 移除 /api/music 前缀，直接访问根目录
      },
      onProxyRes: (proxyRes, req, res) => {
        // 设置正确的Content-Type
        if (req.url.includes('.wav')) {
          proxyRes.headers['content-type'] = 'audio/wav';
        }
        console.log('[音乐代理] 请求:', req.url, '状态:', proxyRes.statusCode);
      },
      onError: (err, req, res) => {
        console.error('[音乐代理] 错误:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({ 
          error: '音乐服务不可用',
          message: '无法连接到音乐服务器，请确保文件服务器已启动'
        }));
      }
    })
  );
};