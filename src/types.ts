export type ExamQuestion = {
  id: string;
  question: string;
  options: Array<{ id: string; text: string; correct: boolean }>;
  explain: string;
};

export type Module = {
  id: string;
  title: string;
  subtitle: string;
  lessons: Array<{ title: string; body: string }>;
  termIds: string[];
  exam: ExamQuestion[];
  passScore: number;
  practiceCaseId?: string;
};
