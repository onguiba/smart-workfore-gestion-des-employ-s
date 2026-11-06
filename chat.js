// SmartWorkforce AI — Conversational Assistant Client

const API_BASE = '/api';

function showChatToast(message, type = 'info') {
  const container = document.getElementById('chatToastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast-notification ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : 'toast-info'}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : 'info'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Quick Prompt click
function sendQuickPrompt(promptText) {
  const input = document.getElementById('chatInput');
  if (input) {
    input.value = promptText;
    handleUserSend();
  }
}

// User Message handler
async function handleUserSend() {
  const input = document.getElementById('chatInput');
  const text = (input?.value || '').trim();
  if (!text) return;

  // Clear input
  input.value = '';

  // 1. Render User Bubble
  appendUserMessage(text);

  // 2. Render Typing Indicator
  const typingId = appendTypingIndicator();

  // 3. Send to Server API or Fallback
  try {
    const res = await fetch(`${API_BASE}/chatbot/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    removeTypingIndicator(typingId);
    if (data.success && data.message) {
      appendAiMessage(data.message);
    } else {
      appendAiMessage(getSmartOfflineReply(text));
    }
  } catch (error) {
    removeTypingIndicator(typingId);
    appendAiMessage(getSmartOfflineReply(text));
  }
}

function appendUserMessage(text) {
  const container = document.getElementById('chatMessagesContainer');
  if (!container) return;

  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const div = document.createElement('div');
  div.className = 'flex items-start justify-end gap-3';
  div.innerHTML = `
    <div class="max-w-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm p-3.5 shadow-sm text-xs leading-relaxed">
      <p class="font-medium">${escapeHtml(text)}</p>
      <span class="text-[10px] text-white/70 block text-right mt-1">${time}</span>
    </div>
    <img class="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20 flex-shrink-0" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" alt="Moussa"/>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function appendTypingIndicator() {
  const container = document.getElementById('chatMessagesContainer');
  if (!container) return null;

  const id = 'typing_' + Date.now();
  const div = document.createElement('div');
  div.id = id;
  div.className = 'flex items-start gap-3.5';
  div.innerHTML = `
    <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
      <span class="material-symbols-outlined text-base">smart_toy</span>
    </div>
    <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5 text-slate-400 text-xs">
      <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
      <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style="animation-delay: 0.2s"></span>
      <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style="animation-delay: 0.4s"></span>
      <span class="text-[11px] text-slate-400 ml-1">L'IA analyse votre demande...</span>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

function appendAiMessage(text) {
  const container = document.getElementById('chatMessagesContainer');
  if (!container) return;

  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const div = document.createElement('div');
  div.className = 'flex items-start gap-3.5';
  div.innerHTML = `
    <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
      <span class="material-symbols-outlined text-base">smart_toy</span>
    </div>
    <div class="max-w-xl bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm text-xs leading-relaxed text-slate-800 space-y-1">
      <p class="font-medium">${text.replace(/\n/g, '<br/>')}</p>
      <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1">
        <span>SmartWorkforce AI Copilot</span>
        <span>${time}</span>
      </div>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function clearChatHistory() {
  const container = document.getElementById('chatMessagesContainer');
  if (container) {
    const welcome = container.firstElementChild;
    container.innerHTML = '';
    if (welcome) container.appendChild(welcome);
    showChatToast('Historique effacé', 'info');
  }
}

// Fallback smart knowledge base
function getSmartOfflineReply(query) {
  const q = query.toLowerCase();
  if (q.includes('congé') || q.includes('conge') || q.includes('vacance') || q.includes('rtt')) {
    return "🌴 Vous disposez actuellement de 22 jours de congés payés et 9 jours de RTT pour l'année 2026. Vous pouvez déposer une demande directement depuis l'onglet Congés & Absences.";
  }
  if (q.includes('absent') || q.includes('absence')) {
    return "📊 Aujourd'hui, 8 collaborateurs sont déclarés absents ou en congé autorisé (notamment Sarah Perez). L'effectif opérationnel est de 142 collaborateurs présents (94.7%).";
  }
  if (q.includes('retard') || q.includes('ponctualité')) {
    return "⏰ 12 collaborateurs ont pointé après l'heure légale ce matin (moyenne +18 min). Marie Martin est arrivée à 09:42.";
  }
  if (q.includes('salaire') || q.includes('paie') || q.includes('bulletin')) {
    return "💰 Votre dernier salaire net calculé (Mai 2026) est de 3 730,00 € (Brut : 3 750 € + primes 250 € + heures sup 180 € - déductions 450 €). Le bulletin certifié est prêt dans l'espace Paie.";
  }
  if (q.includes('mission') || q.includes('tâche')) {
    return "🚀 Vous avez 1 mission active en cours : 'Livraison Express Client ABC' (Progression : 65%, Échéance 16:00). N'oubliez pas de valider les étapes intermédiaires.";
  }
  if (q.includes('fraude') || q.includes('alerte') || q.includes('sécurité')) {
    return "🛡️ Sécurité IA : 3 alertes actives sur le réseau, dont un cas suspect de 'GPS Spoofing' sur le chauffeur Daniel Gomis (vitesse calculée de 280 km/h). Les superviseurs ont été alertés.";
  }
  if (q.includes('bonjour') || q.includes('salut') || q.includes('hello')) {
    return "Bonjour Moussa ! Comment puis-je vous aider aujourd'hui ? Vous pouvez m'interroger sur votre paie, vos congés, vos missions ou les statistiques du jour.";
  }
  return "Je comprends votre demande. En tant qu'Assistant RH IA SmartWorkforce, je peux vous renseigner sur la gestion des présences, vos bulletins de salaires, vos congés et le suivi logistique de votre équipe.";
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}
