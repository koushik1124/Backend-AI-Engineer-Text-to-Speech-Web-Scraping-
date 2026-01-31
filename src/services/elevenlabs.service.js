const { ElevenLabsClient } = require('elevenlabs');

class TTSService {
    constructor() {
        this.client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
    }

    async generateAudio(text, fileName, retries = 2) {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                return await this.client.generate({
                    voice: "Rachel",
                    text: text,
                    model_id: "eleven_multilingual_v2",
                });
            } catch (error) {
                if (attempt === retries) throw new Error(`TTS failed after ${retries + 1} attempts: ${error.message}`);
                console.warn(`⚠️ TTS Attempt ${attempt + 1} failed. Retrying...`);
                await new Promise(res => setTimeout(res, 2000)); // 2-second delay
            }
        }
    }
}

module.exports = new TTSService();