// 使用 dotenv 包读取环境变量
function loadEnvVars() {
  try {
    const dotenv = require('dotenv');
    const path = require('path');
    
    // 尝试多个环境文件路径
    const envPaths = [
      path.join(process.cwd(), '.env.local'),
      path.join(process.cwd(), '.env'),
      path.join(process.cwd(), '.env.production')
    ];
    
    for (const envPath of envPaths) {
      if (require('fs').existsSync(envPath)) {
        console.log('找到环境文件:', envPath);
        const result = dotenv.config({ path: envPath });
        if (result.error) {
          console.warn('加载环境文件失败:', envPath, result.error);
        } else {
          console.log('成功加载环境文件:', envPath);
          break;
        }
      }
    }
  } catch (error) {
    console.warn('dotenv 加载失败:', error.message);
  }
}

// 加载环境变量
loadEnvVars();

// 获取环境变量
function getEnvVar(key, defaultValue = '') {
  // 优先从 process.env 读取
  if (process.env[key]) {
    return process.env[key];
  }
  
  // 备用方案：手动读取文件
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(process.cwd(), '.env.local');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [envKey, ...envValueParts] = trimmedLine.split('=');
          if (envKey.trim() === key) {
            return envValueParts.join('=').trim();
          }
        }
      }
    }
  } catch (error) {
    console.warn(`手动读取.env文件失败: ${error.message}`);
  }
  
  return defaultValue;
}

// DeepSeek API配置
const API_URL = getEnvVar('DEEPSEEK_API_URL', 'https://api.deepseek.com/chat/completions');
const API_KEY = getEnvVar('DEEPSEEK_API_KEY');

export async function POST(request) {
  try {
    // 调试日志：显示环境变量状态
    console.log('环境变量调试信息:');
    console.log('- DEEPSEEK_API_KEY from .env:', API_KEY ? '已设置' : '未设置');
    console.log('- API_URL:', API_URL);
    
    // 检查API密钥
    if (!API_KEY) {
      return Response.json(
        { success: false, error: 'API密钥未配置', debug: { 
          envFile: !!API_KEY,
          apiUrl: API_URL 
        }},
        { status: 500 }
      );
    }

    const { text } = await request.json();
    
    // 检查输入文本
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return Response.json(
        { success: false, error: '请输入要翻译的文本' },
        { status: 400 }
      );
    }

    // 固定提示词
    const prompt = `请将以下文本翻译成地道的香港粤语，不要额外添加或删减内容，仅基于原文进行翻译，只输出翻译结果，不要添加任何说明、解释或注释：${text}`;

    console.log('收到翻译请求，文本长度:', text.length);

    // 调用DeepSeek API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    // 处理并返回结果
    if (data.choices && data.choices.length > 0) {
      const translatedText = data.choices[0].message.content.trim();
      
      return Response.json({
        success: true,
        result: translatedText,
        original: text
      });
    } else {
      return Response.json(
        { success: false, error: '未获取到翻译结果' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('翻译过程出错:', error);
    
    return Response.json(
      { 
        success: false, 
        error: error.message || '翻译过程发生错误',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
