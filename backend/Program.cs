using System;
using System.Net.Http;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.ComponentModel.DataAnnotations;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// Crear carpeta "data" si no existe
var dbFolder = Path.Combine(Directory.GetCurrentDirectory(), "data");
if (!Directory.Exists(dbFolder))
{
    Directory.CreateDirectory(dbFolder);
}

var dbPath = Path.Combine(dbFolder, "CatGifDb.sqlite");

// Registrar DbContext solo una vez, con ruta física correcta
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

// Swagger y configuración general
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.WebHost.UseUrls("http://0.0.0.0:5000");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors();
// Endpoints

app.MapGet("/api/fact", async () =>
{
    using var http = new HttpClient();
    var response = await http.GetStringAsync("https://catfact.ninja/fact");
    return Results.Content(response, "application/json");
});

app.MapGet("/api/gif", async (string query) =>
{
    var apiKey = "voaNIOg1u7ONPbckzWK71C48YqCOkhVP";

    // Tomar las 3 primeras palabras del query
    var keywords = string.Join(" ", query.Split(' ', StringSplitOptions.RemoveEmptyEntries).Take(3));

    var url = $"https://api.giphy.com/v1/gifs/search?api_key={apiKey}&q={Uri.EscapeDataString(keywords)}&limit=1";

    using var http = new HttpClient();
    var response = await http.GetAsync(url);

    if (!response.IsSuccessStatusCode)
    {
        return Results.Problem("Error al consultar Giphy");
    }

    var json = await response.Content.ReadAsStringAsync();
    return Results.Content(json, "application/json");
});


app.MapGet("/api/history", async (AppDbContext db) =>
{
    return await db.SearchHistory.ToListAsync();
});

app.MapPost("/api/history", async (SearchEntry entry, AppDbContext db) =>
{
    entry.Date = DateTime.UtcNow;
    db.SearchHistory.Add(entry);
    await db.SaveChangesAsync();
    return Results.Created($"/api/history/{entry.Id}", entry);
});

// Asegurar creación base de datos
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}



app.Run();

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<SearchEntry> SearchHistory => Set<SearchEntry>();
}

public class SearchEntry
{
    public int Id { get; set; }

    public DateTime Date { get; set; }

    [Required]
    public string Fact { get; set; } = string.Empty;

    [Required]
    public string Query { get; set; } = string.Empty;

    [Required]
    public string GifUrl { get; set; } = string.Empty;
}
