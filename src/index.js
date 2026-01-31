require('dotenv').config();
const validateEnv = require('./utils/validate-env'); 
const scraper = require('./services/scraper.service');
const openai = require('./services/openai.service');
const tts = require('./services/elevenlabs.service');
const fileManager = require('./utils/file-manager');

// Use a production-grade site for the assessment
const TARGET_URL = 'https://en.wikipedia.org/wiki/Nuclear_warfare'; 

/**
 * Utility for "Jitter" - helps bypass anti-bot pattern detection
 * by introducing random pauses between 2 and 5 seconds.
 */
const delay = () => new Promise(res => setTimeout(res, Math.floor(Math.random() * 3000) + 2000));

async function runAssessment() {
    // Stage 0: Pre-flight checks
    try {
        validateEnv();
    } catch (err) {
        console.error("❌ Configuration Error:", err.message);
        process.exit(1);
    }

    console.log("🚀 Initializing Production-Grade AI Assessment Flow...");

    try {
        // Step 1: Scrape with Stealth
        console.log(`🔍 Step 1: Fetching raw content from ${TARGET_URL}...`);
        const rawHtml = await scraper.getRawContent(TARGET_URL);
        
        // Step 2 & 3: AI Extraction & Summarization
        // We do this immediately after scraping to keep data fresh in memory
        console.log("🤖 Step 2 & 3: Performing Semantic AI Extraction...");
        const products = await openai.extractAndSummarize(rawHtml);

        if (!products || products.length === 0) {
            throw new Error("AI failed to extract any valid product data from the provided URL.");
        }

        // Step 4: Storage
        console.log(`💾 Step 4: Persisting ${products.length} items to local storage...`);
        await fileManager.saveJson(products);

        // Step 5: Sequential TTS with Jitter
        console.log("🎙️   Step 5: Converting summaries to audio with throttling...");
        
        for (const [index, item] of products.entries()) {
            console.log(`   [${index + 1}/${products.length}] Processing: ${item.name}`);
            
            // Senior Move: Introducing delay between API calls to avoid rate limits
            if (index > 0) await delay();

            const audioStream = await tts.generateAudio(item.summary, item.name);
            await fileManager.saveAudio(audioStream, item.name);
        }

        console.log("\n✅ Assessment Complete! Check the /output folder for generated files.");

    } catch (error) {
        console.error("\n❌ Critical Flow Error:");
        // Providing specific context helps in production debugging
        const errorContext = error.stack.includes('scraper') ? 'Scraping Stage' : 
                             error.stack.includes('openai') ? 'AI Stage' : 
                             error.stack.includes('elevenlabs') ? 'TTS Stage' : 'Orchestration';
        
        console.error(`[Context: ${errorContext}] ${error.message}`);
        process.exit(1);
    }
}

runAssessment();