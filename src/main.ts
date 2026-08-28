import './styles.css';
import { buildPacketHtml } from './packet';
import {
  newActivity,
  safeFilename,
  sanitizeImportedPacket,
  starterPacket,
  validatePacket,
  type ActivityType,
  type Packet,
  type ValidationIssue,
} from './model';

const DRAFT_KEY = 'lesson-packet:teacher-draft:v1';
function mustFind<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`The packet composer could not find ${selector}.`);
  return element;
}

const form = mustFind<HTMLFormElement>('#packet-form');
const activitiesRoot = mustFind<HTMLElement>('#activities');
const emptyActivities = mustFind<HTMLElement>('#empty-activities');
const preview = mustFind<HTMLIFrameElement>('#packet-preview');
const draftStatus = mustFind<HTMLElement>('#draft-status');
const errorSummary = mustFind<HTMLElement>('#error-summary');
const toast = mustFind<HTMLElement>('#toast');
const importInput = mustFind<HTMLInputElement>('#import-template');

let packet = loadDraft();
let previewTimer = 0;
let saveTimer = 0;
let toastTimer = 0;

const fields = {
  title: document.querySelector<HTMLInputElement>('#lesson-title')!,
  subject: document.querySelector<HTMLInputElement>('#lesson-subject')!,
  minutes: document.querySelector<HTMLInputElement>('#lesson-time')!,
  instructions: document.querySelector<HTMLTextAreaElement>('#lesson-instructions')!,
  reflection: document.querySelector<HTMLTextAreaElement>('#reflection-prompt')!,
  exitPrompt: document.querySelector<HTMLTextAreaElement>('#exit-prompt')!,
  allowLocalSave: document.querySelector<HTMLInputElement>('#remember-responses')!,
};

function loadDraft(): Packet {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? sanitizeImportedPacket(JSON.parse(raw)) : starterPacket();
  } catch {
    return starterPacket();
  }
}

function setFormValues(): void {
  fields.title.value = packet.title;
  fields.subject.value = packet.subject;
  fields.minutes.value = packet.minutes ? String(packet.minutes) : '';
  fields.instructions.value = packet.instructions;
  fields.reflection.value = packet.reflection;
  fields.exitPrompt.value = packet.exitPrompt;
  fields.allowLocalSave.checked = packet.allowLocalSave;
}

function updatePacketFromForm(): void {
  packet.title = fields.title.value;
  packet.subject = fields.subject.value;
  const minutes = Number(fields.minutes.value);
  packet.minutes = fields.minutes.value && Number.isFinite(minutes) ? Math.min(300, Math.max(1, Math.round(minutes))) : null;
  packet.instructions = fields.instructions.value;
  packet.reflection = fields.reflection.value;
  packet.exitPrompt = fields.exitPrompt.value;
  packet.allowLocalSave = fields.allowLocalSave.checked;
}

function activityLabel(type: ActivityType): string {
  return { checklist: 'Checklist', sort: 'Put in order', write: 'Short response' }[type];
}

function renderActivities(focusId?: string): void {
  activitiesRoot.replaceChildren();
  emptyActivities.hidden = packet.activities.length > 0;
  packet.activities.forEach((activity, activityIndex) => {
    const card = document.createElement('section');
    card.className = 'activity-card';
    card.dataset.type = activity.type;
    card.dataset.id = activity.id;
    card.id = `activity-${activity.id}`;

    const heading = document.createElement('div');
    heading.className = 'activity-card-head';
    heading.innerHTML = `<div><strong>Activity ${activityIndex + 1}</strong><span class="activity-type">${activityLabel(activity.type)}</span></div>
      <div class="icon-actions">
        <button class="icon-button" type="button" data-action="move-up" aria-label="Move activity ${activityIndex + 1} up" ${activityIndex === 0 ? 'disabled' : ''}>↑</button>
        <button class="icon-button" type="button" data-action="move-down" aria-label="Move activity ${activityIndex + 1} down" ${activityIndex === packet.activities.length - 1 ? 'disabled' : ''}>↓</button>
        <button class="icon-button danger" type="button" data-action="remove" aria-label="Remove activity ${activityIndex + 1}">×</button>
      </div>`;
    card.append(heading);

    const field = document.createElement('div');
    field.className = 'field';
    const label = document.createElement('label');
    label.htmlFor = `activity-prompt-${activity.id}`;
    label.textContent = 'Prompt *';
    const input = document.createElement('textarea');
    input.id = label.htmlFor;
    input.rows = 2;
    input.maxLength = 500;
    input.required = true;
    input.dataset.activityField = 'prompt';
    input.value = activity.prompt;
    field.append(label, input);
    card.append(field);

    if (activity.type !== 'write') {
      const list = document.createElement('div');
      list.className = 'option-list';
      list.setAttribute('aria-label', `${activityLabel(activity.type)} items`);
      activity.options.forEach((option, optionIndex) => {
        const row = document.createElement('div');
        row.className = 'option-row';
        const number = document.createElement('span');
        number.className = 'option-handle';
        number.setAttribute('aria-hidden', 'true');
        number.textContent = activity.type === 'checklist' ? '□' : String(optionIndex + 1);
        const optionLabel = document.createElement('label');
        optionLabel.className = 'sr-only';
        optionLabel.htmlFor = `option-${activity.id}-${optionIndex}`;
        optionLabel.textContent = `Item ${optionIndex + 1} for activity ${activityIndex + 1}`;
        const optionInput = document.createElement('input');
        optionInput.id = optionLabel.htmlFor;
        optionInput.value = option;
        optionInput.maxLength = 240;
        optionInput.required = true;
        optionInput.dataset.optionIndex = String(optionIndex);
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'remove-option';
        remove.dataset.removeOption = String(optionIndex);
        remove.setAttribute('aria-label', `Remove item ${optionIndex + 1}`);
        remove.textContent = '×';
        row.append(number, optionLabel, optionInput, remove);
        list.append(row);
      });
      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'add-option';
      add.dataset.action = 'add-option';
      add.textContent = '+ Add another item';
      list.append(add);
      card.append(list);
    }
    activitiesRoot.append(card);
  });
  if (focusId) requestAnimationFrame(() => document.getElementById(focusId)?.focus());
}

function scheduleSaveAndPreview(): void {
  draftStatus.textContent = 'Saving…';
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(packet));
      draftStatus.textContent = 'Draft saved on this device';
    } catch {
      draftStatus.textContent = 'Draft could not be saved';
    }
  }, 300);
  window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(renderPreview, 220);
}

function renderPreview(): void {
  preview.srcdoc = buildPacketHtml(packet, true);
}

function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3200);
}

function download(contents: string, filename: string, type: string): void {
  const blob = new Blob([contents], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function displayErrors(issues: ValidationIssue[]): void {
  form.querySelectorAll('[aria-invalid="true"]').forEach((element) => element.removeAttribute('aria-invalid'));
  if (!issues.length) {
    errorSummary.hidden = true;
    errorSummary.replaceChildren();
    return;
  }
  const heading = document.createElement('strong');
  heading.textContent = `Fix ${issues.length} ${issues.length === 1 ? 'thing' : 'things'} before downloading:`;
  const list = document.createElement('ul');
  issues.forEach((issue) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${issue.fieldId}`;
    link.textContent = issue.message;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById(issue.fieldId)?.focus();
    });
    item.append(link);
    list.append(item);
    document.getElementById(issue.fieldId)?.setAttribute('aria-invalid', 'true');
  });
  errorSummary.replaceChildren(heading, list);
  errorSummary.hidden = false;
  errorSummary.focus();
}

form.addEventListener('input', (event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  const card = target.closest<HTMLElement>('.activity-card');
  if (card) {
    const activity = packet.activities.find((item) => item.id === card.dataset.id);
    if (!activity) return;
    if (target.dataset.activityField === 'prompt') activity.prompt = target.value;
    if (target.dataset.optionIndex !== undefined) activity.options[Number(target.dataset.optionIndex)] = target.value;
  } else {
    updatePacketFromForm();
  }
  scheduleSaveAndPreview();
});

form.addEventListener('change', (event) => {
  if ((event.target as HTMLInputElement).name === 'allowLocalSave') {
    updatePacketFromForm();
    scheduleSaveAndPreview();
  }
});

activitiesRoot.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
  const card = button?.closest<HTMLElement>('.activity-card');
  if (!button || !card) return;
  const index = packet.activities.findIndex((item) => item.id === card.dataset.id);
  if (index < 0) return;
  const activity = packet.activities[index];
  const action = button.dataset.action;
  if (action === 'move-up' && index > 0) {
    [packet.activities[index - 1], packet.activities[index]] = [packet.activities[index], packet.activities[index - 1]];
    renderActivities(`activity-${activity.id}`);
    showToast(`Activity moved to position ${index}.`);
  } else if (action === 'move-down' && index < packet.activities.length - 1) {
    [packet.activities[index + 1], packet.activities[index]] = [packet.activities[index], packet.activities[index + 1]];
    renderActivities(`activity-${activity.id}`);
    showToast(`Activity moved to position ${index + 2}.`);
  } else if (action === 'remove') {
    if (!window.confirm(`Remove activity ${index + 1}? This cannot be undone.`)) return;
    packet.activities.splice(index, 1);
    renderActivities();
    showToast('Activity removed.');
  } else if (action === 'add-option') {
    if (activity.options.length >= 20) return showToast('Each activity can have up to 20 items.');
    activity.options.push('');
    renderActivities(`option-${activity.id}-${activity.options.length - 1}`);
  } else if (button.dataset.removeOption !== undefined) {
    activity.options.splice(Number(button.dataset.removeOption), 1);
    renderActivities();
    showToast('Item removed.');
  } else {
    return;
  }
  scheduleSaveAndPreview();
});

document.querySelectorAll<HTMLButtonElement>('[data-add]').forEach((button) => {
  button.addEventListener('click', () => {
    if (packet.activities.length >= 20) return showToast('A packet can have up to 20 activity blocks.');
    const activity = newActivity(button.dataset.add as ActivityType);
    packet.activities.push(activity);
    renderActivities(`activity-prompt-${activity.id}`);
    scheduleSaveAndPreview();
    showToast(`${activityLabel(activity.type)} added.`);
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  updatePacketFromForm();
  const issues = validatePacket(packet);
  displayErrors(issues);
  if (issues.length) return;
  download(buildPacketHtml(packet), safeFilename(packet.title, 'html'), 'text/html;charset=utf-8');
  showToast('Lesson packet downloaded. Open it once before sharing.');
});

document.querySelector('#download-template')?.addEventListener('click', () => {
  updatePacketFromForm();
  download(JSON.stringify(packet, null, 2), safeFilename(packet.title, 'json'), 'application/json');
  showToast('Editable template downloaded.');
});

importInput.addEventListener('change', async () => {
  const file = importInput.files?.[0];
  importInput.value = '';
  if (!file) return;
  if (file.size > 200_000) return showToast('That template is too large. Choose a file under 200 KB.');
  try {
    packet = sanitizeImportedPacket(JSON.parse(await file.text()));
    setFormValues();
    renderActivities();
    scheduleSaveAndPreview();
    displayErrors([]);
    showToast('Template imported and checked.');
  } catch (error) {
    showToast(error instanceof Error ? error.message : 'That template could not be imported.');
  }
});

document.querySelector('#reset-draft')?.addEventListener('click', () => {
  if (!window.confirm('Start over with the example packet? Your current draft will be replaced.')) return;
  packet = starterPacket();
  setFormValues();
  renderActivities();
  scheduleSaveAndPreview();
  displayErrors([]);
  showToast('A fresh example packet is ready.');
});

function updateOfflineState(): void {
  const bar = document.querySelector<HTMLElement>('#offline-bar');
  if (bar) bar.hidden = navigator.onLine;
}

window.addEventListener('online', updateOfflineState);
window.addEventListener('offline', updateOfflineState);
updateOfflineState();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  navigator.serviceWorker.register('/sw.js').catch(() => undefined);
}

setFormValues();
renderActivities();
renderPreview();
