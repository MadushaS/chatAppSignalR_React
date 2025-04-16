using System;
using CoreAPI.Data.Repository.Interfaces;
using CoreAPI.Models;
using CoreAPI.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace CoreAPI.Data.Repository;

public class UserRepository : IUserRepository
{
    private readonly ChatDbContext _context;
    
    public UserRepository(ChatDbContext context)
    {
        _context = context;
    }
    
    public async Task<UserDto> GetUserAsync(string userId)
    {
        var user = await _context.Profiles
            .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));
            
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            AvatarUrl = user.AvatarUrl,
            Status = user.Status
        };
    }
    
    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        return await _context.Profiles
            .Select(p => new UserDto
            {
                Id = p.Id,
                Username = p.Username,
                AvatarUrl = p.AvatarUrl,
                Status = p.Status
            })
            .ToListAsync();
    }
    
    public async Task<bool> UpdateUserStatusAsync(string userId, string status)
    {
        var user = await _context.Profiles.FindAsync(Guid.Parse(userId));
        
        if (user == null)
        {
            return false;
        }
        
        user.Status = status;
        await _context.SaveChangesAsync();
        return true;
    }
}
