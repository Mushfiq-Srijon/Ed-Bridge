using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EdBridge.API.Migrations
{
    /// <inheritdoc />
    public partial class AddListingImageAndEducationLevel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EducationLevel",
                table: "Listings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Listings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EducationLevel",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Listings");
        }
    }
}
