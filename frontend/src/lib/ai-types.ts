/**
 * Shared on-device + server AI types. Kept in a tiny module so both the
 * browser bundle and server code can import them without dragging in the
 * transformers library.
 */
export type CbtDistortion =
    | 'catastrophising'
    | 'all-or-nothing thinking'
    | 'mind reading'
    | 'fortune telling'
    | 'overgeneralisation'
    | 'personalisation'
    | 'emotional reasoning'
    | 'should statements'
    | 'labelling'
    | 'disqualifying the positive';

export interface CbtHit {
    label: CbtDistortion;
    confidence: number;
    excerpt?: string;
}

export interface CbtResult {
    hits: CbtHit[];
    model: string;
}

/**
 * Map the on-device label-set to the server's snake_case taxonomy so both
 * codepaths produce the same shape to the UI.
 */
export type ServerDistortion =
    | 'catastrophising'
    | 'all_or_nothing'
    | 'mind_reading'
    | 'fortune_telling'
    | 'should_statements'
    | 'personalisation'
    | 'emotional_reasoning'
    | 'disqualifying_the_positive'
    | 'magnification'
    | 'labeling'
    | 'mental_filter'
    | 'overgeneralisation';

export const CBT_TO_SERVER: Record<CbtDistortion, ServerDistortion> = {
    catastrophising: 'catastrophising',
    'all-or-nothing thinking': 'all_or_nothing',
    'mind reading': 'mind_reading',
    'fortune telling': 'fortune_telling',
    overgeneralisation: 'overgeneralisation',
    personalisation: 'personalisation',
    'emotional reasoning': 'emotional_reasoning',
    'should statements': 'should_statements',
    labelling: 'labeling',
    'disqualifying the positive': 'disqualifying_the_positive',
};

export const CBT_REFRAMES: Record<ServerDistortion, string> = {
    catastrophising: "The mind is reaching for worst-case. What's the most likely outcome, not the scariest one?",
    all_or_nothing: 'Words like "always" and "never" rarely hold up — is there a small counter-example this week?',
    mind_reading: "We can't actually see inside other people's heads. What else could their behaviour mean?",
    fortune_telling: "You're predicting. The future is still open — what evidence do you actually have yet?",
    should_statements: '"Should" often hides self-judgement. What would a kinder voice say instead?',
    personalisation: "Not everything that happens around you is caused by you. What's outside your control here?",
    emotional_reasoning: "Feelings are real, but they're not always facts. What would the evidence say on its own?",
    disqualifying_the_positive: "You're allowed to count the good parts. What small thing actually went okay?",
    magnification: "The mind is zooming in on one piece. What does the wider picture look like?",
    labeling: "You are not a label. One struggle doesn't define you.",
    mental_filter: "There may be other parts of today the mind is filtering out. What else happened?",
    overgeneralisation: "One moment doesn't always become a pattern. What recent exception comes to mind?",
};
