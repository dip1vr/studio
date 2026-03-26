export const EXAMS = [
  // UPSC
  "UPSC CSE", "UPSC CAPF", "UPSC CDS", "UPSC NDA", "UPSC IES", "UPSC Geo-Scientist",
  // SSC
  "SSC CGL", "SSC CHSL", "SSC MTS", "SSC GD", "SSC CPO", "SSC JE", "SSC Stenographer",
  // Banking
  "IBPS PO", "IBPS Clerk", "IBPS RRB Officer Scale I", "IBPS RRB Office Assistant",
  "SBI PO", "SBI Clerk", "SBI SO",
  "RBI Grade B", "RBI Assistant",
  // Railways
  "RRB NTPC", "RRB Group D", "RRB JE", "RRB ALP",
  // Defence
  "AFCAT", "INET", "Territorial Army",
  // State PSC
  "BPSC", "UPPSC", "MPPSC", "RPSC", "JPSC", "HPSC", "WBPSC",
  // Other
  "CUET", "UGC NET", "CSIR NET", "GATE", "CAT"
];

export const SUBJECTS: { [key: string]: string[] } = {
  // UPSC
  "UPSC CSE": ["History", "Polity", "Geography", "Economy", "Science & Technology", "Environment", "Current Affairs", "CSAT"],
  "UPSC CAPF": ["General Mental Ability", "General Science", "Current Events", "Indian Polity and Economy", "History of India", "Indian and World Geography", "General English"],
  "UPSC CDS": ["English", "General Knowledge", "Elementary Mathematics"],
  "UPSC NDA": ["Mathematics", "General Ability Test"],
  // SSC
  "SSC CGL": ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"],
  "SSC CHSL": ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"],
  "SSC MTS": ["Numerical and Mathematical Ability", "Reasoning Ability and Problem Solving", "General Awareness", "English Language and Comprehension"],
  "SSC GD": ["General Intelligence & Reasoning", "General Knowledge & General Awareness", "Elementary Mathematics", "English/Hindi"],
  "SSC CPO": ["General Intelligence & Reasoning", "General Knowledge & General Awareness", "Quantitative Aptitude", "English Comprehension"],
  "SSC JE": ["General Intelligence & Reasoning", "General Awareness", "Technical Subject"],
  // Banking
  "IBPS PO": ["Quantitative Aptitude", "Reasoning", "English", "General Awareness", "Computer Knowledge"],
  "IBPS Clerk": ["Quantitative Aptitude", "Reasoning", "English", "General Awareness", "Computer Knowledge"],
  "IBPS RRB Officer Scale I": ["Reasoning", "Quantitative Aptitude", "English/Hindi", "Computer Knowledge", "General Awareness"],
  "IBPS RRB Office Assistant": ["Reasoning", "Quantitative Aptitude", "English/Hindi", "Computer Knowledge", "General Awareness"],
  "SBI PO": ["Quantitative Aptitude", "Reasoning Ability", "English Language", "General/Economy/Banking Awareness", "Computer Aptitude"],
  "SBI Clerk": ["Quantitative Aptitude", "Reasoning Ability", "English Language", "General/Financial Awareness"],
  "RBI Grade B": ["General Awareness", "English Language", "Quantitative Aptitude", "Reasoning", "Economic and Social Issues", "Finance and Management"],
  "RBI Assistant": ["English Language", "Numerical Ability", "Reasoning Ability"],
  // Railways
  "RRB NTPC": ["Mathematics", "General Intelligence and Reasoning", "General Awareness"],
  "RRB Group D": ["Mathematics", "General Intelligence and Reasoning", "General Science", "General Awareness and Current Affairs"],
  "RRB JE": ["Mathematics", "General Intelligence and Reasoning", "General Awareness", "General Science", "Technical Abilities"],
  "RRB ALP": ["Mathematics", "General Intelligence and Reasoning", "General Science", "General Awareness on Current Affairs"],
  // State PSC
  "BPSC": ["General Studies", "Optional Paper"],
  "UPPSC": ["General Studies", "CSAT", "Optional Paper"],
  // Other
  "UGC NET": ["Teaching Aptitude", "Research Aptitude", "Comprehension", "Communication", "Mathematical Reasoning and Aptitude", "Logical Reasoning", "Data Interpretation", "ICT", "People, Development and Environment", "Higher Education System", "Chosen Subject"],
  "GATE": ["Engineering Mathematics", "Specific Branch Paper"],
  "CAT": ["Verbal Ability and Reading Comprehension", "Data Interpretation and Logical Reasoning", "Quantitative Ability"],
};

export const TOPICS: { [key: string]: { [key: string]: string[] } } = {
  "UPSC CSE": {
    "History": ["Ancient India", "Medieval India", "Modern India - Indian National Movement", "Art & Culture", "World History"],
    "Polity": ["Constitutional Framework", "System of Government", "Central Government", "State Government", "Judiciary", "Local Government", "Constitutional Bodies"],
    "Geography": ["Physical Geography", "Indian Geography", "World Geography", "Human Geography"],
    "Economy": ["National Income", "Money and Banking", "Budgeting and Fiscal Policy", "Indian Agriculture", "Economic Reforms", "Poverty and Unemployment"],
    "Science & Technology": ["Biotechnology", "Space Technology", "Defence Technology", "Information Technology", "Health and Diseases"],
    "Environment": ["Ecology and Biodiversity", "Climate Change", "Environmental Pollution", "Conservation"],
    "CSAT": ["Comprehension", "Interpersonal skills including communication skills", "Logical reasoning and analytical ability", "Decision making and problem solving", "General mental ability", "Basic numeracy"]
  },
  "UPSC CAPF": {
    "General Mental Ability": ["Logical Reasoning", "Quantitative Aptitude", "Data Interpretation"],
    "General Science": ["Physics", "Chemistry", "Biology", "Everyday Science"],
    "Current Events": ["National and International Importance"],
    "Indian Polity and Economy": ["Indian Constitution", "Indian Economy and Planning", "Governance"],
    "History of India": ["Ancient", "Medieval", "Modern - Freedom Struggle"],
    "Indian and World Geography": ["Physical", "Social", "Economic Geography of India and the World"]
  },
  "SSC CGL": {
    "Quantitative Aptitude": ["Number System", "Percentage", "Profit & Loss", "Time & Work", "Algebra", "Geometry", "Trigonometry", "Data Interpretation"],
    "Reasoning": ["Analogy", "Coding-Decoding", "Syllogism", "Blood Relations", "Verbal and Non-verbal reasoning"],
    "English": ["Reading Comprehension", "Cloze Test", "Synonyms & Antonyms", "Idioms & Phrases", "One word substitution", "Error Spotting"],
    "General Awareness": ["History", "Geography", "Polity", "Economy", "General Science", "Static GK", "Current Affairs"]
  },
  "IBPS PO": {
    "Quantitative Aptitude": ["Simplification/Approximation", "Number Series", "Data Interpretation", "Quadratic Equations", "Arithmetic Problems"],
    "Reasoning": ["Puzzles", "Seating Arrangement", "Syllogism", "Blood Relations", "Input-Output"],
    "English": ["Reading Comprehension", "Cloze Test", "Para Jumbles", "Error Spotting"],
    "General Awareness": ["Banking Awareness", "Financial Awareness", "Current Affairs", "Static GK"],
![CDATA[export const EXAMS = [
  // UPSC
  "UPSC CSE", "UPSC CAPF", "UPSC CDS", "UPSC NDA", "UPSC IES", "UPSC Geo-Scientist",
  // SSC
  "SSC CGL", "SSC CHSL", "SSC MTS", "SSC GD", "SSC CPO", "SSC JE", "SSC Stenographer",
  // Banking
  "IBPS PO", "IBPS Clerk", "IBPS RRB Officer Scale I", "IBPS RRB Office Assistant",
  "SBI PO", "SBI Clerk", "SBI SO",
  "RBI Grade B", "RBI Assistant",
  // Railways
  "RRB NTPC", "RRB Group D", "RRB JE", "RRB ALP",
  // Defence
  "AFCAT", "INET", "Territorial Army",
  // State PSC
  "BPSC", "UPPSC", "MPPSC", "RPSC", "JPSC", "HPSC", "WBPSC",
  // Other
  "CUET", "UGC NET", "CSIR NET", "GATE", "CAT"
];

export const SUBJECTS: { [key: string]: string[] } = {
  // UPSC
  "UPSC CSE": ["History", "Polity", "Geography", "Economy", "Science & Technology", "Environment", "Current Affairs", "CSAT"],
  "UPSC CAPF": ["General Mental Ability", "General Science", "Current Events", "Indian Polity and Economy", "History of India", "Indian and World Geography", "General English"],
  "UPSC CDS": ["English", "General Knowledge", "Elementary Mathematics"],
  "UPSC NDA": ["Mathematics", "General Ability Test"],
  // SSC
  "SSC CGL": ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"],
  "SSC CHSL": ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"],
  "SSC MTS": ["Numerical and Mathematical Ability", "Reasoning Ability and Problem Solving", "General Awareness", "English Language and Comprehension"],
  "SSC GD": ["General Intelligence & Reasoning", "General Knowledge & General Awareness", "Elementary Mathematics", "English/Hindi"],
  "SSC CPO": ["General Intelligence & Reasoning", "General Knowledge & General Awareness", "Quantitative Aptitude", "English Comprehension"],
  "SSC JE": ["General Intelligence & Reasoning", "General Awareness", "Technical Subject"],
  // Banking
  "IBPS PO": ["Quantitative Aptitude", "Reasoning", "English", "General Awareness", "Computer Knowledge"],
  "IBPS Clerk": ["Quantitative Aptitude", "Reasoning", "English", "General Awareness", "Computer Knowledge"],
  "IBPS RRB Officer Scale I": ["Reasoning", "Quantitative Aptitude", "English/Hindi", "Computer Knowledge", "General Awareness"],
  "IBPS RRB Office Assistant": ["Reasoning", "Quantitative Aptitude", "English/Hindi", "Computer Knowledge", "General Awareness"],
  "SBI PO": ["Quantitative Aptitude", "Reasoning Ability", "English Language", "General/Economy/Banking Awareness", "Computer Aptitude"],
  "SBI Clerk": ["Quantitative Aptitude", "Reasoning Ability", "English Language", "General/Financial Awareness"],
  "RBI Grade B": ["General Awareness", "English Language", "Quantitative Aptitude", "Reasoning", "Economic and Social Issues", "Finance and Management"],
  "RBI Assistant": ["English Language", "Numerical Ability", "Reasoning Ability"],
  // Railways
  "RRB NTPC": ["Mathematics", "General Intelligence and Reasoning", "General Awareness"],
  "RRB Group D": ["Mathematics", "General Intelligence and Reasoning", "General Science", "General Awareness and Current Affairs"],
  "RRB JE": ["Mathematics", "General Intelligence and Reasoning", "General Awareness", "General Science", "Technical Abilities"],
  "RRB ALP": ["Mathematics", "General Intelligence and Reasoning", "General Science", "General Awareness on Current Affairs"],
  // State PSC
  "BPSC": ["General Studies", "Optional Paper"],
  "UPPSC": ["General Studies", "CSAT", "Optional Paper"],
  // Other
  "UGC NET": ["Teaching Aptitude", "Research Aptitude", "Comprehension", "Communication", "Mathematical Reasoning and Aptitude", "Logical Reasoning", "Data Interpretation", "ICT", "People, Development and Environment", "Higher Education System", "Chosen Subject"],
  "GATE": ["Engineering Mathematics", "Specific Branch Paper"],
  "CAT": ["Verbal Ability and Reading Comprehension", "Data Interpretation and Logical Reasoning", "Quantitative Ability"],
};

export const TOPICS: { [key: string]: { [key: string]: string[] } } = {
  "UPSC CSE": {
    "History": ["Ancient India", "Medieval India", "Modern India - Indian National Movement", "Art & Culture", "World History"],
    "Polity": ["Constitutional Framework", "System of Government", "Central Government", "State Government", "Judiciary", "Local Government", "Constitutional Bodies"],
    "Geography": ["Physical Geography", "Indian Geography", "World Geography", "Human Geography"],
    "Economy": ["National Income", "Money and Banking", "Budgeting and Fiscal Policy", "Indian Agriculture", "Economic Reforms", "Poverty and Unemployment"],
    "Science & Technology": ["Biotechnology", "Space Technology", "Defence Technology", "Information Technology", "Health and Diseases"],
    "Environment": ["Ecology and Biodiversity", "Climate Change", "Environmental Pollution", "Conservation"],
    "CSAT": ["Comprehension", "Interpersonal skills including communication skills", "Logical reasoning and analytical ability", "Decision making and problem solving", "General mental ability", "Basic numeracy"]
  },
  "UPSC CAPF": {
    "General Mental Ability": ["Logical Reasoning", "Quantitative Aptitude", "Data Interpretation"],
    "General Science": ["Physics", "Chemistry", "Biology", "Everyday Science"],
    "Current Events": ["National and International Importance"],
    "Indian Polity and Economy": ["Indian Constitution", "Indian Economy and Planning", "Governance"],
    "History of India": ["Ancient", "Medieval", "Modern - Freedom Struggle"],
    "Indian and World Geography": ["Physical", "Social", "Economic Geography of India and the World"]
  },
  "SSC CGL": {
    "Quantitative Aptitude": ["Number System", "Percentage", "Profit & Loss", "Time & Work", "Algebra", "Geometry", "Trigonometry", "Data Interpretation"],
    "Reasoning": ["Analogy", "Coding-Decoding", "Syllogism", "Blood Relations", "Verbal and Non-verbal reasoning"],
    "English": ["Reading Comprehension", "Cloze Test", "Synonyms & Antonyms", "Idioms & Phrases", "One word substitution", "Error Spotting"],
    "General Awareness": ["History", "Geography", "Polity", "Economy", "General Science", "Static GK", "Current Affairs"]
  },
  "IBPS PO": {
    "Quantitative Aptitude": ["Simplification/Approximation", "Number Series", "Data Interpretation", "Quadratic Equations", "Arithmetic Problems"],
    "Reasoning": ["Puzzles", "Seating Arrangement", "Syllogism", "Blood Relations", "Input-Output"],
    "English": ["Reading Comprehension", "Cloze Test", "Para Jumbles", "Error Spotting"],
    "General Awareness": ["Banking Awareness", "Financial Awareness", "Current Affairs", "Static GK"],
  },
  "RRB NTPC": {
      "Mathematics": ["Number System", "Decimals", "Fractions", "LCM, HCF", "Ratio and Proportion", "Percentage", "Mensuration", "Time and Work", "Time and Distance", "Simple and Compound Interest", "Profit and Loss", "Elementary Algebra", "Geometry and Trigonometry", "Elementary Statistics"],
      "General Intelligence and Reasoning": ["Analogies", "Completion of Number and Alphabetical Series", "Coding and Decoding", "Mathematical Operations", "Similarities and Differences", "Relationships", "Analytical Reasoning", "Syllogism", "Jumbling", "Venn Diagrams", "Puzzle", "Data Sufficiency"],
      "General Awareness": ["Current Events of National and International Importance", "Games and Sports", "Art and Culture of India", "Indian Literature", "Monuments and Places of India", "General Science and Life Science (up to 10th CBSE)", "History of India and Freedom Struggle", "Physical, Social and Economic Geography of India and World", "Indian Polity and Governance- constitution and political system", "General Scientific and Technological Developments including Space and Nuclear Program of India", "UNICEF and Other important World Organizations"]
  }
};

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Mixed'] as const;
export const LANGUAGES = ['English', 'Hindi', 'Bilingual'] as const;
export const NUM_QUESTIONS = [5, 10, 20, 25, 50, 100];
