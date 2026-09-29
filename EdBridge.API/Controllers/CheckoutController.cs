using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;
using EdBridge.API.Data;
using EdBridge.API.DTOs;
using EdBridge.API.Models;

namespace EdBridge.API.Controllers
{
    [ApiController]
    [Route("api/checkout")]
    public class CheckoutController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _configuration;

        public CheckoutController(AppDbContext db, IConfiguration configuration)
        {
            _db = db;
            _configuration = configuration;
        }

        [HttpPost("stripe-session")]
        [Authorize]
        public async Task<IActionResult> CreateStripeSession([FromBody] CheckoutRequest request)
        {
            if (string.IsNullOrWhiteSpace(_configuration["Stripe:SecretKey"]))
                return StatusCode(503, new { message = "Stripe is not configured on the server yet." });

            var buyerId = GetCurrentUserId();
            var validation = await LoadPurchasableListingsAsync(request, buyerId);
            if (validation.Error != null)
                return validation.Error;

            var listings = validation.Listings!;
            var order = BuildOrder(request.CustomerEmail, buyerId, "Card", listings);

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            try
            {
                StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
                var currency = (_configuration["Stripe:Currency"] ?? "bdt").Trim().ToLowerInvariant();
                var frontendUrl = (_configuration["FrontendUrl"] ?? "http://localhost:3000").TrimEnd('/');

                var lineItems = order.Items.Select(item => new SessionLineItemOptions
                {
                    Quantity = 1,
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = currency,
                        UnitAmount = ToMinorUnit(item.UnitPrice),
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = item.Title
                        }
                    }
                }).ToList();

                var options = new SessionCreateOptions
                {
                    Mode = "payment",
                    PaymentMethodTypes = new List<string> { "card" },
                    CustomerEmail = order.CustomerEmail,
                    LineItems = lineItems,
                    SuccessUrl = $"{frontendUrl}/checkout?payment=success&order_id={order.Id}&session_id={{CHECKOUT_SESSION_ID}}",
                    CancelUrl = $"{frontendUrl}/checkout?payment=cancelled&order_id={order.Id}",
                    Metadata = new Dictionary<string, string>
                    {
                        ["order_id"] = order.Id.ToString()
                    }
                };

                var session = await new SessionService().CreateAsync(options);
                order.StripeCheckoutSessionId = session.Id;
                order.Currency = currency;
                await _db.SaveChangesAsync();

                return Ok(new
                {
                    checkoutUrl = session.Url,
                    orderId = order.Id,
                    totalAmount = order.TotalAmount,
                    currency
                });
            }
            catch (StripeException)
            {
                _db.Orders.Remove(order);
                await _db.SaveChangesAsync();
                return StatusCode(502, new { message = "Stripe could not create the checkout session." });
            }
        }

        [HttpPost("cash-on-delivery")]
        [Authorize]
        public async Task<IActionResult> CreateCashOnDeliveryOrder([FromBody] CheckoutRequest request)
        {
            var buyerId = GetCurrentUserId();
            var validation = await LoadPurchasableListingsAsync(request, buyerId);
            if (validation.Error != null)
                return validation.Error;

            var order = BuildOrder(request.CustomerEmail, buyerId, "CashOnDelivery", validation.Listings!);
            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Your cash-on-delivery order has been placed.",
                orderId = order.Id,
                totalAmount = order.TotalAmount,
                paymentStatus = order.PaymentStatus
            });
        }

        [HttpPost("stripe-webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> StripeWebhook()
        {
            var webhookSecret = _configuration["Stripe:WebhookSecret"];
            if (string.IsNullOrWhiteSpace(webhookSecret))
                return StatusCode(503);

            using var reader = new StreamReader(Request.Body);
            var json = await reader.ReadToEndAsync();
            var signature = Request.Headers["Stripe-Signature"].ToString();

            Event stripeEvent;
            try
            {
                stripeEvent = EventUtility.ConstructEvent(json, signature, webhookSecret);
            }
            catch (Exception)
            {
                return BadRequest();
            }

            if (stripeEvent.Type is "checkout.session.completed" or "checkout.session.async_payment_succeeded")
            {
                var session = stripeEvent.Data.Object as Session;
                if (session != null && session.PaymentStatus == "paid")
                    await MarkOrderPaidAsync(session);
            }

            return Ok();
        }

        private async Task MarkOrderPaidAsync(Session session)
        {
            var orderIdText = session.Metadata?.GetValueOrDefault("order_id");
            Order? order = int.TryParse(orderIdText, out var orderId)
                ? await _db.Orders.Include(item => item.Items).FirstOrDefaultAsync(item => item.Id == orderId)
                : await _db.Orders.Include(item => item.Items).FirstOrDefaultAsync(item => item.StripeCheckoutSessionId == session.Id);

            if (order == null || order.PaymentStatus == "Paid")
                return;

            order.PaymentStatus = "Paid";
            order.OrderStatus = "Confirmed";
            order.PaidAt = DateTime.UtcNow;

            var listingIds = order.Items
                .Where(item => item.ListingId.HasValue)
                .Select(item => item.ListingId!.Value)
                .ToList();

            var listings = await _db.Listings
                .Where(listing => listingIds.Contains(listing.Id))
                .ToListAsync();

            foreach (var listing in listings)
            {
                if (listing.Status == "Active")
                    listing.Status = "Sold";
            }

            await _db.SaveChangesAsync();
        }

        private async Task<(List<Listing>? Listings, IActionResult? Error)> LoadPurchasableListingsAsync(
            CheckoutRequest request,
            int buyerId)
        {
            if (!ModelState.IsValid)
                return (null, BadRequest(ModelState));

            var requestedIds = request.ListingIds.Distinct().ToList();
            if (requestedIds.Count == 0)
                return (null, BadRequest(new { message = "Your cart is empty." }));

            var listings = await _db.Listings
                .Where(listing => requestedIds.Contains(listing.Id))
                .ToListAsync();

            if (listings.Count != requestedIds.Count)
                return (null, BadRequest(new { message = "One or more cart listings no longer exist." }));

            if (listings.Any(listing => listing.UserId == buyerId))
                return (null, BadRequest(new { message = "You cannot purchase your own listing." }));

            if (listings.Any(listing => listing.Status != "Active"))
                return (null, BadRequest(new { message = "One or more listings are no longer available." }));

            return (listings, null);
        }

        private static Order BuildOrder(string customerEmail, int buyerId, string paymentMethod, List<Listing> listings)
        {
            var order = new Order
            {
                BuyerId = buyerId,
                CustomerEmail = customerEmail.Trim().ToLowerInvariant(),
                PaymentMethod = paymentMethod,
                Currency = "bdt"
            };

            foreach (var listing in listings)
            {
                order.Items.Add(new OrderItem
                {
                    ListingId = listing.Id,
                    SellerId = listing.UserId,
                    Title = listing.Title,
                    UnitPrice = listing.AskingPrice
                });
            }

            order.TotalAmount = order.Items.Sum(item => item.UnitPrice);
            return order;
        }

        private int GetCurrentUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new InvalidOperationException("Authenticated user id is missing."));
        }

        private static long ToMinorUnit(decimal amount)
        {
            return checked((long)Math.Round(amount * 100m, 0, MidpointRounding.AwayFromZero));
        }
    }
}
