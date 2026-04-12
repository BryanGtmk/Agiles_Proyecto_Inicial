using System.Globalization;
using ProcesosService.Application.DTOs;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ProcesosService.Application.Documents;

public sealed class FacturaPdfDocument : IDocument
{
    private readonly FacturaPdfRequestDto _factura;
    private static readonly CultureInfo MoneyCulture = new("es-EC");

    public FacturaPdfDocument(FacturaPdfRequestDto factura)
    {
        _factura = factura;
    }

    public DocumentMetadata GetMetadata()
    {
        return DocumentMetadata.Default;
    }

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Margin(30);
            page.DefaultTextStyle(text => text.FontSize(10).FontFamily(Fonts.Arial));

            page.Header().Element(ComposeHeader);
            page.Content().PaddingVertical(12).Element(ComposeBody);
            page.Footer().AlignCenter().Text($"Factura {_factura.NumeroComprobante} - {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
        });
    }

    private void ComposeHeader(IContainer container)
    {
        container.Row(row =>
        {
            row.RelativeItem().Column(column =>
            {
                column.Item().Text(_factura.NombreNegocio).SemiBold().FontSize(20).FontColor(Colors.Blue.Darken3);
                column.Item().Text($"RUC: {_factura.RucNegocio}");
                column.Item().Text(_factura.DireccionNegocio);
                column.Item().Text($"Tel: {_factura.TelefonoNegocio}");
            });

            row.ConstantItem(240).Border(1).BorderColor(Colors.Grey.Lighten1).Padding(10).Column(column =>
            {
                column.Item().Text("FACTURA").SemiBold().FontSize(16);
                column.Item().PaddingTop(4).Text($"Comprobante: {_factura.NumeroComprobante}");
                column.Item().Text($"Fecha de emision: {_factura.FechaEmision:yyyy-MM-dd HH:mm}");
                column.Item().Text($"Estado: {_factura.Estado}");
            });
        });
    }

    private void ComposeBody(IContainer container)
    {
        container.Column(column =>
        {
            column.Spacing(10);

            column.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(10).Column(info =>
            {
                info.Item().Text("Datos del cliente").SemiBold().FontSize(12);
                info.Item().PaddingTop(3).Text(_factura.NombreClienteFactura);
                info.Item().Text($"{_factura.TipoIdentificacionComprador}: {_factura.IdentificacionComprador}");
            });

            column.Item().Element(ComposeDetailTable);

            column.Item().AlignRight().Width(280).Border(1).BorderColor(Colors.Grey.Lighten1).Padding(10).Column(total =>
            {
                total.Spacing(4);
                total.Item().Element(cell => ComposeTotalRow(cell, "Subtotal", FormatMoney(_factura.Subtotal)));
                total.Item().Element(cell => ComposeTotalRow(cell, "Descuento", FormatMoney(_factura.Descuento)));
                total.Item().Element(cell => ComposeTotalRow(cell, "IVA", FormatMoney(_factura.IVA)));
                total.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                total.Item().Element(cell => ComposeTotalRow(cell, "Total", FormatMoney(_factura.Total), true));
            });
        });
    }

    private void ComposeDetailTable(IContainer container)
    {
        container.Border(1).BorderColor(Colors.Grey.Lighten1).Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(90);    // Codigo
                columns.RelativeColumn(3);     // Descripcion
                columns.ConstantColumn(70);    // Cantidad
                columns.ConstantColumn(90);    // P.Unitario
                columns.ConstantColumn(90);    // Subtotal
            });

            table.Header(header =>
            {
                header.Cell().Element(HeaderCell).Text("Codigo");
                header.Cell().Element(HeaderCell).Text("Detalle de productos");
                header.Cell().Element(HeaderCell).AlignCenter().Text("Cant.");
                header.Cell().Element(HeaderCell).AlignRight().Text("P. Unit.");
                header.Cell().Element(HeaderCell).AlignRight().Text("Subtotal");
            });

            foreach (var detalle in _factura.Detalles)
            {
                table.Cell().Element(BodyCell).Text(detalle.CodigoProducto);
                table.Cell().Element(BodyCell).Column(col =>
                {
                    col.Item().Text(detalle.DescripcionProducto).SemiBold();
                    if (!string.IsNullOrWhiteSpace(detalle.MarcaProducto))
                    {
                        col.Item().Text(detalle.MarcaProducto).FontColor(Colors.Grey.Darken1).FontSize(9);
                    }
                });
                table.Cell().Element(BodyCell).AlignCenter().Text(detalle.Cantidad.ToString());
                table.Cell().Element(BodyCell).AlignRight().Text(FormatMoney(detalle.PrecioUnitario));
                table.Cell().Element(BodyCell).AlignRight().Text(FormatMoney(detalle.SubtotalLinea));
            }
        });
    }

    private static IContainer HeaderCell(IContainer container)
    {
        return container
            .Background(Colors.Grey.Lighten3)
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Lighten1)
            .Padding(6);
    }

    private static IContainer BodyCell(IContainer container)
    {
        return container
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Lighten2)
            .Padding(6);
    }

    private static void ComposeTotalRow(IContainer container, string label, string value, bool strong = false)
    {
        container.Row(row =>
        {
            var labelText = row.RelativeItem().Text(label);
            var valueText = row.ConstantItem(120).AlignRight().Text(value);

            if (strong)
            {
                labelText.SemiBold();
                valueText.SemiBold();
            }
        });
    }

    private static string FormatMoney(decimal value)
    {
        return value.ToString("C2", MoneyCulture);
    }
}

