using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EdBridge.API.Migrations
{
    public partial class AddNoteNewFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PdfPath",
                table: "Notes",
                type: "longtext",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailPath",
                table: "Notes",
                type: "longtext",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EducationLevel",
                table: "Notes",
                type: "longtext",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClassName",
                table: "Notes",
                type: "longtext",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Group",
                table: "Notes",
                type: "longtext",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Department",
                table: "Notes",
                type: "longtext",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CourseTitle",
                table: "Notes",
                type: "longtext",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "YearSemester",
                table: "Notes",
                type: "longtext",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "NoteComments",
                columns: table => new
                {
                    Id = table.Column<int>(
    type: "int",
    nullable: false),
                    CommentText = table.Column<string>(
                        type: "longtext",
                        nullable: false),

                    CreatedAt = table.Column<DateTime>(
                        type: "datetime(6)",
                        nullable: false),

                    NoteId = table.Column<int>(
                        type: "int",
                        nullable: false),

                    UserId = table.Column<int>(
                        type: "int",
                        nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoteComments", x => x.Id);

                    table.ForeignKey(
                        name: "FK_NoteComments_Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);

                    table.ForeignKey(
                        name: "FK_NoteComments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NoteRatings",
                columns: table => new
                {
                    Id = table.Column<int>(
    type: "int",
    nullable: false),
                    Rating = table.Column<int>(
                        type: "int",
                        nullable: false),

                    CreatedAt = table.Column<DateTime>(
                        type: "datetime(6)",
                        nullable: false),

                    UpdatedAt = table.Column<DateTime>(
                        type: "datetime(6)",
                        nullable: true),

                    NoteId = table.Column<int>(
                        type: "int",
                        nullable: false),

                    UserId = table.Column<int>(
                        type: "int",
                        nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoteRatings", x => x.Id);

                    table.ForeignKey(
                        name: "FK_NoteRatings_Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);

                    table.ForeignKey(
                        name: "FK_NoteRatings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NoteComments_NoteId",
                table: "NoteComments",
                column: "NoteId");

            migrationBuilder.CreateIndex(
                name: "IX_NoteComments_UserId",
                table: "NoteComments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_NoteRatings_NoteId",
                table: "NoteRatings",
                column: "NoteId");

            migrationBuilder.CreateIndex(
                name: "IX_NoteRatings_UserId",
                table: "NoteRatings",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NoteComments");

            migrationBuilder.DropTable(
                name: "NoteRatings");

            migrationBuilder.DropColumn(
                name: "PdfPath",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "ThumbnailPath",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "EducationLevel",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "ClassName",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "Group",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "Department",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "CourseTitle",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "YearSemester",
                table: "Notes");
        }
    }
}