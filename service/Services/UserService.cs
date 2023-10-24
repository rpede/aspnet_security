using System.Collections;
using infrastructure.DataModels;
using infrastructure.Repositories;
using service.Models.Command;
using service.Models.Query;

namespace service.Services;

public class UserService
{
    private readonly UserRepository _repository;

    public UserService(UserRepository repository)
    {
        _repository = repository;
    }

    public User Create(CreateUserCommandModel model)
    {
        return _repository.Create(
            fullName: model.FullName,
            email: model.Email,
            avatarUrl: model.AvatarUrl
        );
    }

    public User? GetById(int id)
    {
        return _repository.GetById(id);
    }
    
    public IEnumerable<User> GetByIds(IEnumerable<int> ids)
    {
        return _repository.GetByIds(ids);
    }

    public IEnumerable<User> GetAll()
    {
        return _repository.GetAll();
    }
    
    public int Count()
    {
        return _repository.Count();
    }

    public UserDetailQueryModel? GetDetails(int id)
    {
        var user = _repository.GetById(id);
        if (user == null) return null;

        return new UserDetailQueryModel
        {
            Id = user.Id,
            Email = user.Email,
            IsAdmin = user.IsAdmin,
            FullName = user.FullName,
            AvatarUrl = user.AvatarUrl,
        };
    }

    public IEnumerable<UserOverviewQueryModel> GetOverview()
    {
        return _repository.GetAll().Select(user => new UserOverviewQueryModel()
        {
            Id = user.Id,
            FullName = user.FullName,
            AvatarUrl = user.AvatarUrl,
        });
    }
}