# IPAM

## What is it?

IP Address Manager is a application useful to add, update or remove IP Addresses from a local DB.

## What do we use?

### Front-end and server-side
The application uses the Qwik.js framework that permits the creation of the front-end of the web-app.
It can also create middleware functions and API.

### Database
The database we use is POSTGRES.
Here the initial E/R (still in work in progress): https://app.gleek.io/diagrams/CeCUNLWItc0CkFVN6vzQXQ

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
