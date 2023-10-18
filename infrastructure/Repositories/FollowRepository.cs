using Dapper;
using infrastructure.DataModels;

namespace infrastructure.Repositories;

public class FollowRepository
{
    private readonly SQLiteDataSource _dataSource;

    public FollowRepository(SQLiteDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public bool Create(int followerId, int followingId)
    {
        const string sql = $@"
INSERT INTO followers (follower_id, following_id)
VALUES (@followerId, @followingId)
";
        using var connection = _dataSource.OpenConnection();
        return connection.Execute(sql, new { followerId, followingId }) != 0;
    }

    public bool Exists(int followerId, int followingId)
    {
        const string sql = $@"
SELECT count(*)
FROM followers
WHERE follower_id = @followerId AND following_id = @followingId
";
        using var connection = _dataSource.OpenConnection();
        return connection.ExecuteScalar<int>(sql, new { followerId, followingId }) != 0;
    }

    public IEnumerable<User> GetFollowers(int id)
    {
        const string sql = $@"
SELECT
    id as {nameof(User.Id)},
    full_name as {nameof(User.FullName)},
    email as {nameof(User.Email)},
    avatar_url as {nameof(User.AvatarUrl)},
    admin as {nameof(User.IsAdmin)}
FROM users
JOIN followers ON users.id = followers.follower_id
WHERE following_id = @id
";
        using var connection = _dataSource.OpenConnection();
        return connection.Query<User>(sql, new { id });
    }

    public int CountFollowers(int id)
    {
        const string sql = $@"
SELECT count(*)
FROM followers
WHERE following_id = @id
";
        using var connection = _dataSource.OpenConnection();
        return connection.ExecuteScalar<int>(sql, new { id });
    }

    public IEnumerable<User> GetFollowing(int id)
    {
        const string sql = $@"
SELECT
    id as {nameof(User.Id)},
    full_name as {nameof(User.FullName)},
    email as {nameof(User.Email)},
    avatar_url as {nameof(User.AvatarUrl)},
    admin as {nameof(User.IsAdmin)}
FROM users
JOIN followers ON users.id = followers.following_id
WHERE follower_id = @id
";
        using var connection = _dataSource.OpenConnection();
        return connection.Query<User>(sql, new { id });
    }

    public int CountFollowing(int id)
    {
        const string sql = $@"
SELECT count(*)
FROM followers
WHERE follower_id = @id
";
        using var connection = _dataSource.OpenConnection();
        return connection.ExecuteScalar<int>(sql, new { id });
    }
}