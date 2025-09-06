// 临时回退方案 - 如果前端还在直接调用 Coze API
export async function POST(request) {
  try {
    // 读取环境变量
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

    const COZE_API_URL = getEnvVar('NEXT_PUBLIC_COZE_API_URL', 'https://api.coze.cn/v1/workflow/stream_run');
    const COZE_API_TOKEN = getEnvVar('NEXT_PUBLIC_COZE_API_TOKEN');
    
    console.log('=== 回退方案调试信息 ===');
    console.log('- COZE_API_TOKEN 长度:', COZE_API_TOKEN ? COZE_API_TOKEN.length : 0);
    console.log('- COZE_API_URL:', COZE_API_URL);
    
    if (!COZE_API_TOKEN) {
      return Response.json(
        { success: false, error: 'Coze API密钥未配置' },
        { status: 500 }
      );
    }

    const requestBody = await request.json();
    console.log('请求体:', JSON.stringify(requestBody, null, 2));

    // 调用 Coze API
    const response = await fetch(COZE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Coze API 响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Coze API调用失败:', response.status, errorText);
      return Response.json(
        { success: false, error: `Coze API调用失败: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    // 返回流式响应
    const stream = new ReadableStream({
      start(controller) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        function pump() {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(new TextEncoder().encode(chunk));
            return pump();
          });
        }
        
        return pump();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('回退方案出错:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
