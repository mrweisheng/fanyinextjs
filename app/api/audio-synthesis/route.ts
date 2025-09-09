import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, voiceId, speed, vol } = body;

    const apiKey = process.env.MINIMAX_API_KEY;
    const groupId = process.env.MINIMAX_GROUP_ID;

    if (!apiKey || !groupId) {
      return NextResponse.json({ error: 'Missing API key or Group ID' }, { status: 500 });
    }

    const url = `https://api.minimax.io/v1/t2a_v2?GroupId=${groupId}`;

    const payload = {
      model: 'speech-2.5-hd-preview',
      text: text,
      stream: false,
      voice_setting: {
        voice_id: voiceId,
        speed: speed,
        vol: vol,
        pitch: 0,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: 'mp3',
        channel: 1,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiniMax API Error:', errorText);
      return NextResponse.json({ error: 'Failed to generate audio from MiniMax', details: errorText }, { status: response.status });
    }

    const data = await response.json();

    if (data.base_resp && data.base_resp.status_code !== 0) {
      return NextResponse.json({ error: '语音合成失败', details: data.base_resp.status_msg }, { status: 500 });
    }

    // Extract the hex-encoded audio data.
    const audioHex = data.data?.audio;

    if (!audioHex || typeof audioHex !== 'string') {
      console.error('Invalid response structure, audio data not found.', JSON.stringify(data, null, 2));
      return NextResponse.json({ error: '无效的响应数据结构，未找到音频数据' }, { status: 500 });
    }

    // Convert the hex string to a Base64 string.
    const audioBase64 = Buffer.from(audioHex, 'hex').toString('base64');

    return NextResponse.json({ audio: audioBase64 });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}