using Microsoft.EntityFrameworkCore;
using ProcesosService.Domain.Entities;

namespace ProcesosService.Infrastructure.Persistence;

public class ProcesoDbContext : DbContext
{
    public ProcesoDbContext(DbContextOptions<ProcesoDbContext> options) : base(options)
    {
    }

    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<CompraCabecera> ComprasCabecera => Set<CompraCabecera>();
    public DbSet<CompraDetalle> ComprasDetalle => Set<CompraDetalle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Producto>(entity =>
        {
            entity.ToTable("Productos");
            entity.HasKey(p => p.IdProducto);
            entity.Property(p => p.IdProducto).ValueGeneratedOnAdd();
            entity.Property(p => p.CodigoProducto).HasMaxLength(30).IsRequired();
            entity.Property(p => p.Nombre).HasMaxLength(120).IsRequired();
            entity.Property(p => p.Marca).HasMaxLength(100).IsRequired();
            entity.Property(p => p.Precio).HasColumnType("decimal(18,2)");
            entity.HasIndex(p => p.CodigoProducto).IsUnique();

            entity.HasData(
                new Producto { IdProducto = 1, CodigoProducto = "CEM-001", Nombre = "Cemento Portland", Marca = "Holcim", Precio = 8.75m, Stock = 200, Activo = true },
                new Producto { IdProducto = 2, CodigoProducto = "CLA-001", Nombre = "Clavos 2 pulgadas", Marca = "Truper", Precio = 1.95m, Stock = 1000, Activo = true },
                new Producto { IdProducto = 3, CodigoProducto = "MRT-001", Nombre = "Martillo 16oz", Marca = "Stanley", Precio = 12.50m, Stock = 75, Activo = true },
                new Producto { IdProducto = 4, CodigoProducto = "PIN-001", Nombre = "Pintura blanca 1 galon", Marca = "Sika", Precio = 18.90m, Stock = 60, Activo = true },
                new Producto { IdProducto = 5, CodigoProducto = "BRO-001", Nombre = "Brocha 2 pulgadas", Marca = "Truper", Precio = 2.40m, Stock = 150, Activo = true },
                new Producto { IdProducto = 6, CodigoProducto = "TAL-001", Nombre = "Taladro inalambrico", Marca = "Bosch", Precio = 95.00m, Stock = 25, Activo = true },
                new Producto { IdProducto = 7, CodigoProducto = "DST-001", Nombre = "Destornillador Phillips", Marca = "Stanley", Precio = 4.25m, Stock = 120, Activo = true },
                new Producto { IdProducto = 8, CodigoProducto = "LLA-001", Nombre = "Llave inglesa 10 pulgadas", Marca = "Truper", Precio = 7.80m, Stock = 80, Activo = true },
                new Producto { IdProducto = 9, CodigoProducto = "TOR-001", Nombre = "Tornillos galvanizados x100", Marca = "Fixer", Precio = 3.60m, Stock = 300, Activo = true },
                new Producto { IdProducto = 10, CodigoProducto = "PVC-001", Nombre = "Tuberia PVC 4 metros", Marca = "Amanco", Precio = 6.95m, Stock = 90, Activo = true }
            );
        });

        modelBuilder.Entity<CompraCabecera>(entity =>
        {
            entity.ToTable("ComprasCabecera");
            entity.HasKey(c => c.IdCompra);
            entity.Property(c => c.IdCompra).ValueGeneratedOnAdd();
            entity.Property(c => c.FechaCompra).IsRequired();
            entity.Property(c => c.NumeroComprobante).HasMaxLength(40).IsRequired();
            entity.Property(c => c.TipoIdentificacionComprador).HasMaxLength(40).IsRequired();
            entity.Property(c => c.IdentificacionComprador).HasMaxLength(20).IsRequired();
            entity.Property(c => c.NombreClienteFactura).HasMaxLength(200).IsRequired();
            entity.Property(c => c.Subtotal).HasColumnType("decimal(18,2)");
            entity.Property(c => c.Descuento).HasColumnType("decimal(18,2)");
            entity.Property(c => c.IVA).HasColumnType("decimal(18,2)");
            entity.Property(c => c.Total).HasColumnType("decimal(18,2)");
            entity.Property(c => c.Estado).HasMaxLength(30).IsRequired();
            entity.HasIndex(c => c.NumeroComprobante).IsUnique();

            entity.HasMany(c => c.Detalles)
                .WithOne(d => d.CompraCabecera)
                .HasForeignKey(d => d.IdCompra)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CompraDetalle>(entity =>
        {
            entity.ToTable("ComprasDetalle");
            entity.HasKey(d => d.IdDetalle);
            entity.Property(d => d.IdDetalle).ValueGeneratedOnAdd();
            entity.Property(d => d.CodigoProducto).HasMaxLength(30).IsRequired();
            entity.Property(d => d.DescripcionProducto).HasMaxLength(220).IsRequired();
            entity.Property(d => d.PrecioUnitario).HasColumnType("decimal(18,2)");
            entity.Property(d => d.SubtotalLinea).HasColumnType("decimal(18,2)");

            entity.HasOne(d => d.Producto)
                .WithMany(p => p.ComprasDetalle)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
