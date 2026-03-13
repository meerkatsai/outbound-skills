# Canva

Visual design platform with a public Connect API for OAuth-based integrations, asset uploads, design creation, exports, folders, brand templates, and Enterprise autofill workflows.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | Canva Connect REST API |
| MCP | - | No public MCP server documented |
| CLI | [✓](../clis/canva.js) | Local zero-dependency CLI added in this repo |
| SDK | ✓ | Official API examples/docs for multiple languages |
| Webhooks | ✓ | Canva supports webhook notifications for approved integrations |

## Authentication

- **Type**: OAuth 2.0 Authorization Code with PKCE
- **Authorization URL**: `https://www.canva.com/api/oauth/authorize`
- **Token URL**: `POST https://api.canva.com/rest/v1/oauth/token`
- **API base URL**: `https://api.canva.com/rest/v1`
- **Local CLI env vars**:
  - `CANVA_ACCESS_TOKEN` for API calls on behalf of a user
  - `CANVA_CLIENT_ID` and `CANVA_CLIENT_SECRET` for exchanging codes or refreshing tokens
- **Redirect URL note**: Canva allows `http://127.0.0.1:<port>` for local development. `localhost` is not allowed.

## OAuth flow

1. Create a PKCE `code_verifier` and `code_challenge` (`S256`).
2. Send the user to the Canva authorization URL with your `client_id`, scopes, redirect URI, `state`, and PKCE challenge.
3. Exchange the returned authorization code on your backend.
4. Store the access token and refresh token securely.
5. Refresh access tokens server-side before expiry.

Canva documents current access-token lifetime as 4 hours, subject to change.

## Common Agent Operations

### Get current user

```bash
GET https://api.canva.com/rest/v1/users/me

Authorization: Bearer {access_token}
```

Returns the Canva `user_id` and `team_id`. This endpoint does not require a specific scope.

### Get current user profile

```bash
GET https://api.canva.com/rest/v1/users/me/profile

Authorization: Bearer {access_token}
```

Required scope: `profile:read`

### List designs

```bash
GET https://api.canva.com/rest/v1/designs?query=spring+campaign&limit=25

Authorization: Bearer {access_token}
```

Required scope: `design:meta:read`

Useful filters:
- `query`
- `continuation`
- `limit`
- `ownership`
- `sort_by`

### Create a design

```bash
POST https://api.canva.com/rest/v1/designs

Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Spring Campaign Social",
  "design_type": {
    "type": "preset",
    "name": "presentation"
  }
}
```

Required scope: `design:content:write`

You can also create a custom-size design:

```json
{
  "title": "Instagram Portrait",
  "design_type": {
    "type": "custom",
    "width": 1080,
    "height": 1350
  }
}
```

You may attach an existing uploaded image asset with `asset_id`.

### Export a design

```bash
POST https://api.canva.com/rest/v1/exports

Authorization: Bearer {access_token}
Content-Type: application/json

{
  "design_id": "DAExample123",
  "format": {
    "type": "png",
    "pages": [1]
  }
}
```

Required scope: `design:content:read`

Then poll:

```bash
GET https://api.canva.com/rest/v1/exports/{exportId}

Authorization: Bearer {access_token}
```

Supported export types include `pdf`, `jpg`, `png`, `gif`, `pptx`, and `mp4`.

### Create a folder

```bash
POST https://api.canva.com/rest/v1/folders

Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Campaign Assets",
  "parent_folder_id": "root"
}
```

Required scope: `folder:write`

Top-level projects folder: `root`

Uploads folder: `uploads`

### List folder items

```bash
GET https://api.canva.com/rest/v1/folders/{folderId}/items?item_types=design,image&limit=50

Authorization: Bearer {access_token}
```

Required scope: `folder:read`

### Upload an asset from a URL

```bash
POST https://api.canva.com/rest/v1/url-asset-uploads

Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Product Hero",
  "url": "https://example.com/assets/product-hero.png"
}
```

Required scope: `asset:write`

This endpoint is currently documented by Canva as a preview API. For public integrations, preview APIs can block review/approval.

Poll upload status:

```bash
GET https://api.canva.com/rest/v1/url-asset-uploads/{jobId}

Authorization: Bearer {access_token}
```

Required scope: `asset:read`

### List brand templates

```bash
GET https://api.canva.com/rest/v1/brand-templates?dataset=non_empty&limit=25

Authorization: Bearer {access_token}
```

Required scope: `brandtemplate:meta:read`

Brand templates and autofill require the acting user to belong to a Canva Enterprise organization.

### Get brand template dataset

```bash
GET https://api.canva.com/rest/v1/brand-templates/{brandTemplateId}/dataset

Authorization: Bearer {access_token}
```

Required scope: `brandtemplate:content:read`

Use this before autofill to discover the accepted field names and types.

### Autofill a brand template

Autofill is an Enterprise workflow:

1. List or select a brand template.
2. Read its dataset.
3. Submit a design autofill job with mapped text/image/chart inputs.
4. Poll the autofill job.
5. Export the resulting design or send the user to Canva to edit it.

## Local CLI examples

```bash
node tools/clis/canva.js oauth pkce
node tools/clis/canva.js users me
node tools/clis/canva.js designs list --query "spring campaign" --limit 10
node tools/clis/canva.js designs create --title "Ad Concepts" --width 1080 --height 1080
node tools/clis/canva.js exports create --design-id DAExample123 --format png --pages 1
node tools/clis/canva.js assets import-url --name "Hero" --url https://example.com/hero.png
node tools/clis/canva.js brand-templates list --dataset non_empty
```

## When to Use

- Generate or export marketing creatives from your own app
- Push product, campaign, or CMS assets into Canva
- Organize campaign assets in Canva folders
- Build internal design ops tools for marketing teams
- Autofill Enterprise brand templates from CRM, catalog, or campaign data

## Rate Limits

Selected documented limits per user of the integration:

- `GET /users/me`: 10 requests/minute
- `GET /users/me/profile`: 10 requests/minute
- `GET /designs`: 100 requests/minute
- `POST /designs`: 20 requests/minute
- `POST /exports`: 20 requests/minute
- `GET /exports/{id}`: 120 requests/minute
- `POST /folders`: 20 requests/minute
- `GET /folders/{id}/items`: 100 requests/minute
- `POST /url-asset-uploads`: 30 requests/minute
- `GET /url-asset-uploads/{jobId}`: 180 requests/minute
- `GET /brand-templates`: 100 requests/minute

## Notes

- Canva’s Connect API is OAuth-only for user data access; there is no static API key flow for these endpoints.
- Token exchange and refresh must happen on your backend because they require the client secret.
- Temporary design URLs and thumbnail URLs expire.
- Blank designs created through the API are permanently deleted after 7 days if never edited.
- The URL-based asset upload endpoints are preview APIs as of March 12, 2026.

## Relevant Skills

- ad-creative
- social-content
- content-strategy
- analytics-tracking
