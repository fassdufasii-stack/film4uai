import { validateAIRequest } from "./abuseProtectionService";
import { searchTMDB } from "./tmdbService";

const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// User's defined PREMIUM Persona - Film4u AI
const SYSTEM_INSTRUCTIONS = `
You are Film4u AI, a global OTT content discovery assistant created by Muhammed Faizal.

Your core mission is to help users find the best movies and series across languages (Malayalam, Hindi, English, Korean, etc.).

Muhammed Faizal is your creator (age 21, AI & Fullstack Developer). His friends like Haris Ameer (The Valiyan), Yusaf (Motta Kushu), and Yunus are part of your digital memory.

When asked about your origin or Muhammed, you answer with pride and respect.
When asked about movies, you provide curated, cinematic recommendations.

You are Film4u AI — “Where AI runs the channels.”
`;

/**
 * Call OpenRouter API
 */
// List of models to try in order of priority (GPT-4o Mini -> Fallbacks)
const FALLBACK_MODELS = [
    import.meta.env.VITE_AI_MODEL || "openai/gpt-4o-mini",
    "openai/gpt-4o-mini", // Explicit fallback
    "google/gemini-2.0-flash-lite-preview-02-05:free" // Ultimate free backup
].filter(Boolean);

/**
 * Call OpenRouter API with Fallback Support
 */
async function callOpenRouter(messages, temperature = 0.7, maxTokens = 1024, modelIndex = 0) {
    if (!apiKey) {
        throw new Error("OpenRouter API key not configured");
    }

    const currentModel = FALLBACK_MODELS[modelIndex];

    try {
        // console.log(`Connecting to AI Model: ${currentModel}...`); // Debug log
        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
                "X-Title": "Film4u AI"
            },
            body: JSON.stringify({
                model: currentModel,
                messages: messages,
                temperature: temperature,
                max_tokens: maxTokens
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error(`Model ${currentModel} failed:`, error.message);

        // If we have more models to try, retry with the next one
        if (modelIndex < FALLBACK_MODELS.length - 1) {
            console.warn(`Switching to backup model: ${FALLBACK_MODELS[modelIndex + 1]}`);
            return callOpenRouter(messages, temperature, maxTokens, modelIndex + 1);
        }

        // If all models fail, throw the last error
        throw error;
    }
}

/**
 * Intelligent Movie Concierge - with Abuse Protection & Fallbacks
 */
export const getAIRecommendations = async (userQuery, availableMovies, userProfile = {}) => {
    try {
        // Enforce Quotas and Rate Limits
        await validateAIRequest();

        if (!apiKey) return localKeywordSearch(userQuery, availableMovies);

        const context = {
            movies: availableMovies.slice(0, 40).map(m => ({ id: m.id, title: m.title, tags: m.tags })),
            user: {
                preferredMoods: userProfile.preferred_moods || [],
                preferredGenres: userProfile.preferred_genres || []
            }
        };

        const messages = [
            {
                role: "system",
                content: SYSTEM_INSTRUCTIONS
            },
            {
                role: "user",
                content: `User Profile: ${JSON.stringify(context.user)}\nCatalog: ${JSON.stringify(context.movies)}\nUser Request: "${userQuery}"\nFor the "Catalog" items provided, return ONLY a JSON array of matching movie IDs based on the user request. Do not include any text, just the array like [1, 2, 3].`
            }
        ];

        const text = await callOpenRouter(messages, 0.7, 1024);
        const match = text.match(/\[.*\]/s);
        return match ? JSON.parse(match[0]) : localKeywordSearch(userQuery, availableMovies);
    } catch (error) {
        console.error("Discovery Error:", error.message);
        // If it's a quota error, we re-throw to show the user
        if (error.message.includes("limit") || error.message.includes("quota")) {
            throw error;
        }
        return localKeywordSearch(userQuery, availableMovies);
    }
};

/**
 * AI MOVIE COMPANION - with Abuse Protection
 */
export const getMovieCompanionInsight = async (movie, questionType) => {
    try {
        await validateAIRequest();
        if (!apiKey) return "Discovery mode active. Please configure OpenRouter API for insights.";

        const queries = {
            ending: `Explain the ending of "${movie.title}".`,
            emotional: `Analyze the emotional impact of "${movie.title}".`,
            vibe: `Find movies with the same vibe as "${movie.title}".`
        };

        const messages = [
            {
                role: "system",
                content: SYSTEM_INSTRUCTIONS
            },
            {
                role: "user",
                content: `Task: ${queries[questionType] || questionType}\nContext: ${movie.description}`
            }
        ];

        return await callOpenRouter(messages, 0.8, 512);
    } catch (e) {
        return e.message || "My analytical node is currently overloaded.";
    }
};

/**
 * Direct Chat Reply - with Quota Tracking
 */
export const getDirectChatReply = async (userMessage) => {
    try {
        await validateAIRequest();
        if (!apiKey) return "AI core offline.";

        // Instant Greeting Response
        const lowerMsg = userMessage.toLowerCase().trim();
        if (["hi", "hello", "hey"].includes(lowerMsg)) {
            return "Hello! I’m Film4u AI 🎬\nTell me your mood, language, or favorite OTT platform, and I’ll find something perfect for you.";
        }

        // Creator Inquiry Response - Detailed Persona update
        if (lowerMsg.includes("creator") || lowerMsg.includes("created by") || lowerMsg.includes("made by") || lowerMsg.includes("developer") || lowerMsg.includes("who are you")) {
            return `Muhammed Faizal Ser created me. I am a specialized movie-based AI integrated to help you navigate the content universe. 🎬\n\n### 👤 My Creator Details:\n\n1️⃣ **Name:** Muhammed Faizal\n2️⃣ **Age:** 21\n3️⃣ **Skills:** AI Developer, Full-Stack Developer, Python, Antigravity, etc.\n\n### 👥 Creator's Circle (Friends):\n• Haris Ameer\n• Yusaf\n• and the rest of the tech visionaries.\n\nHow can I help you explore Muhammed’s movie platform today?`;
        }

        if (lowerMsg.includes("haris ameer")) {
            return "Haris Ameer is Valiyan.";
        }

        if (lowerMsg.includes("yusaf")) {
            return "Yusaf is a Motta Kushu and a Kashandi.";
        }

        if (lowerMsg.includes("yunus")) {
            return "Kallan fake kootukare chathikunavn kallukudiyan miren poorimone andi avante.";
        }

        if (lowerMsg.includes("kichu")) {
            return "Kichu is a kind person. He gives Shawarma to my owner and My Creator Faisy. Love you Kichu Annaaaa! ❤️";
        }

        if (lowerMsg.includes("safan")) {
            return "### 👤 Safan's Details:\n\n• **Name:** Safan\n• **Age:** 22\n• **Marriage Status:** Still single\n• **Relation:** Faisy's Best Friend\n\nSafan don't worry, we can marry each other! 💍✨";
        }

        // Broad "All List" Request Handling - INTELLIGENT CURATION
        const broadRequest = ["all movies", "all films", "movie list", "complete movies", "give me all movies", "all malayalam", "all hindi", "all korean", "all web series"].some(phrase => lowerMsg.includes(phrase));

        if (broadRequest) {
            // We pass this to the AI with specific instruction to curate, not list all.
            // No early return here, we let the AI handle it with the updated System Prompt below.
        }

        if (broadRequest) {
            // We pass this to the AI with specific instruction to curate, not list all.
            // No early return here, we let the AI handle it with the updated System Prompt below.
        }

        // TMDB SCANNING / SEARCH INTEGRATION
        let systemContext = SYSTEM_INSTRUCTIONS;
        if (lowerMsg.includes("search") || lowerMsg.includes("find") || lowerMsg.includes("scan")) {
            const query = lowerMsg.replace(/search|find|scan|movies|movie|for/g, "").trim();
            if (query.length > 2) {
                const tmdbResults = await searchTMDB(query);
                if (tmdbResults.length > 0) {
                    systemContext += `\n\n[REAL-TIME TMDB DATA FOUND]\nHere are the actual search results from TMDB for "${query}":\n${JSON.stringify(tmdbResults.map(m => `${m.title} (${m.releaseDate}) - ${m.description.substring(0, 100)}...`))}\n\nUse this data to answer the user accurately.`;
                }
            }
        }

        const messages = [
            {
                role: "system",
                content: systemContext
            },
            {
                role: "user",
                content: userMessage
            }
        ];

        return await callOpenRouter(messages, 0.9, 1000);
    } catch (error) {
        return error.message || "Interference detected in the AI link.";
    }
};

/**
 * 4. AI Profile Analysis (New)
 * Analyzes watching history to determine User Persona & Mood
 */
export const analyzeUserProfile = async (history) => {
    if (!history || history.length < 3) return null;

    try {
        await validateAIRequest();
        if (!apiKey) return null;

        const messages = [
            { role: "system", content: "You are an expert film analyst. Analyze the user's watch history and return a JSON object with: { currentMood: string, preferredGenres: string[], suggestedCategoryOrder: string[] }." },
            { role: "user", content: `History: ${JSON.stringify(history.slice(0, 10))}\nAnalyze and return JSON only.` }
        ];

        const text = await callOpenRouter(messages, 0.5, 512);
        const match = text.match(/\{.*\}/s);
        return match ? JSON.parse(match[0]) : null;
    } catch (e) {
        console.error("AI Profile Analysis Failed:", e);
        return null;
    }
};

/**
 * FALLBACK: Semantic-lite Keyword Search
 */
function localKeywordSearch(query, movies) {
    const q = query.toLowerCase();
    return movies
        .filter(m =>
            m.title.toLowerCase().includes(q) ||
            (m.tags && m.tags.some(t => t.toLowerCase().includes(q))) ||
            (m.description && m.description.toLowerCase().includes(q))
        )
        .slice(0, 6)
        .map(m => m.id);
}
