# IPNova

## 🧐 What is it?

IPNova is a special kind of IPAM (IP Address Management) — a tool that helps manage multiple networks easily and efficiently.

The key features of this software include:

- 🔄 CRUD operations for networks and IP addresses

- 🏗️ Building a hierarchy (pyramid) of networks, each with its own properties

- 👨‍💼👩‍💼 Multiple access levels: Admin, Central Agency Technician, and Client

This IPAM is designed specifically for organizations managing clients’ sites and datacenters — with scalability and clarity in mind.

## 💡 Why use it?

The main reason to use an IPAM is its quick access to organized network data — which is crucial for diagnostics 🧠🔍.
IPNova is built to be:

- ⚡ Fast

- 🧭 Intuitive

- 📚 Easy to learn

## 🛠️ What do we use?

### 🖼️ Front-end

We use Qwik.js, a lightning-fast ⚡ framework by Google.
It boosts performance by skipping hydration and only loads functions when needed — meaning super-fast page loads 🚀.

It’s similar to React in structure, using TypeScript-based components you can fully customize 🧩.

For the design we used Figma and later developed with Tailwindcss 🎨.
Here the mockup link: https://www.figma.com/proto/140HyfKtxB1QSIJjT4UIlm

### 🔙 Back-end

Qwik.js also supports server-side functions directly inside components, making it an all-in-one full-stack framework.

Perks:

- 🧬 Route creation based on folder structure

- 🌐 Built-in support for API endpoints

- 🧱 Middleware inside components

### 🗄️ Database

We use PostgreSQL, a robust SQL-based RDBMS — perfect for the strict structure of networks.
It runs in a Docker container 🐳 for easy deployment and efficiency.

Check out our current E/R diagram (may change in the future):
<a href="https://app.gleek.io/diagrams/yI5le9oWea5QbPatlvAIKg" target="_blank"> <img src="https://sketchertest.blob.core.windows.net/previewimages/yI5le9oWea5QbPatlvAIKg.png" alt="ER Progetto" title="ER Progetto" /> </a>
Made with Gleek.io
🤝 Team Management

We're a small but mighty team of two 💪👨‍💻 working on this project.

We manage tasks using Jira 🗂️ — an Atlassian tool that supports AGILE methodologies:

- ⏱️ Sprint-based task planning

- 🎫 Tickets for modular work

- 👥 Clear communication between devs and the commissioner

## 🚀 How to start it?

Let’s get this app running!

### 🌍 Run the site

Clone the repo:

```shell
git clone https://github.com/IPAM-website/ipam.git
```

Install dependencies:

```shell
pnpm i
```

Start development mode:

```shell
pnpm dev
```

Preview production mode:

```shell
pnpm preview
```

Build the static site:

```shell
pnpm build
```

The output will be in the dist/ folder 📁.

### 🐘 Run the DB

We use Postgres inside a Docker container.

> 🔧 Install Docker Desktop (Windows) or dockerd (Linux) beforehand!

Create a .env file in your project root:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_db_name
```

Start the DB container:

```shell
docker-compose up
```

If you get an error about a missing image, install it manually:

```shell
docker pull postgres:17-alpine
```

## 🙌 Credits

Made with 💙 by Ricks & L0rexist

## Static Site Generator (Node.js)

```shell
pnpm build.server
```

## Static Site Generator (Node.js)

```shell
pnpm build.server
```

## Static Site Generator (Node.js)

```shell
pnpm build.server
```

## Express Server

This app has a minimal [Express server](https://expressjs.com/) implementation. After running a full build, you can preview the build using the command:

```
pnpm serve
```

Then visit [http://localhost:8080/](http://localhost:8080/)

# Qwik City App ⚡️

- [Qwik Docs](https://qwik.dev/)
- [Discord](https://qwik.dev/chat)
- [Qwik GitHub](https://github.com/QwikDev/qwik)
- [@QwikDev](https://twitter.com/QwikDev)
- [Vite](https://vitejs.dev/)

---

## Project Structure

This project is using Qwik with [QwikCity](https://qwik.dev/qwikcity/overview/). QwikCity is just an extra set of tools on top of Qwik to make it easier to build a full site, including directory-based routing, layouts, and more.

Inside your project, you'll see the following directory structure:

```
├── public/
│   └── ...
└── src/
    ├── components/
    │   └── ...
    └── routes/
        └── ...
```

- `src/routes`: Provides the directory-based routing, which can include a hierarchy of `layout.tsx` layout files, and an `index.tsx` file as the page. Additionally, `index.ts` files are endpoints. Please see the [routing docs](https://qwik.dev/qwikcity/routing/overview/) for more info.

- `src/components`: Recommended directory for components.

- `public`: Any static assets, like images, can be placed in the public directory. Please see the [Vite public directory](https://vitejs.dev/guide/assets.html#the-public-directory) for more info.

## Add Integrations and deployment

Use the `pnpm qwik add` command to add additional integrations. Some examples of integrations includes: Cloudflare, Netlify or Express Server, and the [Static Site Generator (SSG)](https://qwik.dev/qwikcity/guides/static-site-generation/).

```shell
pnpm qwik add # or `pnpm qwik add`
```

## Development

Development mode uses [Vite's development server](https://vitejs.dev/). The `dev` command will server-side render (SSR) the output during development.

```shell
npm start # or `pnpm start`
```

> Note: during dev mode, Vite may request a significant number of `.js` files. This does not represent a Qwik production build.

## Preview

The preview command will create a production build of the client modules, a production build of `src/entry.preview.tsx`, and run a local server. The preview server is only for convenience to preview a production build locally and should not be used as a production server.

```shell
pnpm preview # or `pnpm preview`
```

## Production

The production build will generate client and server modules by running both client and server build commands. The build command will use Typescript to run a type check on the source code.

```shell
pnpm build # or `pnpm build`
```

## Express Server

This app has a minimal [Express server](https://expressjs.com/) implementation. After running a full build, you can preview the build using the command:

```
pnpm serve
```

Then visit [http://localhost:8080/](http://localhost:8080/)
