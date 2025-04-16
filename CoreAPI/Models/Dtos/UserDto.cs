namespace CoreAPI.Models.Dtos;

public class UserDto
{
    public Guid Id { get; set; }
    public string Username { get; set; }
    public string AvatarUrl { get; set; }
    public string Status { get; set; } = "offline";
}