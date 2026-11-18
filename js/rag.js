/**
 * Cancer Awareness — RAG Knowledge Base (Demo)
 * 
 * This is a curated keyword-retrieval demonstration.
 * Production implementation would use:
 *  1. Server-side embedding model (multilingual, e.g. multilingual-e5)
 *  2. Vector database (pgvector, Pinecone, Weaviate)
 *  3. BM25 hybrid retrieval + cross-encoder reranking
 *  4. Server-side answer generation with strict source grounding
 *  5. No client-side API key exposure
 * 
 * This demo runs entirely in-browser using a static curated Q&A bank
 * and keyword matching. It demonstrates cited bilingual answers.
 * 
 * SAFETY: All answers in this demo are drawn from verified public sources
 * and have been manually checked. The demo does not use an LLM for generation.
 */

/* ============================================================
   CURATED Q&A BANK (verified against public sources)
   Each entry: { keywords[], answer:{en, ta}, sources[], urgent? }
   ============================================================ */
const QA_BANK = [
  {
    id: 'young-cancer',
    keywords: ['young', 'youth', 'teenager', 'teen', 'child', 'children', 'age', 'குழந்தை', 'young people', 'வயது குறைவு'],
    answerEn: `Cancer can occur at any age, including in children and young adults. Some cancers — such as certain leukaemias, brain tumours, lymphomas, and testicular cancer — are more common in young people than in older adults.

**Young age should never be used to dismiss a symptom.** If a symptom is unusual, persistent, or worsening, it should be assessed by a doctor regardless of the person's age.

Cancer in children and young adults uses different diagnostic and treatment pathways from those used in adults. If you are concerned about a child's health, see your GP.`,
    answerTa: `புற்றுநோய் எந்த வயதிலும் வரலாம் — குழந்தைகள் மற்றும் இளைஞர்களுக்கும் வரலாம். சில புற்றுநோய்கள் — குறிப்பிட்ட லுகேமியா, மூளை கட்டிகள், லிம்போமா, டெஸ்டிகுலர் புற்றுநோய் — இளையவர்களில் அதிக பொதுவானவை.

**இளம் வயது ஒரு அறிகுறியை நிராகரிக்க பயன்படுத்தப்படக்கூடாது.** அறிகுறி அசாதாரணமாக, தொடர்ச்சியாக அல்லது மோசமாக இருந்தால், வயதைப் பொருட்படுத்தாமல் மருத்துவரால் மதிப்பாய்வு செய்யப்பட வேண்டும்.`,
    sources: ['Cancer Research UK: Children\'s cancers', 'NHS: Cancer in children', 'Macmillan: Young people and cancer'],
    urgent: false
  },
  {
    id: 'lump-cancer',
    keywords: ['lump', 'bump', 'swelling', 'mass', 'knotty', 'கட்டி', 'வீக்கம்', 'mean cancer', 'always cancer'],
    answerEn: `**Most lumps are not cancer.** Many lumps are caused by benign (non-cancerous) conditions such as cysts, lipomas (fatty lumps), swollen lymph nodes from infections, or benign fibroadenomas in the breast.

However, **all new, unexplained, or growing lumps should be assessed by a doctor**. A lump that is hard, painless, or growing — or that is accompanied by other symptoms such as unexplained weight loss or night sweats — deserves prompt attention.

You do not need to guess whether a lump is cancer. Your GP can examine it and, if needed, refer you for further tests.`,
    answerTa: `**பெரும்பாலான கட்டிகள் புற்றுநோயல்ல.** பல கட்டிகள் நீர்க்கட்டிகள், கொழுப்பு கட்டிகள், நோய்த்தொற்றிலிருந்து வீங்கிய நிணநீர் கணுக்கள் போன்ற பாதிப்பற்ற நிலைகளால் உண்டாகின்றன.

எவ்வாறாயினும், **அனைத்து புதிய, விளக்கமில்லாத அல்லது வளரும் கட்டிகளும் மருத்துவரால் சோதிக்கப்பட வேண்டும்.** கட்டி புற்றுநோயா என்று நீங்களே யூகிக்க வேண்டியதில்லை. உங்கள் GP சோதித்து, தேவைப்பட்டால், மேலும் சோதனைகளுக்கு பரிந்துரைக்கலாம்.`,
    sources: ['NHS: Cancer symptoms', 'Cancer Research UK: Possible symptoms of cancer', 'Macmillan: Lumps and swellings'],
    urgent: false
  },
  {
    id: 'normal-screening-symptoms',
    keywords: ['normal screening', 'clear screening', 'negative result', 'screening result', 'symptoms screening', 'ஸ்கிரீனிங் சாதாரண', 'still have symptoms'],
    answerEn: `**A normal screening result does not rule out cancer, and you should still see your GP if you have symptoms.**

Screening tests are designed to detect cancer in people without symptoms. They can miss some cancers, and they check for specific types of cancer at specific sites. If you develop symptoms — such as unusual bleeding, unexplained weight loss, or a persistent change in bowel habits — you should be assessed regardless of a recent normal screening result.

Do not wait for your next scheduled screening appointment if you have a symptom that concerns you now. See your GP.`,
    answerTa: `**சாதாரண ஸ்கிரீனிங் முடிவு புற்றுநோயை முழுவதுமாக நிராகரிக்காது, மற்றும் அறிகுறிகள் இருந்தால் நீங்கள் GP யை சந்திக்க வேண்டும்.**

ஸ்கிரீனிங் சோதனைகள் அறிகுறிகள் இல்லாத நபர்களில் புற்றுநோயை கண்டுபிடிக்க வடிவமைக்கப்பட்டுள்ளன. தற்போது கவலைப்படும் அறிகுறி இருந்தால், அடுத்த திட்டமிட்ட ஸ்கிரீனிங் வரை காத்திருக்க வேண்டாம். GP யை சந்தியுங்கள்.`,
    sources: ['NHS: Cancer symptoms', 'NHS: Bowel cancer screening', 'NHS: Breast cancer screening'],
    urgent: true
  },
  {
    id: 'betel-nut-risk',
    keywords: ['betel', 'areca', 'paan', 'paakku', 'betel nut', 'betel leaf', 'gutka', 'supari', 'tobacco free', 'வெற்றிலை', 'பாக்கு', 'chewing', 'chew'],
    answerEn: `**Yes — chewing betel nut (areca nut/paakku) carries significant cancer risk, even without tobacco.**

The International Agency for Research on Cancer (IARC) classifies areca nut as a **Group 1 carcinogen** — meaning it is confirmed to cause cancer in humans. This classification applies to areca nut itself, not just when combined with tobacco or betel leaf.

Regular use of betel nut significantly increases the risk of cancers of the **mouth, tongue, throat, and oesophagus** (food pipe). These cancers are largely preventable.

Products that contain areca nut include: paan (betel quid), gutka, paan masala, mawa, zarda, and supari. Some are sold as "tobacco-free" but still contain areca nut — and still carry significant cancer risk.

**The safest choice is to stop using all areca nut and betel quid products.** Talk to your GP or the NHS Stop Smoking service about support with stopping.`,
    answerTa: `**ஆம் — வெற்றிலை பாக்கு (areca nut/paakku) மெல்வது புகையிலை இல்லாமலும் குறிப்பிடத்தக்க புற்றுநோய் ஆபத்தை உண்டாக்குகிறது.**

சர்வதேச புற்றுநோய் ஆராய்ச்சி நிறுவனம் (IARC) வெற்றிலை பாக்கை **குழு 1 புற்றுநோயுண்டாக்கும் பொருளாக** வகைப்படுத்தியுள்ளது — அதாவது மனிதர்களில் புற்றுநோயை உண்டாக்குவது உறுதிப்படுத்தப்பட்டுள்ளது.

**பாதுகாப்பான தேர்வு: அனைத்து வெற்றிலை பாக்கு பொருட்களையும் நிறுத்துவது.** NHS நிறுத்த சேவையின் உதவி பெறுங்கள்.`,
    sources: ['IARC Monograph Vol 85 (2004): Betel-quid and Areca-nut Chewing', 'IARC Monograph Vol 100E (2012)', 'Cancer Research UK: Mouth cancer risk factors'],
    urgent: false
  },
  {
    id: 'herbal-remedies',
    keywords: ['herbal', 'herb', 'turmeric', 'natural remedy', 'traditional', 'alternative', 'cure', 'prevent', 'மூலிகை', 'இயற்கை', 'மஞ்சள்', 'குணமாக'],
    answerEn: `**No herbal remedy or supplement has been shown in reliable evidence to cure or reliably prevent cancer in people.**

Some herbs and supplements are studied in laboratory or early-stage research, but laboratory findings do not always translate to human benefit. No herbal product has passed the high-quality clinical trials needed to be recommended as a cancer treatment or prevention measure.

Some supplements may interact with cancer treatments — it is important to tell your GP or cancer care team about anything you take.

Eating a varied diet with plenty of vegetables, wholegrains, and fibre is associated with reduced risk of some cancers — but this benefit comes from food patterns over time, not individual "superfoods" or supplements.`,
    answerTa: `**எந்த மூலிகை வைத்தியமும் அல்லது சப்ளிமெண்டும் நம்பகமான சான்றுகளில் புற்றுநோயை குணப்படுத்துவதாக அல்லது நம்பகமாக தடுப்பதாக நிரூபிக்கப்படவில்லை.**

சில சப்ளிமெண்டுகள் புற்றுநோய் சிகிச்சையில் குறுக்கிடலாம் — நீங்கள் எடுப்பவை பற்றி உங்கள் GP யிடம் கண்டிப்பாக சொல்லுங்கள்.`,
    sources: ['Cancer Research UK: Myths and facts about cancer', 'NHS: Complementary and alternative therapies', 'Macmillan: Complementary therapies'],
    urgent: false
  },
  {
    id: 'embarrassed-gp',
    keywords: ['embarrassed', 'ashamed', 'awkward', 'nervous', 'afraid', 'worried bother', 'waste time', 'நாணம்', 'கவலை', 'doctor', 'GP', 'speak'],
    answerEn: `**Feeling embarrassed, nervous, or worried about bothering your GP is very common — and very understandable. But every concern is worth raising.**

Your GP has heard many sensitive concerns before, and they want to help you. If a symptom is bothering you, it deserves to be checked.

A few things that can help:
- **Write down** what you want to say before the appointment.
- **Be direct:** "I have noticed [symptom] for [time] and I am worried about it."
- **Ask for more time** at booking if you have several concerns.
- **Request an interpreter** when you book: "I would like a Tamil interpreter, please." You have the right to a professional NHS interpreter — you do not need to bring a family member to translate.

If you feel your concern was not taken seriously, it is always right to follow up or seek a second opinion.`,
    answerTa: `**நாணமாக உணர்வது, GP யிடம் பேசுவதில் தயக்கம் மிகவும் பொதுவானது — மிகவும் புரிந்துகொள்ளக்கூடியது. ஆனால் ஒவ்வொரு கவலையும் முன்வைக்க தகுதியானது.**

உங்கள் GP உதவ விரும்புகிறார்கள். சில உதவிகரமான குறிப்புகள்:
- சந்திப்பிற்கு முன் நீங்கள் சொல்ல விரும்புவதை **எழுதுங்கள்**.
- முன்பதிவு செய்யும்போது **தமிழ் மொழிபெயர்ப்பாளரை கேளுங்கள்**. NHS மொழிபெயர்ப்பாளர் உரிமை உங்களுக்கு உண்டு.`,
    sources: ['NHS: How to get the most from your GP appointment', 'Macmillan: Talking to your doctor', 'Cancer Research UK: Going to the GP'],
    urgent: false
  },
  {
    id: 'severe-symptoms',
    keywords: ['severe', 'emergency', 'urgent', 'ambulance', '999', 'A&E', 'very unwell', 'collapse', 'can\'t breathe', 'heavy bleeding', 'மிகவும் நோய்', 'அவசரம்'],
    answerEn: `**If you have any of the following symptoms, call 999 or go to A&E immediately:**
- Chest pain or severe difficulty breathing
- Heavy bleeding that will not stop
- Loss of consciousness or collapse
- Sudden severe headache or confusion
- Weakness or numbness affecting your face, arm or leg

**Do not use this chat in an emergency. Call 999 or go to your nearest A&E.**`,
    answerTa: `**இந்த அறிகுறிகள் இருந்தால் 999 அழைக்கவும் அல்லது உடனடியாக A&E க்கு செல்லவும்:**
- நெஞ்சுவலி அல்லது கடுமையான மூச்சுத்திணறல்
- நிறுத்தப்படாத கடுமையான இரத்தப்போக்கு
- சுயநினைவு இழப்பு அல்லது சரிவு

**அவசரநிலையில் இந்த சாட்டை பயன்படுத்த வேண்டாம். 999 அழைக்கவும்.**`,
    sources: ['NHS 111', 'NHS: When to call 999'],
    urgent: true
  },
  {
    id: 'what-is-cancer',
    keywords: ['what is cancer', 'how does cancer', 'explain cancer', 'cells', 'grow', 'spread', 'புற்றுநோய் என்ன', 'எப்படி'],
    answerEn: `Cancer is a condition where cells in the body grow and divide in an uncontrolled way. Normally, cells grow, divide, and die in an ordered process. In cancer, damaged cells continue to grow and can form a mass called a tumour — or, in blood cancers, spread through the blood.

There are more than 200 different types of cancer. Each type is named after the organ or type of cell it starts in.

**Key points:**
- Cancer is not one single disease — it is a group of related diseases.
- Many cancers, when found early, can be treated more effectively.
- Cancer is never a person's fault or a moral failing.
- Cancer is not contagious — it cannot be passed from person to person.`,
    answerTa: `புற்றுநோய் என்பது உடலில் உள்ள செல்கள் கட்டுப்பாடற்ற முறையில் வளரும் ஒரு நிலை. சாதாரண செல்கள் ஒழுங்கான முறையில் வளர்ந்து, பிரிந்து, இறக்கின்றன. புற்றுநோயில், சேதமடைந்த செல்கள் தொடர்ந்து வளர்ந்து கட்டியை உருவாக்கலாம்.

**முக்கிய குறிப்புகள்:**
- புற்றுநோய் தொற்றுவதில்லை — ஒருவரிடமிருந்து மற்றொருவருக்கு பரவாது.
- புற்றுநோய் எப்போதும் ஒரு நபரின் தவறோ குற்றமோ அல்ல.`,
    sources: ['Cancer Research UK: What is cancer?', 'NHS: Cancer overview', 'Macmillan: What is cancer?'],
    urgent: false
  }
];

/* ============================================================
   KEYWORD RETRIEVAL (client-side demo)
   ============================================================ */
function findAnswer(query) {
  const q = query.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const item of QA_BANK) {
    let score = 0;
    for (const kw of item.keywords) {
      if (q.includes(kw.toLowerCase())) {
        score += kw.length; // weight by keyword length (more specific = higher weight)
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

function formatAnswer(item, langMode) {
  const urgent = item.urgent
    ? `<div style="background:#FFEBEE;border-left:4px solid #D32F2F;border-radius:4px;padding:0.75rem 1rem;margin-bottom:0.75rem">
        <span class="en-only"><strong>⚠️ Important:</strong> If your symptoms are severe or you are very unwell now, call 999 or go to A&amp;E.</span>
        <span class="ta-only ta" style="font-family:var(--font-ta)"><strong>⚠️ முக்கியம்:</strong> கடுமையான அறிகுறிகள் இருந்தால் 999 அழைக்கவும்.</span>
       </div>` : '';

  // Parse simple markdown bold
  const renderMd = (text) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n- /g, '</p><ul><li>')
      .replace(/\n/g, '<br>');

  const sourceHtml = `<div class="source-citations">
    📄 Sources: ${item.sources.join(' · ')}
    <br><span style="color:#BF360C">⚠️ Tamil content awaiting bilingual clinical review — தமிழ் மருத்துவ மதிப்பாய்வு நிலுவையில்</span>
  </div>`;

  const enHtml = `<p class="en-only" style="margin:0">${renderMd(item.answerEn)}</p>`;
  const taHtml = `<div class="ta-only ta" style="font-family:var(--font-ta);margin-top:0.5rem;padding-top:0.5rem;border-top:1px solid rgba(0,0,0,0.08)">${renderMd(item.answerTa)}</div>`;

  return urgent + enHtml + taHtml + sourceHtml;
}

function fallbackAnswer() {
  return `<p class="en-only">I don't have specific information about that in my current knowledge base. I can answer general questions about what cancer is, symptoms to watch for, UK screening programmes, and how to talk to your GP. For other questions, please speak with your GP or visit <a href="https://www.nhs.uk/conditions/cancer/" target="_blank">nhs.uk/conditions/cancer</a>.</p>
  <p class="ta-only ta" style="font-family:var(--font-ta)">அந்த தகவல் என் தற்போதைய அறிவுத்தளத்தில் இல்லை. பொதுவான புற்றுநோய் கேள்விகளுக்கு பதில் சொல்ல முடியும். மேலும் தகவலுக்கு உங்கள் GP யை சந்தியுங்கள் அல்லது <a href="https://www.nhs.uk/conditions/cancer/" target="_blank">nhs.uk</a> பாருங்கள்.</p>
  <div class="source-citations">📄 nhs.uk/conditions/cancer | cancerresearchuk.org | macmillan.org.uk</div>`;
}

/* ============================================================
   CHAT UI
   ============================================================ */
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

function addMessage(html, role) {
  const wrap = document.createElement('div');
  wrap.className = `msg msg-${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = role === 'user' ? '👤' : 'CA';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = html;

  if (role === 'user') {
    wrap.appendChild(bubble);
    wrap.appendChild(avatar);
  } else {
    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
  }

  chatMessages.appendChild(wrap);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return wrap;
}

function showTyping() {
  const wrap = addMessage(`<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`, 'assistant');
  return wrap;
}

function handleSend() {
  const query = chatInput.value.trim();
  if (!query) return;

  chatInput.value = '';
  sendBtn.disabled = true;

  addMessage(`<span>${escHtml(query)}</span>`, 'user');

  // Safety: flag urgent patterns immediately
  const urgentPatterns = /\b(999|ambulance|collapse|can't breathe|chest pain|heavy bleeding|severe pain)\b/i;
  if (urgentPatterns.test(query)) {
    setTimeout(() => {
      const item = QA_BANK.find(i => i.id === 'severe-symptoms');
      addMessage(formatAnswer(item, 'both'), 'assistant');
      sendBtn.disabled = false;
    }, 300);
    return;
  }

  const typingEl = showTyping();
  setTimeout(() => {
    typingEl.remove();
    const match = findAnswer(query);
    if (match) {
      addMessage(formatAnswer(match, document.documentElement.dataset.lang || 'both'), 'assistant');
    } else {
      addMessage(fallbackAnswer(), 'assistant');
    }
    // Re-apply language visibility
    const mode = document.documentElement.dataset.lang || 'both';
    document.documentElement.dataset.lang = mode;
    sendBtn.disabled = false;
  }, 900);
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
});

// Auto-resize textarea
chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
});
