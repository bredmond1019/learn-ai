// Mock implementation of resend module
export const mockSend = jest.fn()

export class Resend {
  emails = {
    send: mockSend
  }
  
  constructor(apiKey?: string) {
    // Mock constructor
  }
}