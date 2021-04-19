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

- bring postgres docker container down

```
npm run db-down
```

- connect to postgres docker container with psql

```
npm run psql
```

- connect to postgres docker container with bash

```
npm run bash
```

Potentially relevant info from inside docker container:

```
$ uname -a
Linux 2d7adaef8235 4.19.121-linuxkit #1 SMP Thu Jan 21 15:36:34 UTC 2021 x86_64 GNU/Linux
```

```
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

```
$ cat /var/lib/postgresql/data/pg_hba.conf
# PostgreSQL Client Authentication Configuration File
# ===================================================
#
# Refer to the "Client Authentication" section in the PostgreSQL
# documentation for a complete description of this file.  A short
# synopsis follows.
#
# This file controls: which hosts are allowed to connect, how clients
# are authenticated, which PostgreSQL user names they can use, which
# databases they can access.  Records take one of these forms:
#
# local         DATABASE  USER  METHOD  [OPTIONS]
# host          DATABASE  USER  ADDRESS  METHOD  [OPTIONS]
# hostssl       DATABASE  USER  ADDRESS  METHOD  [OPTIONS]
# hostnossl     DATABASE  USER  ADDRESS  METHOD  [OPTIONS]
# hostgssenc    DATABASE  USER  ADDRESS  METHOD  [OPTIONS]
# hostnogssenc  DATABASE  USER  ADDRESS  METHOD  [OPTIONS]
#
# (The uppercase items must be replaced by actual values.)
#
# The first field is the connection type: "local" is a Unix-domain
# socket, "host" is either a plain or SSL-encrypted TCP/IP socket,
# "hostssl" is an SSL-encrypted TCP/IP socket, and "hostnossl" is a
# non-SSL TCP/IP socket.  Similarly, "hostgssenc" uses a
# GSSAPI-encrypted TCP/IP socket, while "hostnogssenc" uses a
# non-GSSAPI socket.
#
# DATABASE can be "all", "sameuser", "samerole", "replication", a
# database name, or a comma-separated list thereof. The "all"
# keyword does not match "replication". Access to replication
# must be enabled in a separate record (see example below).
#
# USER can be "all", a user name, a group name prefixed with "+", or a
# comma-separated list thereof.  In both the DATABASE and USER fields
# you can also write a file name prefixed with "@" to include names
# from a separate file.
#
# ADDRESS specifies the set of hosts the record matches.  It can be a
# host name, or it is made up of an IP address and a CIDR mask that is
# an integer (between 0 and 32 (IPv4) or 128 (IPv6) inclusive) that
# specifies the number of significant bits in the mask.  A host name
# that starts with a dot (.) matches a suffix of the actual host name.
# Alternatively, you can write an IP address and netmask in separate
# columns to specify the set of hosts.  Instead of a CIDR-address, you
# can write "samehost" to match any of the server's own IP addresses,
# or "samenet" to match any address in any subnet that the server is
# directly connected to.
#
# METHOD can be "trust", "reject", "md5", "password", "scram-sha-256",
# "gss", "sspi", "ident", "peer", "pam", "ldap", "radius" or "cert".
# Note that "password" sends passwords in clear text; "md5" or
# "scram-sha-256" are preferred since they send encrypted passwords.
#
# OPTIONS are a set of options for the authentication in the format
# NAME=VALUE.  The available options depend on the different
# authentication methods -- refer to the "Client Authentication"
# section in the documentation for a list of which options are
# available for which authentication methods.
#
# Database and user names containing spaces, commas, quotes and other
# special characters must be quoted.  Quoting one of the keywords
# "all", "sameuser", "samerole" or "replication" makes the name lose
# its special character, and just match a database or username with
# that name.
#
# This file is read on server startup and when the server receives a
# SIGHUP signal.  If you edit the file on a running system, you have to
# SIGHUP the server for the changes to take effect, run "pg_ctl reload",
# or execute "SELECT pg_reload_conf()".
#
# Put your actual configuration here
# ----------------------------------
#
# If you want to allow non-local connections, you need to add more
# "host" records.  In that case you will also need to make PostgreSQL
# listen on a non-local interface via the listen_addresses
# configuration parameter, or via the -i or -h command line switches.

# CAUTION: Configuring the system for local "trust" authentication
# allows any local user to connect as any PostgreSQL user, including
# the database superuser.  If you do not trust all your local users,
# use another authentication method.


# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     trust
# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
# IPv6 local connections:
host    all             all             ::1/128                 trust
# Allow replication connections from localhost, by a user with the
# replication privilege.
local   replication     all                                     trust
host    replication     all             127.0.0.1/32            trust
host    replication     all             ::1/128                 trust

# warning trust is enabled for all connections
# see https://www.postgresql.org/docs/12/auth-trust.html
host all all all trust
```