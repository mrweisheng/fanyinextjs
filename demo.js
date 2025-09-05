import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import cors from 'cors';

// 初始化Express应用
const app = express();
const port = process.env.PORT || 3000;

// 配置CORS，允许APIFox调用
app.use(cors());
app.use(express.json());

// 配置存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads';
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 限制上传文件类型为图片
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件（jpeg, png, gif, webp）'), false);
  }
};

// 配置multer
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制文件大小为10MB
  },
  fileFilter: fileFilter
});

// 初始化OpenAI客户端（豆包API）
const openai = new OpenAI({
  apiKey: '53c21a66-ebd5-4fec-875e-2fa8a8ba055b',
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});

// 将图片文件转换为base64
const imageToBase64 = (filePath) => {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    return `data:image/${path.extname(filePath).slice(1)};base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.error('图片转换为base64失败:', error);
    throw new Error('图片处理失败');
  }
};

// 清理上传的临时文件
const cleanupTempFile = (filePath) => {
  // 检查文件是否存在
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('清理临时文件失败:', err);
      } else {
        console.log('临时文件已清理:', filePath);
      }
    });
  } else {
    console.log('临时文件不存在，无需清理:', filePath);
  }
};

// 图片识别API端点
app.post('/api/recognize', upload.single('image'), async (req, res) => {
  try {
    // 检查是否有文件上传
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片文件' });
    }

    // 使用固定的文本转录提示词，输出JSON格式
    const prompt = `你的任务是进行一次 绝对精确 的文本转录，并输出为JSON格式。
 唯一规则：  必须逐字、逐符号、逐空格地 100%复制 图片中的联系人备注。严禁进行任何形式的自动格式化、美化或空格调整。
 严重警告：  我注意到你可能会在斜杠 / 前后错误地添加空格。这是 绝对不允许 的。
 正确示例 (必须遵循)：  0824/俊
 错误示例 (必须避免)：  0824 / 俊
 你的输出必须和"正确示例"的格式完全一致，斜杠紧贴两边的文字。
 输出格式要求：请将识别到的每个联系人名称输出为JSON格式，每行一个对象，格式如下：
 {"customer_name": "0824/俊"}
 {"customer_name": "0824/刘汉彬"}
 现在，请处理图片，将所有联系人按上述JSON格式逐行输出。`;

    console.log('收到图片识别请求，使用固定文本转录提示词');

    // 将图片转换为base64
    const base64Image = imageToBase64(req.file.path);
    
    // 清理临时文件
    cleanupTempFile(req.file.path);

    // 调用豆包API
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: base64Image
              },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
      model: 'doubao-seed-1-6-250615', // 豆包1.6多模态模型，支持图文理解
    });

    // 处理并返回结果
    if (response.choices && response.choices.length > 0) {
      const rawResult = response.choices[0].message.content;
      
      try {
        // 将AI返回的多行JSON字符串解析为数组
        const lines = rawResult.trim().split('\n');
        const customers = lines.map(line => {
          try {
            return JSON.parse(line.trim());
          } catch (parseError) {
            console.warn('解析JSON行失败:', line, parseError);
            return { customer_name: line.trim() }; // 降级处理
          }
        }).filter(item => item.customer_name); // 过滤掉空值
        
        res.json({
          success: true,
          result: customers
        });
      } catch (error) {
        console.error('结果解析错误:', error);
        // 降级返回原始字符串
        res.json({
          success: true,
          result: rawResult
        });
      }
    } else {
      res.status(500).json({
        success: false,
        error: '未获取到识别结果'
      });
    }
  } catch (error) {
    console.error('识别过程出错:', error);
    
    // 清理可能残留的临时文件
    if (req.file && req.file.path) {
      cleanupTempFile(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error.message || '识别过程发生错误',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
  console.log(`API端点: http://localhost:${port}/api/recognize`);
  console.log(`健康检查: http://localhost:${port}/health`);
});
