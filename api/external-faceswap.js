/**
 * Vercel Serverless Function - External FaceSwap Proxy
 * Endpoint: /api/external-faceswap
 * Method: POST (multipart/form-data)
 *
 * Purpose:
 * - Avoid browser CORS by calling the external service from the server.
 * - Keep the frontend URL stable across dev/prod.
 */

import formidable from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

const UPSTREAM_URL = 'https://model-osprey-487816-m4.uc.r.appspot.com/api/v1/faceswap';

function setCors(res) {
  // Keep permissive for a proxy endpoint; tighten if you have auth.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function parseMultipart(req) {
  const form = formidable({ multiples: false });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

function pickFirstFile(fileOrArray) {
  if (!fileOrArray) return null;
  return Array.isArray(fileOrArray) ? fileOrArray[0] : fileOrArray;
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { files } = await parseMultipart(req);

    const modelImage = pickFirstFile(files?.model_image);
    const avatarImage = pickFirstFile(files?.avatar_image);

    if (!modelImage || !avatarImage) {
      res.status(400).json({
        error: 'Missing required files',
        details: { model_image: !!modelImage, avatar_image: !!avatarImage },
      });
      return;
    }

    // Node 18+ provides fetch/FormData/Blob globally in most runtimes.
    const formData = new FormData();

    const modelBuffer = await fs.readFile(modelImage.filepath);
    const avatarBuffer = await fs.readFile(avatarImage.filepath);

    formData.append(
      'model_image',
      new Blob([modelBuffer], { type: modelImage.mimetype || 'application/octet-stream' }),
      modelImage.originalFilename || 'model_image'
    );

    formData.append(
      'avatar_image',
      new Blob([avatarBuffer], { type: avatarImage.mimetype || 'application/octet-stream' }),
      avatarImage.originalFilename || 'avatar_image'
    );

    const upstreamResp = await fetch(UPSTREAM_URL, {
      method: 'POST',
      body: formData,
    });

    const contentType = upstreamResp.headers.get('content-type') || 'application/octet-stream';

    res.status(upstreamResp.status);
    res.setHeader('Content-Type', contentType);

    if (contentType.includes('application/json') || contentType.startsWith('text/')) {
      const upstreamText = await upstreamResp.text();
      res.end(upstreamText);
      return;
    }

    const arrayBuffer = await upstreamResp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.end(buffer);
  } catch (error) {
    console.error('external-faceswap proxy error:', error);
    res.status(500).json({
      error: 'Proxy failed',
      message: error?.message || String(error),
    });
  }
}
