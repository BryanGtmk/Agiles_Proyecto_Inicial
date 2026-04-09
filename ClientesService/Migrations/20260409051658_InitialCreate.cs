using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClientesService.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Clientes",
                columns: table => new
                {
                    IdCliente = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TipoPersona = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TipoIdentificacionFiscal = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    NumeroIdentificacion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Correo = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Telefono = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Direccion = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    Estado = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clientes", x => x.IdCliente);
                });

            migrationBuilder.CreateTable(
                name: "ClientesJuridicos",
                columns: table => new
                {
                    IdCliente = table.Column<int>(type: "int", nullable: false),
                    RazonSocial = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientesJuridicos", x => x.IdCliente);
                    table.ForeignKey(
                        name: "FK_ClientesJuridicos_Clientes_IdCliente",
                        column: x => x.IdCliente,
                        principalTable: "Clientes",
                        principalColumn: "IdCliente",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientesNaturales",
                columns: table => new
                {
                    IdCliente = table.Column<int>(type: "int", nullable: false),
                    Nombres = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Apellidos = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientesNaturales", x => x.IdCliente);
                    table.ForeignKey(
                        name: "FK_ClientesNaturales_Clientes_IdCliente",
                        column: x => x.IdCliente,
                        principalTable: "Clientes",
                        principalColumn: "IdCliente",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Clientes",
                columns: new[] { "IdCliente", "Correo", "Direccion", "Estado", "FechaRegistro", "NumeroIdentificacion", "Telefono", "TipoIdentificacionFiscal", "TipoPersona" },
                values: new object[] { 1, "consumidor.final@ferreteria.local", "N/A", true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "9999999999999", "N/A", "ConsumidorFinal", "Natural" });

            migrationBuilder.InsertData(
                table: "ClientesNaturales",
                columns: new[] { "IdCliente", "Apellidos", "Nombres" },
                values: new object[] { 1, "Final", "Consumidor" });

            migrationBuilder.CreateIndex(
                name: "IX_Clientes_TipoIdentificacionFiscal_NumeroIdentificacion",
                table: "Clientes",
                columns: new[] { "TipoIdentificacionFiscal", "NumeroIdentificacion" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClientesJuridicos");

            migrationBuilder.DropTable(
                name: "ClientesNaturales");

            migrationBuilder.DropTable(
                name: "Clientes");
        }
    }
}
