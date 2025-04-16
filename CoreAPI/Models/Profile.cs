using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoreAPI.Models;

[Table("profiles", Schema = "public")]
public class Profile
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }
    
    [Required]
    [Column("username")]
    public string Username { get; set; }
    
    [Column("avatar_url")]
    public string? AvatarUrl { get; set; }
    
    [Column("status")]
    public string Status { get; set; } = "offline";

    [Column("first_name")]
    public string FirstName { get; set; } = string.Empty;
    
    [Column("last_name")]
    public string LastName { get; set; } = string.Empty;

    [InverseProperty("Sender")]
    public ICollection<Message> SentMessages { get; set; }
    
    [InverseProperty("Receiver")]
    public ICollection<Message> ReceivedMessages { get; set; }
}
