using Microsoft.AspNetCore.Mvc;
using Dapper;
using Microsoft.AspNetCore.Identity.Data;
using Npgsql;
using Supabase;
using CoreAPI.Models;

namespace CoreAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly Client _supabase;
        private readonly string _connectionString;

        public AuthController(Client supabase, IConfiguration configuration)
        {
            _supabase = supabase;
            _connectionString = configuration.GetConnectionString("Supabase")!;
        }

        // Register a new user using Supabase Auth and then insert profile data
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            // Register the user via Supabase Auth
            var authResponse = await _supabase.Auth.SignUp(req.Email, req.Password);
            if (authResponse?.User == null)
                return BadRequest("Registration failed.");

            // Insert profile info into 'profiles' table
            using var connection = new NpgsqlConnection(_connectionString);
            var sql = "INSERT INTO public.profiles (id, username) VALUES (@Id, @Username)";
            await connection.ExecuteAsync(sql, new { Id = Guid.Parse(authResponse.User.Id!), Username = req.Email });

            return Ok(new
            {
                user = authResponse.User,
                message = "Registration successful."
            });
        }

        // Login using Supabase Auth
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var session = await _supabase.Auth.SignIn(req.Email, req.Password);
            if (session == null || session.User == null)
                return Unauthorized("Invalid credentials.");

            return Ok(new
            {
                access_token = session.AccessToken,
                refresh_token = session.RefreshToken,
                user = session.User
            });
        }

        // Logout endpoint
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _supabase.Auth.SignOut();
            return Ok("Logged out successfully.");
        }

        // Refresh token endpoint
        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshRequest req)
        {
            var session = await _supabase.Auth.RefreshSession();
            if (session == null || session.User == null)
                return Unauthorized("Invalid refresh token.");

            return Ok(new
            {
                access_token = session.AccessToken,
                refresh_token = session.RefreshToken,
                user = session.User
            });
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetProfile()
        {
            var user = _supabase.Auth.CurrentUser;
            if (user == null)
                return Unauthorized("User not authenticated.");

            using var connection = new NpgsqlConnection(_connectionString);
            var sql = "SELECT * FROM public.profiles WHERE id = @Id";
            var profile = await connection.QuerySingleOrDefaultAsync<Profile>(sql, new { Id = Guid.Parse(user.Id!) });

            if (profile == null)
                return NotFound("Profile not found.");

            return Ok(new
            {
                user = user,
                profile = profile
            });
        }
    }
}
