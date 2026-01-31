const fs = require('fs/promises');
const path = require('path');
const { createWriteStream } = require('fs');
const { Readable } = require('stream');

class FileManager {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data/products.json');
        this.outputDir = path.join(__dirname, '../../output');
    }

    async saveJson(data) {
        try {
            await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
            await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2));
        } catch (error) {
            throw new Error(`File Storage Error: ${error.message}`);
        }
    }

    async saveAudio(audioStream, fileName) {
        try {
            await fs.mkdir(this.outputDir, { recursive: true });
            const filePath = path.join(this.outputDir, `${fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`);
            
            // ElevenLabs SDK returns a stream; we pipe it to a local file
            const writeStream = createWriteStream(filePath);
            Readable.from(audioStream).pipe(writeStream);

            return new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });
        } catch (error) {
            throw new Error(`Audio Storage Error: ${error.message}`);
        }
    }
}

module.exports = new FileManager();