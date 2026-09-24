using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace EdBridge.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendVerificationEmailAsync(
            string recipientEmail,
            string recipientName,
            string verificationLink)
        {
            var smtpServer = _configuration["EmailSettings:SmtpServer"];
            var smtpPortValue = _configuration["EmailSettings:SmtpPort"] ?? "587";
            var smtpUsername = _configuration["EmailSettings:SmtpUsername"];
            var smtpPassword = _configuration["EmailSettings:SmtpPassword"];
            var fromEmail = _configuration["EmailSettings:FromEmail"];
            var fromName = _configuration["EmailSettings:FromName"];

            if (string.IsNullOrWhiteSpace(smtpServer) ||
                string.IsNullOrWhiteSpace(smtpUsername) ||
                string.IsNullOrWhiteSpace(smtpPassword) ||
                string.IsNullOrWhiteSpace(fromEmail))
            {
                throw new InvalidOperationException(
                    "Email delivery is not configured. Add EmailSettings to user secrets before registering users."
                );
            }

            if (!int.TryParse(smtpPortValue, out var smtpPort) || smtpPort is < 1 or > 65535)
                throw new InvalidOperationException("EmailSettings:SmtpPort must be a valid port number.");

            var message = new MimeMessage();

            message.From.Add(
                new MailboxAddress(fromName, fromEmail)
            );

            message.To.Add(
                new MailboxAddress(recipientName, recipientEmail)
            );

            message.Subject = "Verify your Ed-Bridge email";

            var body = $"""
                Hello {recipientName},

                Welcome to Ed-Bridge!

                Please verify your email address by clicking the link below:

                {verificationLink}

                This verification link will expire in 24 hours.

                If you did not create an Ed-Bridge account, you can ignore this email.

                Regards,
                Ed-Bridge Team
                """;

            message.Body = new TextPart("plain")
            {
                Text = body
            };

            using var smtp = new SmtpClient();

            await smtp.ConnectAsync(
                smtpServer,
                smtpPort,
                SecureSocketOptions.StartTls
            );

            await smtp.AuthenticateAsync(
                smtpUsername,
                smtpPassword
            );

            await smtp.SendAsync(message);

            await smtp.DisconnectAsync(true);
        }
    }
}
