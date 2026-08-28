export type ActivityType = 'checklist' | 'sort' | 'write';

export interface Activity {
  id: string;
  type: ActivityType;
  prompt: string;
  options: string[];
}

export interface Packet {
  version: 1;
  title: string;
  subject: string;
  minutes: number | null;
  instructions: string;
  activities: Activity[];
  reflection: string;
  exitPrompt: string;
  allowLocalSave: boolean;
}

export interface ValidationIssue {
  fieldId: string;
  message: string;
}

const limits = {
  title: 100,
  subject: 80,
  instructions: 1500,
  prompt: 500,
  option: 240,
  activities: 20,
  options: 20,
};

export const starterPacket = (): Packet => ({
  version: 1,
  title: 'Notice, wonder, connect',
  subject: 'Small-group lesson',
  minutes: 20,
  instructions: 'Work through each activity in order. Take your time and use specific details in your reflection.',
  activities: [
    {
      id: createId(),
      type: 'checklist',
      prompt: 'Before you begin, check what you have ready.',
      options: ['Read the source once', 'Underline one key detail', 'Write down one question'],
    },
    {
      id: createId(),
      type: 'sort',
      prompt: 'Put these thinking steps in the order you would use them.',
      options: ['Notice a detail', 'Ask what it might mean', 'Connect it to the main idea'],
    },
  ],
  reflection: 'What changed or became clearer in your thinking?',
  exitPrompt: 'What is one question you would carry into the next lesson?',
  allowLocalSave: false,
});

export function createId(): string {
  if ('randomUUID' in crypto) return crypto.randomUUID();
  return `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function newActivity(type: ActivityType): Activity {
  const defaults: Record<ActivityType, Pick<Activity, 'prompt' | 'options'>> = {
    checklist: { prompt: 'What should learners check off?', options: ['First item', 'Second item'] },
    sort: { prompt: 'What should learners put in order?', options: ['First step', 'Second step', 'Third step'] },
    write: { prompt: 'What should learners explain?', options: [] },
  };
  return { id: createId(), type, ...defaults[type] };
}

function cleanText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, max);
}

export function sanitizeImportedPacket(value: unknown): Packet {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('This file is not a Lesson Packet template.');
  }
  const raw = value as Record<string, unknown>;
  if (raw.version !== 1 || !Array.isArray(raw.activities)) {
    throw new Error('This template version is not supported.');
  }
  if (raw.activities.length > limits.activities) {
    throw new Error(`A template can contain at most ${limits.activities} activity blocks.`);
  }

  const activities = raw.activities.map((item, index): Activity => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(`Activity ${index + 1} is not valid.`);
    }
    const activity = item as Record<string, unknown>;
    if (!['checklist', 'sort', 'write'].includes(String(activity.type))) {
      throw new Error(`Activity ${index + 1} has an unsupported type.`);
    }
    const type = activity.type as ActivityType;
    const rawOptions = Array.isArray(activity.options) ? activity.options : [];
    if (rawOptions.length > limits.options) {
      throw new Error(`Activity ${index + 1} has too many items.`);
    }
    return {
      id: createId(),
      type,
      prompt: cleanText(activity.prompt, limits.prompt),
      options: type === 'write' ? [] : rawOptions.map((option) => cleanText(option, limits.option)),
    };
  });

  const minutesValue = Number(raw.minutes);
  return {
    version: 1,
    title: cleanText(raw.title, limits.title),
    subject: cleanText(raw.subject, limits.subject),
    minutes: Number.isFinite(minutesValue) && minutesValue >= 1 && minutesValue <= 300 ? Math.round(minutesValue) : null,
    instructions: cleanText(raw.instructions, limits.instructions),
    activities,
    reflection: cleanText(raw.reflection, limits.prompt),
    exitPrompt: cleanText(raw.exitPrompt, limits.prompt),
    allowLocalSave: raw.allowLocalSave === true,
  };
}

export function validatePacket(packet: Packet): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!packet.title.trim()) issues.push({ fieldId: 'lesson-title', message: 'Add a lesson title.' });
  if (!packet.instructions.trim()) issues.push({ fieldId: 'lesson-instructions', message: 'Add lesson instructions.' });
  if (!packet.activities.length) issues.push({ fieldId: 'activities', message: 'Add at least one activity block.' });
  packet.activities.forEach((activity, index) => {
    if (!activity.prompt.trim()) issues.push({ fieldId: `activity-prompt-${activity.id}`, message: `Add a prompt to activity ${index + 1}.` });
    if (activity.type !== 'write') {
      if (activity.options.length < 2) issues.push({ fieldId: `activity-${activity.id}`, message: `Add at least two items to activity ${index + 1}.` });
      activity.options.forEach((option, optionIndex) => {
        if (!option.trim()) issues.push({ fieldId: `option-${activity.id}-${optionIndex}`, message: `Fill in item ${optionIndex + 1} in activity ${index + 1}.` });
      });
    }
  });
  if (!packet.reflection.trim()) issues.push({ fieldId: 'reflection-prompt', message: 'Add a reflection prompt.' });
  if (!packet.exitPrompt.trim()) issues.push({ fieldId: 'exit-prompt', message: 'Add an exit check.' });
  return issues;
}

export function safeFilename(title: string, extension: 'html' | 'json'): string {
  const base = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'lesson-packet';
  return `${base}.${extension}`;
}
