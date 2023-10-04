using Dapper;
using infrastructure.DataModels;

namespace infrastructure.Repositories;

public class UserRepository
{
    private readonly SQLiteDataSource _dataSource;

    public UserRepository(SQLiteDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public User Create(string fullName, string email, string? avatarUrl)
    {
        const string sql = $@"
INSERT INTO users (full_name, email, avatar_url)
VALUES (@fullName, @email, @avatarUrl)
RETURNING
    id as {nameof(User.Id)},
    full_name as {nameof(User.FullName)},
    email as {nameof(User.Email)},
    avatar_url as {nameof(User.AvatarUrl)};
";
        using var connection = _dataSource.OpenConnection();
        return connection.QueryFirst<User>(sql, new { fullName, email, avatarUrl });
    }

    public User? GetById(int id)
    {
        const string sql = $@"
SELECT
    id as {nameof(User.Id)},
    full_name as {nameof(User.FullName)},
    email as {nameof(User.Email)},
    avatar_url as {nameof(User.AvatarUrl)}
FROM users
WHERE id = @id;
";
        using var connection = _dataSource.OpenConnection();
        return connection.QueryFirstOrDefault<User>(sql, new { id });
    }

    public IEnumerable<User> GetAll()
    {
        const string sql = $@"
SELECT
    id as {nameof(User.Id)},
    full_name as {nameof(User.FullName)},
    email as {nameof(User.Email)},
    avatar_url as {nameof(User.AvatarUrl)}
FROM users
";
        using var connection = _dataSource.OpenConnection();
        return connection.Query<User>(sql);
    }
}