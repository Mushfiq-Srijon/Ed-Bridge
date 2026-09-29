
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using EdBridge.API.Models;

namespace EdBridge.API.Services
{
    public class InvoiceService
    {
        public byte[] GenerateInvoice(Order order)
        {
            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(40);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header().Column(header =>
                    {
                        header.Item().Text("Ed-Bridge")
                            .FontSize(26)
                            .Bold()
                            .FontColor(Colors.Blue.Darken2);

                        header.Item().Text("Academic Marketplace")
                            .FontSize(10)
                            .FontColor(Colors.Grey.Darken1);

                        header.Item().PaddingTop(10)
                            .LineHorizontal(1)
                            .LineColor(Colors.Grey.Lighten1);
                    });

                    page.Content().PaddingVertical(20).Column(content =>
                    {
                        content.Spacing(12);

                        content.Item().Text("INVOICE")
                            .FontSize(22)
                            .Bold();

                        content.Item().Row(row =>
                        {
                            row.RelativeItem().Column(column =>
                            {
                                column.Item().Text($"Invoice Number: EDB-INV-{order.Id:D6}");
                                column.Item().Text($"Order ID: {order.Id}");
                                column.Item().Text(
                                    $"Order Date: {order.CreatedAt:dd MMM yyyy}");
                            });

                            row.RelativeItem().AlignRight().Column(column =>
                            {
                                column.Item().Text("BILL TO")
                                    .Bold();

                                column.Item().Text(order.Buyer?.Name ?? "Customer");
                                column.Item().Text(order.CustomerEmail);
                            });
                        });

                        content.Item().PaddingTop(8).LineHorizontal(1);

                        content.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(4);
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(2);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(HeaderCell)
                                    .Text("Item");

                                header.Cell().Element(HeaderCell)
                                    .AlignCenter()
                                    .Text("Qty");

                                header.Cell().Element(HeaderCell)
                                    .AlignRight()
                                    .Text("Amount");
                            });

                            foreach (var item in order.Items)
                            {
                                table.Cell().Element(BodyCell)
                                    .Text(item.Title);

                                table.Cell().Element(BodyCell)
                                    .AlignCenter()
                                    .Text("1");

                                table.Cell().Element(BodyCell)
                                    .AlignRight()
                                    .Text(
                                        $"{order.Currency.ToUpper()} {item.UnitPrice:N2}");
                            }
                        });

                        content.Item().PaddingTop(8)
                            .LineHorizontal(1);

                        content.Item().AlignRight().Column(totals =>
                        {
                            totals.Item().Row(row =>
                            {
                                row.RelativeItem().AlignRight()
                                    .Text("Subtotal:");

                                row.ConstantItem(140).AlignRight()
                                    .Text(
                                        $"{order.Currency.ToUpper()} {order.Items.Sum(x => x.UnitPrice):N2}");
                            });

                            totals.Item().PaddingTop(4).Row(row =>
                            {
                                row.RelativeItem().AlignRight()
                                    .Text("Delivery:");

                                row.ConstantItem(140).AlignRight()
                                    .Text("Included in order total");
                            });

                            totals.Item().PaddingTop(6).Row(row =>
                            {
                                row.RelativeItem().AlignRight()
                                    .Text("Order Total:")
                                    .Bold();

                                row.ConstantItem(140).AlignRight()
                                    .Text(
                                        $"{order.Currency.ToUpper()} {order.TotalAmount:N2}")
                                    .Bold();
                            });
                        });

                        content.Item().PaddingTop(12).Column(payment =>
                        {
                            payment.Item().Text("PAYMENT DETAILS")
                                .Bold();

                            payment.Item().Text(
                                $"Method: {order.PaymentMethod}");

                            payment.Item().Text(
                                $"Payment Status: {order.PaymentStatus}");

                            payment.Item().Text(
                                $"Order Status: {order.OrderStatus}");

                            if (order.PaidAt.HasValue)
                            {
                                payment.Item().Text(
                                    $"Paid At: {order.PaidAt.Value:dd MMM yyyy, hh:mm tt}");
                            }
                        });

                        content.Item().PaddingTop(20)
                            .Text("Thank you for using Ed-Bridge!")
                            .FontSize(12)
                            .Bold();

                        content.Item().Text(
                            "This invoice was generated electronically.")
                            .FontSize(9)
                            .FontColor(Colors.Grey.Darken1);
                    });

                    page.Footer().AlignCenter().Text(text =>
                    {
                        text.Span("Ed-Bridge | Invoice ");
                        text.Span($"EDB-INV-{order.Id:D6}");
                    });
                });
            }).GeneratePdf();
        }

        private static IContainer HeaderCell(IContainer container)
        {
            return container
                .Background(Colors.Blue.Darken2)
                .Padding(8)
                .DefaultTextStyle(x => x
                    .FontColor(Colors.White)
                    .Bold());
        }

        private static IContainer BodyCell(IContainer container)
        {
            return container
                .BorderBottom(1)
                .BorderColor(Colors.Grey.Lighten2)
                .PaddingVertical(8)
                .PaddingHorizontal(4);
        }
    }
}