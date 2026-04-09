using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ProcesosService.Migrations
{
    /// <inheritdoc />
    public partial class SyncProcesoModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Productos",
                keyColumn: "IdProducto",
                keyValue: 1,
                columns: new[] { "CodigoProducto", "Marca", "Nombre", "Precio", "Stock" },
                values: new object[] { "CEM-001", "Holcim", "Cemento Portland", 8.75m, 200 });

            migrationBuilder.UpdateData(
                table: "Productos",
                keyColumn: "IdProducto",
                keyValue: 2,
                columns: new[] { "CodigoProducto", "Marca", "Nombre", "Precio", "Stock" },
                values: new object[] { "CLA-001", "Truper", "Clavos 2 pulgadas", 1.95m, 1000 });

            migrationBuilder.UpdateData(
                table: "Productos",
                keyColumn: "IdProducto",
                keyValue: 3,
                columns: new[] { "CodigoProducto", "Marca", "Nombre", "Precio", "Stock" },
                values: new object[] { "MRT-001", "Stanley", "Martillo 16oz", 12.50m, 75 });

            migrationBuilder.InsertData(
                table: "Productos",
                columns: new[] { "IdProducto", "Activo", "CodigoProducto", "Marca", "Nombre", "Precio", "Stock" },
                values: new object[,]
                {
                    { 4, true, "PIN-001", "Sika", "Pintura blanca 1 galon", 18.90m, 60 },
                    { 5, true, "BRO-001", "Truper", "Brocha 2 pulgadas", 2.40m, 150 },
                    { 6, true, "TAL-001", "Bosch", "Taladro inalambrico", 95.00m, 25 },
                    { 7, true, "DST-001", "Stanley", "Destornillador Phillips", 4.25m, 120 },
                    { 8, true, "LLA-001", "Truper", "Llave inglesa 10 pulgadas", 7.80m, 80 },
                    { 9, true, "TOR-001", "Fixer", "Tornillos galvanizados x100", 3.60m, 300 },
                    { 10, true, "PVC-001", "Amanco", "Tuberia PVC 4 metros", 6.95m, 90 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "IdProducto",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "IdProducto",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "IdProducto",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "IdProducto",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "IdProducto",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "IdProducto",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Productos",
                keyColumn: "IdProducto",
                keyValue: 10);

            migrationBuilder.UpdateData(
                table: "Productos",
                keyColumn: "IdProducto",
                keyValue: 1,
                columns: new[] { "CodigoProducto", "Marca", "Nombre", "Precio", "Stock" },
                values: new object[] { "MRT-001", "Truper", "Martillo 16oz", 8.50m, 50 });

            migrationBuilder.UpdateData(
                table: "Productos",
                keyColumn: "IdProducto",
                keyValue: 2,
                columns: new[] { "CodigoProducto", "Marca", "Nombre", "Precio", "Stock" },
                values: new object[] { "DST-001", "Stanley", "Destornillador Phillips", 4.25m, 120 });

            migrationBuilder.UpdateData(
                table: "Productos",
                keyColumn: "IdProducto",
                keyValue: 3,
                columns: new[] { "CodigoProducto", "Marca", "Nombre", "Precio", "Stock" },
                values: new object[] { "TLL-001", "Bosch", "Taladro Inalambrico", 95.00m, 20 });
        }
    }
}
