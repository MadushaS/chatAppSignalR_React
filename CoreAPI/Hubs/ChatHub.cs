using System.Security.Claims;
using CoreAPI.Data.Repository.Interfaces;
using CoreAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CoreAPI.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;
    private readonly IMessageRepository _messageRepository;
    private readonly IUserRepository _userRepository;
    private readonly ConnectionTracker _connectionTracker;

    public ChatHub(
            ILogger<ChatHub> logger,
            IMessageRepository messageRepository,
            IUserRepository userRepository,
            ConnectionTracker connectionTracker)
    {
        _logger = logger;
        _messageRepository = messageRepository;
        _userRepository = userRepository;
        _connectionTracker = connectionTracker;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        if (userId != null)
        {
            _connectionTracker.AddConnection(userId, Context.ConnectionId);
            await _userRepository.UpdateUserStatusAsync(userId, "online");
            await Clients.Others.SendAsync("UserStatusChanged", userId, "online");
            _logger.LogInformation("User {UserId} connected with connection ID {ConnectionId}", userId, Context.ConnectionId);
        }
        await base.OnConnectedAsync();
        _logger.LogInformation($"User connected: {Context.ConnectionId} (User ID: {userId})");
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();
        if (userId != null)
        {
            // Update user status to offline
            await _userRepository.UpdateUserStatusAsync(userId, "offline");
            await Clients.Others.SendAsync("UserStatusChanged", userId, "offline");
            _connectionTracker.RemoveConnection(userId, Context.ConnectionId);
            
            // Only set user offline if they have no other active connections
            if (!_connectionTracker.IsUserConnected(userId))
            {
                //await _userRepository.UpdateUserStatusAsync(userId, "offline");
                await Clients.Others.SendAsync("UserStatusChanged", userId, "offline");
                _logger.LogInformation("User {UserId} disconnected with connection ID {ConnectionId}", userId, Context.ConnectionId);
            }
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(string receiverId, string content)
    {
        _logger.LogInformation("message send invoked");
        var senderId = GetUserId();
        if (string.IsNullOrEmpty(senderId) || string.IsNullOrEmpty(receiverId) || string.IsNullOrEmpty(content))
        {
            return;
        }

        try
        {
            // Save the message to the database
            var message = await _messageRepository.SaveDirectMessageAsync(
                Guid.Parse(senderId),
                Guid.Parse(receiverId),
                content
            );

            // Send the message to the recipient in real-time if they're online
            var receiverConnections = _connectionTracker.GetConnections(receiverId);
            if (receiverConnections.Any())
            {
                await Clients.Clients(receiverConnections.ToList()).SendAsync("ReceiveMessage", senderId, content);
            }

            _logger.LogInformation("Message sent from {SenderId} to {ReceiverId}", senderId, receiverId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message from {SenderId} to {ReceiverId}", senderId, receiverId);
        }
    }

    public async Task MarkMessagesAsRead(string senderId)
    {
        var receiverId = GetUserId();
        if (string.IsNullOrEmpty(senderId) || string.IsNullOrEmpty(receiverId))
        {
            return;
        }

        try
        {
            //await _messageRepository.MarkMessagesAsReadAsync(Guid.Parse(senderId), Guid.Parse(receiverId));
            
            // Notify the sender that their messages have been read
            var senderConnections = _connectionTracker.GetConnections(senderId);
            if (senderConnections.Any())
            {
                await Clients.Clients(senderConnections.ToList()).SendAsync("MessagesRead", receiverId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking messages as read from {SenderId} to {ReceiverId}", senderId, receiverId);
        }
    }

    private string? GetUserId() => Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
}