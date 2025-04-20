# IPNova

## What is it?

IPNova is an IPAM.
IPAM stands for IP Address Management, a type of application useful to manage an handful of networks with ease.
The key features about this software is the CRUD operations for the networks and ip addresses, and let you create
a pyramid of networks, each one with his own properties.

## Why use it?

The main reason to use an IPAM is for his quick access to all data. Hence its primary use is for diagnostic.
It aims to be an accessible software, fast to learn and easy to use.

## What do we use?

### Front-end
The application uses Qwik.js. This framework, developed by google, is notorious for its speed during page loading,
due to deleting the hydration step during a request. In simple terms, it doesn't load all the functions from the server-side,
but wait an input from a user or an event.
Qwik.js handles the front-end in a similar way to how react does. It uses component created using typescript and
let the programmers customize them completely.

### Back-end
A helpful feature we found useful, is the creation of server-side only functions which are created in the components you need.
Thanks to this, Qwik.js can be used as a full-stack framework, managing both the front-end and back-end.
It also provides an easy creation of routes, based on the folders' structure. 
If this isn't enough, it also provides the creation of endpoints and the implementation of middleware functions inside the components.

### Database
The project uses a RDBMS, which is Postgres. We chose to use a SQL database because of the strictness system of the networks.
The DB is run on a docker container. This is great for mobility, performance and low use of energy.
Here the E/R we are using now (it may change in the future): 
<a href="https://app.gleek.io/diagrams/yI5le9oWea5QbPatlvAIKg" target="_blank">
    <img src="https://sketchertest.blob.core.windows.net/previewimages/yI5le9oWea5QbPatlvAIKg.png" alt="ER Progetto" title="ER Progetto" />
</a>
<p>Created with <a href="https://gleek.io">Gleek.io diagram maker </a></p>

### Team Management
We also use Jira to manage sprints and increments in order to easily divide work through time.

# How to use it?

## Run the site
For running the application in development mode, use this command:
```shell
pnpm run dev
```

If you need it in production, use this instead:
```shell
pnpm run build
```

or for the previw
```shell
pnpm previw
```

## Run the DB
The postgres database runs inside a container using docker.
You need first to create the .env file with this structure:
```env
POSTGRES_HOST= <host ip> (or localhost)
POSTGRES_PORT=5432
POSTGRES_USER= <user>
POSTGRES_PASSWORD= <password>
POSTGRES_DB= <dbname>
```
Then you can create the container and run it with:
```shell
docker-compose up
```

# Credits
The site was made by Ricks and L0rexist
