# Duitflow

React/Vite client and Express API backed by PostgreSQL. The API creates the
`users`, `user_wallets`, `transactions`, and `goals` tables at startup when they
do not exist.

## Aiven PostgreSQL

1. Rotate any password shared in a screenshot, then copy `.env.example` to
   `.env` and set `DATABASE_URL` using the new Aiven credentials. Keep `.env`
   out of Git.
2. For stronger certificate verification, copy Aiven's CA certificate into
   `DB_CA_CERT`. Without it, connections still use TLS encryption but do not
   verify the database certificate.
3. For Vercel, add `DATABASE_URL` (and optionally `DB_CA_CERT`) in the project's
   Environment Variables for each environment where the API runs. The `/api`
   function initializes the schema automatically.
4. Deploy the repository connected to GitHub.

The existing `database_dump.sql` is a MySQL dump. Its user, wallet, transaction,
and goal rows have been imported into the connected Aiven database. To migrate
the dump again to a fresh database, run `npm run migrate:legacy` after setting
`DATABASE_URL`.

## Development

Run `npm install`, then `npm run dev` for the frontend. Start the API with
`node backend/server.js` in another terminal. Set `VITE_API_URL` if the API is
not available at `http://<host>:5000/api`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
