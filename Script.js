document.addEventListener("DOMContentLoaded", () => {
const API_KEY = process.env.QUIZ_API_KEY;
    // Store this in an environment variable
    const API_URL = "https://quizapi.io/api/v1/questions";
    const categoryMap = {
        html: "HTML",
        css: "CSS",
        javascript: "JavaScript",
        angularjs: "JavaScript" // QuizAPI.io may not have AngularJS specifically, so use JavaScript
    };

    const startQuizBtn = document.getElementById("start-quiz");
    const categorySelect = document.getElementById("categorySelect");
    const quizSection = document.getElementById("quiz-section");
    const welcomeScreen = document.getElementById("welcome-screen");
    const timerDisplay = document.getElementById("timer");
    const questionEl = document.getElementById("question");
    const answersEl = document.getElementById("answers");
    const nextBtn = document.getElementById("next-btn");

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let incorrectAnswers = [];
    let totalTime = 30 * 60; // 30 minutes
    let sessionTimer;
    let hasAcceptedTerms = false;

    const termsModal = new bootstrap.Modal(document.getElementById("termsModal"));
    termsModal.show();

    document.getElementById("acceptTerms").addEventListener("click", () => {
        hasAcceptedTerms = true;
        termsModal.hide();
    });

    startQuizBtn.addEventListener("click", (e) => {
        if (!hasAcceptedTerms) {
            e.preventDefault();
            termsModal.show();
        } else {
            startQuiz();
        }
    });

    async function startQuiz() {
        const category = categorySelect.value;
        const url = `${API_URL}?apiKey=${API_KEY}&category=${categoryMap[category]}&difficulty=Medium&limit=10`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            questions = data;
            currentQuestionIndex = 0;
            score = 0;
            incorrectAnswers = [];
            totalTime = 30 * 60;

            welcomeScreen.classList.add("d-none");
            quizSection.classList.remove("d-none");

            startSessionTimer();
            showQuestion();
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    }

    function startSessionTimer() {
        sessionTimer = setInterval(() => {
            const minutes = Math.floor(totalTime / 60);
            const seconds = totalTime % 60;
            timerDisplay.innerText = `Time Left: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

            if (totalTime <= 0) {
                clearInterval(sessionTimer);
                endQuiz();
            }
            totalTime--;
        }, 1000);
    }

    function showQuestion() {
        const currentQuestion = questions[currentQuestionIndex];
        questionEl.innerHTML = currentQuestion.question;
        answersEl.innerHTML = "";

        const options = Object.values(currentQuestion.answers).filter((answer) => answer !== null);

        options.forEach((answer) => {
            const button = document.createElement("button");
            button.classList.add("btn", "btn-outline-primary", "d-block", "mt-2");
            button.innerText = answer;
            button.addEventListener("click", () => selectAnswer(answer, currentQuestion.correct_answer));
            answersEl.appendChild(button);
        });
    }

    function selectAnswer(selected, correct) {
        if (selected === correct) {
            score++;
        } else {
            incorrectAnswers.push({ question: questions[currentQuestionIndex].question, correct });
        }

        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            showQuestion();
        } else {
            endQuiz();
        }
    }

    function endQuiz() {
        clearInterval(sessionTimer);
        quizSection.classList.add("d-none");

        document.getElementById("review-list").innerHTML = incorrectAnswers
            .map((item) => `<p><strong>Q:</strong> ${item.question} <br> <strong>Correct Answer:</strong> ${item.correct}</p>`)
            .join("");

        document.getElementById("review-section").classList.remove("d-none");
    }

    document.getElementById("restart-btn").addEventListener("click", () => {
        document.getElementById("review-section").classList.add("d-none");
        welcomeScreen.classList.remove("d-none");
    });
});
                          
