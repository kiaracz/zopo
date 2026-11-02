const els = {
  loading: document.querySelector('#loading'),
  quiz: document.querySelector('#quiz'),
  results: document.querySelector('#results'),
  questionNumber: document.querySelector('#question-number'),
  images: document.querySelector('#question-images'),
  questionText: document.querySelector('#question-text'),
  answers: document.querySelector('#answers'),
  nextButton: document.querySelector('#next-button'),
  restartButton: document.querySelector('#restart-button'),
  replayButton: document.querySelector('#replay-button'),
  replayDialog: document.querySelector('#replay-dialog'),
  replayButtonYes: document.querySelector('#replay-button-yes'),
  replayButtonNo: document.querySelector('#replay-button-no')
};

let questions = [];
let currentIndex = 0;

async function init() {
  const response = await fetch('questions.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  questions = data.questions;
  els.loading.hidden = true;
  startQuiz();
}

function loadStatus() {
  if (localStorage.getItem("currentIndex") !== null) {
    currentIndex = parseInt(localStorage.getItem("currentIndex"));
  } else {
    currentIndex = 0;
  }

  
  localStorage.clear();
  localStorage.setItem("currentIndex", currentIndex.toString());
}

function storeStatus() {
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
  els.questionNumber.textContent = `Otázka ${question.id} z ${questions.length}`;;
  els.questionText.textContent = question.text;
  els.nextButton.disabled = true;
  els.nextButton.innerHTML = currentIndex === questions.length - 1
    ? 'Konec →'
    : 'Další otázka →';

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
  if (!isCorrect) {
    selectedButton.classList.add('is-wrong');
  }

  els.nextButton.disabled = false;
  els.nextButton.focus({ preventScroll: true });
}

function renderResult() {
  els.quiz.hidden = true;
  els.results.hidden = false;
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
  els.replayDialog.showModal();
}

function replayYes() {
  els.replayDialog.close();
  restart();
}

function replayNo() {
  els.replayDialog.close();
}

els.nextButton.addEventListener('click', nextQuestion);
els.restartButton.addEventListener('click', restart);
els.replayButton.addEventListener('click', replay);
els.replayButtonYes.addEventListener('click', replayYes);
els.replayButtonNo.addEventListener('click', replayNo);
init();
