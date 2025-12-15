const { google } = require('@ai-sdk/google');
const { generateObject } = require('ai');
const { z } = require('zod');

// Schema for the AI response
const authenticitySchema = z.object({
    authenticityScore: z.number().min(0).max(100).describe('A score from 0 to 100 indicating the likelihood of the artifact being authentic and culturally significant.'),
    isAuthentic: z.boolean().describe('Whether the artifact is considered authentic enough for the platform (score >= 70).'),
    feedback: z.string().describe('Detailed feedback explaining why the artifact was accepted or rejected. Mention specific historical or visual discrepancies if rejected.'),
});

/**
 * @desc    Analyze artifact image and details for authenticity
 * @route   POST /api/ai/analyze
 * @access  Private
 */
const analyzeArtifact = async (req, res) => {
    try {
        const { title, description, category, era, region, imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ message: 'Image URL is required for analysis' });
        }

        const prompt = `
      You are an expert historian and artifact appraiser. 
      Analyze the following artifact based on its image and details:
      
      Title: ${title}
      Category: ${category}
      Era: ${era}
      Region: ${region}
      Description: ${description}

      Your task is to determine if this item appears to be a genuine cultural artifact suitable for a digital museum.
      
      Criteria for Authenticity:
      1. Visual consistency with the stated Era and Region.
      2. Plausibility of the artifact's existence and description.
      3. Rejection of obvious modern items, memes, low-quality internet images that are clearly not artifacts, or items that are explicitly labeled as replicas/fakes without context.
      
      Provide a strict assessment.
    `;

        const { object } = await generateObject({
            model: google('gemini-flash-latest'),
            schema: authenticitySchema,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image', image: new URL(imageUrl) },
                    ],
                },
            ],
        });

        res.json(object);

    } catch (error) {
        console.error('AI Analysis Error:', error);
        res.status(500).json({
            message: 'Failed to analyze artifact',
            error: error.message
        });
    }
};

module.exports = {
    analyzeArtifact
};
