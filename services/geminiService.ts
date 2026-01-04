import { GoogleGenAI, Type } from "@google/genai";
import { SwapAssessment, Product, AiMarketAnalysis, AiDeliveryQuote, AiSellerInsight, ComparisonResult } from "../types";

// Helper to get a fresh client instance every time
const getAiClient = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const MODEL_ID = "gemini-3-flash-preview";

// Helper for safe JSON parsing
const safeJsonParse = <T>(text: string, fallback: T): T => {
    try {
        // Clean markdown code blocks if present
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanText) as T;
    } catch (e) {
        console.warn("JSON Parse Error:", e);
        return fallback;
    }
};

export const analyzeSwapParams = async (
  userDeviceImageBase64: string,
  userDeviceDescription: string,
  targetDevicePrice: number
): Promise<SwapAssessment> => {
  try {
    const ai = getAiClient();
    const promptText = `
      You are the "FairTrade AI Pricing Engine" specialized for the Nigerian Tech Market (Computer Village Ikeja / Banex Abuja).
      
      Task: Value a user's device for a trade-in swap.
      User's Device Description: "${userDeviceDescription}".
      Target Device Price (Buying): ₦${targetDevicePrice}.
      
      1. Analyze the image for visual condition (scratches, dents, screen cracks).
      2. Distinguish between 'UK Used' (Grade A) and 'Nigerian Used' (Grade B/C).
      3. Estimate the "True Market Value" in Nigerian Naira (NGN).
      4. Calculate "Trade-in Value": Offer 20% less than Market Value (Seller Margin).
      5. Calculate "Top-up Amount": Target Price - Trade-in Value.
      
      Return valid JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: userDeviceImageBase64 } },
          { text: promptText }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedCondition: { type: Type.STRING },
            marketValue: { type: Type.NUMBER },
            tradeInValue: { type: Type.NUMBER },
            topUpAmount: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            sellerProfitMargin: { type: Type.NUMBER }
          },
          required: ["estimatedCondition", "marketValue", "tradeInValue", "topUpAmount", "reasoning", "sellerProfitMargin"]
        }
      }
    });

    if (response.text) {
      return safeJsonParse<SwapAssessment>(response.text, {
        estimatedCondition: "Unknown",
        marketValue: 0,
        tradeInValue: 0,
        topUpAmount: targetDevicePrice,
        reasoning: "AI analysis failed.",
        sellerProfitMargin: 0
      });
    }
    throw new Error("No response text");

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      estimatedCondition: "Error",
      marketValue: 0,
      tradeInValue: 0,
      topUpAmount: targetDevicePrice,
      reasoning: "System could not process image. Please try again.",
      sellerProfitMargin: 0
    };
  }
};

export const generateListingDetails = async (imageBase64: string): Promise<{
    name: string;
    category: string;
    description: string;
    price: number;
    condition: string;
}> => {
    try {
        const ai = getAiClient();
        const prompt = `
            Analyze this tech device image for a Nigerian marketplace listing.
            1. Identify Product Name (e.g. iPhone 13 Pro Max, HP EliteBook).
            2. Determine Category.
            3. Write a compelling description focusing on "Clean UK Used" or "Direct Tokunbo" aspects if applicable.
            4. Estimate price in Naira (NGN).
            5. Estimate Condition.
            
            Return JSON.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        category: { type: Type.STRING },
                        description: { type: Type.STRING },
                        price: { type: Type.NUMBER },
                        condition: { type: Type.STRING }
                    },
                    required: ["name", "category", "description", "price", "condition"]
                }
            }
        });

        if (response.text) {
             return safeJsonParse(response.text, {
                name: "Unknown Device",
                category: "Phone",
                description: "Auto-detection failed.",
                price: 0,
                condition: "Good"
             });
        }
        throw new Error("No response");
    } catch (e) {
        return {
            name: "Unknown Device",
            category: "Phone",
            description: "Could not auto-generate description.",
            price: 0,
            condition: "Good"
        };
    }
};

export const generateNegotiationReply = async (
  history: { role: string, text: string }[],
  currentOffer: number,
  productPrice: number,
  tone: 'friendly' | 'firm' | 'neutral' = 'neutral'
): Promise<{ text: string, accepted: boolean }> => {
    try {
        const ai = getAiClient();
        const toneMap = {
            friendly: "Use friendly Nigerian Pidgin English (e.g., 'My boss', 'No wahala').",
            firm: "Be strict. 'Last price'. Computer Village style.",
            neutral: "Professional and polite."
        };

        const prompt = `
            Act as a seller in Nigeria negotiating a price.
            Product Price: ₦${productPrice}.
            Current Offer: ₦${currentOffer}.
            Tone: ${toneMap[tone]}.
            
            History: ${JSON.stringify(history)}
            
            Logic:
            - If offer > 90% price: Accept.
            - If offer < 50% price: Reject firmly.
            - Else: Counter-offer.
            
            Return JSON: { "text": string, "accepted": boolean }
        `;

        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        accepted: { type: Type.BOOLEAN }
                    },
                    required: ["text", "accepted"]
                }
            }
        });

        if (response.text) return safeJsonParse(response.text, { text: "Network error.", accepted: false });
        return { text: "Let's discuss more.", accepted: false };

    } catch (e) {
        return { text: "I'm having trouble thinking right now.", accepted: false };
    }
};

export const semanticSearchProducts = async (query: string, products: Product[]): Promise<string[]> => {
    try {
        const ai = getAiClient();
        const prompt = `
            Search Query: "${query}"
            Context: Nigerian Tech Market.
            Inventory: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, desc: p.description, price: p.price })))}
            
            Return JSON array of matching product IDs, ranked by relevance.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        if (response.text) return safeJsonParse(response.text, []);
        return [];
    } catch (e) {
        return [];
    }
};

export const visualSearchProducts = async (imageBase64: string, products: Product[]): Promise<string[]> => {
    try {
        const ai = getAiClient();
        const prompt = `
            Identify this device and find matches in inventory.
            Inventory: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, cat: p.category })))}
            Return JSON array of IDs.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        if (response.text) return safeJsonParse(response.text, []);
        return [];
    } catch (e) {
        return [];
    }
};

export const getMarketBadges = async (products: Product[]): Promise<Record<string, string>> => {
    try {
        const ai = getAiClient();
        const simplified = products.map(p => ({ id: p.id, name: p.name, price: p.price, reputation: p.sellerReputation }));
        const prompt = `
            Assign badges: "Top Rated", "Best Deal", "Rare Find".
            Inventory: ${JSON.stringify(simplified)}
            Return JSON array of { id, badge }.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { id: { type: Type.STRING }, badge: { type: Type.STRING } },
                        required: ["id", "badge"]
                    }
                }
            }
        });

        if (response.text) {
            const list = safeJsonParse<{id: string, badge: string}[]>(response.text, []);
            return list.reduce((acc, item) => ({ ...acc, [item.id]: item.badge }), {});
        }
        return {};
    } catch (e) {
        return {};
    }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    if (targetLanguage === 'English') return text;
    try {
        const ai = getAiClient();
        const prompt = `Translate to ${targetLanguage}. Keep informal tone. Text: "${text}"`;
        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: prompt,
        });
        return response.text || text;
    } catch (e) {
        return text;
    }
};

export const chatWithAssistant = async (history: {role: string, text: string}[], userMessage: string, inventorySummary: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const prompt = `
            You are "TechSwap Assistant". Help users buy/sell/swap in Nigeria.
            Inventory: ${inventorySummary}
            User Input: "${userMessage}"
            Keep it short and helpful.
        `;
        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: [
                ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
                { role: 'user', parts: [{ text: prompt }] }
            ]
        });
        return response.text || "I didn't catch that.";
    } catch (e) {
        return "I'm offline briefly.";
    }
}

export const generateSellerInsights = async (metrics: any): Promise<AiSellerInsight> => {
    try {
        const ai = getAiClient();
        const prompt = `
            Act as a business consultant for a Nigerian tech seller.
            Metrics: ${JSON.stringify(metrics)}.
            
            Provide:
            1. A short, punchy Headline.
            2. A 1-sentence Insight.
            3. A specific Actionable Tip (e.g., "Stock more iPhone 11s").
            
            Return JSON.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        headline: { type: Type.STRING },
                        content: { type: Type.STRING },
                        actionableTip: { type: Type.STRING }
                    },
                    required: ["headline", "content", "actionableTip"]
                }
            }
        });

        if (response.text) return safeJsonParse(response.text, { 
            headline: "Market is steady", 
            content: "Keep monitoring your pricing.", 
            actionableTip: "Check competitor prices." 
        });
        throw new Error("No Data");
    } catch (e) {
        return { 
            headline: "Welcome Back", 
            content: "Ready to make some sales today?", 
            actionableTip: "Update your inventory photos." 
        };
    }
};

export const compareProducts = async (p1: Product, p2: Product): Promise<ComparisonResult> => {
    try {
        const ai = getAiClient();
        const prompt = `
            Compare: ${p1.name} (₦${p1.price}) vs ${p2.name} (₦${p2.price}).
            Context: Durability, Resale Value in Nigeria, Battery Life.
            Return JSON.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        winnerId: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        specs: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    item1Value: { type: Type.STRING },
                                    item2Value: { type: Type.STRING }
                                }
                            }
                        }
                    },
                    required: ["winnerId", "summary", "specs"]
                }
            }
        });

        if (response.text) return safeJsonParse<ComparisonResult>(response.text, { winnerId: p1.id, summary: "Comparison failed.", specs: [] });
        throw new Error("No data");
    } catch (e) {
        return { winnerId: p1.id, summary: "AI unavailable.", specs: [] };
    }
}

export const getPersonalizedRecommendations = async (
    userHistory: any[],
    availableProducts: Product[]
): Promise<string[]> => {
    try {
        const ai = getAiClient();
        const prompt = `
            Recommend 2 products based on history: ${JSON.stringify(userHistory.slice(0,3))}
            Inventory: ${JSON.stringify(availableProducts.map(p => ({ id: p.id, name: p.name })))}
            Return JSON array of IDs.
        `;

        const response = await ai.models.generateContent({
             model: MODEL_ID,
             contents: prompt,
             config: {
                 responseMimeType: "application/json",
                 responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
             }
        });
        
        return safeJsonParse(response.text || "[]", []);
    } catch (e) {
        return [];
    }
}

export const calculateDeliveryQuotes = async (sellerLocation: string, buyerZip: string): Promise<AiDeliveryQuote[]> => {
    try {
        const ai = getAiClient();
        const prompt = `
            Estimate delivery: ${sellerLocation} to ${buyerZip}.
            Context: Nigerian Logistics (GIG, Kwik, DHL).
            Return JSON array of quotes.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            carrier: { type: Type.STRING },
                            service: { type: Type.STRING },
                            cost: { type: Type.NUMBER },
                            estimatedDays: { type: Type.STRING },
                            reasoning: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        if (response.text) return safeJsonParse(response.text, []);
        return [];
    } catch (e) {
        return [{ carrier: "GIG Logistics", service: "Standard", cost: 3500, estimatedDays: "2-4 days", reasoning: "Fallback estimate" }];
    }
}

export const transcribeAudio = async (audioBase64: string, mimeType: string = "audio/webm"): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: audioBase64 } },
                    { text: "Transcribe this audio. It may contain Nigerian accents." }
                ]
            }
        });
        return response.text?.trim() || "";
    } catch (e) {
        return "";
    }
}

export const generateHubVerificationReport = async (productName: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const prompt = `Generate a short QA pass report for ${productName}. Mention "Screen OK", "Battery OK".`;
        const response = await ai.models.generateContent({ model: MODEL_ID, contents: prompt });
        return response.text || "Verified OK.";
    } catch (e) {
        return "Verified OK.";
    }
}

export const getProductMarketAnalysis = async (productName: string): Promise<AiMarketAnalysis> => {
    try {
        const ai = getAiClient();
        const prompt = `
            Market analysis for ${productName} in Nigeria.
            Return JSON: { trend: 'up'|'down'|'stable', insight: string, specs: [{label, value}] }
        `;

        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        trend: { type: Type.STRING, enum: ['up', 'down', 'stable'] },
                        insight: { type: Type.STRING },
                        specs: { 
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { label: { type: Type.STRING }, value: { type: Type.STRING } }
                            }
                        }
                    },
                    required: ["trend", "insight", "specs"]
                }
            }
        });

        if (response.text) return safeJsonParse(response.text, { trend: 'stable', insight: "Analysis unavailable", specs: [] });
        throw new Error("No data");
    } catch (e) {
        return { trend: 'stable', insight: "Analysis unavailable", specs: [] };
    }
}
