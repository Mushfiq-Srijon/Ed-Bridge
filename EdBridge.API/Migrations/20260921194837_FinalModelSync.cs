using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EdBridge.API.Migrations
{
    public partial class FinalModelSync : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // These statements are retry-safe for MariaDB. The first local
            // migration attempt may have committed part of its DDL before a
            // later statement failed.
            migrationBuilder.Sql("ALTER TABLE `Messages` ADD COLUMN IF NOT EXISTS `IsRead` tinyint(1) NOT NULL DEFAULT FALSE;");

            migrationBuilder.Sql(@"CREATE TABLE IF NOT EXISTS `NoteViews` (
                `NoteId` int NOT NULL,
                `UserId` int NOT NULL,
                `ViewedAt` datetime(6) NOT NULL,
                CONSTRAINT `PK_NoteViews` PRIMARY KEY (`NoteId`, `UserId`),
                CONSTRAINT `FK_NoteViews_Notes_NoteId` FOREIGN KEY (`NoteId`) REFERENCES `Notes` (`Id`) ON DELETE CASCADE,
                CONSTRAINT `FK_NoteViews_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
            ) CHARACTER SET=utf8mb4;");

            migrationBuilder.Sql(@"CREATE TABLE IF NOT EXISTS `SavedListings` (
                `Id` int NOT NULL AUTO_INCREMENT,
                `UserId` int NOT NULL,
                `ListingId` int NOT NULL,
                `SavedAt` datetime(6) NOT NULL,
                CONSTRAINT `PK_SavedListings` PRIMARY KEY (`Id`),
                CONSTRAINT `FK_SavedListings_Listings_ListingId` FOREIGN KEY (`ListingId`) REFERENCES `Listings` (`Id`) ON DELETE CASCADE,
                CONSTRAINT `FK_SavedListings_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
            ) CHARACTER SET=utf8mb4;");

            migrationBuilder.Sql(@"CREATE TABLE IF NOT EXISTS `SavedPosts` (
                `Id` int NOT NULL AUTO_INCREMENT,
                `UserId` int NOT NULL,
                `PostId` int NOT NULL,
                `SavedAt` datetime(6) NOT NULL,
                CONSTRAINT `PK_SavedPosts` PRIMARY KEY (`Id`),
                CONSTRAINT `FK_SavedPosts_Posts_PostId` FOREIGN KEY (`PostId`) REFERENCES `Posts` (`Id`) ON DELETE CASCADE,
                CONSTRAINT `FK_SavedPosts_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
            ) CHARACTER SET=utf8mb4;");

            migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS `IX_NoteViews_UserId` ON `NoteViews` (`UserId`);");
            migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS `IX_SavedListings_ListingId` ON `SavedListings` (`ListingId`);");
            migrationBuilder.Sql("CREATE UNIQUE INDEX IF NOT EXISTS `IX_SavedListings_UserId_ListingId` ON `SavedListings` (`UserId`, `ListingId`);");
            migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS `IX_SavedPosts_PostId` ON `SavedPosts` (`PostId`);");
            migrationBuilder.Sql("CREATE UNIQUE INDEX IF NOT EXISTS `IX_SavedPosts_UserId_PostId` ON `SavedPosts` (`UserId`, `PostId`);");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TABLE IF EXISTS `NoteViews`;");
            migrationBuilder.Sql("DROP TABLE IF EXISTS `SavedListings`;");
            migrationBuilder.Sql("DROP TABLE IF EXISTS `SavedPosts`;");
            migrationBuilder.Sql("ALTER TABLE `Messages` DROP COLUMN IF EXISTS `IsRead`;");
        }
    }
}
