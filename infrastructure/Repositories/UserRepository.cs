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

    public User Create(string fullName, string email, string? avatarUrl, bool admin = false)
    {
        const string sql = $@"
INSERT INTO users (full_name, email, avatar_url, admin)
VALUES (@fullName, @email, @avatarUrl, @admin)
RETURNING
    id as {nameof(User.Id)},
    full_name as {nameof(User.FullName)},
    email as {nameof(User.Email)},
    avatar_url as {nameof(User.AvatarUrl)},
    admin as {nameof(User.IsAdmin)}
    ;
";
        using var connection = _dataSource.OpenConnection();
        return connection.QueryFirst<User>(sql, new { fullName, email, avatarUrl, admin });
    }

    public User? GetById(int id)
    {
        const string sql = $@"
SELECT
    id as {nameof(User.Id)},
    full_name as {nameof(User.FullName)},
    email as {nameof(User.Email)},
    avatar_url as {nameof(User.AvatarUrl)},
    admin as {nameof(User.IsAdmin)}
FROM users
WHERE id = @id;
";
        using var connection = _dataSource.OpenConnection();
        return connection.QueryFirstOrDefault<User>(sql, new { id });
    }

    public IEnumerable<User> GetByIds(IEnumerable<int> ids)
    {
        const string sql = $@"
SELECT
    id as {nameof(User.Id)},
    full_name as {nameof(User.FullName)},
    email as {nameof(User.Email)},
    avatar_url as {nameof(User.AvatarUrl)},
    admin as {nameof(User.IsAdmin)}
FROM users
WHERE id IN @ids;
";
        using var connection = _dataSource.OpenConnection();
        return connection.Query<User>(sql, new { ids });
    }

    public IEnumerable<User> GetAll()
    {
        const string sql = $@"
SELECT
    id as {nameof(User.Id)},
    full_name as {nameof(User.FullName)},
    email as {nameof(User.Email)},
    avatar_url as {nameof(User.AvatarUrl)},
    admin as {nameof(User.IsAdmin)}
FROM users
";
        using var connection = _dataSource.OpenConnection();
        return connection.Query<User>(sql);
    }

    public int Count()
    {
        const string sql = $@"
SELECT count(*)
FROM users
";
        using var connection = _dataSource.OpenConnection();
        return connection.ExecuteScalar<int>(sql);
    }
}