
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
  // State PSCs
  "BPSC", "UPPSC", "MPPSC", "RPSC", "JPSC", "HPSC", "WBPSC",
  // Other Major Exams
  "CUET", "UGC NET", "CSIR NET", "GATE", "CAT", "LIC AAO", "LIC ADO", "NABARD Grade A", "SEBI Grade A"
];

export const SUBJECTS: { [key: string]: string[] } = {
  // UPSC
  "UPSC CSE": ["History", "Polity", "Geography", "Economy", "Science & Technology", "Environment", "Current Affairs", "CSAT"],
  "UPSC CAPF": ["General Mental Ability", "General Science", "Current Events", "Indian Polity and Economy", "History of India", "Indian and World Geography"],
  "UPSC CDS": ["English", "General Knowledge", "Elementary Mathematics"],
  "UPSC NDA": ["Mathematics", "General Ability Test"],
  // SSC
  "SSC CGL": ["Quantitative Aptitude", "General Intelligence & Reasoning", "English Language & Comprehension", "General Awareness"],
  "SSC CHSL": ["Quantitative Aptitude", "General Intelligence & Reasoning", "English Language", "General Awareness"],
  "SSC MTS": ["Numerical and Mathematical Ability", "Reasoning Ability and Problem Solving", "General Awareness", "English Language and Comprehension"],
  "SSC GD": ["General Intelligence & Reasoning", "General Knowledge & General Awareness", "Elementary Mathematics", "English/Hindi"],
  "SSC CPO": ["General Intelligence & Reasoning", "General Knowledge & General Awareness", "Quantitative Aptitude", "English Comprehension"],
  "SSC JE": ["General Intelligence & Reasoning", "General Awareness", "Technical Subject (Civil/Electrical/Mechanical)"],
  // Banking
  "IBPS PO": ["Quantitative Aptitude", "Reasoning Ability", "English Language", "General, Economy & Banking Awareness", "Computer Aptitude"],
  "IBPS Clerk": ["Quantitative Aptitude", "Reasoning Ability", "English Language", "General/Financial Awareness"],
  "IBPS RRB Officer Scale I": ["Reasoning", "Quantitative Aptitude", "English/Hindi", "Computer Knowledge", "General Awareness"],
  "IBPS RRB Office Assistant": ["Reasoning", "Quantitative Aptitude", "English/Hindi", "Computer Knowledge", "General Awareness"],
  "SBI PO": ["Quantitative Aptitude", "Reasoning Ability", "English Language", "Data Analysis & Interpretation", "General/Economy/Banking Awareness", "Computer Aptitude"],
  "SBI Clerk": ["Quantitative Aptitude", "Reasoning Ability", "English Language", "General/Financial Awareness"],
  "RBI Grade B": ["General Awareness", "English Language", "Quantitative Aptitude", "Reasoning", "Economic and Social Issues", "Finance and Management"],
  "RBI Assistant": ["English Language", "Numerical Ability", "Reasoning Ability"],
  // Railways
  "RRB NTPC": ["Mathematics", "General Intelligence and Reasoning", "General Awareness"],
  "RRB Group D": ["General Science", "Mathematics", "General Intelligence and Reasoning", "General Awareness and Current Affairs"],
  "RRB JE": ["Mathematics", "General Intelligence and Reasoning", "General Awareness", "General Science", "Technical Abilities"],
  "RRB ALP": ["Mathematics", "General Intelligence and Reasoning", "General Science", "General Awareness on Current Affairs"],
  // State PSCs
  "BPSC": ["General Studies", "Optional Paper"],
  "UPPSC": ["General Studies", "CSAT", "Optional Paper"],
  // Other
  "UGC NET": ["Teaching Aptitude", "Research Aptitude", "Comprehension", "Communication", "Mathematical Reasoning and Aptitude", "Logical Reasoning", "Data Interpretation", "ICT", "People, Development and Environment", "Higher Education System", "Chosen Subject"],
  "GATE": ["Engineering Mathematics", "Specific Branch Paper"],
  "CAT": ["Verbal Ability and Reading Comprehension", "Data Interpretation and Logical Reasoning", "Quantitative Ability"],
};

export const TOPICS: { [key: string]: { [key: string]: string[] } } = {
  "UPSC CSE": {
    "History": ["Ancient India (Prehistoric, Indus Valley, Vedic, Mauryan, Post-Mauryan)", "Medieval India (Sultanate, Mughal, Vijayanagar)", "Modern India (British Conquest, Social-Religious Reforms, Indian National Movement)", "Art & Culture", "World History"],
    "Polity": ["Constitutional Framework & Preamble", "Fundamental Rights & Duties, DPSP", "System of Government (Parliamentary, Federal)", "Central Government (President, Parliament, Judiciary)", "State Government", "Judiciary System", "Local Government & Panchayati Raj", "Constitutional & Non-Constitutional Bodies"],
    "Geography": ["Physical Geography (Geomorphology, Climatology, Oceanography)", "Indian Geography (Physical Features, Rivers, Climate, Minerals)", "World Geography", "Human & Economic Geography"],
    "Economy": ["National Income & Measurement", "Money, Banking & Financial Markets", "Budgeting & Fiscal Policy", "Indian Agriculture", "Economic Reforms, LPG", "Poverty, Inclusion & Demographics", "External Sector"],
    "Science & Technology": ["Biotechnology & Health", "Space Technology & ISRO", "Defence Technology", "IT, Computers & Robotics", "Nuclear Technology", "Recent Developments"],
    "Environment": ["Ecology, Ecosystem & Biodiversity", "Climate Change & Global Warming", "Environmental Pollution & Degradation", "Conservation, Protected Areas", "National & International Conventions"],
    "CSAT": ["Reading Comprehension", "Interpersonal & Communication Skills", "Logical Reasoning & Analytical Ability", "Decision Making & Problem Solving", "General Mental Ability", "Basic Numeracy & Data Interpretation"]
  },
  "SSC CGL": {
    "General Intelligence & Reasoning": [
        "Analogy", "Classification", "Coding-Decoding", "Series (Number, Alphabet, Figure)", 
        "Blood Relations", "Direction and Distance", "Syllogism", "Venn Diagrams", "Puzzles", 
        "Seating Arrangement", "Statement and Conclusion", "Logical Reasoning", 
        "Missing Number", "Matrix", "Paper Folding, Cutting & Unfolding", "Embedded Figures",
        "Figure Completion", "Mirror and Water Images", "Non-Verbal Reasoning"
    ],
    "Quantitative Aptitude": [
        "Number System & Simplification", "Percentage", "Profit, Loss & Discount", "Ratio and Proportion", 
        "Average", "Simple & Compound Interest", "Time & Work, Pipes & Cisterns", "Time, Speed & Distance",
        "Algebra", "Geometry", "Mensuration (2D & 3D)", "Trigonometry", "Data Interpretation (Charts, Graphs)"
    ],
    "English Language & Comprehension": [
        "Reading Comprehension", "Cloze Test", "Synonyms & Antonyms", "Idioms & Phrases", 
        "One-Word Substitution", "Error Spotting & Sentence Correction", "Fill in the Blanks", 
        "Active & Passive Voice", "Direct & Indirect Speech", "Para Jumbles"
    ],
    "General Awareness": ["History (Ancient, Medieval, Modern)", "Geography (Indian, World)", "Polity & Constitution", "Economy", "General Science (Physics, Chemistry, Biology)", "Static GK (Art, Culture, Books, Awards)", "Current Affairs (National & International)"]
  },
  "IBPS PO": {
    "Reasoning Ability": [
        "Puzzles (Floor, Box, Day/Month based)", "Seating Arrangements (Linear, Circular, Square)",
        "Syllogism", "Blood Relations", "Direction Sense", "Inequalities (Coded & Direct)",
        "Input-Output", "Coding-Decoding", "Data Sufficiency", "Logical Reasoning"
    ],
    "Quantitative Aptitude": [
        "Simplification & Approximation", "Number Series (Missing & Wrong)", "Data Interpretation (Bar, Line, Pie, Tabular, Caselet)",
        "Quadratic Equations", "Quantity Comparison (Q1, Q2)", "Arithmetic Problems (Percentage, Profit/Loss, Time/Work etc.)"
    ],
    "English Language": [
        "Reading Comprehension", "Cloze Test", "Para Jumbles / Sentence Rearrangement",
        "Error Spotting / Sentence Correction", "Fillers (Single, Double)", "Word Swap / Word Usage"
    ],
    "General, Economy & Banking Awareness": ["Banking & Financial Awareness", "Current Affairs (Last 6 months)", "Static Awareness (GK)"]
  },
  "RRB NTPC": {
      "Mathematics": ["Number System & BODMAS", "Decimals & Fractions", "LCM, HCF", "Ratio and Proportion", "Percentage", "Mensuration", "Time and Work", "Time and Distance", "Simple and Compound Interest", "Profit and Loss", "Elementary Algebra", "Geometry and Trigonometry", "Elementary Statistics"],
      "General Intelligence and Reasoning": ["Analogies", "Series (Number, Alphabetical)", "Coding and Decoding", "Mathematical Operations", "Relationships (Blood Relations)", "Syllogism", "Jumbling & Venn Diagrams", "Puzzle & Data Sufficiency", "Statement-Conclusion & Decision Making", "Analytical Reasoning"],
      "General Awareness": ["Current Events (National/International)", "Games and Sports", "Art and Culture of India", "Indian Literature & Monuments", "General Science & Life Science (up to 10th CBSE)", "History of India & Freedom Struggle", "Indian & World Geography", "Indian Polity & Governance", "Scientific Developments (Space, Nuclear)", "UN & World Organizations", "Environmental Issues", "Basics of Computers"]
  }
};


export const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Mixed'] as const;
export const LANGUAGES = ['English', 'Hindi', 'Bilingual'] as const;
export const NUM_QUESTIONS = [5, 10, 20, 25, 50, 100];
