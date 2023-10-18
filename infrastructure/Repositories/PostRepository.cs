using System.Collections;
using Dapper;
using infrastructure.DataModels;

namespace infrastructure.Repositories;

public class PostRepository
{
    private readonly SQLiteDataSource _dataSource;

    public PostRepository(SQLiteDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public Post Create(int authorId, string title, string content)
    {
        const string sql = $@"
INSERT INTO posts (author_id, title, content)
VALUES (@authorId, @title, @content)
RETURNING 
    id as {nameof(Post.Id)},
    author_id as {nameof(Post.AuthorId)},
    title as {nameof(Post.Title)},
    content as {nameof(Post.Content)}
";
        using var connection = _dataSource.OpenConnection();
        return connection.QueryFirst<Post>(sql, new { authorId, title, content });
    }

    public Post? GetById(int id)
    {
        const string sql = $@"
SELECT 
    id as {nameof(Post.Id)},
    author_id as {nameof(Post.AuthorId)},
    title as {nameof(Post.Title)},
    content as {nameof(Post.Content)}
FROM posts
WHERE id = @id;
";
        using var connection = _dataSource.OpenConnection();
        return connection.QueryFirstOrDefault<Post>(sql, new { id });
    }

    public IEnumerable<Post> GetByIds(int ids)
    {
        const string sql = $@"
SELECT 
    id as {nameof(Post.Id)},
    author_id as {nameof(Post.AuthorId)},
    title as {nameof(Post.Title)},
    content as {nameof(Post.Content)}
FROM posts
WHERE id IN @id;
";
        using var connection = _dataSource.OpenConnection();
        return connection.Query<Post>(sql, new { ids });
    }

    public IEnumerable<Post> GetByAuthor(int authorId)
    {
        const string sql = $@"
SELECT 
    id as {nameof(Post.Id)},
    author_id as {nameof(Post.AuthorId)},
    title as {nameof(Post.Title)},
    content as {nameof(Post.Content)}
FROM posts
WHERE author_id = @authorId;
";
        using var connection = _dataSource.OpenConnection();
        return connection.Query<Post>(sql, new { authorId });
    }

    public int CountByAuthor(int authorId)
    {
        const string sql = $@"
SELECT count(*)
FROM posts
WHERE author_id = @authorId;
";
        using var connection = _dataSource.OpenConnection();
        return connection.ExecuteScalar<int>(sql, new { authorId });
    }

    public IEnumerable<Post> GetAll()
    {
        const string sql = $@"
SELECT 
    id as {nameof(Post.Id)},
    author_id as {nameof(Post.AuthorId)},
    title as {nameof(Post.Title)},
    content as {nameof(Post.Content)}
FROM posts
";
        using var connection = _dataSource.OpenConnection();
        return connection.Query<Post>(sql);
    }

    public int Count()
    {
        const string sql = $@"
SELECT count(*)
FROM posts
";
        using var connection = _dataSource.OpenConnection();
        return connection.ExecuteScalar<int>(sql);
    }
}