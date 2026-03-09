/**
 * Vercel Serverless Function - Image Generation using Google Generative AI
 * Endpoint: /api/generateImage
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
    const { 
      prompt, 
      identity, 
      characterName,
      dressImage,        
      gender,            
      country,         
      skinTone,      
      additionalPrompt  
    } = req.body;

    // Validate inputs
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.AI_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    // Build enhanced prompt with all options
    let enhancedPrompt = prompt;
    
    if (gender) {
      enhancedPrompt += ` [Gender: ${gender}]`;
    }
    
    if (country) {
      enhancedPrompt += ` [Country/Origin: ${country}]`;
    }
    
    if (skinTone) {
      enhancedPrompt += ` [Skin Tone: ${skinTone}]`;
    }
    
    if (identity && identity !== "default") {
      enhancedPrompt += ` [Style: ${identity}]`;
    }
    
    if (characterName) {
      enhancedPrompt += ` [Character: ${characterName}]`;
    }

    if (additionalPrompt && additionalPrompt.trim()) {
      enhancedPrompt += ` [Additional: ${additionalPrompt}]`;
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Prepare content array
    const contentArray = [];

    // Add dress image if provided
    if (dressImage) {
      contentArray.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: dressImage.replace(/^data:image\/[a-z]+;base64,/, ""), // Remove data URI prefix
        },
      });
    }

    // Add the prompt
    contentArray.push({
      text: `Generate a detailed image description for: ${enhancedPrompt}. 
      ${dressImage ? 'The user has uploaded a dress image that should be worn by the character in the generated image.' : ''}
      Provide: 1) A detailed visual description of the person wearing the outfit, 2) Color palette and styling, 3) Hair and makeup recommendations, 
      4) Technical specifications for image generation (resolution, aspect ratio, composition).`,
    });

    // Generate image using vision capabilities with dress image
    const response = await model.generateContent(contentArray);

    const description = response.response.text();

    // Return the generated description and metadata
    return res.status(200).json({
      success: true,
      generationId: `gen_${Date.now()}`,
      prompt: prompt,
      description: description,
      identity: identity || "default",
      characterName: characterName || null,
      gender: gender || null,
      country: country || null,
      skinTone: skinTone || null,
      hasDressImage: !!dressImage,
      timestamp: new Date().toISOString(),
      model: "gemini-2.0-flash",
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return res.status(500).json({
      error: "Failed to generate image",
      message: error.message,
    });
  }
}
