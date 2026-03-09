/**
 * Vercel Serverless Function - Virtual Reshoot (Avatar-based face swap) with Vertex AI
 * Endpoint: /api/virtual-reshoot
 * Method: POST
 *
 * Frontend sends:
 * - baseImages: array of data URLs (images and/or zip as data:application/zip;base64,...)
 * - avatarImageUrl: URL or data URL used as identity anchor
 * - gender, origin: optional metadata for logging/conditioning
 */

import { VertexAI } from "@google-cloud/vertexai";

let vertexAI = null;

function initializeVertexAI() {
	if (vertexAI) return vertexAI;

	const projectId = process.env.VERTEX_AI_PROJECT_ID;
	const location = process.env.VERTEX_AI_LOCATION || "us-central1";

	if (!projectId) {
		throw new Error("VERTEX_AI_PROJECT_ID environment variable is not set");
	}

	vertexAI = new VertexAI({ project: projectId, location });
	return vertexAI;
}

function dataUrlToInlineDataPart(maybeDataUrl) {
	if (typeof maybeDataUrl !== "string") {
		return { inlineData: { mimeType: "image/jpeg", data: "" } };
	}

	const match = maybeDataUrl.match(/^data:([^;]+);base64,(.*)$/);
	if (match) {
		return {
			inlineData: {
				mimeType: match[1] || "image/jpeg",
				data: match[2] || "",
			},
		};
	}

	// Assume raw base64 image
	return {
		inlineData: {
			mimeType: "image/jpeg",
			data: maybeDataUrl,
		},
	};
}

async function urlToInlineDataPart(imageUrl) {
	const response = await fetch(imageUrl, {
		method: "GET",
		headers: {
			Accept: "image/*",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch avatar image (${response.status})`);
	}

	const contentType = response.headers.get("content-type") || "image/jpeg";
	const buffer = Buffer.from(await response.arrayBuffer());
	const base64 = buffer.toString("base64");

	return {
		inlineData: {
			mimeType: contentType,
			data: base64,
		},
	};
}

function buildVirtualReshootPrompt({ gender, origin }) {
	return `You are performing a professional virtual reshoot.

The selected avatar image is the identity anchor.
Preserve the avatar's face, skin tone, ears, facial proportions, and ethnicity exactly.

The uploaded image is the base image.
Preserve body, pose, clothing, and background from the base image.

Replace only the face in the base image with the avatar face.

Ensure:
- Natural blending
- Correct skin tone matching
- Proper lighting adaptation
- No distortion
- No identity blending
- No clothing changes
- No body reshaping

If conflict occurs, prioritize avatar identity.
High realism. No artifacts.

Metadata:
- gender: ${gender || ""}
- origin: ${origin || ""}`;
}

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const {
			baseImages,
			avatarImageUrl,
			gender,
			origin,
			model = "gemini-2.0-flash",
			generationConfig,
		} = req.body || {};

		if (!Array.isArray(baseImages) || baseImages.length === 0) {
			return res.status(400).json({ error: "Missing baseImages" });
		}

		if (!avatarImageUrl || typeof avatarImageUrl !== "string") {
			return res.status(400).json({ error: "Missing avatarImageUrl" });
		}

		const ai = initializeVertexAI();

		const availableModels = ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"];
		if (!availableModels.includes(model)) {
			return res.status(400).json({
				error: `Invalid model. Available: ${availableModels.join(", ")}`,
			});
		}

		const generativeModel = ai.getGenerativeModel({ model });

		const prompt = buildVirtualReshootPrompt({ gender, origin });

		const avatarPart = avatarImageUrl.startsWith("http")
			? await urlToInlineDataPart(avatarImageUrl)
			: dataUrlToInlineDataPart(avatarImageUrl);

		const baseParts = baseImages.map((img) => dataUrlToInlineDataPart(img));

		const contents = [
			{
				role: "user",
				parts: [{ text: prompt }, avatarPart, ...baseParts],
			},
		];

		const finalGenerationConfig =
			generationConfig || {
				temperature: 0.1,
				topP: 0.9,
				topK: 40,
				maxOutputTokens: 4096,
			};

		const response = await generativeModel.generateContent({
			contents,
			generationConfig: finalGenerationConfig,
		});

		const candidateParts = response?.response?.candidates?.[0]?.content?.parts || [];
		const firstTextPart = candidateParts.find(
			(part) => typeof part?.text === "string" && part.text.trim()
		);
		const responseContent = firstTextPart?.text || "";

		const generationId = `virtual_reshoot_${Date.now()}`;
		const timestamp = new Date().toISOString();

		return res.status(200).json({
			success: true,
			generationId,
			model,
			analysisResponse: responseContent,
			baseCount: baseImages.length,
			avatarImageUrl,
			gender: gender || null,
			origin: origin || null,
			timestamp,
			note: "Gemini model provides analysis/guidance. For actual image generation, integrate with Imagen API or another image generation service.",
		});
	} catch (error) {
		console.error("Virtual reshoot error:", error);
		const message = error?.message || "Failed to process virtual-reshoot request";
		return res.status(500).json({
			error: "Virtual reshoot generation failed",
			message,
			hint: "Ensure Vertex AI credentials are configured and you can fetch the avatar image URL from the server.",
		});
	}
}
