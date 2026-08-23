const form = document.getElementById("login-form");
const errorText = document.getElementById("login-error");

form.addEventListener("submit", login);

async function login(event) {
    event.preventDefault();

    const pin = document.getElementById("pin").value.trim();
    const passcode = document.getElementById("passcode").value.trim();

    errorText.textContent = "";

    if (!/^\d{4}$/.test(pin)) {
        errorText.textContent = "PIN Code must be exactly 4 digits.";
        return;
    }

    if (!/^\d{5}$/.test(passcode)) {
        errorText.textContent = "Passcode must be exactly 5 digits.";
        return;
    }

    try {
        const response = await fetch("/api/student-login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                pin: pin,
                passcode: passcode
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            errorText.textContent = "Incorrect PIN Code or passcode.";
            return;
        }

        sessionStorage.setItem("studentLoggedIn", "true");
        sessionStorage.setItem("studentPIN", pin);

        window.location.href = "./";

    } catch (error) {
        console.error(error);

        errorText.textContent =
            "Could not connect to LimiMake Lessons.";
    }
}
