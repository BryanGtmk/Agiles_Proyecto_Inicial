using ClientesService.Domain.Entities;
using ClientesService.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ClientesService.Infrastructure.Persistence;

public class ClienteDbContext : DbContext
{
    public ClienteDbContext(DbContextOptions<ClienteDbContext> options) : base(options)
    {
    }

    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<ClienteNatural> ClientesNaturales => Set<ClienteNatural>();
    public DbSet<ClienteJuridico> ClientesJuridicos => Set<ClienteJuridico>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.ToTable("Clientes");
            entity.HasKey(c => c.IdCliente);
            entity.Property(c => c.IdCliente).ValueGeneratedOnAdd();
            entity.Property(c => c.TipoPersona).HasConversion<string>().HasMaxLength(20);
            entity.Property(c => c.TipoIdentificacionFiscal).HasConversion<string>().HasMaxLength(40);
            entity.Property(c => c.NumeroIdentificacion).HasMaxLength(20).IsRequired();
            entity.Property(c => c.Correo).HasMaxLength(150);
            entity.Property(c => c.Telefono).HasMaxLength(20);
            entity.Property(c => c.Direccion).HasMaxLength(300);
            entity.Property(c => c.FechaRegistro).HasDefaultValueSql("GETDATE()");
            entity.HasIndex(c => new { c.TipoIdentificacionFiscal, c.NumeroIdentificacion }).IsUnique();

            entity.HasOne(c => c.ClienteNatural)
                .WithOne(n => n.Cliente)
                .HasForeignKey<ClienteNatural>(n => n.IdCliente)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.ClienteJuridico)
                .WithOne(j => j.Cliente)
                .HasForeignKey<ClienteJuridico>(j => j.IdCliente)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasData(new Cliente
            {
                IdCliente = 1,
                TipoPersona = TipoPersona.Natural,
                TipoIdentificacionFiscal = TipoIdentificacionFiscal.ConsumidorFinal,
                NumeroIdentificacion = "9999999999999",
                Correo = "consumidor.final@ferreteria.local",
                Telefono = "N/A",
                Direccion = "N/A",
                FechaRegistro = new DateTime(2026, 1, 1),
                Estado = true
            });
        });

        modelBuilder.Entity<ClienteNatural>(entity =>
        {
            entity.ToTable("ClientesNaturales");
            entity.HasKey(c => c.IdCliente);
            entity.Property(c => c.Nombres).HasMaxLength(100).IsRequired();
            entity.Property(c => c.Apellidos).HasMaxLength(100).IsRequired();

            entity.HasData(new ClienteNatural
            {
                IdCliente = 1,
                Nombres = "Consumidor",
                Apellidos = "Final"
            });
        });

        modelBuilder.Entity<ClienteJuridico>(entity =>
        {
            entity.ToTable("ClientesJuridicos");
            entity.HasKey(c => c.IdCliente);
            entity.Property(c => c.RazonSocial).HasMaxLength(200).IsRequired();
        });
    }
}
