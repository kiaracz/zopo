const els = {
  loading: document.querySelector('#loading'),
  error: document.querySelector('#error'),
  quiz: document.querySelector('#quiz'),
  results: document.querySelector('#results'),
  progressLabel: document.querySelector('#progress-label'),
  scoreLabel: document.querySelector('#score-label'),
  progressBar: document.querySelector('#progress-bar'),
  questionNumber: document.querySelector('#question-number'),
  images: document.querySelector('#question-images'),
  questionText: document.querySelector('#question-text'),
  answers: document.querySelector('#answers'),
  nextButton: document.querySelector('#next-button'),
  resultsSummary: document.querySelector('#results-summary'),
  restartButton: document.querySelector('#restart-button')
};

let allQuestions = [];
let questions = [];
let currentIndex = 0;
let correctCount = 0;
let answered = false;

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

async function init() {
  try {
    const response = await fetch('questions.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error('Soubor neobsahuje seznam otázek.');
    }
    allQuestions = data.questions;
    startQuiz();
  } catch (error) {
    console.error('Načtení otázek selhalo:', error);
    els.loading.hidden = true;
    els.error.hidden = false;
  }
}

function startQuiz() {
  questions = shuffle(allQuestions);
  currentIndex = 0;
  correctCount = 0;
  answered = false;
  els.loading.hidden = true;
  els.error.hidden = true;
  els.results.hidden = true;
  els.quiz.hidden = false;
  renderQuestion();
}

function renderQuestion() {
  const question = questions[currentIndex];
  answered = false;
  els.progressLabel.textContent = `Otázka ${currentIndex + 1} z ${questions.length}`;
  els.scoreLabel.textContent = `Správně: ${correctCount}`;
  els.progressBar.style.width = `${(currentIndex / questions.length) * 100}%`;
  els.questionNumber.textContent = `Číslo otázky: ${question.id}`;
  els.questionText.textContent = question.text;
  els.nextButton.disabled = true;
  els.nextButton.innerHTML = currentIndex === questions.length - 1
    ? 'Zobrazit výsledek <span aria-hidden="true">→</span>'
    : 'Další otázka <span aria-hidden="true">→</span>';

  els.images.replaceChildren();
  const images = Array.isArray(question.images) ? question.images : [];
  els.images.hidden = images.length === 0;
  for (const src of images) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Obrázek k otázce ${question.id}`;
    img.loading = 'lazy';
    img.addEventListener('error', () => {
      img.alt = `Obrázek ${src} se nepodařilo načíst`;
      img.classList.add('image-error');
    });
    els.images.append(img);
  }

  els.answers.replaceChildren();
  question.answers.forEach((answer, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-button';
    const letter = document.createElement('span');
    letter.className = 'answer-letter';
    letter.textContent = `${answer.id || String.fromCharCode(65 + index)})`;
    letter.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('span');
    copy.className = 'answer-copy';
    copy.textContent = answer.text;
    button.append(letter, copy);
    button.addEventListener('click', () => chooseAnswer(answer, button));
    els.answers.append(button);
  });
}

function chooseAnswer(selectedAnswer, selectedButton) {
  if (answered) return;
  answered = true;
  const question = questions[currentIndex];
  const correctAnswer = question.answers.find(answer => answer.correct === true);
  const buttons = [...els.answers.querySelectorAll('button')];
  buttons.forEach((button, index) => {
    button.disabled = true;
    const answer = question.answers[index];
    if (answer.correct === true) button.classList.add('is-correct');
  });

  const isCorrect = selectedAnswer.correct === true;
  if (isCorrect) correctCount++;
  else selectedButton.classList.add('is-wrong');

  els.scoreLabel.textContent = `Správně: ${correctCount}`;
  els.nextButton.disabled = false;
  els.nextButton.focus({ preventScroll: true });
}

function nextQuestion() {
  if (!answered) return;
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    els.quiz.hidden = true;
    els.results.hidden = false;
    els.progressBar.style.width = '100%';
    const percent = Math.round((correctCount / questions.length) * 100);
    els.resultsSummary.textContent = `Správně jsi odpověděl/a na ${correctCount} z ${questions.length} otázek (${percent} %).`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

els.nextButton.addEventListener('click', nextQuestion);
els.restartButton.addEventListener('click', startQuiz);
init();

// enable offline usage after a first visit and an installation on supported devices
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(error => {
      console.warn('Service worker se nepodařilo zaregistrovat:', error);
    });
  });
}
