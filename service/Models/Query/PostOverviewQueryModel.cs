namespace service.Models.Query;

public class PostOverviewQueryModel
{
    public required int Id { get; set; }
    public required int AuthorId { get; set; }
    public required string Title { get; set; }
}