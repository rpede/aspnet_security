namespace service.Models.Command;

public class CreatePostCommandModel
{
    public required int AuthorId { get; set; }
    public required string Title { get; set; }
    public required string Content { get; set; }
}