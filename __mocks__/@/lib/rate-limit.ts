export const rateLimitMiddleware = jest.fn().mockImplementation(async (req, callback) => {
  return callback()
})