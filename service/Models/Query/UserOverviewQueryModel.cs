namespace service.Models.Query;

public class UserOverviewQueryModel
{
    public required int Id { get; set; }
    public required string FullName { get; set; }
    public string? AvatarUrl { get; set; }
}