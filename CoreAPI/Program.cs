using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Scalar.AspNetCore;
using CoreAPI.Hubs;
using CoreAPI.Middleware;
using CoreAPI.Data;
using Microsoft.EntityFrameworkCore;
using CoreAPI.Data.Repository;
using System.Text;
using CoreAPI.Data.Repository.Interfaces;
using CoreAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog Logging
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();
builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddControllers();

builder.Services.AddHealthChecks();

builder.Services.AddDbContext<ChatDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("SupabaseIPv4"),
    npgsqlOptions =>
        npgsqlOptions.EnableRetryOnFailure(0))
            // maxRetryCount: 5,
            // maxRetryDelay: TimeSpan.FromSeconds(10),
            // errorCodesToAdd: null))
);

builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Add SignalR
builder.Services.AddSignalR();
builder.Services.AddSingleton<ConnectionTracker>();

// Configure Supabase Client as Singleton
builder.Services.AddSingleton<Supabase.Client>(_ =>
{
    var supabaseUrl = builder.Configuration["Supabase:Url"];
    var supabaseKey = builder.Configuration["Supabase:AnonKey"];
    var options = new Supabase.SupabaseOptions { AutoConnectRealtime = true };
    return new Supabase.Client(supabaseUrl, supabaseKey, options);
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins(builder.Configuration["AllowedOrigins"]!.Split(";"))
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddAuthorization();

// Configure JWT Bearer Authentication to validate Supabase JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["JWT:ValidIssuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["JWT:ValidAudience"],
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JWT:Secret"] ?? throw new InvalidOperationException("JWT Key not configured"))
            ),
            ValidateIssuerSigningKey = true,
        };

        options.RequireHttpsMetadata = true;

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chathub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });


var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseSerilogRequestLogging();
app.UseMiddleware<GlobalExceptionHandler>();
app.UseCors("CorsPolicy");

app.UseRouting();
app.UseHealthChecks("/health");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/chathub").RequireAuthorization();

app.Run();