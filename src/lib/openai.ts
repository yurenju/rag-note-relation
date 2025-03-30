import OpenAI from "openai";
import "dotenv/config";

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  async explainRelation(query: string, relatedText: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content:
            "你是一個專門分析文章關聯性的助手。請直接說明關聯性，不要加上「這兩段文字的關聯性在於」或類似的前綴。",
        },
        {
          role: "user",
          content: `原始文字：
${query}

相關文字：
${relatedText}

請以「原因：」開頭，直接說明這兩段文字的關聯性。`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const explanation = response.choices[0].message.content || "無法解釋關聯性";
    return explanation.startsWith("原因：")
      ? explanation
      : `原因：${explanation}`;
  }
}
