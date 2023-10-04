using System.ComponentModel.DataAnnotations;

namespace api.TransferModels;

public class RegisterDto
{
    [Required] public required string FullName { get; set; }

    [Required] public required string Email { get; set; }

    [Required] [MinLength(8)] public required string Password { get; set; }

    public string? AvatarUrl { get; set; }
}