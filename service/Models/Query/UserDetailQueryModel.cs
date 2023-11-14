namespace service.Models.Query;

public class UserDetailQueryModel
{
    public required int Id { get; set; }
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public string? AvatarUrl { get; set; }
    public required bool IsAdmin { get; set; }
}