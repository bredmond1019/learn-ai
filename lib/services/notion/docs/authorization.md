# Notion API Authorization

## Overview
Notion provides two types of integrations with different authorization methods:

### 1. Internal Integrations
- **Use Case**: Personal projects, single workspace tools
- **Authentication**: Integration token (API key)
- **Setup**: Created in workspace settings
- **Access**: Manually share pages/databases with integration

### 2. Public Integrations  
- **Use Case**: Multi-workspace applications
- **Authentication**: OAuth 2.0 flow
- **Setup**: Register on Notion developers site
- **Access**: Users authorize and select pages to share

## Internal Integration Setup

### Creating an Integration
1. Go to Settings & Members → Integrations
2. Click "New Integration"
3. Configure basic settings:
   - Name
   - Logo (optional)
   - Capabilities
4. Copy the Internal Integration Token

### Using Integration Token
```typescript
const headers = {
  'Authorization': `Bearer ${process.env.NOTION_KEY}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json'
}
```

### Sharing Pages
- Click "..." menu on any page
- Select "Add connections"
- Choose your integration
- Integration can now access this page and its children

## Public Integration OAuth Flow

### 1. Authorization URL
```typescript
const authUrl = new URL('https://api.notion.com/v1/oauth/authorize')
authUrl.searchParams.append('client_id', CLIENT_ID)
authUrl.searchParams.append('response_type', 'code')
authUrl.searchParams.append('owner', 'user') // or 'workspace'
authUrl.searchParams.append('redirect_uri', REDIRECT_URI)
authUrl.searchParams.append('state', generateSecureState())
```

### 2. Token Exchange
```typescript
const response = await fetch('https://api.notion.com/v1/oauth/token', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: REDIRECT_URI
  })
})

const { access_token, workspace_id, workspace_name } = await response.json()
```

### 3. Using Access Tokens
```typescript
const headers = {
  'Authorization': `Bearer ${access_token}`,
  'Notion-Version': '2022-06-28'
}
```

## Token Storage Best Practices

### Environment Variables (Internal)
```bash
# .env.local
NOTION_KEY=secret_xxx...
```

### Database Storage (Public)
```typescript
interface NotionToken {
  workspace_id: string
  workspace_name: string
  access_token: string
  token_type: string
  bot_id: string
  owner: {
    type: 'user' | 'workspace'
    user?: { id: string, name: string, avatar_url: string }
    workspace?: boolean
  }
}
```

## Permissions & Scopes

### Page Access Levels
- **Read**: View page content
- **Update**: Edit existing pages
- **Create**: Add new pages/blocks
- **Delete**: Remove pages (requires explicit permission)

### Integration Capabilities
- Read content
- Update content  
- Insert content
- Read comments
- Create comments

## Security Considerations

### Token Security
1. **Never commit tokens** to version control
2. **Rotate tokens** periodically
3. **Use HTTPS** for all API requests
4. **Validate state** parameter in OAuth flow
5. **Store tokens encrypted** in production

### Access Control
- Integrations only access explicitly shared pages
- Child pages inherit parent permissions
- Users can revoke access anytime
- Monitor integration activity in workspace settings

## Error Handling

### Common Authorization Errors
```typescript
// 401 Unauthorized
{
  "object": "error",
  "status": 401,
  "code": "unauthorized",
  "message": "API token is invalid"
}

// 403 Forbidden  
{
  "object": "error",
  "status": 403,
  "code": "restricted_resource",
  "message": "Integration doesn't have access to this resource"
}
```

### Token Refresh (Public Integrations)
OAuth tokens don't expire, but best practice is to handle revocation:
- Catch 401 errors
- Prompt user to re-authorize
- Update stored tokens

## Rate Limits
- **Requests**: 3 requests per second average
- **Burst**: Handle up to 9 requests in 3 seconds
- **Response**: Check `X-Notion-Rate-Limit-*` headers

## Version Requirements
Always specify API version in requests:
```typescript
headers['Notion-Version'] = '2022-06-28' // Latest stable
```