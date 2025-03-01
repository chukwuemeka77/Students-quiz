document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://opentdb.com/api.php?amount=10&type=multiple&category=";
    const categoryMap = {
        html: 18,        // Example category ID
        css: 19,
        javascript: 20,
        angularjs: 21
    };

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timer;
    let timeLeft = 30;

    const welcomeScreen = document.getElementById("welcome-screen");
    const quizSection = document.getElementById("quiz-section");
    const resultsSection = document.getElementById("results-section");
    const leaderboardSection = document.getElementById("leaderboard-section");

    const categorySelect = document.getElementById("category-select");
    const startQuizBtn = document.getElementById("start-quiz");
    const questionText = document.getElementById("question-text");
    const answerButtons = document.getElementById("answer-buttons");
    const timerDisplay = document.getElementById("timer");
    const nextQuestionBtn = document.getElementById("next-question");
    const finalScoreText = document.getElementById("final-score");

    startQuizBtn.addEventListener("click", startQuiz);
    nextQuestionBtn.addEventListener("click", nextQuestion);

    async function startQuiz() {
        const category = categorySelect.value;
        const url = `${API_URL}${categoryMap[category]}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            questions = data.results;
            currentQuestionIndex = 0;
            score = 0;

            welcomeScreen.classList.add("d-none");
            quizSection.classList.remove("d-none");

            showQuestion();
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    }

    function showQuestion() {
        if (currentQuestionIndex >= questions.length) {
            endQuiz();
            return;
        }

        resetState();
        const currentQuestion = questions[currentQuestionIndex];

        questionText.innerHTML = decodeHTML(currentQuestion.question);

        const answers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
        answers.sort(() => Math.random() - 0.5);

        answers.forEach(answer => {
            const button = document.createElement("button");
            button.classList.add("btn", "btn-outline-primary", "w-100");
            button.innerHTML = decodeHTML(answer);
            button.addEventListener("click", () => selectAnswer(answer, currentQuestion.correct_answer));
            answerButtons.appendChild(button);
        });

        timeLeft = 30;
        updateTimer();
        timer = setInterval(updateTimer, 1000);
    }

    function selectAnswer(selected, correct) {
        clearInterval(timer);

        if (selected === correct) {
            score++;
            document.querySelectorAll("#answer-buttons button").forEach(btn => {
                if (btn.innerHTML === decodeHTML(correct)) {
                    btn.classList.add("btn-success");
                }
            });
        } else {
            document.querySelectorAll("#answer-buttons button").forEach(btn => {
                if (btn.innerHTML === decodeHTML(correct)) {
                    btn.classList.add("btn-success");
                } else if (btn.innerHTML === decodeHTML(selected)) {
                    btn.classList.add("btn-danger");
                }
            });
        }

        nextQuestionBtn.classList.remove("d-none");
    }

    function nextQuestion() {
        currentQuestionIndex++;
        showQuestion();
    }

    function updateTimer() {
        timerDisplay.innerText = `Time: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            nextQuestion();
        }
        timeLeft--;
    }

    function resetState() {
        answerButtons.innerHTML = "";
        nextQuestionBtn.classList.add("d-none");
    }

    function endQuiz() {
        quizSection.classList.add("d-none");
        resultsSection.classList.remove("d-none");
        finalScoreText.innerText = `Your score: ${score}/${questions.length}`;
    }

    function decodeHTML(html) {
        const text = document.createElement("textarea");
        text.innerHTML = html;
        return text.value;
    }
});
