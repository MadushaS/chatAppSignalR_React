using System;
using CoreAPI.Data.Repository.Interfaces;
using CoreAPI.Models;
using CoreAPI.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace CoreAPI.Data.Repository;

public class MessageRepository : IMessageRepository
{
    private readonly ChatDbContext _context;
    
    public MessageRepository(ChatDbContext context)
    {
        _context = context;
    }

    public async Task<List<MessageDto>> GetConversationAsync(Guid user1Id, Guid user2Id)
    {
        var messages = await _context.Messages
            .Where(m => 
                (m.SenderId == user1Id && m.ReceiverId == user2Id) ||
                (m.SenderId == user2Id && m.ReceiverId == user1Id))
            .OrderBy(m => m.Timestamp)
            .Select(m => new MessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                ReceiverId = m.ReceiverId,
                Content = m.Content,
                Timestamp = m.Timestamp,
                Read = m.Read
            })
            .ToListAsync();
            
        return messages;
    }

    public async Task<bool> MarkMessagesAsReadAsync(Guid senderGuid, Guid readerGuid)
    {
        var unreadMessages = await _context.Messages
            .Where(m => m.SenderId == senderGuid && 
                        m.ReceiverId == readerGuid && 
                        !m.Read)
            .ToListAsync();
            
        if (!unreadMessages.Any())
            return false;
            
        foreach (var message in unreadMessages)
        {
            message.Read = true;
        }
        
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<MessageDto> SaveDirectMessageAsync(Guid senderId, Guid recipientId, string content)
    {
        var message = new Message
        {
            SenderId = senderId,
            ReceiverId = recipientId,
            Content = content,
            Timestamp = DateTime.UtcNow,
            Read = false
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        return new MessageDto
        {
            Id = message.Id,
            SenderId = message.SenderId,
            ReceiverId = message.ReceiverId,
            Content = message.Content,
            Timestamp = message.Timestamp,
            Read = message.Read
        };
    }
}
