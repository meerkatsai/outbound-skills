# Vercel Common Workflows

## Deployment Health Check

1. List project deployments (`list_deployments`) with limit 20.
2. Inspect top 3 by `createdAt`.
3. Flag newest `production` and newest `preview`.
4. Report status, URL, and if either is `ERROR`.

## Build Failure Investigation

1. Run `get_deployment` to capture metadata.
2. Run `get_deployment_events` to isolate failing stage.
3. Run `get_deployment_build_logs` for actionable error lines.
4. Return:
   - failing step
   - likely cause
   - minimal fix
   - confidence level

## Domain Incident Check

1. List domains (`list_domains`) and find affected domain.
2. Check verification with `check_domain_status`.
3. Confirm alias mapping using `list_aliases`.
4. Return whether issue is:
   - DNS/verification
   - missing alias
   - wrong deployment target

## Release Verification

1. Confirm latest production deployment is `READY`.
2. Confirm expected domain aliases point to that deployment.
3. Confirm there is a recent preview deployment for rollback safety.
4. Return go/no-go with reasons.
