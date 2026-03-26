export const EXAMS = [
  "UPSC CSE", "UPSC CAPF",
  "SSC CGL", "SSC CHSL", "SSC MTS", "SSC GD",
  "IBPS PO", "IBPS Clerk", "SBI PO", "SBI Clerk",
  "RRB NTPC", "RRB Group D", "RRB JE",
  "NDA", "CDS", "AFCAT",
  "CUET", "UGC NET",
  "BPSC", "UPPSC", "MPPSC", "RPSC"
];

export const SUBJECTS: { [key: string]: string[] } = {
  "UPSC CSE": ["History", "Polity", "Geography", "Economy", "Science & Technology", "Environment", "Current Affairs"],
  "SSC CGL": ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"],
  "IBPS PO": ["Quantitative Aptitude", "Reasoning", "English", "General Awareness", "Computer Knowledge"],
};

export const TOPICS: { [key: string]: { [key: string]: string[] } } = {
  "UPSC CSE": {
    "History": ["Ancient India", "Medieval India", "Modern India", "Art & Culture"],
    "Polity": ["Constitution", "Parliament", "Judiciary", "Federalism"],
  },
  "SSC CGL": {
    "Quantitative Aptitude": ["Number System", "Percentage", "Profit & Loss", "Time & Work"],
    "Reasoning": ["Analogy", "Coding-Decoding", "Syllogism", "Blood Relations"],
  }
};

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Mixed'] as const;
export const LANGUAGES = ['English', 'Hindi', 'Bilingual'] as const;
export const NUM_QUESTIONS = [5, 10, 20, 25, 50, 100];
