# Linting and Code Style Guide

This document outlines the setup for linting and code formatting in the Investify project. Adhering to these standards is mandatory to ensure code quality, readability, and consistency.

## 1. Tools

- **[ESLint](https://eslint.org/)**: A pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript and TypeScript. It helps us catch errors and enforce best practices.
- **[Prettier](https://prettier.io/)**: An opinionated code formatter that enforces a consistent code style across the entire codebase.

ESLint is configured for code quality and best practices, while Prettier is responsible for all formatting rules (line length, indentation, quotes, etc.).

## 2. Configuration Files

- **`eslint.config.mjs`**: The main configuration file for ESLint. It specifies the rules, plugins (e.g., for React, Next.js, TypeScript), and environments.
- **`.prettierrc.json`**: The configuration file for Prettier. Our rules are defined here.
- **`.gitignore`**: This file is used by both Git and Prettier to identify which files and directories should be ignored.

## 3. How to Run

You can run the linter and formatter manually from the command line. It's also highly recommended to set up your code editor to format on save.

### Checking for Lint Errors

To check the entire project for any ESLint errors or warnings, run:

```bash
npm run lint
```

This command should be run before committing code to ensure you haven't introduced any issues.

### Automatic Formatting

To automatically format all files in the project according to the Prettier rules, run:

```bash
npm run format
```

This is useful for fixing all formatting issues across the codebase at once.

## 4. Editor Integration (Recommended)

For the best developer experience, configure your editor to integrate with ESLint and Prettier.

### VS Code Setup

1.  **Install Extensions**:
    - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
    - [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

2.  **Configure Format on Save**: Open your VS Code `settings.json` file and add the following lines. This will automatically format your files with Prettier every time you save.

    ```json
    {
      // ... your other settings
      "editor.formatOnSave": true,
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    }
    ```

## 5. Key Linting Rules

While Prettier handles all formatting, our ESLint setup focuses on code quality. Some key principles enforced are:

- **No `any`**: The use of the `any` type is strictly discouraged. Always provide a specific type or use `unknown`.
- **React Hooks**: Rules of hooks (e.g., `react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`) are enforced to prevent common bugs.
- **Accessibility**: The `jsx-a11y` plugin is used to enforce accessibility best practices in your JSX.
- **Imports**: Import order is automatically sorted to keep files clean and consistent.

If you encounter an ESLint error, read the message carefully. It will almost always provide a clear explanation of the problem and often a suggestion for a fix.
