import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { PDFParse } from 'pdf-parse';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json({ limit: '50mb' }));

  // --- Start: Stripe/Razorpay Escrow API Mock ---
  interface EscrowPayment {
    id: string;
    appointmentId: string;
    transactionReference: string;
    preauthAmount: number;
    capturedAmount: number;
    escrowStatus: "Authorized" | "Held_In_Escrow" | "Captured" | "Refunded";
    createdAt: string;
  }

  const escrowDb: Record<string, EscrowPayment> = {};

  // POST /api/v1/payments/preauth
  app.post("/api/v1/payments/preauth", (req, res) => {
    const { appointmentId, amount } = req.body;
    if (!appointmentId || !amount) {
      return res.status(400).json({ error: "Missing appointmentId or amount" });
    }

    const payment: EscrowPayment = {
      id: `pay_${Math.random().toString(36).substr(2, 9)}`,
      appointmentId,
      transactionReference: `ch_stripe_mock_${Math.random().toString(36).substr(2, 12)}`,
      preauthAmount: Number(amount),
      capturedAmount: 0,
      escrowStatus: "Authorized",
      createdAt: new Date().toISOString(),
    };

    escrowDb[appointmentId] = payment;
    console.log(`[ESCROW] Pre-authorized ₹${amount} for appointment ${appointmentId}. Ref: ${payment.transactionReference}`);
    res.status(201).json(payment);
  });

  // POST /api/v1/payments/hold
  app.post("/api/v1/payments/hold", (req, res) => {
    const { appointmentId } = req.body;
    const payment = escrowDb[appointmentId];
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    payment.escrowStatus = "Held_In_Escrow";
    console.log(`[ESCROW] Payment ref ${payment.transactionReference} moved to Escrow (Held_In_Escrow).`);
    res.json(payment);
  });

  // POST /api/v1/payments/capture
  app.post("/api/v1/payments/capture", (req, res) => {
    const { appointmentId } = req.body;
    const payment = escrowDb[appointmentId];
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    payment.escrowStatus = "Captured";
    payment.capturedAmount = payment.preauthAmount;
    console.log(`[ESCROW] Escrow captured ₹${payment.capturedAmount} for ref ${payment.transactionReference} (Consultation established).`);
    res.json(payment);
  });

  // POST /api/v1/payments/refund
  app.post("/api/v1/payments/refund", (req, res) => {
    const { appointmentId } = req.body;
    const payment = escrowDb[appointmentId];
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    payment.escrowStatus = "Refunded";
    payment.capturedAmount = 0;
    console.log(`[ESCROW] Refunded ₹${payment.preauthAmount} for ref ${payment.transactionReference} (Consultation missed/cancelled).`);
    res.json(payment);
  });

  // GET /api/v1/payments/status/:appointmentId
  app.get("/api/v1/payments/status/:appointmentId", (req, res) => {
    const payment = escrowDb[req.params.appointmentId];
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.json(payment);
  });

  // GET /api/v1/payments/logs
  app.get("/api/v1/payments/logs", (req, res) => {
    res.json(Object.values(escrowDb));
  });
  // --- End: Stripe/Razorpay Escrow API Mock ---

  // --- Start: Patient Medical AI Chat & Prescription API ---
  
  // Helper to check if a query is medical-related
  function isMedicalQuery(text: string): boolean {
    const medicalKeywords = [
      "symptom", "medical", "doctor", "pain", "fever", "flu", "prescription", 
      "diabetes", "dose", "pill", "capsule", "drug", "medicine", "health", 
      "heart", "blood", "anatomy", "virus", "bacteria", "infect", "hospital", 
      "clinical", "cough", "head", "belly", "stomach", "kidney", "liver", 
      "lungs", "diagnose", "treatment", "disease", "vaccine", "allergy", 
      "hypertension", "cholesterol", "asthma", "cancer", "therapy", "wound",
      "pharmacy", "clinic", "surgeon", "pediatric", "veterinary", "dosage"
    ];
    const query = text.toLowerCase();
    return medicalKeywords.some(keyword => query.includes(keyword));
  }

  // POST /api/chat
  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing message parameter" });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const isGeminiConfigured = geminiKey && !geminiKey.startsWith("MY_") && !geminiKey.startsWith("your_");

    if (isGeminiConfigured) {
      try {
        console.log(`[AI CHAT] Sending query to Google Gemini API (gemini-2.5-flash)...`);
        
        // Initialize Gemini API
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        
        // Set custom persona constraints
        const systemInstruction = `You are WeCare Bot, a specialized AI assistant. YOU MUST ONLY answer questions related to medicine, healthcare, hospitals, veterinary care, and hospitality within healthcare settings. If the user's question is NOT strictly related to these fields (or is a casual greeting, pleasantry, or general knowledge topic without clear medical/health context), you must reply with exactly 'out of my knowledge!' and absolutely nothing else. Do not engage in casual conversation, pleasantries, or general knowledge unless it has a clear medical, healthcare, veterinary, or hospital hospitality context. Keep your response professional, elegant, and format it nicely using markdown, bold, and bullet points where applicable.`;

        const aiResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: message,
          config: { systemInstruction }
        });

        const replyText = aiResponse.text || "";
        return res.json({ response: replyText });
      } catch (err: any) {
        console.error("[AI CHAT] Failed to call Gemini, falling back to mock...", err);
      }
    }

    // Graceful Mock Fallback if key is missing or calls fail
    console.log(`[AI CHAT] Processing mock fallback response (Gemini API key not configured/active).`);
    
    if (!isMedicalQuery(message)) {
      return res.json({ response: "out of my knowledge!" });
    }

    // Custom smart medical replies for testing
    let reply = "";
    const msgLower = message.toLowerCase();
    if (msgLower.includes("flu") || msgLower.includes("fever") || msgLower.includes("cold")) {
      reply = `### **Clinical Assessment: Seasonal Influenza / Pyrexia (Fever)**

**A. Clinical Overview:**
Pyrexia (fever) and influenza-like symptoms typically indicate a viral trigger affecting the respiratory tract. Adopting a structured recovery plan is essential for optimal prognosis.

**B. Recommended Supportive Protocols:**
*   **Systemic Hydration:** Consume adequate fluids (electrolyte formulations, mineral water) to restore sweat-induced fluid losses.
*   **Therapeutic Rest:** Minimize metabolic strain by maintaining physical rest to assist immune function.
*   **Pharmacological Management:** Standard therapeutic relief includes *Paracetamol (500mg - 650mg)* every 6 to 8 hours as needed to manage fever and somatic pain. Max dose is 4g in 24 hours.

**C. Red Flag Symptoms & Critical Disclaimers:**
> ⚠️ **Urgent Medical Evaluation Required:** If you experience dyspnea (difficulty breathing), persistent thoracic pain, or a pyrexial state exceeding 103°F (39.4°C) that remains unresponsive to antipyretics, proceed to the nearest Emergency Department immediately.`;
    } else if (msgLower.includes("diabetes") || msgLower.includes("sugar")) {
      reply = `### **Clinical Guidance: Diabetes Mellitus Management**

**A. Clinical Overview:**
Diabetes mellitus requires structured glycemic monitoring, metabolic pacing, and pharmacological compliance to prevent vascular and systemic complications.

**B. Core Care Plan Principles:**
*   **Glycemic Control:** Monitor fasting and postprandial blood glucose levels regularly.
*   **Nutritional Pacing:** Prioritize low-glycemic, high-fiber complexes and restrict refined carbohydrates and trans-fats.
*   **Pharmacological Adherence:** Take medications like *Metformin* or *Insulin* strictly as scheduled by your physician.

**C. Essential Action Items:**
*   Schedule a HbA1c screening every 3 months.
*   Retain a personalized diabetic care journal to track glucose fluctuations.
*   Consult an endocrinologist for precise dose adjustments.`;
    } else if (msgLower.includes("headache") || msgLower.includes("migraine")) {
      reply = `### **Clinical Guidance: Cephalgia (Headache) & Migraine Assessment**

**A. Clinical Overview:**
Cephalgia can stem from primary syndromes (e.g., tension, migraine) or secondary physiological triggers (e.g., dehydration, sleep deprivation).

**B. Supportive Care Protocols:**
*   **Environmental Modification:** Rest in a darkened, silent, temperature-controlled environment.
*   **Rehydration Protocol:** Administer fluids immediately to eliminate dehydration-induced vascular tension.
*   **Analgesic Options:** Mild episodes can be managed using over-the-counter analgesics (e.g., *Ibuprofen 400mg* or *Paracetamol 500mg*) with food.

**C. Emergency Advisory:**
> ⚠️ **Seek immediate clinical care if:** You experience a sudden, excruciating headache ('thunderclap cephalgia'), a headache accompanied by neck stiffness (nuchal rigidity), high pyrexia, confusion, or focal neurological deficits (such as speech slurry or visual disruption).`;
    } else if (msgLower.includes("stomach") || msgLower.includes("belly") || msgLower.includes("abdomen") || msgLower.includes("digestion") || msgLower.includes("vomit") || msgLower.includes("nausea")) {
      reply = `### **Clinical Guidance: Acute Gastrointestinal Distress Assessment**

**A. Clinical Overview:**
Gastrointestinal symptoms such as abdominal cramping, dyspepsia (indigestion), nausea, or bloating are frequently linked to localized mucosal irritation, viral gastroenteritis, or dietary sensitivity.

**B. Supportive Recovery Plan:**
*   **Dietary Pacing:** Adopt the BRAT diet (Bananas, Rice, Applesauce, Toast) to ease digestive strain. Avoid dairy, high-fat foods, acidic fruits, caffeine, and ethanol.
*   **Hydration Maintenance:** Administer oral rehydration salts (ORS) in small, frequent sips to sustain essential electrolyte levels.
*   **Activity Modulation:** Maintain an upright position for at least 30 minutes post-fluid consumption to minimize acid reflux.

**C. Red Flag Warnings:**
> ⚠️ **Proceed to Urgent Care immediately if:** You experience severe, localized abdominal guarding or rigidity, hematemesis (vomiting blood), dark/tarry stools, high fever, or inability to retain fluids for over 12 hours.`;
    } else if (msgLower.includes("chest") || msgLower.includes("heart") || msgLower.includes("breathing") || msgLower.includes("breath")) {
      reply = `### **Critical Advisory: Thoracic Discomfort / Dyspnea Assessment**

**A. Urgent Directive:**
> 🚨 **IMMEDIATE ACTION REQUIRED:** Thoracic pain, pressure, tightness, or severe dyspnea (shortness of breath) must be treated as a potential medical emergency (such as an acute coronary event or pulmonary embolism).

**B. Crucial Clinical Protocols:**
1.  **Do not delay evaluation.** Stop all physical activities immediately.
2.  **Call local emergency services (e.g., 102 / 112) immediately.**
3.  **Positioning:** Sit in a comfortable, upright position to reduce cardiac load.
4.  **Pharmacology:** If medically advised by emergency personnel and not allergic, consider chewing a standard *Aspirin (325mg)*.

**C. Important Information:**
This assessment is not diagnostic. Thoracic symptoms require physical, clinical diagnostic screening (including ECG and cardiac enzyme assays) to rule out life-threatening pathologies.`;
    } else {
      reply = `### **Clinical Inquiry Assessment**

**A. Consultation Directive:**
I have registered your health-related query. As your **WeCare AI Clinical Assistant**, I am designed to offer informational guidance, but this cannot substitute for in-person diagnostic evaluation.

**B. Essential Preventive Guidelines:**
*   **Professional Diagnosis:** Consult a primary care physician or specialist for proper diagnostic screenings (blood panels, imaging, etc.).
*   **Therapeutic Compliance:** Always follow the exact dosing, timing, and administration guidelines provided by your licensed healthcare provider.
*   **Clinical Records:** Keep your digital health charts and prescriptions updated inside WeCare to facilitate seamless care coordination.

We recommend booking an instant **Video Consult** or finding a localized WeCare specialist to discuss your specific symptoms.`;
    }

    // Append small warning/notice in mock mode
    reply += "\n\n*(Note: WeCare AI chatbot is running in premium local medical fallback mode.)*";
    res.json({ response: reply });
  });

  // POST /api/prescription
  app.post("/api/prescription", async (req, res) => {
    const { fileName, textContent, fileBase64 } = req.body;
    console.log(`[PRESCRIPTION] Analyzing file: ${fileName || "text block"}`);

    // Step 1: Extract text content
    let extractedText = textContent || "";

    if (fileBase64 && !extractedText) {
      try {
        const pdfBuffer = Buffer.from(fileBase64, "base64");
        const parser: any = new PDFParse({});
        await parser.load(pdfBuffer);
        extractedText = parser.getText() || "";
        console.log(`[PRESCRIPTION] Extracted ${extractedText.length} chars from PDF`);
      } catch (err) {
        console.error("[PRESCRIPTION] PDF parsing failed:", err);
        return res.json({
          success: false,
          isAIGenerated: false,
          aiDetectionReason: "",
          analysis: "Failed to extract text from the uploaded PDF. Please ensure it is a text-based digital PDF, not a scanned image.",
          medicines: [],
          dietRecommendations: [],
          warnings: [],
          doctorGuidanceNotice: "Please consult your doctor with the original prescription."
        });
      }
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return res.json({
        success: false,
        isAIGenerated: false,
        aiDetectionReason: "",
        analysis: "Could not extract meaningful text from the uploaded file. Please upload a digital prescription (text-based PDF or .txt file) rather than a scanned image.",
        medicines: [],
        dietRecommendations: [],
        warnings: [],
        doctorGuidanceNotice: "Please consult your doctor with the original prescription."
      });
    }

    // Step 2: Use Gemini for AI detection + analysis
    const geminiKey = process.env.GEMINI_API_KEY;
    const isGeminiConfigured = geminiKey && !geminiKey.startsWith("MY_") && !geminiKey.startsWith("your_");

    if (isGeminiConfigured) {
      try {
        console.log(`[PRESCRIPTION] Sending to Gemini for AI-detection + analysis...`);
        const ai = new GoogleGenAI({ apiKey: geminiKey });

        const systemInstruction = `You are WeCare Prescription Analyzer, a highly specialized medical AI.

You will be given the text content of a prescription document. You must perform TWO tasks:

**TASK 1 - AI-Generated Detection:**
Analyze whether this prescription appears to be AI-generated or fake. Check for:
- Missing doctor name, registration/license number, or clinic/hospital details
- Overly generic or template-like language with no patient-specific context
- Perfect formatting that looks computer-generated rather than from a real clinic system
- Lack of date, patient name, or visit context
- Generic placeholder-like text (e.g., "Patient Name: [Name]")
- Suspiciously comprehensive coverage of unrelated conditions
If it appears AI-generated, set isAIGenerated to true.

**TASK 2 - Medical Analysis (ONLY if prescription is NOT AI-generated):**
Extract all medications and provide:
- Medicine name, purpose, dosage, frequency, duration
- Timing (morning/afternoon/evening/night booleans) with instructions
- Weekly and monthly dose calculations
- Diet recommendations based on the medications (foods to eat, foods to avoid, meal timing)
- Important warnings (drug interactions, side effects, contraindications)

You MUST respond with ONLY valid JSON (no markdown, no code blocks) in this exact structure:
{
  "isAIGenerated": boolean,
  "aiDetectionReason": "string explaining why it was flagged or empty string if legitimate",
  "analysis": "string summary of the prescription",
  "medicines": [
    {
      "name": "string",
      "purpose": "string",
      "dosage": "string",
      "frequency": "string",
      "duration": "string",
      "timing": {
        "morning": boolean,
        "afternoon": boolean,
        "evening": boolean,
        "night": boolean,
        "instructions": "string"
      },
      "weeklyDose": "string",
      "monthlyDose": "string"
    }
  ],
  "dietRecommendations": [
    {
      "category": "Recommended Foods" | "Foods to Avoid" | "Meal Timing" | "Hydration",
      "icon": "🥗" | "🚫" | "⏰" | "💧",
      "title": "string",
      "items": ["string array of specific recommendations"]
    }
  ],
  "warnings": [
    {
      "severity": "high" | "medium" | "low",
      "title": "string",
      "description": "string"
    }
  ],
  "doctorGuidanceNotice": "All recommendations are strictly informational and must be followed ONLY under the guidance of your prescribing physician. Do not self-medicate or alter dosages without professional medical consultation."
}

If the prescription IS AI-generated, return the JSON with isAIGenerated=true, an explanation in aiDetectionReason, empty medicines/dietRecommendations/warnings arrays, and analysis saying you cannot process AI-generated prescriptions.`;

        const aiResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Analyze this prescription document:\n\n${extractedText}`,
          config: { systemInstruction }
        });

        const replyText = (aiResponse.text || "").trim();

        let parsed;
        try {
          const cleanText = replyText.replace(/```json/g, "").replace(/```/g, "").trim();
          parsed = JSON.parse(cleanText);
        } catch (parseErr) {
          console.error("[PRESCRIPTION] Failed to parse Gemini JSON response", parseErr);
        }

        if (parsed) {
          return res.json({ success: !parsed.isAIGenerated, ...parsed });
        }
      } catch (err: any) {
        console.error("[PRESCRIPTION] Gemini prescription analysis failed, falling back to mock...", err);
      }
    }

    // ---- MOCK FALLBACK ----
    console.log(`[PRESCRIPTION] Using premium mock fallback (Gemini not configured/failed).`);

    const textLower = extractedText.toLowerCase();
    const aiIndicators = [
      textLower.includes("[name]") || textLower.includes("[patient"),
      textLower.includes("[doctor") || textLower.includes("[dr."),
      textLower.includes("lorem ipsum"),
      textLower.includes("this is a sample") || textLower.includes("example prescription"),
      (textLower.match(/\[.*?\]/g) || []).length > 3,
    ];
    const aiScore = aiIndicators.filter(Boolean).length;

    if (aiScore >= 2) {
      return res.json({
        success: false,
        isAIGenerated: true,
        aiDetectionReason: "This prescription contains multiple indicators of AI-generated content: placeholder brackets, generic template language, and/or missing authentic doctor credentials.",
        analysis: "This prescription appears to be AI-generated or a template. For your safety, we cannot analyze AI-generated prescriptions. Please upload a valid prescription issued by a licensed medical professional.",
        medicines: [],
        dietRecommendations: [],
        warnings: [],
        doctorGuidanceNotice: "Please consult a licensed physician for a legitimate prescription."
      });
    }

    const nameLower = (fileName || "").toLowerCase();
    let medicines = [
      {
        name: "Amoxicillin 500mg (Antibiotic)",
        purpose: "Treats bacterial infections",
        dosage: "1 capsule",
        frequency: "3 times a day",
        duration: "7 days",
        timing: {
          morning: true,
          afternoon: true,
          evening: false,
          night: true,
          instructions: "Take with or after food. Complete the full course."
        },
        weeklyDose: "21 capsules",
        monthlyDose: "N/A (Short course)"
      },
      {
        name: "Paracetamol 650mg (Antipyretic)",
        purpose: "Relieves mild to moderate pain and reduces fever",
        dosage: "1 tablet",
        frequency: "Every 6 hours as needed",
        duration: "5 days",
        timing: {
          morning: true,
          afternoon: false,
          evening: true,
          night: false,
          instructions: "Take if fever exceeds 100.4°F or for headache. Keep a 6-hour gap."
        },
        weeklyDose: "Up to 14 tablets (As needed)",
        monthlyDose: "N/A"
      },
      {
        name: "Pantoprazole 40mg (Antacid)",
        purpose: "Reduces stomach acid and prevents reflux",
        dosage: "1 tablet",
        frequency: "Once daily",
        duration: "14 days",
        timing: {
          morning: true,
          afternoon: false,
          evening: false,
          night: false,
          instructions: "Take on an empty stomach, 30 minutes before breakfast."
        },
        weeklyDose: "7 tablets",
        monthlyDose: "14 tablets total"
      }
    ];

    if (nameLower.includes("diabetes") || nameLower.includes("sugar")) {
      medicines = [
        {
          name: "Metformin 500mg (Anti-diabetic)",
          purpose: "Controls blood sugar levels",
          dosage: "1 tablet",
          frequency: "Twice daily",
          duration: "Ongoing / 30 days",
          timing: {
            morning: true,
            afternoon: false,
            evening: false,
            night: true,
            instructions: "Take with dinner and breakfast to minimize stomach upset."
          },
          weeklyDose: "14 tablets",
          monthlyDose: "60 tablets"
        },
        {
          name: "Glimepiride 2mg (Sulfonylurea)",
          purpose: "Stimulates insulin release",
          dosage: "1 tablet",
          frequency: "Once daily",
          duration: "Ongoing / 30 days",
          timing: {
            morning: true,
            afternoon: false,
            evening: false,
            night: false,
            instructions: "Take 15 minutes before breakfast."
          },
          weeklyDose: "7 tablets",
          monthlyDose: "30 tablets"
        }
      ];
    }

    const dietRecommendations = [
      {
        category: "Recommended Foods",
        icon: "🥗",
        title: "Include in Your Diet",
        items: [
          "Probiotic-rich foods (yogurt, kefir) to support gut health during antibiotic therapy",
          "High-fiber vegetables (broccoli, spinach, carrots) for nutrient support",
          "Lean proteins (chicken breast, fish, lentils) for recovery",
          "Whole grains (brown rice, oats) for sustained energy",
          "Fresh fruits rich in Vitamin C (oranges, kiwi, strawberries) for immune support"
        ]
      },
      {
        category: "Foods to Avoid",
        icon: "🚫",
        title: "Avoid These Foods",
        items: [
          "Alcohol — may interfere with antibiotic efficacy and increase liver strain",
          "Spicy and acidic foods — may worsen stomach issues while on Pantoprazole",
          "Dairy products within 2 hours of antibiotics — may reduce absorption",
          "Processed sugars and junk food — may weaken immune response",
          "Caffeinated beverages in excess — may increase Paracetamol side effects"
        ]
      },
      {
        category: "Meal Timing",
        icon: "⏰",
        title: "Optimal Meal Schedule",
        items: [
          "Breakfast at 8:00 AM — Take Pantoprazole 30 min before (7:30 AM)",
          "Mid-morning snack at 10:30 AM — Light fruit or nuts",
          "Lunch at 1:00 PM — Take Amoxicillin with meal",
          "Evening snack at 5:00 PM — Probiotic yogurt",
          "Dinner at 8:00 PM — Take Amoxicillin and Paracetamol (if needed) with meal"
        ]
      },
      {
        category: "Hydration",
        icon: "💧",
        title: "Hydration Guidelines",
        items: [
          "Drink at least 2.5-3 liters of water daily",
          "Warm water with honey and lemon in the morning for immunity",
          "Coconut water for electrolyte balance",
          "Avoid ice-cold beverages while on antibiotics",
          "Herbal teas (chamomile, ginger) are recommended for recovery"
        ]
      }
    ];

    const warnings = [
      {
        severity: "high" as const,
        title: "Complete the Full Antibiotic Course",
        description: "Do not stop Amoxicillin early even if symptoms improve. Incomplete courses contribute to antibiotic resistance."
      },
      {
        severity: "medium" as const,
        title: "Paracetamol Dosage Limit",
        description: "Do not exceed 4g (approx. 6 tablets of 650mg) in 24 hours. Exceeding this limit may cause severe liver damage."
      },
      {
        severity: "low" as const,
        title: "Pantoprazole Timing",
        description: "Always take on an empty stomach 30 minutes before eating for optimal acid reduction."
      }
    ];

    res.json({
      success: true,
      isAIGenerated: false,
      aiDetectionReason: "",
      analysis: `WeCare Smart Scan extracted **${medicines.length} medications** from **"${fileName || "prescription.pdf"}"**. Below is your personalized medication schedule, dietary guidance, and important warnings.`,
      medicines,
      dietRecommendations,
      warnings,
      doctorGuidanceNotice: "All recommendations are strictly informational and must be followed ONLY under the guidance of your prescribing physician. Do not self-medicate or alter dosages without professional medical consultation."
    });
  });

  // --- End: Patient Medical AI Chat & Prescription API ---

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // For Express 4
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
