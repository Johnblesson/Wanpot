/*******************
* WANPOT Signup JS * 
*******************/

  // 1️⃣ Toggle password visibility
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  togglePassword.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
  });

  // 2️⃣ Remove error highlight on input
  const inputs = document.querySelectorAll("input");
  inputs.forEach(input => {
    input.addEventListener("input", () => {
      input.classList.remove("input-error");
    });
  });

  // 3️⃣ Live password strength validation
  const passwordStrengthDiv = document.createElement("div");
  passwordStrengthDiv.id = "password-strength";
  passwordInput.parentNode.appendChild(passwordStrengthDiv);

  const passwordRules = {
    length: /.{6,}/,      // Minimum 6 chars
    upper: /[A-Z]/,       // At least one uppercase
    lower: /[a-z]/        // At least one lowercase
  };

  passwordInput.addEventListener("input", () => {
    const val = passwordInput.value;
    let valid = true;

    if (!passwordRules.length.test(val)) valid = false;
    if (!passwordRules.upper.test(val)) valid = false;
    if (!passwordRules.lower.test(val)) valid = false;

    passwordStrengthDiv.innerHTML = valid 
      ? "<span class='strong'>✔ Strong password</span>" 
      : "<span class='weak'>✖ Weak password</span>";
  });

  // 4️⃣ Live username availability check
  const usernameInput = document.querySelector("input[name='username']");
  const usernameStatus = document.createElement("div");
  usernameStatus.className = "username-status";
  usernameInput.parentNode.appendChild(usernameStatus);

  let usernameTimer;
  usernameInput.addEventListener("input", () => {
    clearTimeout(usernameTimer);
    usernameTimer = setTimeout(async () => {
      const username = usernameInput.value.trim();
      if (!username) {
        usernameStatus.innerHTML = "";
        return;
      }

      try {
        const res = await fetch("/check-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username })
        });

        const data = await res.json();

        if (data.exists) {
          usernameStatus.innerHTML = "<span class='error'>Username already taken</span>";
          usernameInput.classList.add("input-error");
        } else {
          usernameStatus.innerHTML = "<span class='success'>✔ Available</span>";
          usernameInput.classList.remove("input-error");
        }
      } catch (err) {
        console.error("Username check error:", err);
      }
    }, 500);
  });

  // 5️⃣ Auto-fill country code for phone
  fetch("https://ipapi.co/json/")
    .then(res => res.json())
    .then(data => {
      const phoneInput = document.querySelector("input[name='phone']");
      if (data.country_calling_code && phoneInput.value === "") {
        phoneInput.value = data.country_calling_code + " ";
      }
    })
    .catch(() => {});

  // 6️⃣ Disable submit until all required fields are valid
  const form = document.querySelector("form");
  const submitBtn = form.querySelector("button");

  form.addEventListener("input", () => {
    const requiredInputs = [...form.querySelectorAll("input[required]")];
    const allValid = requiredInputs.every(i => i.value.trim() !== "" && !i.classList.contains("input-error"));

    submitBtn.disabled = !allValid;
    submitBtn.style.opacity = allValid ? "1" : "0.6";
  });

// 7️⃣ AI-assisted username suggestions (click-to-fill)
usernameInput.addEventListener("focus", async () => {
  const fullnameInput = document.querySelector("input[name='fullname']");
  const fullname = fullnameInput.value.trim() || "user";

  try {
    const res = await fetch("/suggest-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullname })
    });

    const data = await res.json();

    if (data.suggestions && data.suggestions.length) {
      // Create clickable buttons
      const buttons = data.suggestions
        .map(s => `<button type="button" class="suggest-btn">${s}</button>`)
        .join(" ");

      usernameStatus.innerHTML = `
        <div class="info">Suggestions:</div>
        <div class="suggestion-box">${buttons}</div>
      `;

      // Make each suggestion clickable
      document.querySelectorAll(".suggest-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          usernameInput.value = btn.textContent;
          usernameInput.classList.remove("input-error");
          usernameStatus.innerHTML = "<span class='success'>✔ Selected</span>";

          // Trigger validation instantly
          usernameInput.dispatchEvent(new Event("input"));
        });
      });
    }
  } catch (err) {
    console.error("Username suggestion error:", err);
  }
});