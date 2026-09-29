using System.ComponentModel.DataAnnotations;

namespace EdBridge.API.DTOs
{
    public class CheckoutRequest
    {
        [Required]
        [MinLength(1)]
        public List<int> ListingIds { get; set; } = new();

        [Required]
        [EmailAddress]
        public string CustomerEmail { get; set; } = string.Empty;
    }
}
