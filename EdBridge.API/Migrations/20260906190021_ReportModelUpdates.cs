using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EdBridge.API.Migrations
{
    /// <inheritdoc />
    public partial class ReportModelUpdates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reports_Listings_ListingId",
                table: "Reports");

            migrationBuilder.AlterColumn<int>(
                name: "ListingId",
                table: "Reports",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "PostId",
                table: "Reports",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReplyId",
                table: "Reports",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReportType",
                table: "Reports",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_PostId",
                table: "Reports",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_ReplyId",
                table: "Reports",
                column: "ReplyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reports_Listings_ListingId",
                table: "Reports",
                column: "ListingId",
                principalTable: "Listings",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Reports_Posts_PostId",
                table: "Reports",
                column: "PostId",
                principalTable: "Posts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Reports_Replies_ReplyId",
                table: "Reports",
                column: "ReplyId",
                principalTable: "Replies",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reports_Listings_ListingId",
                table: "Reports");

            migrationBuilder.DropForeignKey(
                name: "FK_Reports_Posts_PostId",
                table: "Reports");

            migrationBuilder.DropForeignKey(
                name: "FK_Reports_Replies_ReplyId",
                table: "Reports");

            migrationBuilder.DropIndex(
                name: "IX_Reports_PostId",
                table: "Reports");

            migrationBuilder.DropIndex(
                name: "IX_Reports_ReplyId",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "PostId",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "ReplyId",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "ReportType",
                table: "Reports");

            migrationBuilder.AlterColumn<int>(
                name: "ListingId",
                table: "Reports",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Reports_Listings_ListingId",
                table: "Reports",
                column: "ListingId",
                principalTable: "Listings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
