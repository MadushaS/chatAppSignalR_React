using CoreAPI.Models;
using CoreAPI.Models.Dtos;

namespace CoreAPI.Data.Repository.Interfaces;

public interface IMessageRepository
{
    Task<MessageDto> SaveDirectMessageAsync(Guid senderId, Guid recipientId, string message);
    Task<bool> MarkMessagesAsReadAsync(Guid senderId, Guid readerId);
    Task<List<MessageDto>> GetConversationAsync(Guid user1Id, Guid user2Id);
}
