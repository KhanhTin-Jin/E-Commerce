using ECommerceAPI.Data;
using ECommerceAPI.DTOs;
using ECommerceAPI.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1) DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2) CORS (đọc Origins từ config/ENV; nếu rỗng thì chỉ AllowAll khi Development)
var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", p =>
    {
        if (origins.Length > 0 || !builder.Environment.IsDevelopment())
            p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
        else
            p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod(); // dev nhanh
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 3) Middlewares
app.UseCors("Frontend");

// Bật Swagger SỚM để luôn truy cập được
var enableSwagger = app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("EnableSwagger");
if (enableSwagger)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// KHÔNG bắt buộc trên Render (tránh redirect loop). Bật nếu bạn chắc chắn dùng HTTPS reverse proxy.
// app.UseHttpsRedirection();

// 4) Auto-migrate AN TOÀN (không làm sập app nếu thiếu connection / migrate fail)
var conn = app.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(conn))
{
    app.Logger.LogWarning("DefaultConnection is empty; skipping EF migrations.");
}
else
{
    try
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
        app.Logger.LogInformation("EF migrations applied successfully.");
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "EF migrations failed at startup; continuing without DB.");
        // KHÔNG throw; để còn vào /swagger debug
    }
}

// 5) Healthcheck đơn giản
app.MapGet("/healthz", () => Results.Ok(new { ok = true, env = app.Environment.EnvironmentName }));

// 6) Endpoints

// GET all products
app.MapGet("/api/products", async (AppDbContext db) =>
{
    var products = await db.Products.ToListAsync();
    var productDtos = products.Select(p => new ProductResponseDto
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        Price = p.Price,
        Image = p.Image
    }).ToList();

    return Results.Ok(productDtos);
});

// GET single product
app.MapGet("/api/products/{id:guid}", async (Guid id, AppDbContext db) =>
{
    var product = await db.Products.FindAsync(id);
    if (product is null) return Results.NotFound();

    var productDto = new ProductResponseDto
    {
        Id = product.Id,
        Name = product.Name,
        Description = product.Description,
        Price = product.Price,
        Image = product.Image
    };

    return Results.Ok(productDto);
});

// POST create product
app.MapPost("/api/products", async (CreateProductDto createDto, AppDbContext db) =>
{
    var product = new Product
    {
        Id = Guid.NewGuid(),
        Name = createDto.Name,
        Description = createDto.Description,
        Price = createDto.Price,
        Image = createDto.Image
    };

    db.Products.Add(product);
    await db.SaveChangesAsync();

    var responseDto = new ProductResponseDto
    {
        Id = product.Id,
        Name = product.Name,
        Description = product.Description,
        Price = product.Price,
        Image = product.Image
    };

    return Results.Created($"/api/products/{product.Id}", responseDto);
});

// PUT update product
app.MapPut("/api/products/{id:guid}", async (Guid id, UpdateProductDto updateDto, AppDbContext db) =>
{
    var product = await db.Products.FindAsync(id);
    if (product is null) return Results.NotFound();

    if (!string.IsNullOrEmpty(updateDto.Name)) product.Name = updateDto.Name;
    if (!string.IsNullOrEmpty(updateDto.Description)) product.Description = updateDto.Description;
    if (updateDto.Price.HasValue && updateDto.Price > 0) product.Price = updateDto.Price.Value;
    if (updateDto.Image != null) product.Image = updateDto.Image;

    await db.SaveChangesAsync();

    var responseDto = new ProductResponseDto
    {
        Id = product.Id,
        Name = product.Name,
        Description = product.Description,
        Price = product.Price,
        Image = product.Image
    };

    return Results.Ok(responseDto);
});


// DELETE product
app.MapDelete("/api/products/{id:guid}", async (Guid id, AppDbContext db) =>
{
    var product = await db.Products.FindAsync(id);
    if (product is null) return Results.NotFound();

    db.Products.Remove(product);
    await db.SaveChangesAsync();
    return Results.Ok();
});

app.Run();