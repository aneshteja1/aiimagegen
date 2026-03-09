/**
 * Vercel Serverless Function - Video Generation using Google Generative AI
 * Endpoint: /api/generateVideo
 * Method: POST
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.AI_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, characterName, origin, duration } = req.body;

    // Validate inputs
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.AI_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    // Build enhanced prompt for video
    let enhancedPrompt = prompt;
    
    if (characterName) {
      enhancedPrompt += ` [Character: ${characterName}]`;
    }
    
    if (origin) {
      enhancedPrompt += ` [Origin: ${origin}]`;
    }

    const videoDuration = duration || 15; // Default 15 seconds

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Generate video script and storyboard
    const response = await model.generateContent([
      {
        text: `Create a detailed video storyboard and script for a ${videoDuration}-second video with: ${enhancedPrompt}
        
        Provide in this format:
        1. VIDEO TITLE
        2. OVERALL CONCEPT (2-3 sentences)
        3. SCENE-BY-SCENE BREAKDOWN (for ${videoDuration} seconds total):
           - Scene 1: [duration] seconds - [description]
           - Scene 2: [duration] seconds - [description]
           ... etc
        4. SCRIPT/DIALOGUE (if applicable)
        5. VISUAL STYLE NOTES
        6. TECHNICAL SPECS (resolution, frame rate, aspect ratio)
        7. MUSIC/SOUND RECOMMENDATIONS`,
      },
    ]);

    const storyboard = response.response.text();

    // Return video generation metadata
    return res.status(200).json({
      success: true,
      generationId: `vid_${Date.now()}`,
      prompt: prompt,
      storyboard: storyboard,
      characterName: characterName || null,
      origin: origin || null,
      duration: videoDuration,
      timestamp: new Date().toISOString(),
      model: "gemini-2.0-flash",
      status: "storyboard_generated",
      note: "For actual video generation, integrate with Google Vertex AI Video Generation API",
    });
  } catch (error) {
    console.error("Video generation error:", error);
    return res.status(500).json({
      error: "Failed to generate video",
      message: error.message,
    });
  }
}
