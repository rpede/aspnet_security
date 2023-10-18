namespace service.Models.Command;

public class FollowRequestCommandModel
{
    public int OwnUserId { get; set; }
    public int OtherUserId { get; set; }
}