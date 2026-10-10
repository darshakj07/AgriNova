import Groq from 'groq-sdk';
import Message from '../models/Message.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize with env var to prevent crashes
const apiKey = process.env.GROQ_API_KEY || '';
const groq = new Groq({ apiKey });

const SYSTEM_PROMPT = `You are a strict, objective Trust & Safety AI Moderator for the AgriNova Marketplace.
Your job is to analyze buyer-farmer chat messages and automatically detect suspicious activity, fraud attempts, spam, abusive language, off-platform deals, and policy violations.

Detect:
* Phone Numbers
* WhatsApp Numbers
* Telegram Usernames
* Email Addresses
* Requests to move conversation outside platform
* Fraud Attempts
* Scam Indicators
* Abusive Language
* Spam Messages
* Suspicious Payment Discussions

Analyze this marketplace conversation.
Generate a risk score from 0-100 and explain the reason.
Assign a riskLevel: "Low" (0-30), "Medium" (31-69), or "High" (70-100).
Assign a category summarizing the main issue, or "Safe".
Provide a summary of the risk reason.
List specific policy violations detected.
Provide a suggestedAction (e.g., "None", "Warning", "Suspend", "Escalate").

Return JSON ONLY in this exact structure:
{
  "riskScore": 0,
  "riskLevel": "Low",
  "category": "Safe",
  "summary": "",
  "violations": [],
  "suggestedAction": "None"
}
`;

export const analyzeMessageInBackground = async (messageId) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) return;

    const sender = await User.findById(message.senderId);
    const receiver = await User.findById(message.receiverId);

    if (!sender || !receiver) return;

    const chatContext = `
Sender (${sender.role}): ${sender.firstName} ${sender.lastName || sender.companyName}
Receiver (${receiver.role}): ${receiver.firstName} ${receiver.lastName || receiver.companyName}
Message: "${message.text}"
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: chatContext }
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || '{}';
    const analysis = JSON.parse(aiResponse);

    const riskLevel = analysis.riskLevel || 'Low';
    let moderationStatus = 'Safe';
    
    if (riskLevel === 'High') moderationStatus = 'Flagged';
    else if (riskLevel === 'Medium') moderationStatus = 'Under Review';

    // Update Message
    message.analysis = {
      riskScore: analysis.riskScore || 0,
      riskLevel: riskLevel,
      category: analysis.category || 'Safe',
      summary: analysis.summary || '',
      violations: analysis.violations || [],
      suggestedAction: analysis.suggestedAction || 'None',
      analyzedAt: new Date()
    };
    message.moderationStatus = moderationStatus;

    await message.save();
    console.log(`[Moderation] Analyzed message ${messageId} - Score: ${message.analysis.riskScore} (${riskLevel})`);

  } catch (error) {
    console.error(`[Moderation Service Error] Failed to analyze message ${messageId}:`, error.message);
  }
};
