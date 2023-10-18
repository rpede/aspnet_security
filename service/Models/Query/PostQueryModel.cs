namespace service.Models.Query;

public class PostQueryModel
{
    public required int Id { get; set; }
    public required int AuthorId { get; set; }
    public required string Title { get; set; }
    public required string Content { get; set; }
}