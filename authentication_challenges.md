# Authentication Challenges

The challenges can be completed independently of each other.

You must at minimum have read and understood all the challenges.

## Challenge 1

We cannot have multiple users with the same email address.

Catch `Microsoft.Data.Sqlite.SqliteException` and check if exception message
contains "UNIQUE constraint failed: users.email", so an appropriate message can
be displayed to the user.

In what layer would you catch SQL exceptions?

## Challenge 2

Lets pretend you are taking over the development of software project from
someone else.
The project is using a very insecure hashing algorithm (MD5) and no salt 😱.

As the responsible developer you are - you determine that the right thing to do,
is to upgrade users to a secure hashing algorithm.

### Preparation

Before you can complete the challenge, we need have code to verify hashes using
the insecure MD5 algorithm.  Add this to a new file in **service**
folder/project.

```csharp
namespace service;

// Never actually do this in your applications.
public class InsecurePasswordHashAlgorithm : PasswordHashAlgorithm
{
    public const string Name = "md5";
    public override string GetName() => Name;

    // It doesn't even use a salt 😱
    public string GenerateSalt() => string.Empty;

    public override string HashPassword(string password, string ignored)
    {
        using var md5 = MD5.Create();
        var hash = md5.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(hash).ToLower();
    }

    public override bool VerifyHashedPassword(string password, string hash, string ignored)
    {
        return HashPassword(password, ignored).SequenceEqual(hash);
    }
}
```

Change `Create()` in [PasswordHashAlgorithm](service/PasswordHashAlgorithm.cs) to:

```csharp
public static PasswordHashAlgorithm Create(string algorithmName = PreferredAlgorithmName)
{
    switch (algorithmName)
    {
        case Argon2idPasswordHashAlgorithm.Name:
            return new Argon2idPasswordHashAlgorithm();
        case InsecurePasswordHashAlgorithm.Name: // <--- add this
            return new InsecurePasswordHashAlgorithm(); // <--- and this
        default:
            throw new NotImplementedException();
    }
}
```


Next need a couple of users with passwords hashed using MD5, so we have
something to test with.  Execute the following SQL to insert MD5 hashes for
users in `generatetable.sql`:

```sql
INSERT INTO password_hash (user_id, hash, salt, algorithm) VALUES ((SELECT id FROM users WHERE email = 'mde0@salon.com'), 'd00375a8ca01f1a5f3a34fdc9af24038', '', 'md5');
INSERT INTO password_hash (user_id, hash, salt, algorithm) VALUES ((SELECT id FROM users WHERE email = 'dlysaght1@shareasale.com'), '5a6f2451492daae2f67ce475751d721c', '', 'md5');
INSERT INTO password_hash (user_id, hash, salt, algorithm) VALUES ((SELECT id FROM users WHERE email = 'jburris2@illinois.edu'), 'ffe8a299c0d0c2191cd3b70998c12e05', '', 'md5');
INSERT INTO password_hash (user_id, hash, salt, algorithm) VALUES ((SELECT id FROM users WHERE email = 'zmacaughtrie3@blogger.com'), 'f9930310b98c489038e2f9a48efdd102', '', 'md5');
INSERT INTO password_hash (user_id, hash, salt, algorithm) VALUES ((SELECT id FROM users WHERE email = 'awoodley4@reddit.com'), 'ac2fcaa09d8b033ad11965a276d5e587', '', 'md5');
```

Hashes are just an MD5 of the email.

**Note:** never use your email address as password, or you will cause death to
thousands of kittens.

### Goal

We can not just convert the existing hash to a different algorithm.

So the system will need to:

1. Wait for the user to authenticate (re-enter their password).
2. Verify the password against the insecure hash algorithm (MD5). If successful:
   1) Compute a new hash using our secure algorithm (argon2id).
   2) Update `password_hash`, `salt` and `hash_algorithm` in the database with the new values.

In other words: Replace the logic in
[AccountService.Authenticate()](service/AccountService.cs). Such that it
computes and stores a new argon2id hash and updates the user - only after
verifying the old hash.

## Challenge 3

Passwords in our application are well protected against potential data breaches.

However an attack could also be; that someone tries to bruteforce their way in
by spamming the login endpoint with different credentials.

Because we use a strong password hashing, such an attack would be really slow to execute.
However it will also consume a lot server resources.

A good solution would be setting a threshold for how many attempts can be made
for an email address within X-minutes (also known as throttling).

Reflect over the following:

- What database changes would you make to store login attempts?
- What time-frame would you use (X-minutes)?
- How many attempts would you allow within the time-frame?

Implement throttling of login attempts.

## Challenge 4

The keen observer might notice that our system doesn't use any pepper.

Remember pepper is an extra random value added to the password hash function.
It can be the same for all users in the system, but is stored outside
the database.

Change **Argon2idPasswordHashAlgorithm** to use a pepper stored in an environment variable (envvar).

**Hint** you can use `Environment.GetEnvironmentVariable` method to read a envvars.