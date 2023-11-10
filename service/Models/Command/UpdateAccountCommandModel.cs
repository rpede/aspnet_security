using System.ComponentModel.DataAnnotations;

namespace service.Models.Command;

public class UpdateAccountCommandModel
{
    [Required] public string FullName { get; set; }
    [Required] public string Email { get; set; }
}