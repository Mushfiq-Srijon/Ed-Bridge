using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EdBridge.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSavedNotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SavedNotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    NoteId = table.Column<int>(type: "int", nullable: false),
                    SavedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SavedNotes_Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SavedNotes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_NoteId",
                table: "Reports",
                column: "NoteId");

            migrationBuilder.CreateIndex(
                name: "IX_SavedNotes_NoteId",
                table: "SavedNotes",
                column: "NoteId");

            migrationBuilder.CreateIndex(
                name: "IX_SavedNotes_UserId_NoteId",
                table: "SavedNotes",
                columns: new[] { "UserId", "NoteId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Reports_Notes_NoteId",
                table: "Reports",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reports_Notes_NoteId",
                table: "Reports");

            migrationBuilder.DropTable(
                name: "SavedNotes");

            migrationBuilder.DropIndex(
                name: "IX_Reports_NoteId",
                table: "Reports");
        }
    }
}
