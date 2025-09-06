// 调试API - 检查环境变量
function getEnvVar(key, defaultValue = '') {
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
    console.warn(`读取.env文件失败: ${error.message}`);
  }
  
  return defaultValue;
}

export async function GET() {
  const cozeToken = getEnvVar('NEXT_PUBLIC_COZE_API_TOKEN');
  const cozeUrl = getEnvVar('NEXT_PUBLIC_COZE_API_URL');
  const deepseekToken = getEnvVar('DEEPSEEK_API_KEY');
  
  return Response.json({
    success: true,
    debug: {
      workingDir: process.cwd(),
      envFileExists: require('fs').existsSync(require('path').join(process.cwd(), '.env.local')),
      cozeToken: {
        exists: !!cozeToken,
        length: cozeToken ? cozeToken.length : 0,
        prefix: cozeToken ? cozeToken.substring(0, 10) + '...' : '未设置'
      },
      cozeUrl: cozeUrl,
      deepseekToken: {
        exists: !!deepseekToken,
        length: deepseekToken ? deepseekToken.length : 0,
        prefix: deepseekToken ? deepseekToken.substring(0, 10) + '...' : '未设置'
      }
    }
  });
}
