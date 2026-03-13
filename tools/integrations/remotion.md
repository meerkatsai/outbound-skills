# Remotion

React-based video generation framework for building, previewing, and rendering videos programmatically in local, server, Lambda, and Cloud Run workflows.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | - | No public hosted REST API; integration surface is Node.js packages and CLI |
| MCP | - | No public MCP server documented |
| CLI | ✓ | Official `remotion` CLI and package-specific CLIs |
| SDK | ✓ | Official packages such as `@remotion/renderer`, `@remotion/player`, `@remotion/lambda`, `@remotion/cloudrun` |

## Authentication

- **Local/server rendering**: No auth built into Remotion itself
- **Lambda / Cloud Run**: Authenticate with your cloud provider credentials and Remotion deployment config
- **Commercial note**: Remotion has licensing requirements for companies and cloud rendering usage

## Common Agent Operations

### Create a new Remotion project

```bash
npx create-video@latest
```

### Preview a composition locally

```bash
npx remotion studio
```

This opens Remotion Studio for interactive preview and editing.

### Render from the CLI

```bash
npx remotion render src/index.ts MyComposition out/video.mp4 --props='{"title":"Spring launch"}'
```

Use this for the fastest local or CI render path when you already know the composition ID.

### List compositions programmatically

```ts
import {bundle} from '@remotion/bundler';
import {getCompositions} from '@remotion/renderer';

const bundled = await bundle('/path/to/remotion/project');
const comps = await getCompositions(bundled, {
  inputProps: {},
});
```

`getCompositions()` evaluates the Remotion root and returns the available compositions. Remotion documents `inputProps` as optional in v4.x and required starting in v5.0.

### Select one composition and render server-side

```ts
import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia} from '@remotion/renderer';

const serveUrl = await bundle('/path/to/remotion/project');
const inputProps = {title: 'Spring launch'};

const composition = await selectComposition({
  serveUrl,
  id: 'MyComposition',
  inputProps,
});

await renderMedia({
  composition,
  serveUrl,
  codec: 'h264',
  outputLocation: 'out/video.mp4',
  inputProps,
});
```

Important rule: pass the same `inputProps` to `selectComposition()` and `renderMedia()`.

### Embed an interactive preview in a React app

```tsx
import {Player} from '@remotion/player';
import {MyVideo} from './MyVideo';

export const App = () => {
  return (
    <Player
      component={MyVideo}
      durationInFrames={120}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
      inputProps={{title: 'Preview'}}
    />
  );
};
```

Remotion’s `<Player>` takes a component directly, not a `<Composition>`.

### Render on AWS Lambda

```ts
import {renderMediaOnLambda} from '@remotion/lambda/client';

const {bucketName, renderId} = await renderMediaOnLambda({
  region: 'us-east-1',
  functionName: 'remotion-render-abc123',
  composition: 'MyVideo',
  serveUrl: 'https://example-bucket.s3.us-east-1.amazonaws.com/sites/site-id',
  codec: 'h264',
});
```

Track progress using `getRenderProgress()`.

### Render on Cloud Run

Remotion also ships `@remotion/cloudrun`, but the official docs mark Cloud Run as:

- experimental
- alpha
- not actively being developed

Prefer standard server-side rendering or Lambda unless GCP Cloud Run is a hard requirement.

## Key Concepts

- **Composition**: A named renderable video definition
- **serveUrl**: A local bundle path or hosted bundle URL used for rendering
- **inputProps**: JSON props passed into the composition
- **Player**: Browser preview component for React apps
- **Renderer**: Node API for local/server rendering
- **Lambda**: Distributed AWS render path

## When to Use

- Build a video generation product with React
- Generate personalized videos from CRM or campaign data
- Render MP4s in CI or a backend job
- Embed live previews in a web app before export
- Scale rendering with AWS Lambda when local rendering is too slow

## Operational Notes

- Local/server rendering depends on Chromium and FFmpeg availability; Remotion can auto-detect/download browser binaries in many cases.
- `renderMedia()` supports output to file or in-memory buffer.
- `renderMediaOnLambda()` requires a deployed Remotion Lambda function first.
- Cloud Run support is currently experimental as of March 12, 2026.
- For company use, confirm the current Remotion license that matches your team size and render model.

## Relevant Skills

- ad-creative
- social-content
- content-strategy
- launch-strategy
