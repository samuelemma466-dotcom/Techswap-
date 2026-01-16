import { GoogleGenAI } from "@google/genai";
import { TrustScanResult, DealSenseReply, MarketPulseData, AiDeliveryQuote, SecurityLog, SwapAssessment, AiSellerInsight, AiPricingAdvice } from "../types";

// --- CONFIGURATION ---
const MODEL_ID = "gemini-3-flash-preview";

// Safe Client Initialization
const getAiClient = (): GoogleGenAI | null => {
    // Only return client if API KEY is present
    if (!process.env.API_KEY) return null;
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- UTILS ---
const safeJsonParse = <T>(text: string, fallback: T): T => {
    try {
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanText) as T;
    } catch (e) {
        console.warn("AI JSON Parse Error (using fallback):", e);
        return fallback;
    }
};

export const sanitizeInput = (input: string): string => {
  if (!input) return "";
  return input.replace(/[<>&"']/g, "");
};

// --- TRUSTSCAN AI ---
export const runTrustScan = async (base64Image: string, description: string): Promise<TrustScanResult> => {
    const ai = getAiClient();
    
    // MOCK FALLBACK
    if (!ai) {
        await new Promise(r => setTimeout(r, 2000));
        return {
            deviceModel: "iPhone 13 Pro (Detected)",
            conditionGrade: "A",
            confidenceScore: 94,
            marketValue: 650000,
            verificationNotes: "Screen is pristine. No visible bezel damage. Camera lens clear.",
            visualAnalysis: { screen: 'Clean', body: 'Mint', camera: 'Clear' },
            isEligibleForListing: true
        };
    }

    try {
        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: base64Image } },
                    { text: `Analyze gadget. Desc: ${description}. Output JSON: {deviceModel, conditionGrade(A/B/C), confidenceScore(0-100), marketValue(NGN), visualAnalysis:{screen,body,camera}, verificationNotes}.` }
                ]
            },
            config: { responseMimeType: "application/json" }
        });
        return safeJsonParse(response.text || "", {
            deviceModel: "Unknown", conditionGrade: "B", confidenceScore: 70, marketValue: 0,
            verificationNotes: "Analysis inconclusive.", visualAnalysis: { screen: 'Clean', body: 'Worn', camera: 'Clear' }, isEligibleForListing: true
        });
    } catch (e) {
        console.error("TrustScan Failed:", e);
        return {
            deviceModel: "Error Reading Image", conditionGrade: "B", confidenceScore: 0, marketValue: 0,
            verificationNotes: "AI Service Unavailable.", visualAnalysis: { screen: 'Clean', body: 'Mint', camera: 'Clear' }, isEligibleForListing: true
        };
    }
};

// --- DEALSENSE AI ---
export const getDealSenseReply = async (
    history: any[], 
    offer: number, 
    listingPrice: number, 
    language: string, 
    tone: string
): Promise<DealSenseReply> => {
    const ai = getAiClient();

    if (!ai) {
        await new Promise(r => setTimeout(r, 1500));
        return { 
            text: `(AI Mock) That offer is a bit low. Can you do ₦${Math.floor((offer + listingPrice)/2)}?`, 
            accepted: false, 
            toneUsed: tone 
        };
    }

    try {
        const messages = history.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
        messages.push({ 
            role: 'user', 
            parts: [{ text: `Seller Negotiation. Price: ${listingPrice}. Offer: ${offer}. Lang: ${language}. Tone: ${tone}. JSON: {text, accepted, toneUsed}.` }]
        });

        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: messages,
            config: { responseMimeType: "application/json" }
        });
        return safeJsonParse(response.text || "", { text: "Let's discuss.", accepted: false, toneUsed: tone });
    } catch (e) {
        return { text: "Connection unstable. I'm listening though.", accepted: false, toneUsed: tone };
    }
};

export const generateNegotiationReply = async (
    history: any[], 
    offer: number, 
    listingPrice: number, 
    tone: string
): Promise<{ text: string, accepted: boolean, toneUsed: string }> => {
    const ai = getAiClient();

    if (!ai) {
        await new Promise(r => setTimeout(r, 1500));
        return { 
            text: `(AI Mock) I see your offer of ${offer > 0 ? offer : 'negotiation'}. Let's see if we can make a deal.`, 
            accepted: false, 
            toneUsed: tone 
        };
    }

    try {
        const messages = history.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
        messages.push({ 
            role: 'user', 
            parts: [{ text: `Negotiate gadget price. Listing Price: ${listingPrice}. User Offer: ${offer > 0 ? offer : 'None'}. Tone: ${tone}. Goal: Maximize seller profit but close deal. Return JSON: {text, accepted, toneUsed}.` }]
        });

        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: messages,
            config: { responseMimeType: "application/json" }
        });
        return safeJsonParse(response.text || "", { text: "I am considering your position.", accepted: false, toneUsed: tone });
    } catch (e: any) {
        throw new Error(e.message || "Negotiation service failed.");
    }
};

// --- MARKETPULSE AI ---
export const generateSellerInsights = async (data: any): Promise<AiSellerInsight> => {
    const ai = getAiClient();
    
    if (!ai) {
        return {
            headline: "Market Demand Rising",
            content: "We noticed a 15% increase in searches for iPhones this week.",
            actionableTip: "List more phones to capture demand."
        };
    }

    try {
         const response = await ai.models.generateContent({
             model: MODEL_ID,
             contents: `Analyze seller stats: ${JSON.stringify(data)}. JSON: {headline, content, actionableTip}.`,
             config: { responseMimeType: "application/json" }
         });
         return safeJsonParse(response.text || "", {
             headline: "Steady Performance",
             content: "Sales are stable.",
             actionableTip: "Check competitor prices."
         });
    } catch (e) {
         return { headline: "Data Offline", content: "Reconnect to view insights.", actionableTip: "Keep selling!" };
    }
};

export const getSmartPricingAdvice = async (productName: string, condition: string): Promise<AiPricingAdvice> => {
    const ai = getAiClient();
    if (!ai) return { recommendedPrice: 150000, priceRange: { min: 140000, max: 160000 }, confidence: 0.9 };

    try {
        const response = await ai.models.generateContent({
             model: MODEL_ID,
             contents: `Price advice for ${condition} ${productName} in Nigeria. JSON: {recommendedPrice, priceRange:{min,max}, confidence}.`,
             config: { responseMimeType: "application/json" }
        });
        return safeJsonParse(response.text || "", { recommendedPrice: 0, priceRange: {min:0,max:0}, confidence: 0 });
    } catch (e) {
        return { recommendedPrice: 0, priceRange: { min: 0, max: 0 }, confidence: 0 };
    }
};

export const getMarketPulse = async (productName: string, price: number): Promise<MarketPulseData> => {
    const ai = getAiClient();
    if (!ai) return { valueScore: 88, fairPriceRange: { min: price*0.9, max: price*1.1 }, priceTrend: 'stable', demandLevel: 'high', insight: 'Good price.' };

    try {
        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: `Market analysis for ${productName} at ${price}. JSON: {valueScore, fairPriceRange:{min,max}, priceTrend, demandLevel, insight}.`,
            config: { responseMimeType: "application/json" }
        });
        return safeJsonParse(response.text || "", { valueScore: 50, fairPriceRange: {min:0,max:0}, priceTrend: 'stable', demandLevel: 'medium', insight: 'No data.' });
    } catch (e) {
        return { valueScore: 50, fairPriceRange: {min:0,max:0}, priceTrend: 'stable', demandLevel: 'medium', insight: 'Service offline.' };
    }
};

export const generateListingDetails = async (base64Image: string): Promise<any> => {
    const ai = getAiClient();
    if(!ai) return { name: "Detected Gadget", price: 50000, category: "Phone", condition: "Good", description: "Auto-generated description." };

    try {
        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: { parts: [{ inlineData: { mimeType: "image/jpeg", data: base64Image } }, { text: "Identify gadget. JSON: {name, price, category, condition, description}." }] },
            config: { responseMimeType: "application/json" }
        });
        return safeJsonParse(response.text || "", { name: "Unknown", price: 0, category: "Other", condition: "Fair", description: "" });
    } catch (e) { throw new Error("AI Failed"); }
};

// --- MOCK UTILS ---
export const logSecurityEvent = (msg: string, type: string) => console.log(`[SEC] ${type}: ${msg}`);
export const createPaymentIntent = async (amt: number, cur: string) => ({ clientSecret: "mock_sec_" + Date.now() });
export const confirmSecurePayment = async (pid: string, sec: string) => ({ success: true });
export const secureSaveAddress = async (uid: string, addr: string) => true;
export const calculateDeliveryQuotes = async (from: string, to: string): Promise<AiDeliveryQuote[]> => [
    { carrier: "GIG Logistics", service: "Priority", cost: 3500, estimatedDays: "24hrs", trustRating: "High", reasoning: "Fastest" },
    { carrier: "TopShip", service: "Standard", cost: 2000, estimatedDays: "2-3 Days", trustRating: "Medium", reasoning: "Cheapest" }
];
export const getSecurityLogs = async (): Promise<SecurityLog[]> => [
    { id: '1', event: 'Login', timestamp: 'Today', status: 'success' }
];
export const transcribeAudio = async (b: string, m: string) => "Mock transcription";
export const translateText = async (t: string, l: string) => t;
export const chatWithAssistant = async (h: any, m: string, c: string) => "I am a mock assistant.";
export const generateHubVerificationReport = async (p: string) => "Passed all checks.";
export const analyzeSwapParams = async (b: string, d: string, t: number): Promise<SwapAssessment> => ({
    marketValue: 100000, tradeInValue: 80000, topUpAmount: t - 80000,
    breakdown: { screen: 'Good', body: 'Fair', battery: '85%' }, verificationStatus: 'verified', reasoning: 'Mock analysis.'
});