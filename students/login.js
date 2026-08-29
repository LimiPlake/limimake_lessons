const API_URL =
    "https://limimake-lessons-paid-only-privacy.onrender.com";

const form = document.getElementById("login-form");
const errorText = document.getElementById("login-error");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    errorText.textContent = "";

    const pin = document.getElementById("pin").value.trim();
    const passcode = document.getElementById("passcode").value.trim();

    try {
        const response = await fetch(
            `${API_URL}/lml_api/student-login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    pin,
                    passcode
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            errorText.textContent =
                data.error || "Login failed.";

            return;
        }

        // Save the secure session token for this browser tab.
        sessionStorage.setItem(
            "lmlStudentToken",
            data.token
        );

        window.location.href = "index.html";

    } catch (error) {
        console.error(error);

        errorText.textContent =
            "Could not connect to LimiMake Lessons.";
    }
});