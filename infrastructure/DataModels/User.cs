namespace infrastructure.DataModels;

public class User
{
    public int Id { get; set; }
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public string? AvatarUrl { get; set; }
    public required Role Role { get; set; }
}

public enum Role
{
    Student,
    Teacher,
    Admin
}