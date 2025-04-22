# IPNova
## 🧐 What is it?

IPNova is a special kind of IPAM (IP Address Management) — a tool that helps manage multiple networks easily and efficiently.

The key features of this software include:

+ 🔄 CRUD operations for networks and IP addresses

+ 🏗️ Building a hierarchy (pyramid) of networks, each with its own properties

+ 👨‍💼👩‍💼 Multiple access levels: Admin, Central Agency Technician, and Client

This IPAM is designed specifically for organizations managing clients’ sites and datacenters — with scalability and clarity in mind.

## 💡 Why use it?

The main reason to use an IPAM is its quick access to organized network data — which is crucial for diagnostics 🧠🔍.
IPNova is built to be:

+ ⚡ Fast

+ 🧭 Intuitive

+ 📚 Easy to learn

## 🛠️ What do we use?

### 🖼️ Front-end

We use Qwik.js, a lightning-fast ⚡ framework by Google.
It boosts performance by skipping hydration and only loads functions when needed — meaning super-fast page loads 🚀.

It’s similar to React in structure, using TypeScript-based components you can fully customize 🧩.

For the design we used Figma 🎨.
Here the mockup link: https://www.figma.com/proto/140HyfKtxB1QSIJjT4UIlm

### 🔙 Back-end

Qwik.js also supports server-side functions directly inside components, making it an all-in-one full-stack framework 🧰.

Perks:

+ 🧬 Route creation based on folder structure

+ 🌐 Built-in support for API endpoints

+ 🧱 Middleware inside components

### 🗄️ Database

We use PostgreSQL (🦖), a robust SQL-based RDBMS — perfect for the strict structure of networks.
It runs in a Docker container 🐳 for easy deployment and efficiency.

Check out our current E/R diagram (may change in the future):
<a href="https://app.gleek.io/diagrams/yI5le9oWea5QbPatlvAIKg" target="_blank"> <img src="https://sketchertest.blob.core.windows.net/previewimages/yI5le9oWea5QbPatlvAIKg.png" alt="ER Progetto" title="ER Progetto" /> </a>
Made with Gleek.io 🧩
🤝 Team Management

We're a small but mighty team of two 💪👨‍💻 working on this project.

We manage tasks using Jira 🗂️ — an Atlassian tool that supports AGILE methodologies:

+ ⏱️ Sprint-based task planning

+ 🎫 Tickets for modular work

+ 👥 Clear communication between devs and the commissioner

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
pnpm run dev
```
Preview production mode:
```shell
pnpm run preview
```
Build the static site:
```shell
pnpm run build
```
The output will be in the dist/ folder 📁.

### 🐘 Run the DB

We use Postgres inside a Docker container.
>🔧 Install Docker Desktop (Windows) or dockerd (Linux) beforehand!

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
