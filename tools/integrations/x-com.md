# X.com (formerly Twitter)

Social platform for organic publishing, engagement, and paid promotion through the X API ecosystem.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | X API v2 for posts, users, engagement, and lookup operations |
| MCP | - | Not available |
| CLI | - | No local CLI in this repository yet |
| SDK | ✓ | Official and community SDKs for Node.js, Python, and other languages |

## Authentication

- **Type**: OAuth 2.0 Bearer token (App-only) or OAuth 1.0a / OAuth 2.0 user context
- **Header**: `Authorization: Bearer {token}`
- **Base URL**: `https://api.x.com/2` (or `https://api.twitter.com/2` depending on account/app setup)
- **Setup**:
  1. Create an app in the X Developer Portal.
  2. Generate API keys and tokens.
  3. Store token in env vars (for example: `X_BEARER_TOKEN`).

## Common Agent Operations

### Get authenticated user

```bash
GET https://api.x.com/2/users/me
Authorization: Bearer {token}
```

### Get user by username

```bash
GET https://api.x.com/2/users/by/username/{username}?user.fields=id,name,username,public_metrics,verified
Authorization: Bearer {token}
```

### List a user's recent posts

```bash
GET https://api.x.com/2/users/{user_id}/tweets?max_results=20&tweet.fields=created_at,public_metrics,lang
Authorization: Bearer {token}
```

### Search recent posts by keyword

```bash
GET https://api.x.com/2/tweets/search/recent?query=(ai%20saas)%20lang:en%20-is:retweet&max_results=25&tweet.fields=created_at,public_metrics,author_id
Authorization: Bearer {token}
```

### Publish a post (user context)

```bash
POST https://api.x.com/2/tweets
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "Launching our new feature today."
}
```

### Get post metrics

```bash
GET https://api.x.com/2/tweets/{tweet_id}?tweet.fields=public_metrics,created_at,lang
Authorization: Bearer {token}
```

## Key Metrics

| Metric | Description |
|--------|-------------|
| `like_count` | Likes on a post |
| `retweet_count` | Retweets |
| `reply_count` | Replies |
| `quote_count` | Quote posts |
| `impression_count` | Impressions (availability depends on access level) |
| `followers_count` | Account follower count |

## When to Use

- Social listening and keyword trend checks
- Competitive brand monitoring
- Post performance tracking
- Publishing and scheduling workflows (when user-context auth is available)
- Building audience/reach reports for GTM campaigns

## Rate Limits

- Rate limits vary by endpoint and X API access tier.
- Always inspect `x-rate-limit-*` response headers and back off on `429` responses.

## Relevant Skills

- social-content
- paid-ads
- analytics-tracking
