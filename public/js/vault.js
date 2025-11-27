  // ----------- ELEMENTS ------------
  const passwordBox = document.getElementById('passwordBox');
  const lengthRange = document.getElementById('lengthRange');
  const lenLabel = document.getElementById('lenLabel');
  const lowercase = document.getElementById('lowercase');
  const uppercase = document.getElementById('uppercase');
  const numbers = document.getElementById('numbers');
  const symbols = document.getElementById('symbols');
  const excludeAmb = document.getElementById('excludeAmb');

  const generateBtn = document.getElementById('generateBtn');
  const copyBtn = document.getElementById('copyBtn');
  const saveBtn = document.getElementById('saveBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  const vaultList = document.getElementById('vaultList');

  // ----------- GENERATION LOGIC -----------
  const sets = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    num: '0123456789',
    sym: '!@#$%^&*()-_=+[]{};:,.<>?/|'
  };

  const ambiguous = '0O1lI|`\\""' ;

  const getCharPool = () => {
    let pool = '';
    if (lowercase.checked) pool += sets.lower;
    if (uppercase.checked) pool += sets.upper;
    if (numbers.checked) pool += sets.num;
    if (symbols.checked) pool += sets.sym;
    if (excludeAmb.checked) {
      pool = pool.split('').filter(c => !ambiguous.includes(c)).join('');
    }
    return pool;
  };

  const randomChar = (str) => str[Math.floor(Math.random() * str.length)];

  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const generatePassword = (len) => {
    const pool = getCharPool();
    if (!pool) return '';

    let pwd = [];
    let required = [];

    if (lowercase.checked) required.push(randomChar(sets.lower));
    if (uppercase.checked) required.push(randomChar(sets.upper));
    if (numbers.checked) required.push(randomChar(sets.num));
    if (symbols.checked) required.push(randomChar(sets.sym));

    if (required.length > len) required = required.slice(0, len);

    for (let i = 0; i < len - required.length; i++) {
      pwd.push(randomChar(pool));
    }

    for (const r of required) {
      const pos = Math.floor(Math.random() * (pwd.length + 1));
      pwd.splice(pos, 0, r);
    }

    return shuffle(pwd).join('');
  };

  const setStrength = (pw) => {
    const meter = document.getElementById('meterFill');
    const label = document.getElementById('strengthLabel');

    if (!pw) {
      meter.style.width = '0%';
      label.textContent = 'Strength: —';
      return;
    }

    let pool = 0;
    if (/[a-z]/.test(pw)) pool += 26;
    if (/[A-Z]/.test(pw)) pool += 26;
    if (/\d/.test(pw)) pool += 10;
    if (/[^A-Za-z0-9]/.test(pw)) pool += 30;

    const entropy = Math.log2(Math.pow(pool, pw.length));

    let score = 0;
    let text = 'Weak';

    if (entropy < 36) { score = 30; text = 'Weak'; }
    else if (entropy < 60) { score = 60; text = 'Fair'; }
    else if (entropy < 80) { score = 80; text = 'Strong'; }
    else { score = 100; text = 'Very Strong'; }

    meter.style.width = score + '%';
    label.textContent = `Strength: ${text}`;
  };

  // ----------- UI EVENTS -----------  
  lengthRange.addEventListener('input', () => {
    lenLabel.textContent = lengthRange.value;
  });

  generateBtn.addEventListener('click', () => {
    const pw = generatePassword(+lengthRange.value);
    passwordBox.textContent = pw;
    setStrength(pw);
  });

  copyBtn.addEventListener('click', async () => {
    if (!passwordBox.textContent.includes('•')) {
      await navigator.clipboard.writeText(passwordBox.textContent);
      alert('Copied!');
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!passwordBox.textContent.includes('•')) {
      const blob = new Blob([passwordBox.textContent], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "password.txt";
      a.click();
    }
  });

  // ----------- DATABASE VAULT LOGIC -----------

  // Correct route → GET /vault/my-passwords
  const loadVault = async () => {
    try {
      const res = await fetch('/vault/my-passwords');
      const data = await res.json();

      if (!data.length) {
        vaultList.innerHTML = `<div class="small">No passwords saved.</div>`;
        return;
      }

      vaultList.innerHTML = data.map(item => `
        <div class="vault-item">
          <div style="display:flex; flex-direction:column;">
            <div><strong>URL:</strong> ${item.url || "—"}</div>
            <div><strong>User:</strong> ${item.usernameOrEmail || "—"}</div>
            <div><strong>Password:</strong> ${item.password}</div>
          </div>

          <button class="btn ghost" onclick="deletePassword('${item._id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `).join('');
    } catch (err) {
      vaultList.innerHTML = `<div class="small">Error loading vault</div>`;
    }
  };

  // Correct route → POST /vault/save-password
  const savePassword = async () => {
    const pw = passwordBox.textContent;
    if (!pw || pw.includes('•')) return alert('Generate a password first.');

    const url = prompt('Enter URL (optional):') || '';
    const usernameOrEmail = prompt('Enter Username/email (optional):') || '';

    await fetch('/vault/save-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, usernameOrEmail, password: pw })
    });

    alert('Saved to database!');
    loadVault();
  };

  // Correct route → DELETE /vault/delete/:id
  window.deletePassword = async (id) => {
    await fetch(`/vault/delete/${id}`, { method: 'DELETE' });
    loadVault();
  };

  saveBtn.addEventListener('click', savePassword);

  // INITIAL LOAD
  loadVault();

