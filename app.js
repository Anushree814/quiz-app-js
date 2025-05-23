// app.js
import { quizData } from "./data.js";

const categorySelection = document.getElementById("category-selection");
const startForm = document.getElementById("start-form");
const fullnameInput = document.getElementById("fullname");

const quizContainer = document.getElementById("quiz-container");
const questionNumEl = document.getElementById("question-number");
const totalQuestionsEl = document.getElementById("total-questions");
const quizProgress = document.getElementById("quiz-progress");
const quizButtons = document.getElementById("quiz-buttons");
const progressBar = document.getElementById("progress-bar");
const timerEl = document.getElementById("timer");
const quizQuestionEl = document.getElementById("quiz-question");
const optionsForm = document.getElementById("options-form");
const nextBtn = document.getElementById("next-btn");
const skipBtn = document.getElementById("skip-btn");

const resultContainer = document.getElementById("result-container");
const correctCountEl = document.getElementById("correct-count");
const unansweredCountEl = document.getElementById("unanswered-count");
const scoreFeedbackEl = document.getElementById("score-feedback");
const restartBtn = document.getElementById("restart-btn");
const rulesLink = document.querySelector(".rules-link");
const rulesModal = document.getElementById("rules-modal");
const closeModal = document.getElementById("close-modal");
const exitBtn = document.getElementById("exit-btn");

let currentCategory = null;
let currentQuestionIndex = 0;
let timerInterval = null;
let timeLeft = 0;
let userAnswers = [];
let answeredCurrent = false;

rulesLink.addEventListener("click", (e) => {
  e.preventDefault();
  rulesModal.hidden = false;
  rulesModal.style.display = "flex";
});

closeModal.addEventListener("click", () => {
  rulesModal.hidden = true;
  rulesModal.style.display = "none";
});

// Optional: Close modal on outside click
window.addEventListener("click", (e) => {
  if (e.target === rulesModal) {
    rulesModal.hidden = true;
    rulesModal.style.display = "none";
  }
});
document.addEventListener("DOMContentLoaded", () => {
  rulesModal.hidden = true;
  rulesModal.style.display = "none";
  resultContainer.hidden = true;
  resultContainer.style.display = "none";
});

// Handle Exit Quiz button
exitBtn.addEventListener("click", () => {
  location.reload();
});

// Form submit to start quiz
startForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fullname = fullnameInput.value.trim();
  const selectedTopicRadio = startForm.topic;

  let selectedTopic = null;
  for (const radio of selectedTopicRadio) {
    if (radio.checked) {
      selectedTopic = radio.value;
      break;
    }
  }
  if (!fullname) {
    alert("Please enter your full name.");
    fullnameInput.focus();
    return;
  }
  if (!selectedTopic) {
    alert("Please select a quiz topic.");
    return;
  }
  startQuiz(selectedTopic);
});

function startQuiz(categoryId) {
  currentCategory = quizData.categories.find((c) => c.id === categoryId);
  currentQuestionIndex = 0;
  userAnswers = [];
  categorySelection.hidden = true;
  categorySelection.style.display = "none";
  resultContainer.hidden = true;
  resultContainer.style.display = "none";
  quizContainer.hidden = false;
  exitBtn.hidden = false;
  quizProgress.style.display = "block";
  quizButtons.style.display = "flex";
  totalQuestionsEl.textContent = currentCategory.questions.length;
  progressBar.max = currentCategory.questions.length;
  progressBar.value = 0;

  loadQuestion();
}
console.log(resultContainer.hidden);
function loadQuestion() {
  clearInterval(timerInterval);
  answeredCurrent = false;
  nextBtn.disabled = true;
  skipBtn.disabled = false;

  const question = currentCategory.questions[currentQuestionIndex];
  questionNumEl.textContent = currentQuestionIndex + 1;
  quizQuestionEl.textContent = question.question;
  quizQuestionEl.focus();

  optionsForm.innerHTML = "";

  question.options.forEach((option) => {
    const optionId = `option-${option.replace(/[^\w\s]/gi, "")}`;
    const label = document.createElement("label");
    label.className = "option-label";
    label.setAttribute("for", optionId);

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.value = option;
    input.id = optionId;
    input.required = true;

    const spanText = document.createElement("span");
    spanText.textContent = option;

    input.addEventListener("change", () => {
      answeredCurrent = true;
      nextBtn.disabled = false;
      skipBtn.disabled = true;
    });

    label.appendChild(input);
    label.appendChild(spanText);
    optionsForm.appendChild(label);
  });

  timeLeft = question.timeLimit || 10;
  timerEl.textContent = formatTimer(timeLeft);

  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = formatTimer(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (!answeredCurrent) {
        recordAnswer(null, true);
      }
      goToNextQuestion();
    }
  }, 1000);

  progressBar.value = currentQuestionIndex;
}

function formatTimer(seconds) {
  return `0:${seconds < 10 ? "0" : ""}${seconds}`;
}

nextBtn.addEventListener("click", () => {
  if (!answeredCurrent) return; // should be disabled anyway
  const selectedOption = optionsForm.answer.value.split(".")[0];
  recordAnswer(selectedOption, false);
  goToNextQuestion();
});

skipBtn.addEventListener("click", () => {
  if (answeredCurrent) return;
  recordAnswer(null, true);
  goToNextQuestion();
});

function recordAnswer(selectedOption, timedOut) {
  const question = currentCategory.questions[currentQuestionIndex];
  const isCorrect = selectedOption === question.correctAnswer;
  userAnswers[currentQuestionIndex] = {
    selectedOption,
    correct: isCorrect,
    timedOut,
  };
}

function goToNextQuestion() {
  clearInterval(timerInterval);
  currentQuestionIndex++;
  if (currentQuestionIndex >= currentCategory.questions.length) {
    showScore();
  } else {
    loadQuestion();
  }
}

function highlightCorrectness() {
  const question = currentCategory.questions[currentQuestionIndex];
  const options = optionsForm.querySelectorAll(".option-label");

  options.forEach((label) => {
    const input = label.querySelector("input");
    label.classList.remove("correct", "incorrect", "disabled");

    if (!input.checked) {
      label.classList.add("disabled");
    }

    if (input.value === question.correctAnswer) {
      label.classList.add("correct");
    }

    if (input.checked && input.value !== question.correctAnswer) {
      label.classList.add("incorrect");
    }
  });
  nextBtn.disabled = true;
  skipBtn.disabled = true;
}

function showScore() {
  quizContainer.hidden = true;
  categorySelection.hidden = true;
  categorySelection.style.display = "none";
  resultContainer.hidden = false;
  resultContainer.style.display = "flex";
  exitBtn.hidden = true;

  const total = currentCategory.questions.length;
  const correctCount = userAnswers.filter((a) => a.correct).length;
  const incorrectCount =
    total -
    correctCount -
    userAnswers.filter((a) => a.timedOut || !a.selectedOption).length;
  const unansweredCount = userAnswers.filter(
    (a) => a.timedOut || !a.selectedOption
  ).length;

  document.getElementById("total-questions-detail").textContent = total;
  document.getElementById(
    "correct-detail"
  ).textContent = `${correctCount} Correct`;
  document.getElementById(
    "incorrect-detail"
  ).textContent = `${incorrectCount} Incorrect`;
  document.getElementById(
    "unanswered-detail"
  ).textContent = `${unansweredCount} Not answered`;

  const percentage = Math.round((correctCount / total) * 100);
  document.getElementById("result-percentage").textContent = `${percentage}%`;

  let feedback = "";
  if (percentage >= 80) {
    feedback = "Great job!";
    document.getElementById("result-icon").style.backgroundImage =
      "url('path/to/happy-icon.png')";
  } else if (percentage >= 60) {
    feedback = "Well done!";
    document.getElementById("result-icon").style.backgroundImage =
      "url('path/to/neutral-icon.png')";
  } else {
    feedback = "Keep practicing!";
    document.getElementById("result-icon").style.backgroundImage =
      "url('path/to/sad-icon.png')";
  }

  document.getElementById("result-feedback").textContent = feedback;
}

document.getElementById("retake-quiz-btn").addEventListener("click", () => {
  resultContainer.hidden = true;
  resultContainer.style.display = "none";
  categorySelection.hidden = false;
  categorySelection.style.display = "flex";
  fullnameInput.value = "";
  exitBtn.hidden = true;
});

restartBtn.addEventListener("click", () => {
  resultContainer.hidden = true;
  resultContainer.style.display = "none";
  categorySelection.hidden = false;
  categorySelection.style.display = "flex";
  fullnameInput.value = "";
  exitBtn.hidden = true;
  quizProgress.style.display = "none";
  quizButtons.style.display = "none";
});
