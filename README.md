This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database (Prisma + Docker)

Postgres runs in Docker; the app and Prisma CLI run natively on your machine and connect to it over the exposed port.

**Setup:**

1. Copy `.env.sample` to `.env` and adjust `DATABASE_URL` if needed (e.g. if the default port conflicts with another Postgres instance on your machine).
2. Start the database: `docker compose up -d`
3. Apply migrations: `npx prisma migrate dev`

**Day-to-day flow:**

1. Edit `prisma/schema.prisma` with your model changes.
2. Run `npx prisma migrate dev --name <short-description>` — this diffs your schema against migration history, generates SQL, applies it to the running container, and regenerates the Prisma Client (`app/generated/prisma`).
3. Commit the new folder under `prisma/migrations/` along with the schema change — migrations are part of source history, not disposable.
4. Teammates/other machines run `npx prisma migrate dev` (or `migrate deploy` in CI/prod) after pulling, to apply any migrations they don't have yet.

`docker compose up -d` only needs to be rerun if the container was stopped — it keeps running in the background otherwise.

> If `prisma migrate dev` reports authentication errors even though `docker-compose.yml` credentials look right, check whether another Postgres process (a native Windows/Mac install, another project's container) already owns the host port — `docker ps` can report a container as healthy while the OS still routes `localhost` traffic to a different server on that same port.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
