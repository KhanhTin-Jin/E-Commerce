using ECommerceAPI.Data;
using ECommerceAPI.DTOs;
using ECommerceAPI.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); // Optional cho test API

var app = builder.Build();

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Updated endpoints using DTOs

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