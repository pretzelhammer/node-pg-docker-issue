# node pg docker issue

## Repro steps

Note: Host machine is running macOS Catalina v10.15.7

1) Have docker installed.
2) Have nvm (node version manager) installed.

3) Switch to correct node version (v14.8.0)

```
nvm use
```

4) Install deps (just pg)

```
npm ci
```

5) Start postgres docker container

Relevant: [Postgres Docker Image Docs](https://hub.docker.com/_/postgres)

```bash
npm run db-up

# the above command runs:
# docker run --rm --name node-pg-postgres -e POSTGRES_HOST_AUTH_METHOD=trust -p 5432:5432 -d postgres
```

6) Attempt to connect to the postgres db inside the docker container

```
npm start
```

Fails with:

```
> pg-docker-issue@1.0.0 start /Users/kirill/github/node-pg-docker-issue
> node index.js

error: password authentication failed for user "postgres"
    at Parser.parseErrorMessage (/Users/kirill/github/node-pg-docker-issue/node_modules/pg-protocol/dist/parser.js:287:98)
    at Parser.handlePacket (/Users/kirill/github/node-pg-docker-issue/node_modules/pg-protocol/dist/parser.js:126:29)
    at Parser.parse (/Users/kirill/github/node-pg-docker-issue/node_modules/pg-protocol/dist/parser.js:39:38)
    at Socket.<anonymous> (/Users/kirill/github/node-pg-docker-issue/node_modules/pg-protocol/dist/index.js:11:42)
    at Socket.emit (events.js:314:20)
    at addChunk (_stream_readable.js:303:12)
    at readableAddChunk (_stream_readable.js:279:9)
    at Socket.Readable.push (_stream_readable.js:218:10)
    at TCP.onStreamRead (internal/stream_base_commons.js:188:23) {
  length: 104,
  severity: 'FATAL',
  code: '28P01',
  detail: undefined,
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'auth.c',
  line: '337',
  routine: 'auth_failed'
} undefined
```

Which doesn't make any sense because `POSTGRES_HOST_AUTH_METHOD=trust` was set so postgres should accept all incoming connections without requiring a password. I have verified that it does so by connecting to it with [Postico](https://eggerapps.at/postico/) (GUI client) without any password and without issue. The following Rust libraries: [r2d2](https://github.com/sfackler/r2d2) and [sqlx](https://github.com/launchbadge/sqlx), also connected to the postgres docker container without any password and without any issues. Only [node](https://nodejs.org/en/) + [node-postgres](https://github.com/brianc/node-postgres) are not working using this setup and connection string and I don't understand why.



### Other potentially useful commands

1) bring postgres docker container down

```
npm run db-down
```

2) connect to postgres docker container with psql

```
npm run psql
```

3) connect to postgres docker container with bash

```
npm run bash
```

Potentially relevant info:

```
$ uname -a
Linux 2d7adaef8235 4.19.121-linuxkit #1 SMP Thu Jan 21 15:36:34 UTC 2021 x86_64 GNU/Linux

$ cat /etc/os-release
PRETTY_NAME="Debian GNU/Linux 10 (buster)"
NAME="Debian GNU/Linux"
VERSION_ID="10"
VERSION="10 (buster)"
VERSION_CODENAME=buster
ID=debian
HOME_URL="https://www.debian.org/"
SUPPORT_URL="https://www.debian.org/support"
BUG_REPORT_URL="https://bugs.debian.org/"
```