# Garden of Tasks

# Vite + React

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc/README.md) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top level `parserOptions` in your ESLint config file like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and [eslint-plugin-react-hooks](https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks) and [eslint-plugin-react-refresh](https://github.com/ArnaudBarre/eslint-plugin-react-refresh)

## Deployment to Vercel

To deploy this project to Vercel:

1. Push your code to a Git repository (e.g., GitHub).
2. Connect your repository to Vercel.
3. Vercel will automatically detect the Vite configuration and build the project using `npm run build`.
4. The built files in the `dist` directory will be deployed.

No additional configuration is needed for basic Vite projects on Vercel.

---

## Troubleshooting: "Can't reach the server" (login / sign up)

That message means the **frontend cannot reach the backend API**. The app expects the API at **http://localhost:8000** unless you set `VITE_API_URL` in `frontend/.env`.

### Fix: run the backend

1. **Start the API** (from the project root):
   ```bash
   cd api
   pip install -r requirements.txt
   uvicorn index:app --reload --host 0.0.0.0 --port 8000
   ```
   Leave this terminal open. You should see something like `Uvicorn running on http://0.0.0.0:8000`.

2. **Database**: The API uses PostgreSQL. Set one of these env vars (in `api/.env` or your shell) before starting uvicorn:
   - `POSTGRES_URL` or `DATABASE_URL` — connection string, e.g. `postgresql://user:pass@localhost:5432/dbname`

3. **Frontend**: Run the app as usual (`npm run dev`). It will call `http://localhost:8000` for login/register. If your API runs on another port or host, create `frontend/.env` with:
   ```env
   VITE_API_URL=http://localhost:YOUR_PORT
   ```
   Then restart `npm run dev`.

4. **CORS**: The API allows `http://localhost:5173`. If your frontend runs on a different port, the backend must list it in `allow_origins` in `api/index.py`.