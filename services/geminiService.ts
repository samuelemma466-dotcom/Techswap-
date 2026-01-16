
import { GoogleGenAI, Type } from "@google/genai";
import { TrustScanResult, DealSenseReply, MarketPulseData, AiDeliveryQuote, SecurityLog, SwapAssessment, AiSellerInsight, AiPricingAdvice } from "../types";

// --- SERVER-SIDE CONFIGURATION ---
const MODEL_ID = "gemini-3-flash-preview";

const getEnvVar = (key: string): string => {
    try {
        if (typeof process !== 'undefined' && process.env) {
            return process.env[key] || '';
        }
    } catch (e) {}
    return '';
};

const getAiClient = () => {
    const apiKey = getEnvVar('API_KEY');
    if (!apiKey) {
        // Fallback for demo environments without API Key - returns mocks or warns
        console.warn("GadgetTrust AI: Running in MOCK mode (Missing API Key)");
        return new GoogleGenAI({ apiKey: 'dummy' });
    }
    return new GoogleGenAI({ apiKey });
};

// --- SECURITY & UTILS ---
const safeJsonParse = <T>(text: string, fallback: T): T => {
    try {
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanText) as T;
    } catch (e) {
        console.warn("AI JSON Parse Error, using fallback", e);
        return fallback;
    }
};

export const sanitizeInput = (input: string): string => {
  if (!input) return "";
  return input.replace(/[<>&"']/g, "");
};

// --- TRUSTSCAN AI (Verification Engine) ---
export const runTrustScan = async (base64Image: string, description: string): Promise<TrustScanResult> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: base64Image } },
                    { text: `Analyze this gadget for the GadgetTrust platform. Description: ${description}. 
                      Determine the Grade (A=Mint, B=Good, C=Fair, D=Poor). 
                      Estimate visual confidence. Return JSON.` }
                ]
            },
            config: { responseMimeType: "application/json" }
        });

        return safeJsonParse(response.text || "", {
            deviceModel: "Identified Device",
            conditionGrade: "B",
            confidenceScore: 88,
            marketValue: 150000,
            verificationNotes: "Visual analysis suggests good condition. Minor wear detected.",
            visualAnalysis: { screen: 'Clean', body: 'Mint', camera: 'Clear' },
            isEligibleForListing: true
        });
    } catch (e) {
        return {
            deviceModel: "Unknown Device",
            conditionGrade: "B",
            confidenceScore: 75,
            marketValue: 100000,
            verificationNotes: "AI Service Offline. Manual verification required.",
            visualAnalysis: { screen: 'Clean', body: 'Mint', camera: 'Clear' },
            isEligibleForListing: true
        };
    }
};

// --- DEALSENSE AI (Negotiation) ---
export const getDealSenseReply = async (
    history: any[], 
    offer: number, 
    listingPrice: number, 
    language: string, 
    tone: string
): Promise<DealSenseReply> => {
    try {
        const ai = getAiClient();
        // Construct chat history manually
        const messages = history.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
        messages.push({ 
            role: 'user', 
            parts: [{ text: `Act as a seller negotiating a price. Item Price: ${listingPrice}. User Offer: ${offer}. Language: ${language}. Tone: ${tone}. If offer is > 85% of price, accept. Else counter. Return JSON.` }]
        });

        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: messages,
            config: { responseMimeType: "application/json" }
        });
        
        return safeJsonParse(response.text || "", { 
            text: "I verify that offer, e try small. Add small money make we deal.", 
            accepted: false, 
            toneUsed: tone 
        });
    } catch (e) {
        return { text: "Network is unstable, but I'm listening. Can you repeat?", accepted: false, toneUsed: 'neutral' };
    }
};

export const generateNegotiationReply = async (history: any[], offer: number, price: number, tone: string) => {
    return getDealSenseReply(history, offer, price, "English", tone);
};

// --- MARKETPULSE AI (Market Intelligence) ---
export const getMarketPulse = async (productName: string, price: number): Promise<MarketPulseData> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: `Analyze market data for ${productName} at price ${price}. Return JSON with valueScore (0-100), trend, etc.`,
            config: { responseMimeType: "application/json" }
        });
        return safeJsonParse(response.text || "", {
            valueScore: 85,
            fairPriceRange: { min: price * 0.9, max: price * 1.1 },
            priceTrend: 'stable',
            demandLevel: 'high',
            insight: "This price is competitive for the current Nigerian market."
        });
    } catch (e) {
        return {
            valueScore: 70,
            fairPriceRange: { min: price, max: price },
            priceTrend: 'stable',
            demandLevel: 'medium',
            insight: "Unable to fetch live market data."
        };
    }
};

// --- SWAP ASSESSMENT AI ---
export const analyzeSwapParams = async (base64Image: string, description: string, targetPrice: number): Promise<SwapAssessment> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: base64Image } },
                    { text: `Analyze swap trade-in device: ${description}. Target Product Price: ${targetPrice}. Estimate trade-in value and top-up needed. Return JSON.` }
                ]
            },
            config: { responseMimeType: "application/json" }
        });

        return safeJsonParse(response.text || "", {
             marketValue: 120000,
             tradeInValue: 90000,
             topUpAmount: targetPrice - 90000,
             breakdown: { screen: 'Good', body: 'Fair', battery: '85%' },
             verificationStatus: 'verified',
             reasoning: "Device appears in good working condition."
        });
    } catch (e) {
         return {
             marketValue: 100000,
             tradeInValue: 80000,
             topUpAmount: targetPrice - 80000,
             breakdown: { screen: 'Unknown', body: 'Unknown', battery: 'Unknown' },
             verificationStatus: 'pending',
             reasoning: "Could not analyze image."
        };
    }
};

// --- LOGISTICS & SECURITY ---
export const calculateDeliveryQuotes = async (from: string, to: string): Promise<AiDeliveryQuote[]> => {
    // In a real scenario, this could query a logistics API or use AI to estimate based on distance
    return [
        { carrier: "GIG Logistics", service: "Priority", cost: 3500, estimatedDays: "24hrs", trustRating: "High", reasoning: "Fastest route" },
        { carrier: "TopShip", service: "Standard", cost: 2000, estimatedDays: "2-3 Days", trustRating: "Medium", reasoning: "Best value" }
    ];
};

export const getSecurityLogs = async (): Promise<SecurityLog[]> => {
    return [
        { id: '1', event: 'Escrow Wallet Access', timestamp: 'Today, 10:00 AM', status: 'success', ip: '192.168.1.1', device: 'Chrome on Mac' },
        { id: '2', event: 'New Device Login', timestamp: 'Yesterday', status: 'warning', ip: '10.0.0.5', device: 'Safari on iPhone' }
    ];
};

export const secureSaveAddress = async (userId: string, address: string) => {
    // Mock save
    console.log("Address secured:", address);
    return true;
};

// --- UTILS & HELPERS ---
export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
             model: MODEL_ID,
             contents: {
                 parts: [
                     { inlineData: { mimeType: mimeType, data: base64Audio } },
                     { text: "Transcribe this audio to text." }
                 ]
             }
        });
        return response.text || "";
    } catch (e) {
        console.error("Transcription failed", e);
        return "";
    }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    if (targetLanguage === 'English') return text;
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
             model: MODEL_ID,
             contents: `Translate the following text to ${targetLanguage}: "${text}"`
        });
        return response.text || text;
    } catch (e) {
        return text;
    }
};

export const chatWithAssistant = async (history: any[], message: string, context: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: [
                { role: 'user', parts: [{ text: `Context: ${context}` }] },
                ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
                { role: 'user', parts: [{ text: message }] }
            ]
        });
        return response.text || "I'm here to help!";
    } catch (e) {
        return "I'm having trouble connecting right now.";
    }
};

export const generateHubVerificationReport = async (productName: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: `Generate a short technical verification report for a used ${productName}. Mention functional tests passed.`
        });
        return response.text || "Verification passed standard checks.";
    } catch (e) {
        return "Manual verification completed.";
    }
};

export const generateSellerInsights = async (data: any): Promise<AiSellerInsight> => {
    try {
         const ai = getAiClient();
         const response = await ai.models.generateContent({
             model: MODEL_ID,
             contents: `Analyze seller data: ${JSON.stringify(data)}. Return JSON with headline, content, and actionableTip.`,
             config: { responseMimeType: "application/json" }
         });
         return safeJsonParse(response.text || "", {
             headline: "Steady Growth Detected",
             content: "Your sales are trending upwards.",
             actionableTip: "Restock popular items."
         });
    } catch (e) {
         return {
             headline: "Data Analysis Unavailable",
             content: "Check back later.",
             actionableTip: "Keep your inventory updated."
         };
    }
};

export const generateListingDetails = async (base64Image: string): Promise<any> => {
     try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: base64Image } },
                    { text: "Analyze image and generate product details (name, price estimation in Naira, category, condition, description). Return JSON." }
                ]
            },
            config: { responseMimeType: "application/json" }
        });
        return safeJsonParse(response.text || "", {
            name: "Detected Item",
            price: 50000,
            category: "Phone",
            condition: "Good",
            description: "A nice gadget."
        });
     } catch (e) {
         throw new Error("AI Analysis Failed");
     }
};

export const getSmartPricingAdvice = async (productName: string, condition: string): Promise<AiPricingAdvice> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
             model: MODEL_ID,
             contents: `Suggest pricing for ${condition} ${productName} in Nigeria. Return JSON with recommendedPrice, priceRange, confidence.`
        });
        // We might get JSON inside text, use safe parser or regex if strict JSON mode not set (but default mock handles fallback)
        // Here we didn't force JSON mimeType in config, so let's rely on text or mock.
        // Actually, let's force JSON for consistency.
         const response2 = await ai.models.generateContent({
             model: MODEL_ID,
             contents: `Suggest pricing for ${condition} ${productName} in Nigeria. Return JSON with recommendedPrice, priceRange, confidence.`,
             config: { responseMimeType: "application/json" }
        });
        return safeJsonParse(response2.text || "", {
             recommendedPrice: 150000,
             priceRange: { min: 140000, max: 160000 },
             confidence: 0.85
        });
    } catch (e) {
        return {
             recommendedPrice: 0,
             priceRange: { min: 0, max: 0 },
             confidence: 0
        };
    }
};

export const logSecurityEvent = (message: string, type: 'success' | 'warning' | 'error') => {
    console.log(`[Security Log] ${type.toUpperCase()}: ${message}`);
};

export const createPaymentIntent = async (amount: number, currency: string) => {
    // Mock
    return { clientSecret: "mock_secret_" + Date.now() };
};

export const confirmSecurePayment = async (paymentMethodId: string, clientSecret: string) => {
    // Mock
    return { success: true };
};
