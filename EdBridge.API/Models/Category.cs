namespace EdBridge.API.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } // "Textbooks", "Lab Equipment", "Instruments"
        
        public ICollection<Listing> Listings { get; set; } = new List<Listing>();
    }
}