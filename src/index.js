require('dotenv').config();
const validateEnv = require('./utils/validate-env'); 
const scraper = require('./services/scraper.service');
const openai = require('./services/openai.service');
const tts = require('./services/elevenlabs.service');
const fileManager = require('./utils/file-manager');

// The only thing to change for different sites, no need to modify core logic
const TARGET_URL = 'https://quotes.toscrape.com/'; 

async function runAssessment() {
    validateEnv();

    console.log("🚀 Initializing Universal Backend AI Assessment Flow...");

    try {
        // Step 1: Semantic Scraping (Fetch raw content from any site)
        console.log(`🔍 Step 1: Fetching raw content from ${TARGET_URL}...`);
        const rawHtml = await scraper.getRawContent(TARGET_URL);
        
        // Step 2 & 3 Combined: AI Semantic Extraction & Summarization
        // This makes the script site-agnostic by letting the LLM identify products
        console.log("🤖 Step 2 & 3: AI is extracting and summarizing 5 products...");
        const products = await openai.extractAndSummarize(rawHtml);

        // Step 4: Storage (Store the AI-extracted data locally in JSON format at data folder)
        console.log("💾 Step 4: Saving structured data to local storage...");
        await fileManager.saveJson(products);

        // Step 5: TTS & Audio Output (Generate audio files for each summary)
        console.log("🎙️   Step 5: Converting summaries to audio...");
        for (const item of products) {
            console.log(`   - Processing audio for: ${item.name}`);
            
            const audioStream = await tts.generateAudio(item.summary, item.name);
            await fileManager.saveAudio(audioStream, item.name);
        }

        console.log("\n✅ Assessment Complete! 5 audio files generated in /output.");
    } catch (error) {
        console.error("\n❌ Critical Flow Error:");
        console.error(`[Context: ${error.stage || 'General Execution'}] ${error.message}`);
        process.exit(1);
    }
}

runAssessment();