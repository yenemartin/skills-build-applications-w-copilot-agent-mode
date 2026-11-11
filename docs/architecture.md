# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Build the React app as a thin client over the `/api` contract. Each capability screen should fetch data through the shared API client and render loading, empty, success, and error states with accessible text, without owning business logic or persistence rules.
- Logic tier decision: Keep Express routes slim and delegate behavior to TypeScript service functions. Route handlers validate request input, map malformed input to deliberate 4xx errors, and pass valid data to the service layer.
- Data tier decision: Keep validation and persistence rules in Mongoose schemas and seed scripts. Use a stable seed process with upserts so demo records stay consistent without deleting user data, while reconciling previous team membership for seeded users.
- Activity tracking approach: Store activities with valid `user`, `team`, `type`, `minutes`, and timestamps, compute a positive `points` value from minutes, and reject invalid or missing references with 4xx responses instead of Mongoose cast exceptions.
- Team management approach: Validate required team data (`name`, `mascot`) and accept member arrays as ObjectIds. Expose team members in the list response and ensure the seed script preserves existing membership relationships when moving demo users.
- Leaderboard approach: Aggregate activity points by team, sort by descending total, and assign 1-based ranks in the final API payload. The UI should render the ranked results without recalculating business rules.
- Workout suggestions approach: Recommend workouts based on the user’s seeded email, recent activity type, and fitness goal. The first suggestion should match the inferred focus and carry a human-readable reason string that references the activity pattern.
## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
- API command: `npm run test:api --prefix octofit-tracker/backend`
- Frontend command: `npm test --prefix octofit-tracker/frontend`
- Backend build command: `npm run build --prefix octofit-tracker/backend`
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
