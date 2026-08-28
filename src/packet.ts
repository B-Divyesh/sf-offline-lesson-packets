import type { Activity, Packet } from './model';

function packetRuntime(): void {
  type SavedState = {
    name: string;
    responses: Record<string, string | boolean[]>;
    reflection: string;
    exit: string;
  };

  const configNode = document.getElementById('packet-data');
  if (!configNode?.textContent) return;
  const config = JSON.parse(configNode.textContent) as Packet & { preview?: boolean };
  const storageKey = `lesson-packet:${location.pathname}:${config.title}`;
  const status = document.getElementById('status') as HTMLElement;
  const activitiesRoot = document.getElementById('packet-activities') as HTMLElement;
  const learnerName = document.getElementById('learner-name') as HTMLInputElement;
  const reflection = document.getElementById('reflection') as HTMLTextAreaElement;
  const exit = document.getElementById('exit') as HTMLTextAreaElement;
  let saved: SavedState = { name: '', responses: {}, reflection: '', exit: '' };

  const announce = (message: string): void => {
    status.textContent = message;
  };

  const moveItem = (list: HTMLOListElement, index: number, direction: -1 | 1): void => {
    const items = Array.from(list.children);
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const current = items[index];
    if (direction === -1) list.insertBefore(current, items[target]);
    else list.insertBefore(items[target], current);
    const label = current.querySelector('.sort-text')?.textContent || 'Item';
    announce(`${label} moved to position ${target + 1}.`);
    save();
  };

  const createSortItem = (text: string, list: HTMLOListElement): HTMLLIElement => {
    const item = document.createElement('li');
    item.className = 'sort-item';
    item.draggable = true;
    const handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.setAttribute('aria-hidden', 'true');
    handle.textContent = '⠿';
    const label = document.createElement('span');
    label.className = 'sort-text';
    label.textContent = text;
    const controls = document.createElement('span');
    controls.className = 'sort-controls';
    const up = document.createElement('button');
    up.type = 'button';
    up.textContent = '↑';
    up.setAttribute('aria-label', `Move ${text} up`);
    up.addEventListener('click', () => moveItem(list, Array.from(list.children).indexOf(item), -1));
    const down = document.createElement('button');
    down.type = 'button';
    down.textContent = '↓';
    down.setAttribute('aria-label', `Move ${text} down`);
    down.addEventListener('click', () => moveItem(list, Array.from(list.children).indexOf(item), 1));
    controls.append(up, down);
    item.append(handle, label, controls);
    item.addEventListener('dragstart', () => item.classList.add('dragging'));
    item.addEventListener('dragend', () => { item.classList.remove('dragging'); save(); });
    item.addEventListener('dragover', (event) => {
      event.preventDefault();
      const dragging = list.querySelector('.dragging');
      if (dragging && dragging !== item) {
        const box = item.getBoundingClientRect();
        list.insertBefore(dragging, event.clientY < box.top + box.height / 2 ? item : item.nextSibling);
      }
    });
    return item;
  };

  const renderActivity = (activity: Activity, number: number): void => {
    const section = document.createElement('section');
    section.className = 'activity';
    const heading = document.createElement('h2');
    heading.textContent = `Activity ${number}`;
    const prompt = document.createElement('p');
    prompt.className = 'prompt';
    prompt.textContent = activity.prompt;
    section.append(heading, prompt);

    if (activity.type === 'checklist') {
      const list = document.createElement('ul');
      list.className = 'checklist';
      activity.options.forEach((option, index) => {
        const row = document.createElement('li');
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.dataset.activity = activity.id;
        input.dataset.index = String(index);
        input.addEventListener('change', save);
        const text = document.createElement('span');
        text.textContent = option;
        label.append(input, text);
        row.append(label);
        list.append(row);
      });
      section.append(list);
    } else if (activity.type === 'sort') {
      const instruction = document.createElement('p');
      instruction.className = 'assist';
      instruction.textContent = 'Drag the strips or use the arrow buttons to put them in order.';
      const list = document.createElement('ol');
      list.className = 'sort-list';
      list.dataset.activity = activity.id;
      activity.options.forEach((option) => list.append(createSortItem(option, list)));
      section.append(instruction, list);
    } else {
      const label = document.createElement('label');
      label.className = 'sr-only';
      label.htmlFor = `response-${activity.id}`;
      label.textContent = `Response to activity ${number}`;
      const textarea = document.createElement('textarea');
      textarea.id = `response-${activity.id}`;
      textarea.dataset.activity = activity.id;
      textarea.rows = 5;
      textarea.placeholder = 'Write your response here…';
      textarea.addEventListener('input', save);
      section.append(label, textarea);
    }
    activitiesRoot.append(section);
  };

  const collect = (): SavedState => {
    const responses: SavedState['responses'] = {};
    config.activities.forEach((activity) => {
      if (activity.type === 'checklist') {
        responses[activity.id] = Array.from(document.querySelectorAll<HTMLInputElement>(`input[data-activity="${activity.id}"]`)).map((input) => input.checked);
      } else if (activity.type === 'sort') {
        responses[activity.id] = Array.from(document.querySelectorAll(`[data-activity="${activity.id}"] .sort-text`)).map((item) => item.textContent || '').join('\n');
      } else {
        responses[activity.id] = (document.querySelector<HTMLTextAreaElement>(`textarea[data-activity="${activity.id}"]`)?.value || '');
      }
    });
    return { name: learnerName.value, responses, reflection: reflection.value, exit: exit.value };
  };

  function save(): void {
    saved = collect();
    if (config.allowLocalSave && !config.preview) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(saved));
        announce('Progress saved on this device.');
      } catch {
        announce('This browser could not save progress. You can still download your responses.');
      }
    }
  }

  const restore = (): void => {
    if (!config.allowLocalSave || config.preview) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      saved = JSON.parse(raw) as SavedState;
      learnerName.value = saved.name || '';
      reflection.value = saved.reflection || '';
      exit.value = saved.exit || '';
      config.activities.forEach((activity) => {
        const response = saved.responses[activity.id];
        if (activity.type === 'checklist' && Array.isArray(response)) {
          document.querySelectorAll<HTMLInputElement>(`input[data-activity="${activity.id}"]`).forEach((input, index) => { input.checked = Boolean(response[index]); });
        } else if (activity.type === 'sort' && typeof response === 'string') {
          const list = document.querySelector<HTMLOListElement>(`.sort-list[data-activity="${activity.id}"]`);
          if (list) {
            list.replaceChildren();
            response.split('\n').filter(Boolean).forEach((item) => list.append(createSortItem(item, list)));
          }
        } else if (activity.type === 'write' && typeof response === 'string') {
          const field = document.querySelector<HTMLTextAreaElement>(`textarea[data-activity="${activity.id}"]`);
          if (field) field.value = response;
        }
      });
      announce('Saved progress restored from this device.');
    } catch {
      announce('Saved progress could not be read. You can begin again and download a response file.');
    }
  };

  const responseText = (): string => {
    const data = collect();
    const lines = [config.title, '='.repeat(config.title.length), '', `Learner: ${data.name.trim() || 'Not provided'}`, `Completed: ${new Date().toLocaleString()}`, ''];
    config.activities.forEach((activity, index) => {
      lines.push(`ACTIVITY ${index + 1}`, activity.prompt);
      const answer = data.responses[activity.id];
      if (activity.type === 'checklist' && Array.isArray(answer)) {
        activity.options.forEach((option, itemIndex) => lines.push(`${answer[itemIndex] ? '[x]' : '[ ]'} ${option}`));
      } else if (activity.type === 'sort' && typeof answer === 'string') {
        answer.split('\n').forEach((item, itemIndex) => lines.push(`${itemIndex + 1}. ${item}`));
      } else {
        lines.push(String(answer || 'No response'));
      }
      lines.push('');
    });
    lines.push('REFLECTION', config.reflection, data.reflection || 'No response', '', 'EXIT CHECK', config.exitPrompt, data.exit || 'No response', '', 'Created offline with Lesson Packet.');
    return lines.join('\n');
  };

  config.activities.forEach((activity, index) => renderActivity(activity, index + 1));
  learnerName.addEventListener('input', save);
  reflection.addEventListener('input', save);
  exit.addEventListener('input', save);
  document.getElementById('download-responses')?.addEventListener('click', () => {
    const blob = new Blob([responseText()], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${config.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'lesson'}-response.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    announce('Response file downloaded. You choose how to share it.');
  });
  document.getElementById('print')?.addEventListener('click', () => window.print());
  document.getElementById('clear')?.addEventListener('click', () => {
    if (!confirm('Clear every response in this packet on this device?')) return;
    if (config.allowLocalSave && !config.preview) localStorage.removeItem(storageKey);
    location.reload();
  });
  restore();
}

const packetStyles = String.raw`
:root{color-scheme:light;--paper:#f4ebd8;--sheet:#fffdf7;--ink:#18231f;--muted:#58635c;--violet:#5a36a3;--orange:#e65e36;--focus:#0b6e75;font:16px/1.5 Arial,Helvetica,sans-serif;color:var(--ink);background:var(--paper)}*{box-sizing:border-box}body{margin:0;background:var(--paper)}button,input,textarea{font:inherit}:focus-visible{outline:3px solid var(--focus);outline-offset:3px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.packet{max-width:850px;margin:32px auto;padding:0 20px 60px}.packet-head{position:relative;padding:40px;background:var(--sheet);border:2px solid var(--ink);box-shadow:8px 8px 0 var(--violet)}.packet-head:before{content:"LESSON PACKET";display:inline-block;margin-bottom:16px;padding:4px 8px;border:1px solid var(--ink);background:var(--orange);font-size:12px;font-weight:800;letter-spacing:.12em;transform:rotate(-1deg)}h1,h2{font-family:Georgia,Cambria,"Times New Roman",serif;line-height:1.12}h1{margin:0;font-size:clamp(36px,8vw,58px);letter-spacing:-.035em}.meta{display:flex;gap:16px;flex-wrap:wrap;margin:16px 0 0;color:var(--muted);font-weight:700}.instructions{margin:28px 0 0;padding-top:22px;border-top:2px dashed #c9bfa9;white-space:pre-wrap}.learner{display:block;margin-top:22px;font-weight:700}.learner input{display:block;width:100%;max-width:420px;min-height:48px;margin-top:6px;padding:9px 11px;border:2px solid #6d736f;background:#fff}.privacy{margin:10px 0 0;color:var(--muted);font-size:13px}.activity,.wrap-up{margin-top:28px;padding:30px;background:var(--sheet);border-left:6px solid var(--violet)}.activity:nth-child(even){border-left-color:var(--orange)}h2{margin:0 0 12px;font-size:25px}.prompt{margin:0 0 18px;font-size:18px;font-weight:700}.assist{color:var(--muted);font-size:14px}.checklist,.sort-list{margin:0;padding:0;list-style:none}.checklist li+li,.sort-list li+li{margin-top:10px}.checklist label{min-height:48px;display:flex;align-items:center;gap:12px;padding:8px 12px;border:1px solid #8d918e;cursor:pointer}.checklist input{width:24px;height:24px;accent-color:var(--violet)}.sort-item{min-height:54px;display:grid;grid-template-columns:30px 1fr auto;gap:10px;align-items:center;padding:6px 8px;border:2px solid #6d736f;background:#fffefa;cursor:grab}.drag-handle{color:var(--muted);font-size:22px}.sort-controls{display:flex;gap:8px}.sort-controls button{width:44px;height:44px;border:1px solid var(--ink);background:var(--paper);font-weight:800;cursor:pointer}.sort-controls button:hover{background:var(--ink);color:white}.dragging{opacity:.5}textarea{width:100%;min-height:130px;padding:12px;border:2px solid #6d736f;background:#fffefa;resize:vertical}.response-field{margin-top:24px}.response-field label{display:block;margin-bottom:6px;font-weight:700}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:28px}.button{min-height:48px;padding:10px 16px;border:2px solid var(--ink);background:var(--violet);color:white;font-weight:800;cursor:pointer;box-shadow:4px 4px 0 var(--ink)}.button.secondary{background:var(--sheet);color:var(--ink);box-shadow:none}.button.danger{color:#8d2424;border-color:#8d2424}.status{min-height:24px;margin-top:18px;color:#216b52;font-weight:700}.foot{margin-top:34px;text-align:center;color:var(--muted);font-size:13px}@media(max-width:600px){.packet{margin-top:14px;padding:0 12px 40px}.packet-head{padding:24px}.activity,.wrap-up{padding:22px 16px}.actions .button{width:100%}}@media print{body{background:white}.packet{max-width:none;margin:0;padding:0}.packet-head,.activity,.wrap-up{box-shadow:none;break-inside:avoid}.actions,.status,.privacy,.assist,.sort-controls,.drag-handle,.foot{display:none}.sort-item{grid-template-columns:1fr}textarea{border:1px solid #555}.packet-head{padding:24px}.activity,.wrap-up{margin-top:14px;padding:20px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
`;

export function buildPacketHtml(packet: Packet, preview = false): string {
  const data = JSON.stringify({ ...packet, preview }).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const title = escapeHtml(packet.title || 'Untitled lesson');
  const subject = escapeHtml(packet.subject);
  const instructions = escapeHtml(packet.instructions);
  const reflection = escapeHtml(packet.reflection);
  const exitPrompt = escapeHtml(packet.exitPrompt);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${title} — Lesson Packet</title><style>${packetStyles}</style></head>
<body><main class="packet" aria-label="Lesson packet"><header class="packet-head"><h1>${title}</h1><div class="meta">${subject ? `<span>${subject}</span>` : ''}${packet.minutes ? `<span>About ${packet.minutes} ${packet.minutes === 1 ? 'minute' : 'minutes'}</span>` : ''}<span>Works offline</span></div><p class="instructions">${instructions}</p><label class="learner" for="learner-name">Your name or initials (optional)<input id="learner-name" autocomplete="name" maxlength="100"></label><p class="privacy">Nothing in this packet is sent anywhere.${packet.allowLocalSave && !preview ? ' Your progress is remembered only in this browser.' : ''}</p></header>
<div id="packet-activities"></div><section class="wrap-up"><h2>Reflection</h2><div class="response-field"><label for="reflection">${reflection}</label><textarea id="reflection" rows="6"></textarea></div><div class="response-field"><label for="exit">Exit check: ${exitPrompt}</label><textarea id="exit" rows="4"></textarea></div></section>
<div class="actions"><button class="button" id="download-responses" type="button">Download my responses</button><button class="button secondary" id="print" type="button">Print packet</button>${packet.allowLocalSave && !preview ? '<button class="button secondary danger" id="clear" type="button">Clear saved progress</button>' : ''}</div><p class="status" id="status" role="status" aria-live="polite">${preview ? 'Preview mode: responses here are temporary.' : packet.allowLocalSave ? 'Progress is saved on this device as you work.' : 'Responses stay in this page until you download them.'}</p><footer class="foot">Made with Lesson Packet · This self-contained file works without an internet connection.</footer></main><script id="packet-data" type="application/json">${data}</script><script>(${packetRuntime.toString()})();<\/script></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] ?? character);
}
