// 直接从项目配置文件读取环境变量
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

// Coze API配置
const COZE_API_URL = getEnvVar('NEXT_PUBLIC_COZE_API_URL', 'https://api.coze.cn/v1/workflow/stream_run');
const COZE_API_TOKEN = getEnvVar('NEXT_PUBLIC_COZE_API_TOKEN');
const COZE_WORKFLOW_ID_EXTRACT = getEnvVar('NEXT_PUBLIC_COZE_WORKFLOW_ID_EXTRACT', '7511939386046218291');
const COZE_WORKFLOW_ID_DOWNLOAD = getEnvVar('NEXT_PUBLIC_COZE_WORKFLOW_ID_DOWNLOAD', '7527869690576699430');

export async function POST(request) {
  try {
    // 调试日志
    console.log('Coze API 代理调试信息:');
    console.log('- COZE_API_TOKEN:', COZE_API_TOKEN ? '已设置' : '未设置');
    console.log('- COZE_API_URL:', COZE_API_URL);
    
    // 检查API密钥
    if (!COZE_API_TOKEN) {
      return Response.json(
        { success: false, error: 'Coze API密钥未配置' },
        { status: 500 }
      );
    }

    const { workflow_id, input } = await request.json();
    
    // 检查参数
    if (!workflow_id || !input) {
      return Response.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    console.log('调用Coze API，工作流ID:', workflow_id);

    // 调用Coze API
    const response = await fetch(COZE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        "workflow_id": workflow_id,
        "parameters": {
          "input": input
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Coze API调用失败:', response.status, errorText);
      throw new Error(`Coze API调用失败: ${response.status} - ${errorText}`);
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
    console.error('Coze API代理出错:', error);
    
    return Response.json(
      { 
        success: false, 
        error: error.message || 'Coze API调用发生错误',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
