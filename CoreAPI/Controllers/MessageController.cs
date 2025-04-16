using System.Security.Claims;
using CoreAPI.Data.Repository.Interfaces;
using CoreAPI.Hubs;
using CoreAPI.Models;
using CoreAPI.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace CoreAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly IMessageRepository _messageRepo;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ILogger<MessagesController> _logger;

        public MessagesController(
            IMessageRepository messageRepo, 
            IHubContext<ChatHub> hubContext,
            ILogger<MessagesController> logger)
        {
            _messageRepo = messageRepo;
            _hubContext = hubContext;
            _logger = logger;
        }

        [HttpGet("{contactId}")]
        public async Task<IActionResult> GetMessages(string contactId)
        {
            try
            {
                // Get the current user's ID from the JWT
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (currentUserId == null)
                {
                    return Unauthorized();
                }

                // Convert the IDs to Guid
                var currentUserGuid = Guid.Parse(currentUserId);
                var contactGuid = Guid.Parse(contactId);

                // Retrieve messages between the current user and the contact
                //var messages = await _messageRepo.GetConversationAsync(currentUserGuid, contactGuid);
                //return Ok(messages);
                return Ok(new List<Message>([
                    new Message
                    {
                        SenderId = currentUserGuid,
                        ReceiverId = contactGuid,
                        Content = "Hello, this is a test message.",
                        Timestamp = DateTime.UtcNow
                    },
                    new Message
                    {
                        SenderId = contactGuid,
                        ReceiverId = currentUserGuid,
                        Content = "Hi! This is a reply.",
                        Timestamp = DateTime.UtcNow.AddMinutes(1)
                    }
                ]));
            }
            catch (FormatException)
            {
                return BadRequest("Invalid user ID format");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting messages for contact {ContactId}", contactId);
                return StatusCode(500, "An error occurred while retrieving messages");
            }
        }

        [HttpPost("send/{contactId}")]
        public async Task<IActionResult> SendMessageUsingSignalR([FromRoute]string contactId, [FromBody] MessageDto messageDto)
        {
            try
            {
                // Get the current user's ID from the JWT
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (currentUserId == null)
                {
                    return Unauthorized();
                }

                // Convert the IDs to Guid
                var currentUserGuid = Guid.Parse(currentUserId);
                var contactGuid = Guid.Parse(contactId);

                // Validate message content
                if (string.IsNullOrWhiteSpace(messageDto.Content))
                {
                    return BadRequest("Message content cannot be empty");
                }

                _logger.LogInformation(
                    "Sending message - Sender: {Sender}, Receiver: {Receiver}, Content: {Content}",
                    currentUserGuid, contactGuid, messageDto.Content
                );

                // Save message to database
                //var savedMessage = await _messageRepo.SaveDirectMessageAsync(
                //    currentUserGuid, contactGuid, messageDto.Content);

                // Send the message using SignalR
                await _hubContext.Clients.User(contactId).SendAsync("ReceiveMessage", currentUserGuid.ToString(), messageDto.Content);

                //return Ok(savedMessage);
                return Ok(new
                {
                    SenderId = currentUserGuid,
                    ReceiverId = contactGuid,
                    Content = messageDto.Content,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (FormatException)
            {
                return BadRequest("Invalid user ID format");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message to contact {ContactId}", contactId);
                return StatusCode(500, "An error occurred while sending the message");
            }
        }

        [HttpPost("markAsRead/{senderId}")]
        public async Task<IActionResult> MarkMessagesAsRead(string senderId)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (currentUserId == null)
                {
                    return Unauthorized();
                }

                var success = await _messageRepo.MarkMessagesAsReadAsync(
                    Guid.Parse(senderId), Guid.Parse(currentUserId));

                if (success)
                {
                    // Notify the sender that their messages have been read
                    await _hubContext.Clients.User(senderId).SendAsync("MessagesRead", currentUserId);
                }

                return Ok(new { success });
            }
            catch (FormatException)
            {
                return BadRequest("Invalid user ID format");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking messages as read from {SenderId}", senderId);
                return StatusCode(500, "An error occurred while marking messages as read");
            }
        }
    }
}
