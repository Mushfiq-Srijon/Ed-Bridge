using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EdBridge.API.Migrations
{
    /// <inheritdoc />
    public partial class AddNoteIdToReportsAndPostStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add NoteId to Reports if it doesn't exist
            migrationBuilder.AddColumn<int>(
                name: "NoteId",
                table: "Reports",
                type: "int",
                nullable: true);

            // Add Status to Posts if it doesn't exist
            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Posts",
                type: "longtext",
                nullable: false,
                defaultValue: "Active")
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NoteId",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Posts");
        }
    }
}