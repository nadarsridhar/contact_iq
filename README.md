# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react';

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
});
```

## Privileges

pushNot: 0, // 0 or 1
webrtc: 1, // 0 or 1 (enabled), 2 (click to call), 4 (dialpad), 8 (bargin)
numVis: 0, // 0 or 1
rec: 0, // 0 or 1 (play), 2 (download)
clients: 0, // 0 or 1, 2, 4, 8 (RCUD)
users: 0, // 0 or 1, 2, 4, 8 (RCUD)
branch: 0, // 0 or 1, 2, 4, 8 (RCUD)
tempMap: 0, // 0 or 1
priv: 0, // 0 or 1
expImp: 0, // 0 or 1 (user), 2 (client), 4 (calls), 8 (recordings), 16 (call traffic)
callQue: 0, // 0 or 1
filters: 0, // 0 or 1 (search), 2 (date), 4 (status), 8 (tags), 16 (branch), 32 (users)
stats: 0, // 0 or 1 (5 stats), 2 (channels)
remarks: 0, // 0 or 1
reports: 0, // 0 or 1 (call traffic)
pass: 0, // 0 or 1 (change password), 2 (reset password)
