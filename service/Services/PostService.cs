using infrastructure.DataModels;
using infrastructure.Repositories;
using service.Models.Command;

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
}