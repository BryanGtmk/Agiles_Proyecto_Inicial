using Microsoft.EntityFrameworkCore;
using ProcesosService.Api.Middlewares;
using ProcesosService.Application.Interfaces;
using ProcesosService.Application.Services;
using ProcesosService.Infrastructure.Persistence;
using ProcesosService.Infrastructure.Repositories;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ProcesoDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ProcesosDb")));

builder.Services.AddScoped<IProductosRepository, ProductosRepository>();
builder.Services.AddScoped<IFacturasRepository, FacturasRepository>();
builder.Services.AddScoped<IProductosService, ProductosService>();
builder.Services.AddScoped<IFacturasService, FacturasService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseCors("Frontend");
app.UseAuthorization();

app.MapControllers();

app.Run();
