const API_URL =
    "https://limimake-lessons-paid-only-privacy.onrender.com";

const token =
    sessionStorage.getItem("lmlStudentToken");

if (!token) {
    window.location.href = "login.html";
}

const lessonName =
    document.getElementById("lesson-name");

const lessonIDText =
    document.getElementById("lesson-id");

const lessonLevel =
    document.getElementById("lesson-level");

const pdfSection =
    document.getElementById("pdf-section");

const pdfViewer =
    document.getElementById("lesson-pdf");

const downloadButton =
    document.getElementById("download-button");

const lessonError =
    document.getElementById("lesson-error");

const logoutButton =
    document.getElementById("logout-button");

const params =
    new URLSearchParams(window.location.search);

const lessonID =
    params.get("id");

let pdfObjectURL = null;


async function loadLesson() {
    if (!lessonID) {
        showError(
            "No Lesson ID was provided."
        );

        return;
    }

    try {
        // --------------------------------
        // Load lesson information
        // --------------------------------

        const lessonResponse =
            await fetch(
                `../jsonlessondata/${encodeURIComponent(
                    lessonID
                )}.json`
            );

        if (!lessonResponse.ok) {
            throw new Error(
                `Could not find lesson ${lessonID}`
            );
        }

        const lesson =
            await lessonResponse.json();


        // --------------------------------
        // Show lesson information
        // --------------------------------

        document.title =
            `${lesson.name} - LimiMake Lessons`;

        lessonName.textContent =
            lesson.name;

        lessonIDText.textContent =
            lesson.lessonID;

        lessonLevel.textContent =
            `Level ${lesson.level.number}: ${lesson.level.name}`;


        // --------------------------------
        // Fetch protected PDF
        // --------------------------------

        const pdfResponse =
            await fetch(
                `${API_URL}/lml_api/student-lesson/${encodeURIComponent(
                    lesson.lessonID
                )}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        // Session expired / invalid
        if (
            pdfResponse.status === 401 ||
            pdfResponse.status === 403
        ) {
            sessionStorage.removeItem(
                "lmlStudentToken"
            );

            window.location.href =
                "login.html";

            return;
        }


        if (!pdfResponse.ok) {
            let message =
                "Could not load the lesson PDF.";

            try {
                const errorData =
                    await pdfResponse.json();

                if (errorData.error) {
                    message =
                        errorData.error;
                }
            } catch {
                // Response wasn't JSON.
            }

            throw new Error(message);
        }


        // --------------------------------
        // Turn PDF into a temporary
        // browser-only URL
        // --------------------------------

        const pdfBlob =
            await pdfResponse.blob();

        pdfObjectURL =
            URL.createObjectURL(pdfBlob);


        // --------------------------------
        // PDF viewer
        // --------------------------------

        pdfViewer.src =
            pdfObjectURL;


        // --------------------------------
        // Download button
        // --------------------------------

        downloadButton.href =
            pdfObjectURL;

        downloadButton.setAttribute(
            "download",
            `${lesson.lessonID}.pdf`
        );


        pdfSection.hidden =
            false;

        lessonError.textContent =
            "";

    } catch (error) {
        console.error(error);

        showError(
            error.message ||
            "Could not load this lesson."
        );
    }
}


function showError(message) {
    lessonName.textContent =
        "Lesson unavailable";

    lessonLevel.textContent =
        "";

    lessonIDText.textContent =
        "";

    pdfSection.hidden =
        true;

    lessonError.textContent =
        message;
}


async function logout() {
    try {
        await fetch(
            `${API_URL}/lml_api/logout`,
            {
                method: "POST",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );
    } catch (error) {
        console.error(error);
    }


    sessionStorage.removeItem(
        "lmlStudentToken"
    );


    if (pdfObjectURL) {
        URL.revokeObjectURL(
            pdfObjectURL
        );
    }


    window.location.href =
        "login.html";
}


logoutButton.addEventListener(
    "click",
    logout
);


// Clean up the temporary PDF URL
// when leaving the page.

window.addEventListener(
    "beforeunload",
    () => {
        if (pdfObjectURL) {
            URL.revokeObjectURL(
                pdfObjectURL
            );
        }
    }
);


loadLesson();