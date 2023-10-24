using infrastructure.DataModels;
using infrastructure.Repositories;
using service.Models.Command;
using service.Models.Query;

namespace service.Services;

public class PostService
{
    private readonly PostRepository _repository;

    public PostService(PostRepository repository)
    {
        _repository = repository;
    }

    public Post Create(CreatePostCommandModel model)
    {
        return _repository.Create(authorId: model.AuthorId, title: model.Title, content: model.Content);
    }

    public Post? GetById(int id)
    {
        return _repository.GetById(id);
    }

    public IEnumerable<Post> GetByAuthor(int authorId)
    {
        return _repository.GetByAuthor(authorId);
    }

    public int CountByAuthor(int authorId)
    {
        return _repository.CountByAuthor(authorId);
    }

    public IEnumerable<Post> GetAll()
    {
        return _repository.GetAll();
    }

    public int Count()
    {
        return _repository.Count();
    }
    
    public PostDetailQueryModel? GetDetails(int id)
    {
        var post = _repository.GetById(id);
        if (post == null) return null;

        return new PostDetailQueryModel()
        {
            Id = post.Id,
            AuthorId = post.AuthorId,
            Title = post.Title,
            Content = post.Content
        };
    }

    public IEnumerable<PostOverviewQueryModel> GetOverview()
    {
        return _repository.GetAll().Select(post => new PostOverviewQueryModel()
        {
            Id = post.Id,
            AuthorId = post.AuthorId,
            Title = post.Title,
            
        });
    }
}