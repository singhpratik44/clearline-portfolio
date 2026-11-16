# APERTURE Enterprise Foundation

This directory defines the first durable enterprise contract for APERTURE.

## Safety boundaries

- No real learner data should be inserted until authentication, organization isolation, consent, and retention policies are configured.
- AI may draft hints and summaries; it may not silently grade learners or make consequential recommendations.
- External messages require a human approval record.
- Every sensitive action should create an audit event.

## Build sequence

1. Create a D1 database.
2. Apply schema.sql.
3. Add Cloudflare Access or an approved identity provider.
4. Bind D1 in wrangler.jsonc without committing credentials.
5. Implement tenant-scoped API handlers.
6. Add R2 only for approved project artifacts.
7. Connect the Studio and Lab to the API.
