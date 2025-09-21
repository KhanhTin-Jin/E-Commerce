using ECommerceAPI.Data;
using ECommerceAPI.DTOs;
using ECommerceAPI.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1) DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2) CORS: đọc danh sách origin từ cấu hình (hoặc cho phép tất cả nếu chưa cấu hình)
var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", p =>
    {
        if (origins.Length > 0)
            p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
        else
            p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod(); // dev nhanh
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 3) Auto-migrate
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// 4) Middlewares
app.UseCors("Frontend"); // <-- đặt SAU khi build app, TRƯỚC khi map endpoints

var enableSwagger = app.Environment.IsDevelopment() || builder.Configuration.GetValue<bool>("EnableSwagger");
if (enableSwagger)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Nếu deploy lên Render mà gặp redirect loop, có thể tạm comment dòng này.
// app.UseHttpsRedirection();

// 5) Endpoints

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