using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoreAPI.Models;

[Table("messages", Schema = "public")]
public class Message
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    
    [Column("sender_id")]
    public Guid SenderId { get; set; }
    
    [Column("receiver_id")]
    public Guid ReceiverId { get; set; }
    
    [Required]
    [Column("content")]
    public string Content { get; set; }
    
    [Column("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    [Column("read")]
    public bool Read { get; set; }

    [ForeignKey("SenderId")]
    public Profile Sender { get; set; }
    
    [ForeignKey("ReceiverId")]
    public Profile Receiver { get; set; }
}
