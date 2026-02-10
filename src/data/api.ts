// Mock data and API functions for Gramin Sahayak
// In production, these would be API calls to the Express backend

export interface NewsItem {
  id: number;
  title: string;
  description: string;
  category: "Farmer" | "Worker" | "General";
}

// Data from /backend/data/news.json equivalent
export const newsData: NewsItem[] = [
  {
    id: 1,
    title: "PM Kisan Installment Released",
    description: "₹6,000 yearly benefit under PM-KISAN scheme. Check your bank account for the latest installment.",
    category: "Farmer",
  },
  {
    id: 2,
    title: "Minimum Wage Updated",
    description: "Daily minimum wage for unskilled workers increased to ₹382. Know your rights.",
    category: "Worker",
  },
  {
    id: 3,
    title: "Crop Insurance Deadline",
    description: "Last date for Kharif crop insurance registration is approaching. Visit your nearest CSC.",
    category: "Farmer",
  },
  {
    id: 4,
    title: "Free Ration Distribution",
    description: "Government free ration scheme extended. Collect your monthly ration from the nearest PDS shop.",
    category: "General",
  },
  {
    id: 5,
    title: "MGNREGA Work Available",
    description: "New MGNREGA projects starting in your district. Register at Gram Panchayat for guaranteed 100 days work.",
    category: "Worker",
  },
  {
    id: 6,
    title: "Soil Health Card",
    description: "Get your soil tested for free. Collect Soil Health Card from the agriculture office.",
    category: "Farmer",
  },
];

// GET /api/news
export function fetchNews(): NewsItem[] {
  return newsData;
}

// POST /api/chat — simple keyword-based chatbot
export function getChatResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("wage") || lower.includes("payment") || lower.includes("salary")) {
    return "💰 As per the latest government notification, the minimum daily wage for unskilled workers is ₹382. If your employer is paying less, you can file a complaint at the Labour Commissioner's office or call helpline 14434.";
  }

  if (lower.includes("crop") || lower.includes("farming") || lower.includes("kisan") || lower.includes("kheti")) {
    return "🌾 For crop-related help: PM-KISAN provides ₹6,000/year. For crop insurance, visit your nearest Common Service Centre (CSC). For soil testing, contact your block-level agriculture officer.";
  }

  if (lower.includes("ration") || lower.includes("food")) {
    return "🍚 Under the National Food Security Act, eligible families get 5kg of foodgrains per person per month at ₹1-3/kg. Visit your nearest PDS (ration) shop with your ration card.";
  }

  if (lower.includes("health") || lower.includes("hospital") || lower.includes("doctor")) {
    return "🏥 Under Ayushman Bharat, eligible families get free treatment up to ₹5 lakh/year. Visit your nearest government hospital or Health & Wellness Centre for more information.";
  }

  if (lower.includes("school") || lower.includes("education") || lower.includes("padhai")) {
    return "📚 Under the Right to Education Act, education is free for children aged 6-14. Contact your nearest government school for admission. Mid-day meals are also provided free.";
  }

  // Generic help message
  return "🙏 Namaste! I can help you with information about wages, farming schemes, ration, health services, and education. Please ask me about any of these topics.\n\n// ML integration here later";
}

// POST /api/verify — fake news checker (demo)
export function verifyNews(text: string): { status: string; explanation: string } {
  // ML integration here later
  return {
    status: "Likely False (demo model)",
    explanation:
      "This is a prototype model. The actual ML-based fake news detection system will be integrated in future versions using NLP and Bhashini API for multi-language support.",
  };
}
