if (sessionStorage.getItem("studentLoggedIn") !== "true") {
    window.location.href = "login.html";
}

const lessonName = document.getElementById("lesson-name");
const lessonIDText = document.getElementById("lesson-id");
const lessonLevel = document.getElementById("lesson-level");

const pdfSection = document.getElementById("pdf-section");
const pdfViewer = document.getElementById("lesson-pdf");
const downloadButton = document.getElementById("download-button");

const lessonError = document.getElementById("lesson-error");
const logoutButton = document.getElementById("logout-button");

const params = new URLSearchParams(window.location.search);

const lessonID = params.get("id");

async function loadLesson() {
    if (!lessonID) {
        showError("No Lesson ID was provided.");
        return;
    }

    try {
        const response = await fetch(
            `../jsonlessondata/${encodeURIComponent(lessonID)}.json`
        );

        if (!response.ok) {
            throw new Error(
                `Could not find lesson ${lessonID}`
            );
        }

        const lesson = await response.json();

        displayLesson(lesson);

    } catch (error) {
        console.error(error);

        showError("Could not load this lesson.");
    }
}

function displayLesson(lesson) {
    document.title =
        `${lesson.name} - LimiMake Lessons`;

    lessonName.textContent = lesson.name;

    lessonIDText.textContent = lesson.lessonID;

    lessonLevel.textContent =
        `Level ${lesson.level.number}: ${lesson.level.name}`;

    const pdfUrl = lesson.student.pdfUrl;

    pdfViewer.src = pdfUrl;

    downloadButton.href = pdfUrl;

    downloadButton.setAttribute(
        "download",
        `${lesson.lessonID}.pdf`
    );

    pdfSection.hidden = false;
}

function showError(message) {
    lessonName.textContent = "Lesson unavailable";

    lessonLevel.textContent = "";
    lessonIDText.textContent = "";

    pdfSection.hidden = true;

    lessonError.textContent = message;
}

function logout() {
    sessionStorage.removeItem("studentLoggedIn");
    sessionStorage.removeItem("studentPIN");

    window.location.href = "login.html";
}

logoutButton.addEventListener("click", logout);

loadLesson();
