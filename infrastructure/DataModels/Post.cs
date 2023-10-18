namespace infrastructure.DataModels;

public class Post
{
    public int Id { get; set; }
    public required int AuthorId { get; set; }
    public required string Title { get; set; }
    public required string Content { get; set; }
}
