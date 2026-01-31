require('dotenv').config();

function validateEnv() {
    const required = ['OPENAI_API_KEY', 'ELEVENLABS_API_KEY'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error(`❌ Critical Error: Missing environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }
}

module.exports = validateEnv;