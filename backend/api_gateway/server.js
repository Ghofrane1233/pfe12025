const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config(); // Charge les variables d'environnement

const app = express();
app.use(cors());

// Configuration des routes de proxy
app.use('/login', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true,
  // pathRewrite: { '^/login': '' },
}));

app.use('/clients', createProxyMiddleware({
  target: process.env.CLIENT_SERVICE_URL,
  changeOrigin: true,
  // pathRewrite: { '^/clients': '' },
}));

app.use('/model', createProxyMiddleware({
  target: process.env.MODEL_SERVICE_URL,
  changeOrigin: true,
  // pathRewrite: { '^/model': '' },
}));

app.use('/parts', createProxyMiddleware({
  target: process.env.PARTS_SERVICE_URL,
  changeOrigin: true,
  // pathRewrite: { '^/parts': '' },
}));

app.use('/technical-documents', createProxyMiddleware({
  target: process.env.DOCUMENT_SERVICE_URL,
  changeOrigin: true,
  // pathRewrite: { '^/technical-documents': '' },
}));

app.use('/firmware', createProxyMiddleware({
  target: process.env.FIRMWARE_SERVICE_URL,
  changeOrigin: true,
  // pathRewrite: { '^/firmware': '' },
}));

// Port de l'API Gateway
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
});
