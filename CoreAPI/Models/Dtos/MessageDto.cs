namespace CoreAPI.Models.Dtos;

public class MessageDto
{
    public int Id { get; set; }
    public Guid SenderId { get; set; }
    public Guid ReceiverId { get; set; }
    public required string Content { get; set; }
    public DateTime? Timestamp { get; set; } = DateTime.UtcNow;
    public bool? Read { get; set; } = false;
}
