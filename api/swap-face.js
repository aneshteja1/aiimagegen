/**
 * Vercel Serverless Function - Swap Face Image Generation with Vertex AI
 * Endpoint: /api/swap-face
 * Method: POST
 *
 * Uses Google Vertex AI with Gemini models for image generation and face swapping.
 * Environment Variables Required:
 * - VERTEX_AI_PROJECT_ID: Google Cloud Project ID
 * - VERTEX_AI_LOCATION: Region (e.g., us-central1)
 * - GOOGLE_APPLICATION_CREDENTIALS: Path to service account JSON (for local)
 * - VERTEX_AI_CREDENTIALS_BASE64: Base64 encoded service account (for production)
 */

import { VertexAI } from "@google-cloud/vertexai";

// Initialize Vertex AI
let vertexAI = null;

function initializeVertexAI() {
	if (vertexAI) return vertexAI;

	const projectId = process.env.VERTEX_AI_PROJECT_ID;
	const location = process.env.VERTEX_AI_LOCATION || "us-central1";

	if (!projectId) {
		throw new Error("VERTEX_AI_PROJECT_ID environment variable is not set");
	}

	vertexAI = new VertexAI({
		project: projectId,
		location,
	});

	return vertexAI;
}

function normalizeInlineDataPart(part) {
	if (!part || typeof part !== "object") return part;
	if (!part.inlineData || typeof part.inlineData !== "object") return part;

	const mimeType = part.inlineData.mimeType || "image/jpeg";
	const data = part.inlineData.data;
	if (typeof data !== "string") {
		return { ...part, inlineData: { mimeType, data: "" } };
	}

	const match = data.match(/^data:([^;]+);base64,(.*)$/);
	if (match) {
		return {
			...part,
			inlineData: {
				mimeType: match[1] || mimeType,
				data: match[2] || "",
			},
		};
	}

	return {
		...part,
		inlineData: {
			mimeType,
			data,
		},
	};
}

function dataUrlToInlineDataPart(imgData) {
	if (typeof imgData !== "string") {
		return {
			inlineData: {
				mimeType: "image/jpeg",
				data: "",
			},
		};
	}

	const match = imgData.match(/^data:([^;]+);base64,(.*)$/);
	if (match) {
		return {
			inlineData: {
				mimeType: match[1] || "image/jpeg",
				data: match[2] || "",
			},
		};
	}

	// Assume raw base64
	return {
		inlineData: {
			mimeType: "image/jpeg",
			data: imgData,
		},
	};
}

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const {
			inputImages,
			referenceImages,
			prompt,
			userId,
			model = "gemini-2.0-flash",
			// Optional: allow callers to send the raw Gemini/Vertex payload directly
			contents,
			generationConfig,
			generation_config,
		} = req.body || {};

		const usingRawContents = Array.isArray(contents) && contents.length > 0;
		if (!usingRawContents) {
			// Validate legacy inputs
			if (!Array.isArray(inputImages) || inputImages.length === 0) {
				return res.status(400).json({
					error: "Missing input images",
					details: { inputImages: false },
				});
			}

			if (!Array.isArray(referenceImages) || referenceImages.length === 0) {
				return res.status(400).json({
					error: "Missing reference images",
					details: { referenceImages: false },
				});
			}

			if (!prompt || !prompt.trim()) {
				return res.status(400).json({ error: "Prompt is required" });
			}
		}

		// Initialize Vertex AI
		const ai = initializeVertexAI();

		// Validate model is available
		const availableModels = ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"];
		if (!availableModels.includes(model)) {
			return res.status(400).json({
				error: `Invalid model. Available: ${availableModels.join(", ")}`,
			});
		}

		const generativeModel = ai.getGenerativeModel({
			model,
		});

		let requestContents;
		if (usingRawContents) {
			// Normalize any accidental data URLs inside inlineData.data
			requestContents = contents.map((content) => {
				const role = content?.role || "user";
				const parts = Array.isArray(content?.parts) ? content.parts : [];
				return {
					...content,
					role,
					parts: parts.map((part) => normalizeInlineDataPart(part)),
				};
			});
		} else {
			// Convert all images to inline data format
			const imagePartsInput = inputImages.map((imgData) => dataUrlToInlineDataPart(imgData));
			const imagePartsReference = referenceImages.map((imgData) => dataUrlToInlineDataPart(imgData));

			// Build the full prompt with reference images context
			const fullPrompt = `
You are an expert at realistic face and identity swapping while preserving clothing and style.

Reference Identity Images (to swap FROM):
[Reference images provided below]

Target Images (to swap TO clothing/poses):
[Target images showing desired clothing/poses provided below]

${prompt}

Generate transformed images where the reference identity is applied to the target pose/clothing.
`;

			// Match the payload shape you shared: role + parts with text + inlineData
			requestContents = [
				{
					role: "user",
					parts: [{ text: fullPrompt }, ...imagePartsReference, ...imagePartsInput],
				},
			];
		}

		const finalGenerationConfig =
			generationConfig ||
			generation_config || {
				temperature: 0.8,
				topP: 0.9,
				topK: 40,
				maxOutputTokens: 4096,
			};

		const requestPayload = {
			contents: requestContents,
			generationConfig: finalGenerationConfig,
		};

		// Call Vertex AI API
		const response = await generativeModel.generateContent(requestPayload);

		// Extract response content
		const candidateParts = response?.response?.candidates?.[0]?.content?.parts || [];
		const firstTextPart = candidateParts.find((part) => typeof part?.text === "string" && part.text.trim());
		const responseContent = firstTextPart?.text || "";

		// Since Gemini returns text/analysis, we need to inform the user
		// In a production setup, you would:
		// 1. Use a dedicated image generation model if available
		// 2. Or parse the response and call image generation APIs separately
		// 3. Or use Imagen API for actual image generation

		const generationId = `swap_${Date.now()}`;
		const timestamp = new Date().toISOString();

		// For now, return analysis with note about image generation limitations
		return res.status(200).json({
			success: true,
			generationId,
			model,
			analysisResponse: responseContent,
			inputCount: inputImages.length,
			referenceCount: referenceImages.length,
			userId: userId || null,
			promptUsed: prompt,
			timestamp,
			note: "Gemini model provides analysis/guidance. For actual image generation, integrate with Imagen API or alternative image generation service.",
			recommendation: "For production face swapping, consider using: 1) Replicate API, 2) FAI API, 3) Custom ML model, or 4) Runway ML",
		});
	} catch (error) {
		console.error("Swap face error:", error);
		const message = error?.message || "Failed to process swap-face request";
		return res.status(500).json({
			error: "Swap face generation failed",
			message,
			hint: "Ensure Vertex AI credentials are configured and you have access to the project.",
		});
	}
}
