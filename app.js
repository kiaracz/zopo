const els = {
  loading: document.querySelector('#loading'),
  quiz: document.querySelector('#quiz'),
  images: document.querySelector('#question-images'),
  questionText: document.querySelector('#question-text'),
  answers: document.querySelector('#answers'),
  nextButton: document.querySelector('#next-button'),
  prevButton: document.querySelector('#prev-button'),
  firstButton: document.querySelector('#first-button'),
  lastButton: document.querySelector('#last-button'),
  rewButton: document.querySelector('#rew-button'),
  ffwButton: document.querySelector('#ffw-button')
};

let questions = [];

async function init() {
  const response = await fetch('questions.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  questions = data.questions;
  els.loading.hidden = true;
  els.quiz.hidden = false;
  renderQuestion();
}

function getCurrentIndex() {
  if (localStorage.getItem("currentIndex") !== null) {
    return parseInt(localStorage.getItem("currentIndex"));
  } else {
    return 0;
  }
}

function setCurrentIndex(currentIndex) {
  localStorage.setItem("currentIndex", currentIndex.toString());
}

function renderQuestion() {
  const currentIndex = getCurrentIndex();
  const question = questions[currentIndex];
  els.questionText.textContent = `${question.id}) ${question.text}`;
  els.nextButton.disabled = currentIndex >= questions.length - 1;
  els.prevButton.disabled = currentIndex <= 0;
  els.firstButton.disabled = currentIndex === 0;
  els.lastButton.disabled = currentIndex === questions.length - 1;
  els.rewButton.disabled = currentIndex === 0;
  els.ffwButton.disabled = currentIndex === questions.length - 1;

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
}

function chooseAnswer(selectedAnswer, selectedButton) {
  const question = questions[getCurrentIndex()];
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

  els.nextButton.focus({ preventScroll: true });
}

els.nextButton.addEventListener('click', () => {
  setCurrentIndex(getCurrentIndex() + 1);
  renderQuestion();
});

els.prevButton.addEventListener('click', () => {
  setCurrentIndex(getCurrentIndex() - 1);
  renderQuestion();
});

els.firstButton.addEventListener('click', () => {
  setCurrentIndex(0);
  renderQuestion();
});

els.lastButton.addEventListener('click', () => {
  setCurrentIndex(questions.length - 1);
  renderQuestion();
});

els.rewButton.addEventListener('click', () => {
  setCurrentIndex(Math.max(0, (Math.floor(getCurrentIndex() / 50) * 50) - 1));
  renderQuestion();
});

els.ffwButton.addEventListener('click', () => {
  setCurrentIndex(Math.min(questions.length, (Math.floor((getCurrentIndex() + 1) / 50) + 1) * 50) - 1);
  renderQuestion();
});

init();
