using infrastructure.Repositories;
using service.Models.Command;
using service.Models.Query;

namespace service.Services;

public class FollowService
{
    private readonly FollowRepository _repository;

    public FollowService(FollowRepository repository)
    {
        _repository = repository;
    }

    public bool Follow(FollowRequestCommandModel model)
    {
        if (_repository.Exists(followerId: model.OwnUserId, followingId: model.OtherUserId)) return false;
        return _repository.Create(followerId: model.OwnUserId, followingId: model.OtherUserId);
    }

    public IEnumerable<UserOverviewQueryModel> GetFollowers(int id)
    {
        return _repository.GetFollowers(id)
            .Select(user => new UserOverviewQueryModel()
            {
                Id = user.Id,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl
            });
    }

    public int CountFollowers(int id)
    {
        return _repository.CountFollowers(id);
    }

    public IEnumerable<UserOverviewQueryModel> GetFollowing(int id)
    {
        return _repository.GetFollowing(id)
            .Select(user => new UserOverviewQueryModel()
            {
                Id = user.Id,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl
            });
    }

    public int CountFollowing(int id)
    {
        return _repository.CountFollowing(id);
    }
}