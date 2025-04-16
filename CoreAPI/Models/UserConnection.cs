using System;

namespace CoreAPI.Models;

public class UserConnection
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string ConnectionId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
} 
