🎧 AI Product Audio Summarizer (Backend Assessment)
📖 Overview

AI Product Audio Summarizer is a Node.js backend pipeline that:

Scrapes product-style content from a target website

Uses OpenAI to semantically extract and summarize items

Converts each summary into high-quality audio using ElevenLabs

Persists both structured JSON and generated .mp3 files locally

Unlike traditional scrapers that rely on fragile CSS selectors, this system uses LLM-powered semantic extraction. The model “reads” the page content and identifies meaningful entities, making the pipeline resilient to layout or markup changes.

The result is a fully automated flow:

Website → Structured Data → AI Summary → Audio Files

This project demonstrates practical backend engineering for AI products, including orchestration, retries, validation, and clean service separation.

🌐 Target Website (Scraping Source)

For this assessment, the pipeline was tested against:

https://quotes.toscrape.com/

Although this is a demo site, it behaves like a product listing:

Multiple repeatable items (quotes + authors)

Consistent content blocks

Publicly accessible HTML

Each quote is treated as a “product item” for extraction and summarization.

The architecture is site-agnostic, meaning you can replace this URL with almost any product-style website without changing scraper logic.

🏗️ System Architecture & Execution Flow

The service follows a strictly sequential orchestration model with resiliency layers for external APIs.

High-level flow:

Run Script
   ↓
Environment Validation
   ↓
Raw Website Scraping
   ↓
OpenAI Semantic Parsing
   ↓
Structured JSON Storage
   ↓
ElevenLabs Text-to-Speech
   ↓
Local Audio Persistence


Mermaid diagram:

```
graph TD
    Start((Run Script)) --> EnvCheck[Environment Validation]
    EnvCheck --> Scraper[Universal Scraper: Raw Content Fetch]
    Scraper --> OpenAI{AI Semantic Parser}

    subgraph "AI Extraction & Summarization"
    OpenAI -->|Retry on 429/500| Summarize[Generate 1–2 Sentence Summaries]
    Summarize --> JSON[Store Structured JSON]
    end

    JSON --> ElevenLabs{ElevenLabs TTS}

    subgraph "Audio Generation"
    ElevenLabs -->|Exponential Backoff| Audio[Generate 5 .mp3 Files]
    Audio --> LocalSave[Save to /output Folder]
    end

    LocalSave --> End((Task Complete))
```

📂 Project Structure

A modular, service-oriented layout was chosen to maximize clarity, testability, and separation of concerns.

```
├── src/
│   ├── services/
│   │   ├── scraper.service.js     # Site-agnostic raw HTML extraction
│   │   ├── openai.service.js      # Semantic parsing + structured JSON
│   │   └── elevenlabs.service.js  # Text-to-speech with retry logic
│   ├── utils/
│   │   ├── file-manager.js        # Local persistence (JSON + audio)
│   │   └── validate-env.js        # Pre-flight API key validation
│   └── index.js                   # Central orchestrator (entry point)
├── data/                          # Generated structured JSON (gitignored)
├── output/                        # Generated .mp3 files (gitignored)
├── .env                           # API credentials (gitignored)
├── .gitignore
└── README.md
```

Key Principle

Each file owns one responsibility only:

Scraping

AI extraction

Audio generation

Persistence

Orchestration

This avoids monolithic scripts and reflects real-world backend service design.

🚀 Getting Started
1. Prerequisites

->Node.js v18+

->OpenAI API key

->ElevenLabs API key

2. Installation
# Clone repository
git clone <your-repo-link>
cd <repo-folder>

# Install dependencies
npm install axios cheerio openai elevenlabs dotenv

3. Configuration

Create a .env file in the project root:

OPENAI_API_KEY=your_openai_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here


A startup validation ensures both keys exist before execution begins.

4. Run the Script

Execute the full pipeline:

node src/index.js


This performs:

1.Scraping

2.Semantic extraction

3.Summarization

4.JSON storage

5.Audio generation

On completion, you will find:

Structured product data in /data

Five generated .mp3 files in /output

🧠 Senior-Level Design Choices
✅ Site-Agnostic Scraping

Instead of brittle selectors, the scraper extracts raw readable content and delegates understanding to the LLM. This makes the system resilient to:

HTML restructuring

Class name changes

Minor layout updates

This mirrors how modern AI ingestion pipelines work in production.

✅ Semantic Extraction via OpenAI

OpenAI is used not just for summarization, but for structured understanding.

Key implementation detail:

JSON Schema with strict: true is enforced

Guarantees deterministic backend-friendly output

Eliminates defensive parsing logic downstream

This is critical for production reliability.

✅ Resiliency & Backoff

Both OpenAI and ElevenLabs calls include:

Retry handling for 429 / transient failures

Exponential backoff

This protects against:

Rate limits

Temporary network instability

Provider-side hiccups

A must-have for any real AI backend.

✅ Token & Input Optimization

Before sending data to OpenAI:

Raw HTML tags are stripped

Only meaningful text is retained

Benefits:

Reduced token usage

Lower cost

Improved model comprehension

✅ Clear Orchestration Layer

index.js acts as a central controller:

No business logic

Only sequencing + coordination

This mirrors production microservice orchestration patterns.

🔊 Audio Generation

Each summary is converted to speech using ElevenLabs.

Features:

Individual audio file per item

Automatic retries on failure

Files written to /output

Result:

Five independent, human-sounding .mp3 files generated per run.

🧪 Test Outcome

Using https://quotes.toscrape.com/:

Successfully extracted 5 items

Generated 1–2 sentence summaries for each

Produced 5 unique .mp3 audio files

Persisted structured JSON locally

End-to-end flow completed without manual intervention.

📊 Final CheckList
✔ Correctness & Execution Flow

Deterministic pipeline from scrape → audio

Explicit orchestration

Clear success path

✔ Code Clarity & Structure

Service-based architecture

Single-responsibility modules

Clean separation of concerns

✔ Practical Decision-Making

Semantic scraping over CSS selectors

Retry + backoff

Token optimization

Structured outputs

✔ Proper API Usage

OpenAI used for semantic extraction + summarization

ElevenLabs used exclusively for TTS

Both protected with validation + retries

✔ Documentation Quality

Explicit setup instructions

Clear execution steps

Architectural rationale

Testing outcomes