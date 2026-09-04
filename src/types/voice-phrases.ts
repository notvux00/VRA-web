export interface LessonVoiceQuestV2 {
  binding_id: string;
  title?: string;
  goal: string;
  default_phrases: string[];
}

export interface QuestPhraseAdditionsV2 {
  binding_id: string;
  phrases: string[];
}

export interface ChildLessonPhraseSetV2 {
  schema_version: 2;
  scope: "lesson";
  child_id: string;
  lesson_id: string;
  revision: number;
  quest_additions: QuestPhraseAdditionsV2[];
}

export interface ChildGeneralPhraseSetV2 {
  schema_version: 2;
  scope: "general";
  child_id: string;
  revision: number;
  phrases: string[];
}

export interface ResolvedVoiceQuestV2 {
  binding_id: string;
  title?: string;
  goal: string;
  phrases: string[];
}

export interface SaveChildLessonPhraseSetV2 {
  childId: string;
  lessonId: string;
  expectedRevision: number;
  questAdditions: QuestPhraseAdditionsV2[];
  lessonQuests: LessonVoiceQuestV2[];
}

export interface SaveChildGeneralPhraseSetV2 {
  childId: string;
  expectedRevision: number;
  phrases: string[];
}
