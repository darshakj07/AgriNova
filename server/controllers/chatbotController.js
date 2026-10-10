import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

export const processChat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const systemPrompt = {
      role: 'system',
      content: `You are AgriBot, the AI assistant for AgriNova.
AgriNova is an agricultural B2B marketplace platform connecting farmers with corporate buyers (wholesalers, processors, exporters).
You should assist users with information about agriculture, crop prices, platform features, best farming practices, logistics, and trading.
Keep your answers concise, professional, and helpful. Always provide actionable advice where applicable. Use a polite tone.`
    };

    // Construct message payload
    const messages = [
      systemPrompt,
      ...(history || []),
      { role: 'user', content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      // model: 'llama-3.3-70b-versatile',
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const reply = chatCompletion.choices[0]?.message?.content;

    if (!reply) {
      throw new Error('No reply from Groq API');
    }

    res.status(200).json({
      success: true,
      reply
    });

  } catch (error) {
    console.error('[Chatbot Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat request.',
      error: error.message
    });
  }
};
