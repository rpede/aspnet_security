# ASP.NET Security

## Backstory

The startup "Z" hopes to be the next big thing in social media.

Before they release their micro-blogging platform to the broader public,
the CEO has requested to quickly run a bunch experiments with various UI ideas,
to see which increases user retention most on their carefully selected
beta-testers.

As the sole backend engineer - it is your job to develop an API that can support
whatever crazy ideas the army of UX designers employed can come up with.

All in the shimmer of hope that the company will become successful.
So you can get rich from the equity you get paid instead of an actual monthly
paycheck.

You must hurry, as the money from the last seed funding round has almost burned
up.

*#silicon-valley #start-up*

## Project/solution

The project is based authentication + authorization with JWT.
But with a `followers` and a `posts` table added to make it more interesting.

Repositories only handles a single entity each (no-joins).
And query models are moved to the service layer.
Just so we don't have to rewrite any queries.

There are to flavours of query models.
**OverviewModel** is supposed to be used on pages where many of the same entity is shown.
**DetailModel** is supposed to be used on pages that focus on a single instance of the entity.

## What to do

You job is to replace the REST API with GraphQL API.
Based on the guide provided below.

## New exercises

Challenges have to be completed in order this time.

- [GraphQL](graphql.md)

## Previous exercises

- [Security Headers](security_headers.md)
- [Authentication](authentication.md)
- [Authentication Challenges](authentication_challenges.md)
- [Session management](session_management.md)
- [Cookie Session](cookie_session.md)
- [Header JWT](header_jwt.md)