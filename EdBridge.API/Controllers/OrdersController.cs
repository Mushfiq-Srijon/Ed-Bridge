
using System.Security.Claims;
using EdBridge.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EdBridge.API.Controllers
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EdBridge.API.Services.InvoiceService _invoiceService;

        public OrdersController(
            AppDbContext context,
            EdBridge.API.Services.InvoiceService invoiceService)
        {
            _context = context;
            _invoiceService = invoiceService;
        }

        [HttpGet("{orderId:int}/invoice")]
        public async Task<IActionResult> DownloadInvoice(int orderId)
        {
            // Get the logged-in user's ID from the JWT.
            var userIdValue = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdValue, out var userId))
            {
                return Unauthorized();
            }

            // Retrieve only orders belonging to the logged-in buyer.
            var order = await _context.Orders
                .AsNoTracking()
                .Include(o => o.Buyer)
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o =>
                    o.Id == orderId &&
                    o.BuyerId == userId);

            if (order == null)
            {
                return NotFound(new
                {
                    message = "Order not found."
                });
            }

            // Generate the PDF invoice.
            var pdfBytes = _invoiceService.GenerateInvoice(order);

            var fileName = $"EDB-INV-{order.Id:D6}.pdf";

            return File(
                pdfBytes,
                "application/pdf",
                fileName);
        }
    }
}