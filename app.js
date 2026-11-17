'use strict';

const KEY = 'little-notes-v1';
const $ = (selector) => document.querySelector(selector);
const form = $('#note-form');
const titleInput = $('#title');
const bodyInput = $('#body');
const search = $('#search');
const notice = $('#notice');
let notes = [];
let editingId = null;
let storageAvailable = true;
let installPrompt = null;

function showNotice(message) {
  notice.textContent = message;
  notice.hidden = false;
}

try {
  const saved = localStorage.getItem(KEY);
  if (saved !== null) {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every((note) => note && typeof note.id === 'string' && typeof note.title === 'string' && typeof note.body === 'string' && typeof note.updated === 'number' && Number.isFinite(note.updated) && Math.abs(note.updated) <= 8640000000000000)) {
      throw new Error('Invalid notes data');
    }
    notes = parsed;
  }
} catch (_) {
  storageAvailable = false;
  showNotice('Your saved notes could not be read. Saving is disabled to protect existing data; check browser storage settings.');
}

function saveNotes(next) {
  if (!storageAvailable) return false;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    notes = next;
    notice.hidden = true;
    return true;
  } catch (_) {
    showNotice('Could not save your changes. Your browser storage may be full or unavailable. Your draft is still here.');
    return false;
  }
}

function resetEditor() {
  editingId = null;
  form.reset();
  $('#editor-title').textContent = 'New note';
  $('#save').firstChild.textContent = 'Save note ';
  $('#cancel').hidden = true;
}

function render() {
  const query = search.value.trim().toLocaleLowerCase();
  const visible = notes.filter((note) => `${note.title}\n${note.body}`.toLocaleLowerCase().includes(query));
  $('#count').textContent = String(notes.length);
  const container = $('#notes');
  container.replaceChildren();
  $('#empty').hidden = visible.length !== 0;
  $('#empty-title').textContent = notes.length ? 'No notes found' : 'A fresh page awaits';
  $('#empty-copy').textContent = notes.length ? 'Try a different search to find what you need.' : 'Capture an idea, a reminder, or a little moment. Your first note starts here.';
  for (const note of visible) {
    const card = document.createElement('article');
    card.className = 'note card';
    const heading = document.createElement('h3');
    heading.textContent = note.title || 'Untitled note';
    const content = document.createElement('p');
    content.className = 'note-body';
    content.textContent = note.body;
    const meta = document.createElement('div');
    meta.className = 'note-meta';
    const date = document.createElement('time');
    date.dateTime = new Date(note.updated).toISOString();
    date.textContent = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(note.updated);
    const actions = document.createElement('div');
    actions.className = 'note-actions';
    const edit = document.createElement('button');
    edit.type = 'button'; edit.textContent = 'Edit';
    edit.setAttribute('aria-label', `Edit ${note.title || 'untitled note'}`);
    edit.addEventListener('click', () => {
      editingId = note.id;
      titleInput.value = note.title;
      bodyInput.value = note.body;
      $('#editor-title').textContent = 'Edit note';
      $('#save').firstChild.textContent = 'Save changes ';
      $('#cancel').hidden = false;
      titleInput.focus();
    });
    const remove = document.createElement('button');
    remove.type = 'button'; remove.textContent = 'Delete';
    remove.setAttribute('aria-label', `Delete ${note.title || 'untitled note'}`);
    remove.addEventListener('click', () => {
      if (!window.confirm('Delete this note? This cannot be undone.')) return;
      if (saveNotes(notes.filter((item) => item.id !== note.id))) {
        if (editingId === note.id) resetEditor();
        render();
      }
    });
    actions.append(edit, remove); meta.append(date, actions); card.append(heading, content, meta); container.append(card);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const body = bodyInput.value.trim();
  if (!body) { bodyInput.setCustomValidity('Please write a note.'); bodyInput.reportValidity(); return; }
  const note = { id: editingId || `${Date.now()}-${Math.random().toString(36).slice(2)}`, title: titleInput.value.trim(), body, updated: Date.now() };
  const next = [note, ...notes.filter((item) => item.id !== note.id)];
  if (saveNotes(next)) { resetEditor(); render(); }
});
bodyInput.addEventListener('input', () => bodyInput.setCustomValidity(''));
$('#cancel').addEventListener('click', resetEditor);
search.addEventListener('input', render);
function updateConnection() { $('#connection').textContent = navigator.onLine ? 'Online' : 'Offline'; }
window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);
updateConnection();
render();

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault(); installPrompt = event; $('#install').hidden = false;
});
$('#install').addEventListener('click', async () => {
  if (!installPrompt) return;
  const prompt = installPrompt; installPrompt = null; $('#install').hidden = true;
  try { await prompt.prompt(); } catch (_) { showNotice('The install prompt could not be opened. Try your browser’s install menu.'); }
});
window.addEventListener('appinstalled', () => { installPrompt = null; $('#install').hidden = true; });
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => showNotice('Offline support could not be started. Open this app on localhost or HTTPS and try again.'));
  });
}
