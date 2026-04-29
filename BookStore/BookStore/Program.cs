using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using BookStore.Models;

var builder = WebApplication.CreateBuilder(args);

var connectionString =
    builder.Configuration.GetConnectionString("Books")
    ?? "Data Source = Books.db";

builder.Services.AddSqlite<BookDb>(connectionString);

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "BookStore API",
        Version = "v1",
        Description = "Reading the books you love"
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/", () => "Hello World!");

app.MapGet("/books", async (BookDb db) =>
await db.Books.ToListAsync());

app.MapPost("/books", async (BookDb db, Book book) =>
{
    await db.Books.AddAsync(book);
    await db.SaveChangesAsync();
    return Results.Created($"/books/{book.Id}", book);
});

app.MapGet("/books/{Id}", async (BookDb db, int id) =>
await db.Books.FindAsync(id));

// Update endpoint

app.MapPut("/books/{id}", async (BookDb db, Book updateBook, int id) =>
{
    var book = await db.Books.FindAsync(id);
    if (book is null) return Results.NotFound();

    book.Title = updateBook.Title;
    book.Author = updateBook.Author;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

// DELETE endpoint

app.MapDelete("/books/{id}", async (BookDb db, int id) =>
{
    var book = await db.Books.FindAsync(id);
    if (book is null) return Results.NotFound();

    db.Books.Remove(book);
    await db.SaveChangesAsync();
    return Results.Ok();
});

app.Run();
