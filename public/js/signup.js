/* public/js/signup.js
   WANPOT Signup frontend logic:
   - 2-step wizard
   - progress bar
   - password reveal + animation
   - password strength
   - username suggestions + availability check
   - phone auto country code
   - reCAPTCHA (client token attach)
*/

(function () {
  // === CONFIG ===
  const RECAPTCHA_SITE_KEY = "6LeEWA8sAAAAAFJN9MpUYmF5wxRgkWsM_6AoU1mV"; // <-- replace
  const USERNAME_AVAILABILITY_ENDPOINT = "/check-username";
  const USERNAME_AI_ENDPOINT = "/suggest-username"; // optional
  const USERNAME_DEBOUNCE = 450;

  // === HELPERS ===
  const $ = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));
  const exist = el => !!el;

  // === ELEMENTS ===
  const form = document.getElementById("signupForm") || document.querySelector("form");
  const step1 = document.getElementById("step-1");
  const step2 = document.getElementById("step-2");
  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");
  const progressFill = document.getElementById("progressFill");
  const usernameInput = document.getElementById("username") || $("input[name='username']");
  const usernameSuggestionsBox = document.getElementById("usernameSuggestions");
  const passwordInput = document.getElementById("password") || $("input[name='password']");
  const passwordStrengthBox = document.getElementById("password-strength");
  const phoneInput = document.getElementById("phone") || $("input[name='phone']");
  const formStep = document.getElementById("formStep") || $("input[name='step']");

  if (!form) { console.warn("signup.js: form not found."); return; }

  // === WIZARD ===
  let currentStep = Number(formStep.value) || 1;
  function showStep(n) {
    currentStep = n;
    if (step1) step1.style.display = n === 1 ? "block" : "none";
    if (step2) step2.style.display = n === 2 ? "block" : "none";
    if (formStep) formStep.value = n;
    if (progressFill) progressFill.style.width = n === 1 ? "50%" : "100%";
  }
  function validateStep(n) {
    if (n === 1) {
      const req = ["fullname","username","phone"];
      return req.every(name => {
        const el = form.querySelector(`[name='${name}']`);
        return el && el.value.trim() !== "" && !el.classList.contains("input-error");
      });
    } else {
      const pw = form.querySelector("[name='password']");
      return pw && pw.value.trim().length >= 6 && !pw.classList.contains("input-error");
    }
  }
  if (nextBtn) nextBtn.addEventListener("click", e => {
    e.preventDefault();
    if (!validateStep(1)) {
      // highlight empties
      $$("#step-1 input").forEach(i => {
        if (!i.value.trim()) i.classList.add("input-error");
        i.classList.add("shake");
        setTimeout(()=>i.classList.remove("shake"), 350);
      });
      return;
    }
    showStep(2);
  });
  if (backBtn) backBtn.addEventListener("click", e => { e.preventDefault(); showStep(1); });
  showStep(currentStep);

  // === PASSWORD TOGGLE & ANIMATION ===
  const toggle = document.querySelector("[data-toggle='password']") || document.getElementById("togglePassword");
  if (toggle && passwordInput) {
    toggle.addEventListener("click", ()=> {
      const isPw = passwordInput.type === "password";
      passwordInput.type = isPw ? "text" : "password";
      toggle.classList.toggle("fa-eye");
      toggle.classList.toggle("fa-eye-slash");
      toggle.classList.add("pw-anim");
      setTimeout(()=>toggle.classList.remove("pw-anim"), 260);
    });
  }

  // === PASSWORD STRENGTH ===
  function scorePassword(pw) {
    let s = 0;
    if (/.{6,}/.test(pw)) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[a-z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    return s;
  }
  if (passwordInput && passwordStrengthBox) {
    passwordInput.addEventListener("input", ()=> {
      const s = scorePassword(passwordInput.value);
      if (!passwordInput.value) passwordStrengthBox.innerHTML = "";
      else if (s <= 1) { passwordStrengthBox.innerHTML = "<span class='pw-weak'>Very weak</span>"; passwordInput.classList.add("input-error"); }
      else if (s === 2) { passwordStrengthBox.innerHTML = "<span class='pw-medium'>Weak</span>"; passwordInput.classList.add("input-error"); }
      else if (s === 3) { passwordStrengthBox.innerHTML = "<span class='pw-good'>Good</span>"; passwordInput.classList.remove("input-error"); }
      else { passwordStrengthBox.innerHTML = "<span class='pw-strong'>Strong</span>"; passwordInput.classList.remove("input-error"); }
    });
  }

  // === USERNAME SUGGESTIONS (client-side fallback + optional server) ===
  const fullnameInput = form.querySelector("[name='fullname']");
  async function clientSuggest(fullname, count=5) {
    const base = (fullname||"").toLowerCase().replace(/[^a-z0-9 ]/g,"").trim();
    const parts = base.split(/\s+/).filter(Boolean);
    const s = new Set();
    if (parts.length>=2) { s.add(parts[0]+parts[1]); s.add(parts[0]+"."+parts[1]); s.add(parts[0].charAt(0)+parts[1]); }
    else if (parts.length===1) { s.add(parts[0]); s.add(parts[0]+"123"); }
    while (s.size < count) s.add("user"+Math.floor(100+Math.random()*900));
    return Array.from(s).slice(0,count);
  }
  async function aiSuggest(fullname) {
    if (!fullname || !fullname.trim()) return [];
    try {
      const res = await fetch(USERNAME_AI_ENDPOINT, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ fullname }) });
      if (res.ok) { const json = await res.json(); if (Array.isArray(json.suggestions)) return json.suggestions; }
    } catch (e) { /* ignore */ }
    return clientSuggest(fullname);
  }
  function renderSuggestions(list) {
    if (!usernameSuggestionsBox) return;
    usernameSuggestionsBox.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "username-suggestions-list";
    list.forEach(item=>{
      const b = document.createElement("button");
      b.type = "button"; b.className="username-suggestion-pill"; b.textContent = item;
      b.onclick = ()=> { usernameInput.value = item; usernameInput.dispatchEvent(new Event("input",{bubbles:true})); };
      wrap.appendChild(b);
    });
    usernameSuggestionsBox.appendChild(wrap);
  }
  if (fullnameInput && usernameSuggestionsBox) {
    let t;
    fullnameInput.addEventListener("input", ()=> {
      clearTimeout(t);
      t = setTimeout(async ()=> {
        const items = await aiSuggest(fullnameInput.value);
        renderSuggestions(items);
      }, 350);
    });
  }

  // === USERNAME AVAILABILITY (debounced) ===
  if (usernameInput) {
    const statusEl = document.createElement("div");
    statusEl.className = "username-availability-status";
    usernameInput.parentNode.appendChild(statusEl);
    let timer;
    usernameInput.addEventListener("input", ()=> {
      clearTimeout(timer);
      statusEl.innerHTML="";
      const v = usernameInput.value.trim();
      if (!v) return;
      timer = setTimeout(async ()=> {
        try {
          const res = await fetch(USERNAME_AVAILABILITY_ENDPOINT, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ username: v }) });
          if (!res.ok) throw new Error("network");
          const j = await res.json();
          if (j.exists) { statusEl.innerHTML = "<span class='error'>Taken</span>"; usernameInput.classList.add("input-error"); }
          else { statusEl.innerHTML = "<span class='success'>Available ✓</span>"; usernameInput.classList.remove("input-error"); }
        } catch (e) { /* ignore */ }
      }, USERNAME_DEBOUNCE);
    });
  }

  // === AUTO-FILL PHONE COUNTRY CODE (ipapi) ===
  if (phoneInput && phoneInput.value.trim()==="") {
    fetch("https://ipapi.co/json/").then(r=>r.json()).then(data=>{
      if (data && data.country_calling_code) phoneInput.value = data.country_calling_code + " ";
    }).catch(()=>{});
  }

  // === DISABLE NEXT/SUBMIT UNTIL VALID ===
  function refreshButtons() {
    if (nextBtn) nextBtn.disabled = !validateStep(1);
    if (form.querySelector("[type='submit']")) form.querySelector("[type='submit']").disabled = !validateStep(2);
    if (nextBtn) nextBtn.style.opacity = validateStep(1) ? "1" : "0.6";
    if (form.querySelector("[type='submit']")) form.querySelector("[type='submit']").style.opacity = validateStep(2) ? "1" : "0.6";
  }
  form.addEventListener("input", refreshButtons);
  refreshButtons();

  // === reCAPTCHA helper (client) ===
  function loadRecaptcha(callback) {
    if (!RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY==="YOUR_RECAPTCHA_SITE_KEY") { callback && callback(null); return; }
    if (window.grecaptcha) return callback && callback(window.grecaptcha);
    const s = document.createElement("script");
    s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    s.async = true; s.defer = true;
    s.onload = ()=> callback && callback(window.grecaptcha);
    s.onerror = ()=> callback && callback(null);
    document.head.appendChild(s);
  }
  async function attachRecaptchaToken() {
    return new Promise(resolve => {
      loadRecaptcha(async (gre) => {
        if (!gre || !gre.execute) return resolve(null);
        try {
          const token = await gre.execute(RECAPTCHA_SITE_KEY, { action: "signup" });
          let input = form.querySelector("input[name='g-recaptcha-response']");
          if (!input) { input = document.createElement("input"); input.type="hidden"; input.name="g-recaptcha-response"; form.appendChild(input); }
          input.value = token;
          resolve(token);
        } catch (e) { resolve(null); }
      });
    });
  }

  // === FINAL SUBMIT FLOW ===
  form.addEventListener("submit", async (e)=> {
    // if still on step 1, prevent submit
    if (currentStep === 1) { e.preventDefault(); if (nextBtn) nextBtn.click(); return; }

    e.preventDefault(); // we'll submit programmatically
    // final client validation
    if (!validateStep(2)) {
      $$("#step-2 input").forEach(i => { if (!i.value.trim()) i.classList.add("input-error"); i.classList.add("shake"); setTimeout(()=>i.classList.remove("shake"),350); });
      return;
    }

    // attach reCAPTCHA token (if any)
    await attachRecaptchaToken();

    // disable submit and show loading text
    const submit = form.querySelector("[type='submit']");
    if (submit) { submit.disabled = true; submit.textContent = "Creating account..."; }

    // programmatic submit (will send g-recaptcha-response)
    form.submit();
  });

  // expose small debugging API
  window.WANPOT_SIGNUP = { showStep, validateStep };

})();
