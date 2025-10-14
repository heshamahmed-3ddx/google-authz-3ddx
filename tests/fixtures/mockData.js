// Mock user data for testing
export const mockUser = {
  id: '1234567890',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg',
  verified_email: true,
  locale: 'en'
}

// Mock OAuth tokens
export const mockTokens = {
  access_token: 'ya29.mock_access_token',
  refresh_token: 'mock_refresh_token',
  scope: 'email profile openid',
  token_type: 'Bearer',
  id_token: 'mock_id_token',
  expiry_date: Date.now() + 3600000 // 1 hour from now
}

// Mock Google API responses
export const mockGoogleProfile = {
  id: '1234567890',
  email: 'test@example.com',
  verified_email: true,
  name: 'Test User',
  given_name: 'Test',
  family_name: 'User',
  picture: 'https://example.com/avatar.jpg',
  locale: 'en'
}

// Mock Google Drive files
export const mockDriveFiles = {
  files: [
    {
      id: 'file1',
      name: 'Document 1.pdf',
      mimeType: 'application/pdf',
      modifiedTime: '2023-01-01T00:00:00.000Z'
    },
    {
      id: 'file2',
      name: 'Spreadsheet.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      modifiedTime: '2023-01-02T00:00:00.000Z'
    }
  ],
  nextPageToken: 'next_page_token'
}

// Test environment configuration
export const testConfig = {
  serverUrl: process.env.TEST_SERVER_URL || 'http://localhost:3001',
  clientUrl: process.env.TEST_CLIENT_URL || 'http://localhost:3000',
  testTimeout: 30000
}