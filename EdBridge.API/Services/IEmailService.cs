namespace EdBridge.API.Services
{
    public interface IEmailService
    {
        Task SendVerificationEmailAsync(
            string recipientEmail,
            string recipientName,
            string verificationLink);
    }
}