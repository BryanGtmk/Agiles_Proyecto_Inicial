using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ProcesosService.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ComprasCabecera",
                columns: table => new
                {
                    IdCompra = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FechaCompra = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NumeroComprobante = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    IdCliente = table.Column<int>(type: "int", nullable: false),
                    TipoIdentificacionComprador = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    IdentificacionComprador = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NombreClienteFactura = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Descuento = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IVA = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComprasCabecera", x => x.IdCompra);
                });

            migrationBuilder.CreateTable(
                name: "Productos",
                columns: table => new
                {
                    IdProducto = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CodigoProducto = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Marca = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Precio = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Stock = table.Column<int>(type: "int", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Productos", x => x.IdProducto);
                });

            migrationBuilder.CreateTable(
                name: "ComprasDetalle",
                columns: table => new
                {
                    IdDetalle = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdCompra = table.Column<int>(type: "int", nullable: false),
                    IdProducto = table.Column<int>(type: "int", nullable: false),
                    CodigoProducto = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DescripcionProducto = table.Column<string>(type: "nvarchar(220)", maxLength: 220, nullable: false),
                    Cantidad = table.Column<int>(type: "int", nullable: false),
                    PrecioUnitario = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SubtotalLinea = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComprasDetalle", x => x.IdDetalle);
                    table.ForeignKey(
                        name: "FK_ComprasDetalle_ComprasCabecera_IdCompra",
                        column: x => x.IdCompra,
                        principalTable: "ComprasCabecera",
                        principalColumn: "IdCompra",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ComprasDetalle_Productos_IdProducto",
                        column: x => x.IdProducto,
                        principalTable: "Productos",
                        principalColumn: "IdProducto",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Productos",
                columns: new[] { "IdProducto", "Activo", "CodigoProducto", "Marca", "Nombre", "Precio", "Stock" },
                values: new object[,]
                {
                    { 1, true, "MRT-001", "Truper", "Martillo 16oz", 8.50m, 50 },
                    { 2, true, "DST-001", "Stanley", "Destornillador Phillips", 4.25m, 120 },
                    { 3, true, "TLL-001", "Bosch", "Taladro Inalambrico", 95.00m, 20 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ComprasCabecera_NumeroComprobante",
                table: "ComprasCabecera",
                column: "NumeroComprobante",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ComprasDetalle_IdCompra",
                table: "ComprasDetalle",
                column: "IdCompra");

            migrationBuilder.CreateIndex(
                name: "IX_ComprasDetalle_IdProducto",
                table: "ComprasDetalle",
                column: "IdProducto");

            migrationBuilder.CreateIndex(
                name: "IX_Productos_CodigoProducto",
                table: "Productos",
                column: "CodigoProducto",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ComprasDetalle");

            migrationBuilder.DropTable(
                name: "ComprasCabecera");

            migrationBuilder.DropTable(
                name: "Productos");
        }
    }
}
