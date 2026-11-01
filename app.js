const els = {
  loading: document.querySelector('#loading'),
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
  restartButton: document.querySelector('#restart-button'),
  replayButton: document.querySelector('#replay-button'),
  versionLabel: document.querySelector('#version-label')
};

const APP_VERSION = "2";

let questions = [];
let currentIndex = 0;
let correctCount = 0;

async function init() {
  const response = await fetch('questions.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  questions = data.questions;
  els.loading.hidden = true;
  startQuiz();
}

function loadStatus() {
  if (localStorage.getItem("version") !== APP_VERSION) {
    localStorage.clear();
    localStorage.setItem("version", APP_VERSION);
    localStorage.setItem("currentIndex", '0');
    localStorage.setItem("correctCount", '0');
  }

  currentIndex = parseInt(localStorage.getItem("currentIndex"));
  correctCount = parseInt(localStorage.getItem("correctCount"));
}

function storeStatus() {
  localStorage.setItem("correctCount", correctCount.toString());
  localStorage.setItem("currentIndex", currentIndex.toString());
}

function restart() {
  localStorage.clear();
  startQuiz();
}

function startQuiz() {
  loadStatus();
  els.loading.hidden = true;
  els.results.hidden = true;
  els.quiz.hidden = false;
  renderScreen();
}

function renderQuestion() {
  const question = questions[currentIndex];
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
  question.answers.forEach((answer) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-button';
    const letter = document.createElement('span');
    letter.className = 'answer-letter';
    letter.textContent = `${answer.id})`;
    letter.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('span');
    copy.className = 'answer-copy';
    copy.textContent = answer.text;
    button.append(letter, copy);
    button.addEventListener('click', () => chooseAnswer(answer, button));
    els.answers.append(button);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function chooseAnswer(selectedAnswer, selectedButton) {
  const question = questions[currentIndex];
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

function renderResult() {
  els.quiz.hidden = true;
  els.results.hidden = false;
  els.progressBar.style.width = '100%';
  const percent = Math.round((correctCount / questions.length) * 100);
  els.resultsSummary.textContent = `Správně jsi odpověděl/a na ${correctCount} z ${questions.length} otázek (${percent} %).`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextQuestion() {
  currentIndex++;
  storeStatus();
  renderScreen();
}

function renderScreen() {
  if (currentIndex >= questions.length) {
    renderResult();
  } else {
    renderQuestion();
  }
}

function replay() {
  if (confirm('Restartovat procvičování?')) {
    restart();
  }
}

els.nextButton.addEventListener('click', nextQuestion);
els.restartButton.addEventListener('click', restart);
els.replayButton.addEventListener('click', replay);
els.versionLabel.textContent = `Verze: ${APP_VERSION}.`;
init();
