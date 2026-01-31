const OpenAI = require('openai');

class OpenAIService {
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async extractAndSummarize(rawText) {
        const response = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: "Extract exactly 5 products from the text. For each, provide a name and a 1-sentence summary. Return as JSON." 
                },
                { role: "user", content: `Text from website: ${rawText.substring(0, 10000)}` }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "extraction",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                            products: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        summary: { type: "string" }
                                    },
                                    required: ["name", "summary"],
                                    additionalProperties: false
                                }
                            }
                        },
                        required: ["products"],
                        additionalProperties: false
                    }
                }
            }
        });

        return JSON.parse(response.choices[0].message.content).products;
    }
}

module.exports = new OpenAIService();