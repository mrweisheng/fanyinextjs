// DeepSeek API配置
const API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions';
const API_KEY = process.env.DEEPSEEK_API_KEY;

export async function POST(request) {
  try {
    // 检查API密钥
    if (!API_KEY) {
      return Response.json(
        { success: false, error: 'API密钥未配置' },
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
