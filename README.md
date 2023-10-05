# ASP.NET Security

Starter solution for demonstrating web security concepts in ASP.NET.

Based on https://github.com/uldahlalex/programming_2_video_5

## Quick Setup

```shell
cd frontend
npm install
npm run build
npm start
```

## Database

The system uses a SQLite database instead of PostgreSQL.
Simply because it makes the setup a bit easier, since the database is just a file.
No server or service needed!

**Note** SQLite was chosen for convince. You shouldn't use it for real-world web
*applications (in most cases).

There are two tables one for users and one for password hashes.

Many applications store hash and salt directly in user table.
It is also not that uncommon for applications to accidentally leak password hashes.
I decided to put the hashes in another table to prevent leaking by accident.
Just **never-ever** return [PasswordHash](infrastructure/DataModels/PasswordHash.cs) from a controller.

The schema can be generated from [generatetable.sql](generatetable.sql).
You can connect to the database from either DataGrip or Rider.
Set SQLite as datasource and set the file path to `database.sqlite`

First time you use SQLite, it will need to download a driver.
There is a button to do it automatically in the UI.

## Exercises

Complete the exercises below.

- [Security Headers](security_headers.md)
- [Authentication](authentication.md)

From here you can either implement authentication in your mini-project or
complete the challenges.

No matter what you choose, you **must** at least read the challenges.

- [Challenges](authentication_challenges.md)
