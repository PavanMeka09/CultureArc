const { generateText } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');

// Initialize Google AI provider for Vercel AI SDK
const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY
});

/**
 * Review artifact content using Google Gemini via Vercel AI SDK
 * @param {Object} artifact - The artifact to review
 * @returns {Object} - Review result with isAppropriate, confidence, and reason
 */
const reviewArtifactContent = async (artifact) => {
    try {
        const prompt = `You are a content moderator for a cultural heritage preservation platform called CultureArc. 
        Your job is to review artifact submissions and determine if they are appropriate for the platform.

        Criteria for approval:
        1. The content must be related to cultural heritage, history, art, or archaeology
        2. The content must be educational, informative, or culturally significant
        3. No offensive, hateful, sexual, or violent content
        4. No spam, advertisements, or irrelevant content
        5. The description should provide meaningful cultural or historical context

        Please review the following artifact submission:

        Title: ${artifact.title}
        Description: ${artifact.description}
        Category: ${artifact.category}
        Era: ${artifact.era}
        Region: ${artifact.region}

        Respond in JSON format only with no markdown formatting:
        {
            "isAppropriate": true/false,
            "confidence": 0.0-1.0 (how confident you are in this decision),
            "reason": "Brief explanation of the decision"
        }`;

        const { text } = await generateText({
            model: google('gemini-1.5-flash'),
            prompt: prompt
        });

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const review = JSON.parse(jsonMatch[0]);
            return {
                isAppropriate: review.isAppropriate,
                confidence: review.confidence || 0.8,
                reason: review.reason || 'Content reviewed by AI',
                reviewedAt: new Date()
            };
        }

        // Default to approval if parsing fails but no errors
        return {
            isAppropriate: true,
            confidence: 0.5,
            reason: 'AI review completed - default approval',
            reviewedAt: new Date()
        };
    } catch (error) {
        console.error('AI Review Error:', error);
        // On error, mark as pending for manual review
        return {
            isAppropriate: null,
            confidence: 0,
            reason: `AI review failed: ${error.message}. Requires manual review.`,
            reviewedAt: new Date()
        };
    }
};

/**
 * Determine artifact status based on AI review
 * @param {Object} aiReview - The AI review result
 * @returns {string} - Status: 'approved', 'rejected', or 'pending'
 */
const determineStatus = (aiReview) => {
    if (aiReview.isAppropriate === null) {
        return 'pending'; // Needs manual review
    }
    if (aiReview.isAppropriate && aiReview.confidence >= 0.7) {
        return 'approved';
    }
    if (!aiReview.isAppropriate && aiReview.confidence >= 0.7) {
        return 'rejected';
    }
    return 'pending'; // Low confidence, needs manual review
};

module.exports = {
    reviewArtifactContent,
    determineStatus
};
