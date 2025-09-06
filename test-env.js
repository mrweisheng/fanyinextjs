// 测试环境变量读取
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

console.log('=== 环境变量测试 ===');
console.log('当前工作目录:', process.cwd());

// 测试 dotenv 加载
const envPath = path.join(process.cwd(), '.env.local');
console.log('环境文件路径:', envPath);
console.log('文件是否存在:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  console.log('dotenv 加载结果:', result);
  
  // 读取具体变量
  console.log('NEXT_PUBLIC_COZE_API_TOKEN:', process.env.NEXT_PUBLIC_COZE_API_TOKEN);
  console.log('Token 长度:', process.env.NEXT_PUBLIC_COZE_API_TOKEN ? process.env.NEXT_PUBLIC_COZE_API_TOKEN.length : 0);
  console.log('Token 前10位:', process.env.NEXT_PUBLIC_COZE_API_TOKEN ? process.env.NEXT_PUBLIC_COZE_API_TOKEN.substring(0, 10) + '...' : '未设置');
}
