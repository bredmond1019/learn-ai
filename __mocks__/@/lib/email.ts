export const sendContactFormEmails = jest.fn().mockResolvedValue({
  success: true
})
export const sendEmail = jest.fn()
export const emailTemplates = {
  adminNotification: jest.fn(),
  userConfirmation: jest.fn()
}