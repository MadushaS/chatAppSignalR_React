using CoreAPI.Models;
using CoreAPI.Models.Dtos;

namespace CoreAPI.Data.Repository.Interfaces;

public interface IUserRepository
{
    Task<UserDto> GetUserAsync(string userId);
    Task<bool> UpdateUserStatusAsync(string userId, string status);
}
