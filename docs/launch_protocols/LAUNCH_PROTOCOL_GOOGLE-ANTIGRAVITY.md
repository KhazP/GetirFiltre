### Google Antigravity Quick Start Guide

**Time Estimate:** 15 minutes

#### 1. Installation
Install the desktop IDE or Linux package.
- **Linux:** `sudo apt install anti-gravity`
- **Mac/Win:** Download installer from Google.
- **Requirements:** Google Account, Vertex AI access.

#### 2. Setup Project Context
Google Antigravity uses `GEMINI.md` to understand your project.
- **File Location:** Project root.
- **Action:** Place the generated `GEMINI.md` (and `AGENTS.md`) in your project root.
- **Note:** Ensure the IDE is pointed to the folder containing these files.

#### 3. First Prompt
In the Agent panel:
```text
Using the project knowledge base, implement the MVP scaffold.
```

#### 4. Context & Workflow
- **Updates:** If you change `AGENTS.md` locally, Antigravity picks up changes via `GEMINI.md`.
- **Modes:** Use "Agent-Assisted" mode for the best balance of control.

#### 5. Links & Resources
- **Blog:** [developers.googleblog.com](https://developers.googleblog.com)
