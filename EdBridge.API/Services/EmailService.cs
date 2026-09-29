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

            // Debug: Log what was loaded
            Console.WriteLine($"[EMAIL DEBUG] Server: {smtpServer}");
            Console.WriteLine($"[EMAIL DEBUG] Port: {smtpPortValue}");
            Console.WriteLine($"[EMAIL DEBUG] Username: {smtpUsername}");
            Console.WriteLine($"[EMAIL DEBUG] Password loaded: {!string.IsNullOrWhiteSpace(smtpPassword)}");
            Console.WriteLine($"[EMAIL DEBUG] From: {fromEmail}");

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
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(new MailboxAddress(recipientName, recipientEmail));
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

            message.Body = new TextPart("plain") { Text = body };

            using var smtp = new SmtpClient();

            // ⚠️ DEVELOPMENT ONLY: Bypass certificate validation
            // Remove this before going to production
            smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;

            try
            {
                Console.WriteLine($"[EMAIL DEBUG] Connecting to {smtpServer}:{smtpPort}...");
                await smtp.ConnectAsync(smtpServer, smtpPort, SecureSocketOptions.StartTls);
                Console.WriteLine($"[EMAIL DEBUG] Connected successfully");


                Console.WriteLine($"[EMAIL DEBUG] Authenticating as {smtpUsername}...");
                await smtp.AuthenticateAsync(smtpUsername, smtpPassword);
                Console.WriteLine($"[EMAIL DEBUG] Authenticated successfully");

                Console.WriteLine($"[EMAIL DEBUG] Sending email to {recipientEmail}...");
                await smtp.SendAsync(message);
                Console.WriteLine($"[EMAIL DEBUG] Email sent successfully");

                await smtp.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL ERROR] {ex.GetType().Name}: {ex.Message}");
                Console.WriteLine($"[EMAIL ERROR] Stack Trace: {ex.StackTrace}");
                throw;  // Re-throw so controller's catch block handles it
            }
        }
    }
}
