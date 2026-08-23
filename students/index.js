if (sessionStorage.getItem("studentLoggedIn") !== "true") {
    window.location.href = "login.html";
}

const searchInput = document.getElementById("lesson-search");
const results = document.getElementById("lesson-results");
const logoutButton = document.getElementById("logout-button");

let lessons = [];

const levels = [
    {
        level: 1,
        count: 8
    },
    {
        level: 2,
        count: 12
    },
    {
        level: 3,
        count: 4
    },
    {
        level: 4,
        count: 6
    },
    {
        level: 5,
        count: 10
    }
];

function getLessonID(level, lesson) {
    if (lesson === 1) {
        return `LM${level}.${lesson}PMEN0KAT0`;
    }

    if (lesson === 2) {
        return `LM${level}.${lesson}PMEN0KAT2`;
    }

    return `LM${level}.${lesson}PMEN1KAT2`;
}

async function loadLessons() {
    results.innerHTML = `
        <p class="no-results">
            Loading lessons...
        </p>
    `;

    const requests = [];

    for (const levelData of levels) {
        for (
            let lesson = 1;
            lesson <= levelData.count;
            lesson++
        ) {
            const lessonID = getLessonID(
                levelData.level,
                lesson
            );

            requests.push(
                loadLesson(lessonID)
            );
        }
    }

    const loaded = await Promise.allSettled(requests);

    lessons = loaded
        .filter(result => result.status === "fulfilled")
        .map(result => result.value);

    lessons.sort((a, b) => {
        return a.lessonNum - b.lessonNum;
    });

    displayLessons(lessons);
}

async function loadLesson(lessonID) {
    const response = await fetch(
        `../jsonlessondata/${lessonID}.json`
    );

    if (!response.ok) {
        throw new Error(
            `Could not load ${lessonID}.json`
        );
    }

    return response.json();
}

function displayLessons(list) {
    results.innerHTML = "";

    if (list.length === 0) {
        results.innerHTML = `
            <p class="no-results">
                No lessons found.
            </p>
        `;

        return;
    }

    for (const lesson of list) {
        const card = document.createElement("article");

        card.className = "lesson-card";

        const title = document.createElement("h3");
        title.textContent = lesson.name;

        const lessonID = document.createElement("p");
        lessonID.className = "lesson-id";
        lessonID.textContent = lesson.lessonID;

        const level = document.createElement("p");
        level.className = "lesson-level";
        level.textContent =
            `Level ${lesson.level.number}: ${lesson.level.name}`;

        const openButton = document.createElement("a");
        openButton.className = "lesson-button";
        openButton.textContent = "Open Lesson";

        openButton.href =
            `lesvie.html?id=${encodeURIComponent(lesson.lessonID)}`;

        card.appendChild(title);
        card.appendChild(lessonID);
        card.appendChild(level);
        card.appendChild(openButton);

        results.appendChild(card);
    }
}

function searchLessons() {
    const query = searchInput.value
        .trim()
        .toLowerCase();

    if (query === "") {
        displayLessons(lessons);
        return;
    }

    const filtered = lessons.filter(lesson => {
        const searchable = [
            lesson.lessonID,
            lesson.name,
            lesson.level.name,
            `level ${lesson.level.number}`,
            String(lesson.level.number),
            String(lesson.lessonNum)
        ];

        return searchable.some(value =>
            String(value)
                .toLowerCase()
                .includes(query)
        );
    });

    displayLessons(filtered);
}

function logout() {
    sessionStorage.removeItem("studentLoggedIn");
    sessionStorage.removeItem("studentPIN");

    window.location.href = "login.html";
}

searchInput.addEventListener("input", searchLessons);
logoutButton.addEventListener("click", logout);

loadLessons().catch(error => {
    console.error(error);

    results.innerHTML = `
        <p class="no-results">
            Could not load the lesson catalog.
        </p>
    `;
});s
