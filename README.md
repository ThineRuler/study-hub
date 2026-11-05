# study-hub
A task managing app design to break down overwhelming tasks. Designed by COP4331 POOSD Group 15

## API

Base URL when running locally: `http://localhost:5000`

Start the server with `npm run dev` (or `npm start`). Copy `.env.example` to `.env` and set `MONGODB_URI` before starting. The server listens on `PORT` (default `5000`).

Every task and group query is limited to that user. A user cannot read or change another user's tasks, groups, or settings.


### Nodemailer Setup

First setup the transporter email (GMAIL):

- Go to your Google Account -> Security.
- Ensure 2-Step Verification is turned on.
- Search for App Passwords in the search bar.
- Create a new App Password. 

Copy the generated 16-character code and place altered fields in your .env file:

- `#DOMAIN`
- `#EMAIL`
- `#EMAIL_PASSWORD`

### Authentication

`POST /api/auth/sign-up`

```json
{
    "name": "test",
    "email": "test@contact.com",
    "password": "password"
}
```
Body fields: `name`, `email`, `password`. Signing up will send an email using the transporter email to the destination email used to register. A verification email will be sent and response body holds the verification token.

`POST /api/auth/sign-in`

```json
{
    "email": "test@contact.com",
    "password": "password"
}
```
Body fields: `email`, `password`. Successful sign ins will generate a new token each session. 

`POST /api/auth/sign-out`

No fields necessary. Requires a landing page (WIP)

`POST /api/auth/forgot-password`

```json
{
    "email": "test@contact.com",
}
```
Body fields: `email`. Will send a reset password email to destination address. Also generates accompanying reset token.
Current email does not link to a working reset password page (WIP). Manual resets need a specific call to api. `/api/auth/reset-password`

`POST /api/auth/reset-password`

```json
{
    "id": "userID",
    "token": "user.resetToken",
    "newPassword": "newpassword"
}
```
Body fields: `user _id`, `resetToken`, `newPassword`. Will change password after applying calls. 

### Errors

| Status | When | Body |
|---|---|---|
| 401 | `x-user-id` header is missing | `{ "error": "Not logged in" }` |
| 400 | Invalid body, bad id, or a mongoose validation / cast error | `{ "error": "<message>" }` |
| 404 | Task, group, or user was not found for this user | `{ "error": "<message>" }` |
| 409 | This user already has a group with that name | `{ "error": "Group name already exists" }` |
| 500 | Unexpected server error | `{ "error": "<message>" }` |

### Health

`GET /api/health`

No header required.

```json
{ "ok": true }
```

### Tasks

`priorityScore` is calculated from the user's `settings.weights` (importance, due date, and estimated pomodoros). `GET /api/tasks` recalculates it before sorting, so changing weights changes the order of incomplete tasks. A date-only `to` value such as `2026-11-30` includes the whole UTC day.

`GET /api/tasks`

Query parameters, all optional:

- `completed` — `true` or `false`
- `groupId` — only tasks in that group
- `parentTaskId` — a task id, or `none` for top-level tasks only
- `from`, `to` — `dueDate` range, for the calendar

Incomplete lists (`completed=false`, or no `completed` filter) are sorted by `priorityScore` descending. The archive (`completed=true`) is sorted by `completedAt` descending.

```json
[
  {
    "_id": "674100000000000000000001",
    "userId": "674000000000000000000001",
    "groupId": "674200000000000000000001",
    "name": "Study chapter 4",
    "description": "Focus on the practice problems",
    "importance": 0.8,
    "estPomodoros": 2,
    "dueDate": "2026-11-15T00:00:00.000Z",
    "priorityScore": 0.72,
    "sortOrder": 0,
    "completed": false,
    "createdAt": "2026-10-30T16:00:00.000Z",
    "updatedAt": "2026-10-30T16:00:00.000Z"
  }
]
```

`GET /api/tasks/:id`

The task plus its direct subtasks. `404` if it is not this user's task.

```json
{
  "_id": "674100000000000000000001",
  "userId": "674000000000000000000001",
  "name": "Study chapter 4",
  "importance": 0.8,
  "estPomodoros": 2,
  "priorityScore": 0.72,
  "sortOrder": 0,
  "completed": false,
  "subtasks": [
    {
      "_id": "674100000000000000000002",
      "parentTaskId": "674100000000000000000001",
      "name": "Review notes",
      "importance": 0.5,
      "estPomodoros": 1,
      "priorityScore": 0.55,
      "completed": false
    }
  ]
}
```

`POST /api/tasks`

Body fields: `name` (required), `description`, `groupId`, `parentTaskId`, `importance` (0 to 1), `estPomodoros` (integer, at least 1), `dueDate`. `groupId` and `parentTaskId` must belong to the same user. Returns `201` and the created task, including `priorityScore`.

```json
{
  "name": "Study chapter 4",
  "description": "Focus on the practice problems",
  "groupId": "674200000000000000000001",
  "importance": 0.8,
  "estPomodoros": 2,
  "dueDate": "2026-11-15"
}
```

`PATCH /api/tasks/:id`

Only these fields are applied: `name`, `description`, `groupId`, `importance`, `estPomodoros`, `dueDate`, `completed`, `sortOrder`. Setting `completed` to `true` sets `completedAt`. Setting it to `false` removes `completedAt`. `priorityScore` is saved again. Returns the updated task.

`PATCH /api/tasks/reorder`

Body is an array of `{ "id", "sortOrder" }`. Only this user's tasks are updated.

```json
[
  { "id": "674100000000000000000001", "sortOrder": 0 },
  { "id": "674100000000000000000002", "sortOrder": 1 }
]
```

```json
{ "updated": 2 }
```

`DELETE /api/tasks/:id`

Deletes the task and its direct subtasks. Returns `204` with an empty body.

### Groups

`GET /api/groups`

This user's groups, sorted by `sortOrder`. Each group includes `taskCount`.

```json
[
  {
    "_id": "674200000000000000000001",
    "userId": "674000000000000000000001",
    "name": "Homework",
    "color": "#4C7EFF",
    "sortOrder": 0,
    "taskCount": 3,
    "createdAt": "2026-10-30T16:00:00.000Z",
    "updatedAt": "2026-10-30T16:00:00.000Z"
  }
]
```

`POST /api/groups`

Body: `name` (required), `color` (optional, default `#FFFFFF`). Duplicate names for the same user return `409`. Returns `201`.

```json
{ "name": "Homework", "color": "#4C7EFF" }
```

`PATCH /api/groups/:id`

Body fields: `name`, `color`, `sortOrder`. A duplicate name returns `409`.

`DELETE /api/groups/:id`

Deletes the group and sets `groupId` to `null` on its tasks. The tasks are kept. Returns `204`.

### Settings

`GET /api/users/me`

The current user, without `passwordHash`, `verifyToken`, `resetToken`, `verifyTokenExpires`, or `resetTokenExpires`.

```json
{
  "_id": "674000000000000000000001",
  "email": "alice@test.com",
  "displayName": "Alice",
  "isVerified": true,
  "settings": {
    "theme": "light",
    "weights": {
      "importance": 0.5,
      "dueDate": 0.35,
      "time": 0.15
    }
  }
}
```

`PATCH /api/users/me`

Body fields: `displayName`, `settings.theme`, and `settings.weights.importance`, `settings.weights.dueDate`, `settings.weights.time`. Each weight must be a number from 0 to 1. Returns the updated user, still without the secret fields.

```json
{
  "displayName": "Alice",
  "settings": {
    "theme": "dark",
    "weights": {
      "importance": 0.2,
      "dueDate": 0.7,
      "time": 0.1
    }
  }
}
```


## Frontend

To test the frontend of the web app, change to the frontend directory and start the server.

```bash
cd frontend
npm run dev
```