"use strict";

(() => {
  const passwordInput = document.querySelector("#password-input");
  const toggleVisibility = document.querySelector("#toggle-visibility");
  const clearPassword = document.querySelector("#clear-password");
  const strengthLabel = document.querySelector("#strength-label");
  const scoreValue = document.querySelector("#score-value");
  const strengthFill = document.querySelector("#strength-fill");
  const strengthMeter = document.querySelector(".strength-meter");
  const checklistItems = [...document.querySelectorAll("#checklist-items li")];
  const checkCount = document.querySelector("#check-count");
  const recommendationList = document.querySelector("#recommendation-list");
  const recommendationSummary = document.querySelector("#recommendation-summary");
  const lengthRange = document.querySelector("#length-range");
  const lengthValue = document.querySelector("#length-value");
  const generatedPassword = document.querySelector("#generated-password");
  const generatorFeedback = document.querySelector("#generator-feedback");
  const generateButton = document.querySelector("#generate-password");
  const copyButton = document.querySelector("#copy-password");
  const useGeneratedButton = document.querySelector("#use-generated");
  const toggleGenerated = document.querySelector("#toggle-generated");
  const categories = [
    { id: "#include-uppercase", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
    { id: "#include-lowercase", chars: "abcdefghijklmnopqrstuvwxyz" },
    { id: "#include-numbers", chars: "0123456789" },
    { id: "#include-symbols", chars: "!@#$%^&*()-_=+[]{};:,.?/~" }
  ];
  const commonPasswords = new Set([
    "password", "password1", "123456", "123456789", "12345678", "1234567890",
    "qwerty", "qwerty123", "abc123", "111111", "letmein", "welcome",
    "admin", "iloveyou", "monkey", "dragon", "password123"
  ]);
  const sequenceGroups = ["abcdefghijklmnopqrstuvwxyz", "0123456789", "qwertyuiop", "asdfghjkl", "zxcvbnm"];
  const strengthLevels = [
    { threshold: 20, label: "Very weak", level: 1 },
    { threshold: 40, label: "Weak", level: 2 },
    { threshold: 60, label: "Fair", level: 3 },
    { threshold: 80, label: "Strong", level: 4 },
    { threshold: 100, label: "Very strong", level: 5 }
  ];

  function hasObviousSequence(password) {
    const normalized = password.toLowerCase();
    for (const group of sequenceGroups) {
      for (let index = 0; index <= group.length - 4; index += 1) {
        const segment = group.slice(index, index + 4);
        const reverseSegment = [...segment].reverse().join("");
        if (normalized.includes(segment) || normalized.includes(reverseSegment)) {
          return true;
        }
      }
    }
    return /(.)\1{3,}/.test(password);
  }

  function containsCommonPattern(password) {
    const normalized = password.toLowerCase().replace(/[^a-z0-9]/g, "");
    return commonPasswords.has(normalized) ||
      [...commonPasswords].some((common) => common.length >= 5 && normalized.includes(common));
  }

  function analyzePassword(password) {
    if (!password) {
      return { score: 0, level: null, checks: {}, recommendations: [] };
    }

    const checks = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
      sequences: !hasObviousSequence(password),
      common: !containsCommonPattern(password)
    };

    let score = 0;
    score += Math.min(password.length, 20) * 3;
    score += [checks.uppercase, checks.lowercase, checks.number, checks.symbol]
      .filter(Boolean).length * 8;

    const uniqueRatio = new Set(password).size / password.length;
    if (uniqueRatio >= 0.8) score += 8;
    if (uniqueRatio < 0.5) score -= 18;
    else if (uniqueRatio < 0.7) score -= 8;
    if (hasObviousSequence(password)) score -= 20;
    if (containsCommonPattern(password)) score -= 35;
    score = Math.max(0, Math.min(100, Math.round(score)));

    const level = strengthLevels.find((item) => score <= item.threshold) ?? strengthLevels[4];
    return { score, level, checks, recommendations: buildRecommendations(checks, password.length) };
  }

  function buildRecommendations(checks, length) {
    const suggestions = [];
    if (length < 12) suggestions.push("Increase the length to at least 12 characters.");
    else if (length < 16) suggestions.push("Consider using 16 or more characters for added protection.");
    if (!checks.sequences) suggestions.push("Avoid predictable sequences and repeated characters.");
    if (!checks.common) suggestions.push("Avoid common passwords and predictable patterns.");
    if (!checks.uppercase || !checks.lowercase || !checks.number || !checks.symbol) {
      suggestions.push("Combine uppercase and lowercase letters, numbers, and symbols.");
    }
    suggestions.push("Use a different password for every account.");
    suggestions.push("Consider using a reputable password manager.");
    return suggestions.slice(0, 4);
  }

  function renderAnalysis(password) {
    const result = analyzePassword(password);
    if (!password) {
      strengthLabel.textContent = "Waiting for password";
      strengthLabel.removeAttribute("data-level");
      scoreValue.textContent = "—";
      strengthFill.style.width = "0%";
      strengthFill.removeAttribute("data-level");
      strengthMeter.setAttribute("aria-valuenow", "0");
      checklistItems.forEach((item) => item.classList.remove("is-met"));
      checkCount.textContent = "0/7 complete";
      recommendationSummary.textContent = "Personalized tips to help protect your accounts";
      renderRecommendations([
        "Use a unique password for every account.",
        "A reputable password manager can help keep your credentials secure."
      ]);
      return;
    }

    strengthLabel.textContent = result.level.label;
    strengthLabel.dataset.level = String(result.level.level);
    scoreValue.textContent = String(result.score);
    strengthFill.style.width = `${result.score}%`;
    strengthFill.dataset.level = String(result.level.level);
    strengthMeter.setAttribute("aria-valuenow", String(result.score));

    let passed = 0;
    checklistItems.forEach((item) => {
      const isMet = result.checks[item.dataset.check];
      item.classList.toggle("is-met", isMet);
      item.querySelector(".check-icon").textContent = isMet ? "✓" : "";
      if (isMet) passed += 1;
    });
    checkCount.textContent = `${passed}/7 complete`;
    recommendationSummary.textContent = "Next steps to improve your password";
    renderRecommendations(result.recommendations);
  }

  function renderRecommendations(recommendations) {
    recommendationList.replaceChildren();
    recommendations.forEach((text, index) => {
      const item = document.createElement("li");
      const number = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0");
      item.append(number, document.createTextNode(text));
      recommendationList.append(item);
    });
  }

  function secureRandomInt(maxExclusive) {
    if (!Number.isSafeInteger(maxExclusive) || maxExclusive < 1) {
      throw new RangeError("Invalid random selection range.");
    }
    const cryptoApi = window.crypto;
    if (!cryptoApi || typeof cryptoApi.getRandomValues !== "function") {
      throw new Error("This browser does not support secure password generation.");
    }
    const range = 0x100000000;
    const limit = range - (range % maxExclusive);
    const value = new Uint32Array(1);
    do {
      cryptoApi.getRandomValues(value);
    } while (value[0] >= limit);
    return value[0] % maxExclusive;
  }

  function secureShuffle(items) {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const swapIndex = secureRandomInt(index + 1);
      [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
    }
    return items;
  }

  function generateSecurePassword() {
    const selected = categories.filter((category) => document.querySelector(category.id).checked);
    const length = Number(lengthRange.value);
    if (selected.length === 0) {
      throw new Error("Select at least one character type.");
    }
    if (!Number.isInteger(length) || length < 8 || length > 32 || length < selected.length) {
      throw new Error("The selected length is not valid for the chosen character types.");
    }

    const pool = selected.map((category) => category.chars).join("");
    const chars = selected.map((category) => category.chars[secureRandomInt(category.chars.length)]);
    while (chars.length < length) chars.push(pool[secureRandomInt(pool.length)]);
    return secureShuffle(chars).join("");
  }

  function showFeedback(message, kind = "success") {
    generatorFeedback.textContent = message;
    generatorFeedback.dataset.kind = kind;
  }

  passwordInput.addEventListener("input", () => renderAnalysis(passwordInput.value));
  toggleVisibility.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";
    passwordInput.type = isVisible ? "password" : "text";
    toggleVisibility.setAttribute("aria-pressed", String(!isVisible));
    toggleVisibility.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
  });
  clearPassword.addEventListener("click", () => {
    passwordInput.value = "";
    renderAnalysis("");
    passwordInput.focus();
  });

  lengthRange.addEventListener("input", () => {
    lengthValue.value = lengthRange.value;
    lengthValue.textContent = lengthRange.value;
  });
  generateButton.addEventListener("click", () => {
    try {
      generatedPassword.value = generateSecurePassword();
      generatedPassword.type = "password";
      toggleGenerated.setAttribute("aria-pressed", "false");
      toggleGenerated.setAttribute("aria-label", "Show generated password");
      useGeneratedButton.disabled = false;
      showFeedback("Password generated securely on your device.");
    } catch (error) {
      showFeedback(error instanceof Error ? error.message : "Unable to generate a password.", "error");
    }
  });
  toggleGenerated.addEventListener("click", () => {
    const isVisible = generatedPassword.type === "text";
    generatedPassword.type = isVisible ? "password" : "text";
    toggleGenerated.setAttribute("aria-pressed", String(!isVisible));
    toggleGenerated.setAttribute("aria-label", isVisible ? "Show generated password" : "Hide generated password");
  });
  copyButton.addEventListener("click", async () => {
    if (!generatedPassword.value) {
      showFeedback("Generate a password before copying it.", "error");
      return;
    }
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      showFeedback("Copying is unavailable in this context. Open the site over HTTPS.", "error");
      return;
    }
    try {
      await navigator.clipboard.writeText(generatedPassword.value);
      showFeedback("Password copied to the clipboard.");
    } catch {
      showFeedback("Unable to copy. Check clipboard permissions and try again.", "error");
    }
  });
  useGeneratedButton.addEventListener("click", () => {
    if (!generatedPassword.value) return;
    passwordInput.value = generatedPassword.value;
    renderAnalysis(passwordInput.value);
    passwordInput.focus();
    passwordInput.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.querySelector("#current-year").textContent = String(new Date().getFullYear());
  renderAnalysis("");
})();
