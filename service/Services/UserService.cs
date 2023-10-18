using infrastructure.Repositories;
using service.Models.Command;
using service.Models.Query;

namespace service.Services;

public class UserService
{
    private readonly UserRepository _userRepository;

    public UserService(UserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public UserOverviewQueryModel Create(CreateUserCommandModel model)
    {
        var user = _userRepository.Create(
            fullName: model.FullName,
            email: model.Email,
            avatarUrl: model.AvatarUrl
        );
        return new UserOverviewQueryModel()
        {
            Id = user.Id,
            FullName = user.FullName,
            AvatarUrl = user.AvatarUrl,
        };
    }

    public UserDetailQueryModel? GetDetails(int id)
    {
        var user = _userRepository.GetById(id);
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
        return _userRepository.GetAll().Select(user => new UserOverviewQueryModel()
        {
            Id = user.Id,
            FullName = user.FullName,
            AvatarUrl = user.AvatarUrl,
        });
    }
}