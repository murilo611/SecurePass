# SecurePass — Smart Password Security Analyzer

SecurePass is a static, educational web application for analyzing password strength and generating random passwords directly in your browser. Passwords are never sent to a server or saved by the application.

## Project goals

- Explain the characteristics that contribute to stronger passwords.
- Provide a transparent heuristic assessment and practical recommendations.
- Generate passwords with the browser's cryptographic API.
- Demonstrate a responsive frontend application with no backend, ready for GitHub Pages.

## Features

- Real-time analysis, a score from 0 to 100, and a five-level strength indicator.
- Security checklist for length, character types, obvious sequences, and common patterns.
- Contextual recommendations and account security tips.
- Show, hide, and clear controls for the analyzed password.
- Password generator for 8–32 characters, with category selection, copy, and analyzer actions.
- Responsive layout with keyboard accessibility and reduced-motion support.

## Technologies

- Semantic HTML5
- CSS3 with responsive design variables
- Vanilla JavaScript
- Web Crypto API (`crypto.getRandomValues`)

There is no backend, database, analytics, external API, or build dependency.

## Project structure

```text
.
├── index.html
├── style.css
├── script.js
└── README.md
```

## Security and privacy

- Analysis and password generation run locally on your device.
- Passwords are not sent in requests or URLs, and are not saved to cookies or local storage.
- Password generation uses `crypto.getRandomValues` and rejection sampling for unbiased selection.
- Passwords are masked by default; clearing the analyzer immediately empties its input.
- The score is an educational heuristic, not a scientifically verified probability of compromise or a security guarantee.
- Copying depends on the Clipboard API, which is available in secure contexts such as HTTPS and localhost.

## Run locally

Open `index.html` in a modern browser. To test features that require a secure context, such as clipboard access, serve the folder from `localhost` (for example, with the VS Code Live Server extension).

## Deploy to GitHub Pages

1. Push these files to the root of a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose the branch and the root folder (`/`), then save.
5. Open the URL provided by GitHub Pages after deployment.

CSS and JavaScript are stored alongside `index.html` and use relative paths, so the app works from a GitHub Pages project subpath.

## Screenshots

Add screenshots of the deployed application here when available.

## Educational disclaimer

SecurePass is an educational tool and does not replace comprehensive credential management practices. Do not enter real or currently used passwords. Use unique passwords and consider a reputable password manager.
