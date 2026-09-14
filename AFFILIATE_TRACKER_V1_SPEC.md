# Affiliate Tracking & Management Platform --- V1 Specification

## 1. PURPOSE

This document is the single source of truth for an AI coding agent
implementing V1.

The product is a simple affiliate-management and click-tracking
platform.

The V1 workflow is:

``` text
ADMIN
  |
  +--> MANAGER
         |
         +--> AFFILIATE
                |
                +--> Assigned OFFER
                        |
                        +--> Tracking Link
                                |
                                +--> Click
                                      |
                                      +--> Redirect to advertiser
```

The system must also support an optional customer reference/sub-ID on a
tracking link.

Example:

``` text
https://track.example.com/c/8H3K92?sub_id=RAJ458
```

The system records:

``` text
click_id
affiliate
offer
tracking_link
sub_id
timestamp
IP
user-agent
referrer
```

The goal is a clean, secure, maintainable V1. Do NOT build the future
features listed below.

------------------------------------------------------------------------

# 2. STRICT AI AGENT RULES

Before coding:

1.  Inspect the repository.
2.  Reuse compatible existing code.
3.  Do not rewrite a working project unnecessarily.
4.  Read this document completely before implementation.
5.  Implement in phases.
6.  Run tests after every major phase.
7.  Never claim a feature works without testing it.
8.  Never disable tests to make the project pass.
9.  Keep backend authorization server-side.
10. Never trust frontend role checks as security.
11. Prefer simple architecture.
12. Do not create microservices for V1.
13. Do not introduce Kafka, Kubernetes, ClickHouse, event buses, or
    other infrastructure unless explicitly required later.
14. Use database migrations for schema changes.
15. Keep secrets out of source control.
16. Document architectural decisions that are not obvious.
17. If a requirement is ambiguous but does not affect business behavior,
    choose the simplest secure conventional implementation.
18. If a decision would materially change business behavior, document it
    and ask for clarification rather than silently inventing
    requirements.

------------------------------------------------------------------------

# 3. RESEARCH-BASED INSTRUCTION DESIGN

This specification intentionally contains:

-   project purpose;
-   explicit scope;
-   technology choices;
-   data model;
-   business rules;
-   API contracts;
-   security rules;
-   implementation phases;
-   tests;
-   acceptance criteria;
-   definition of done.

Repository/agent instruction systems are designed to give coding agents
persistent project context, including how to understand, build, test,
and validate a project. Clear and specific instructions are preferred
over vague instructions. `AGENTS.md` is also supported by several modern
coding-agent workflows, while GitHub documents
`.github/copilot-instructions.md` for repository-wide instructions. If
this file is being used as the agent's master specification, place or
copy it into the repository according to the coding agent's
instruction-file convention.

------------------------------------------------------------------------

# 4. V1 SCOPE

## MUST BUILD

-   Authentication
-   Admin role
-   Manager role
-   Affiliate role
-   Manager -\> Affiliate ownership
-   Affiliate CRUD
-   Manager CRUD
-   Offer CRUD
-   Offer assignment
-   Tracking-link generation
-   Customer reference/sub-ID
-   Public click endpoint
-   Click recording
-   Unique click ID
-   Advertiser redirect
-   Role-specific dashboards
-   Click statistics
-   Click lists
-   Pagination
-   Database migrations
-   Seed data
-   Automated tests
-   Docker/local setup
-   README

## DO NOT BUILD IN V1

-   Offline Excel/CSV report ingestion
-   Automatic email report ingestion
-   Conversion/postback tracking
-   Payouts
-   Affiliate payments
-   Fraud detection
-   Smart links
-   Lead distribution
-   Ping trees
-   CRM
-   AI
-   Marketing automation
-   Advanced attribution
-   Multi-touch attribution
-   Kafka
-   Kubernetes
-   ClickHouse
-   Microservices

The business currently handles advertiser/offline reports manually.
Leave that completely outside V1.

------------------------------------------------------------------------

# 5. TECHNOLOGY

Preferred backend:

-   Python 3.12+
-   FastAPI
-   Pydantic v2
-   SQLAlchemy 2.x
-   Alembic
-   PostgreSQL
-   JWT authentication
-   Argon2id or secure bcrypt
-   pytest
-   httpx

Preferred frontend:

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS

Infrastructure:

-   Docker
-   Docker Compose
-   PostgreSQL locally
-   AWS ECS/Fargate or EC2 later
-   AWS RDS PostgreSQL later

If the existing repository already uses a compatible stack, preserve it.

------------------------------------------------------------------------

# 6. USER HIERARCHY

V1 has exactly three roles:

``` text
ADMIN
  |
  +-- MANAGER
        |
        +-- AFFILIATE
        +-- AFFILIATE
        +-- AFFILIATE
```

An Affiliate belongs to exactly one Manager.

An Offer is global and is assigned to Affiliates.

------------------------------------------------------------------------

# 7. ADMIN PERMISSIONS

Admin can:

-   view all users;
-   create Managers;
-   edit Managers;
-   activate/deactivate Managers;
-   view all Affiliates;
-   create Affiliates;
-   edit Affiliates;
-   assign Affiliates to Managers;
-   activate/deactivate Affiliates;
-   create Offers;
-   edit Offers;
-   activate/deactivate Offers;
-   assign Offers to Affiliates;
-   remove Offer assignments;
-   view all Tracking Links;
-   view all Clicks;
-   view all statistics.

Admin has global access.

------------------------------------------------------------------------

# 8. MANAGER PERMISSIONS

A Manager can only access Affiliates belonging to that Manager.

Manager can:

-   view own profile;
-   view own Affiliates;
-   create Affiliates under themselves;
-   edit own Affiliates;
-   activate/deactivate own Affiliates;
-   view clicks belonging to own Affiliates;
-   view tracking links belonging to own Affiliates;
-   view offers available to own Affiliates;
-   generate links for own Affiliates if the UI supports this.

Manager cannot:

-   access another Manager's Affiliates;
-   move an Affiliate to another Manager;
-   create global Offers;
-   edit global Offers;
-   change their own role;
-   see another Manager's click data.

IMPORTANT:

Backend queries must enforce ownership.

Never rely only on hiding UI elements.

------------------------------------------------------------------------

# 9. AFFILIATE PERMISSIONS

Affiliate can:

-   view own profile;
-   view assigned active Offers;
-   generate Tracking Links;
-   enter an optional Customer Reference;
-   copy Tracking Links;
-   view own clicks;
-   view own click statistics.

Affiliate cannot:

-   see other Affiliates;
-   create Offers;
-   assign Offers;
-   manage users;
-   change own role;
-   see other Affiliates' clicks.

------------------------------------------------------------------------

# 10. CUSTOMER REFERENCE / SUB-ID

This is a required V1 feature.

Business workflow:

1.  Affiliate has a customer.
2.  Affiliate wants to identify that customer later.
3.  Affiliate enters a customer reference.
4.  The reference is attached to the generated tracking URL.
5.  The tracker stores the reference with the click.

Example:

``` text
Customer Reference:
RAJ458
```

Generated URL:

``` text
https://track.example.com/c/8H3K92?sub_id=RAJ458
```

The exact public parameter can be `sub_id` or `aff_sub`; choose one
consistently. `sub_id` is preferred for V1.

IMPORTANT PRIVACY RULE:

Do not require full customer phone numbers, full names, Aadhaar, PAN,
email addresses, passwords, or other sensitive PII in the URL.

Good examples:

``` text
RAJ458
CUS-91A7
4582
CUSTOMER_102
```

The UI should show:

> Do not enter full phone numbers, government IDs, passwords, or other
> sensitive information.

The backend treats the value as opaque text.

------------------------------------------------------------------------

# 11. IMPORTANT ID CONCEPTS

Do not confuse these IDs.

## Affiliate ID

Identifies an Affiliate.

Example:

``` text
AFF-000372
```

## Tracking Code

Identifies a reusable Tracking Link.

Example:

``` text
8H3K92
```

## Click ID

Identifies one individual click.

Example:

``` text
c2fc6fd4863ce2ba1cdfa89bdeb77
```

## Sub-ID / Customer Reference

An optional customer/reference value supplied by the Affiliate.

Example:

``` text
RAJ458
```

Relationship:

``` text
Affiliate
  |
  +-- Tracking Link
        |
        +-- Click A -> click_id A -> sub_id RAJ458
        +-- Click B -> click_id B -> sub_id RAJ458
        +-- Click C -> click_id C -> sub_id AMIT782
```

A sub-ID is NOT a click ID and does not have to be unique.

------------------------------------------------------------------------

# 12. TRACKING LINK DESIGN

A Tracking Link belongs to:

``` text
Affiliate + Offer
```

A Tracking Link has a unique random public code.

Preferred public format:

``` text
https://track.example.com/c/8H3K92
```

Customer-specific:

``` text
https://track.example.com/c/8H3K92?sub_id=RAJ458
```

The database maps:

``` text
8H3K92
  |
  +--> Affiliate
  +--> Offer
```

Do not expose raw database IDs unnecessarily.

------------------------------------------------------------------------

# 13. CLICK FLOW

The public endpoint is:

``` text
GET /c/{tracking_code}
```

Example:

``` text
GET /c/8H3K92?sub_id=RAJ458
```

Flow:

``` text
Request
  |
  v
Find Tracking Link
  |
  +-- not found -> 404
  |
  v
Check Tracking Link active
  |
  v
Check Affiliate active
  |
  v
Check Offer active
  |
  v
Generate unique click_id
  |
  v
Store Click
  |
  v
Build advertiser URL
  |
  v
HTTP redirect
```

The destination MUST come from the stored Offer.

Never accept a destination URL from the public request.

------------------------------------------------------------------------

# 14. CLICK ID

Every click receives a unique server-generated `click_id`.

Requirements:

-   unique;
-   unpredictable;
-   URL-safe;
-   not sequential;
-   not based only on database ID;
-   database unique constraint.

UUID, UUID4, ULID, or secure random token are acceptable.

------------------------------------------------------------------------

# 15. CLICK DATA

Minimum click fields:

``` text
id
click_id
tracking_link_id
affiliate_id
offer_id
sub_id
clicked_at
ip_address
user_agent
referrer
created_at
```

Optional:

``` text
country
device_type
```

Do not add IP geolocation in V1 unless already available and necessary.

Use UTC timestamps.

------------------------------------------------------------------------

# 16. OFFER MODEL

Offer fields:

``` text
id
name
advertiser_name
description
destination_url
click_id_parameter
sub_id_parameter
status
created_at
updated_at
```

Status:

``` text
ACTIVE
INACTIVE
```

Example:

``` text
Offer:
Kotak 811

Advertiser:
Kotak

Destination:
https://advertiser.example/apply

Click ID parameter:
click_id

Sub ID parameter:
aff_sub
```

Destination must be a valid HTTP/HTTPS URL.

Reject dangerous schemes such as `javascript:`.

------------------------------------------------------------------------

# 17. GENERIC OFFER URL PARAMETERS

Do NOT hard-code advertiser-specific behavior.

Offer configuration determines how identifiers are passed.

Example:

``` text
Base:
https://advertiser.example/apply

Click parameter:
click_id

Sub-ID parameter:
aff_sub
```

Generated destination:

``` text
https://advertiser.example/apply?click_id=<CLICK_ID>&aff_sub=RAJ458
```

Implementation must:

-   URL encode values;
-   preserve existing query parameters;
-   avoid malformed URLs;
-   never let public users override the destination host.

If the Offer does not configure a click ID parameter, do not force one.

------------------------------------------------------------------------

# 18. OFFER ASSIGNMENT

Relationship:

``` text
Affiliate <---- affiliate_offers ----> Offer
```

Many-to-many.

An Affiliate can have multiple Offers.

An Offer can be assigned to multiple Affiliates.

Database uniqueness:

``` text
UNIQUE(affiliate_id, offer_id)
```

Inactive Offers cannot be used to create new Tracking Links.

Inactive Affiliates cannot create new Tracking Links.

Existing links are effectively unavailable if their Affiliate or Offer
becomes inactive.

------------------------------------------------------------------------

# 19. DATABASE SCHEMA

Use UUID primary keys unless an existing project convention requires
otherwise.

## users

``` text
id UUID PK
name VARCHAR NOT NULL
email VARCHAR UNIQUE NOT NULL
phone VARCHAR NULL
password_hash VARCHAR NOT NULL
role ENUM('ADMIN','MANAGER','AFFILIATE')
status ENUM('ACTIVE','INACTIVE')
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## affiliates

``` text
id UUID PK
user_id UUID UNIQUE FK users.id
manager_id UUID FK users.id
affiliate_code VARCHAR UNIQUE NOT NULL
status ENUM('ACTIVE','INACTIVE')
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Rules:

-   user_id must reference an AFFILIATE user;
-   manager_id must reference a MANAGER user;
-   manager_id required;
-   affiliate_code unique.

## offers

``` text
id UUID PK
name VARCHAR NOT NULL
advertiser_name VARCHAR NOT NULL
description TEXT NULL
destination_url TEXT NOT NULL
click_id_parameter VARCHAR NULL
sub_id_parameter VARCHAR NULL
status ENUM('ACTIVE','INACTIVE')
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## affiliate_offers

``` text
id UUID PK
affiliate_id UUID FK affiliates.id
offer_id UUID FK offers.id
created_at TIMESTAMPTZ
```

Unique:

``` text
affiliate_id + offer_id
```

## tracking_links

``` text
id UUID PK
tracking_code VARCHAR UNIQUE NOT NULL
affiliate_id UUID FK affiliates.id
offer_id UUID FK offers.id
status ENUM('ACTIVE','INACTIVE')
created_at TIMESTAMPTZ
```

## clicks

``` text
id UUID PK
click_id VARCHAR UNIQUE NOT NULL
tracking_link_id UUID FK tracking_links.id
affiliate_id UUID FK affiliates.id
offer_id UUID FK offers.id
sub_id VARCHAR NULL
clicked_at TIMESTAMPTZ NOT NULL
ip_address VARCHAR NULL
user_agent TEXT NULL
referrer TEXT NULL
created_at TIMESTAMPTZ
```

------------------------------------------------------------------------

# 20. DATABASE INDEXES

Required:

``` text
users.email UNIQUE
affiliates.affiliate_code UNIQUE
tracking_links.tracking_code UNIQUE
clicks.click_id UNIQUE

affiliate_offers UNIQUE(affiliate_id, offer_id)

clicks.affiliate_id
clicks.offer_id
clicks.tracking_link_id
clicks.clicked_at
clicks.sub_id
```

Do not create dozens of indexes without a query need.

------------------------------------------------------------------------

# 21. AUTHENTICATION

Implement:

-   login;
-   current-user endpoint;
-   secure password hashing;
-   JWT or secure session;
-   protected routes.

Recommended password hashing:

``` text
Argon2id
```

Never store plaintext passwords.

Never place tokens/passwords in URLs.

Rate-limit login attempts.

------------------------------------------------------------------------

# 22. API

Base:

``` text
/api/v1
```

Auth:

``` text
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

Users:

``` text
GET   /api/v1/users
POST  /api/v1/users/managers
PATCH /api/v1/users/{user_id}
POST  /api/v1/users/{user_id}/activate
POST  /api/v1/users/{user_id}/deactivate
```

Affiliates:

``` text
GET   /api/v1/affiliates
POST  /api/v1/affiliates
GET   /api/v1/affiliates/{affiliate_id}
PATCH /api/v1/affiliates/{affiliate_id}
POST  /api/v1/affiliates/{affiliate_id}/activate
POST  /api/v1/affiliates/{affiliate_id}/deactivate
```

Offers:

``` text
GET   /api/v1/offers
POST  /api/v1/offers
GET   /api/v1/offers/{offer_id}
PATCH /api/v1/offers/{offer_id}
POST  /api/v1/offers/{offer_id}/activate
POST  /api/v1/offers/{offer_id}/deactivate
```

Assignments:

``` text
POST   /api/v1/affiliates/{affiliate_id}/offers/{offer_id}
DELETE /api/v1/affiliates/{affiliate_id}/offers/{offer_id}
GET    /api/v1/affiliates/{affiliate_id}/offers
```

Tracking links:

``` text
GET  /api/v1/tracking-links
POST /api/v1/tracking-links
GET  /api/v1/tracking-links/{tracking_link_id}
POST /api/v1/tracking-links/{tracking_link_id}/deactivate
```

Clicks:

``` text
GET /api/v1/clicks
GET /api/v1/clicks/stats
```

Public:

``` text
GET /c/{tracking_code}
```

------------------------------------------------------------------------

# 23. CREATE TRACKING LINK

Request:

``` json
{
  "offer_id": "UUID",
  "sub_id": "RAJ458"
}
```

Backend steps:

1.  Authenticate user.
2.  Resolve Affiliate.
3.  Verify Affiliate is active.
4.  Verify Offer exists and is active.
5.  Verify Offer is assigned to Affiliate.
6.  Validate sub_id.
7.  Generate unique tracking code.
8.  Store Tracking Link.
9.  Return public URL.

Example:

``` json
{
  "data": {
    "id": "UUID",
    "tracking_code": "8H3K92",
    "url": "https://track.example.com/c/8H3K92?sub_id=RAJ458",
    "affiliate_id": "UUID",
    "offer_id": "UUID"
  }
}
```

------------------------------------------------------------------------

# 24. SUB-ID VALIDATION

Recommended:

-   max 100 characters;
-   trim whitespace;
-   reject control characters;
-   reject newline characters;
-   allow letters/numbers/hyphen/underscore and safe punctuation;
-   URL-encode when constructing destination URLs.

Examples:

``` text
RAJ458
CUS-91A7
4582
customer_102
```

Sub-ID is data only.

Never execute it as code.

------------------------------------------------------------------------

# 25. PUBLIC TRACKING ENDPOINT

Request:

``` text
GET /c/8H3K92?sub_id=RAJ458
```

Implementation:

``` text
1. Lookup tracking_code.
2. 404 if not found.
3. Check tracking link active.
4. Load affiliate.
5. Check affiliate active.
6. Load offer.
7. Check offer active.
8. Generate click_id.
9. Store click.
10. Build destination URL from Offer configuration.
11. Return 302 or 307 redirect.
```

If click persistence fails, do not pretend the click was stored.

Return a safe server error and log the failure.

------------------------------------------------------------------------

# 26. OPEN REDIRECT PREVENTION

NEVER implement:

``` text
/c/8H3K92?url=https://attacker.com
```

The public request must not choose the destination.

Correct:

``` text
tracking_code
  -> database
  -> offer.destination_url
  -> redirect
```

------------------------------------------------------------------------

# 27. AFFILIATE MANAGEMENT

Affiliate creation fields:

``` text
name
email
phone (optional)
manager_id (Admin only)
```

When Manager creates an Affiliate:

``` text
role = AFFILIATE
manager_id = current_manager.id
status = ACTIVE
```

Manager must not be able to submit an arbitrary manager_id.

Admin may choose the Manager.

------------------------------------------------------------------------

# 28. OFFER MANAGEMENT

Admin can:

-   create;
-   edit;
-   activate;
-   deactivate;
-   assign;
-   unassign.

Offer creation requires:

``` text
name
advertiser_name
destination_url
```

Optional:

``` text
description
click_id_parameter
sub_id_parameter
```

------------------------------------------------------------------------

# 29. ROLE-BASED DATA ISOLATION

This is critical.

## Admin

``` text
all data
```

## Manager

``` text
own affiliates
own affiliates' tracking links
own affiliates' clicks
```

## Affiliate

``` text
own profile
own assigned offers
own tracking links
own clicks
```

Example authorization:

``` python
if user.role == "ADMIN":
    allow

elif user.role == "MANAGER":
    allow only if affiliate.manager_id == user.id

elif user.role == "AFFILIATE":
    allow only if affiliate.user_id == user.id
```

Do not implement authorization only in React.

------------------------------------------------------------------------

# 30. DASHBOARDS

## Admin

Show:

``` text
Total Managers
Total Affiliates
Active Affiliates
Total Offers
Active Offers
Total Clicks
Today's Clicks
```

## Manager

Show:

``` text
My Affiliates
Active Affiliates
Total Clicks
Today's Clicks
```

## Affiliate

Show:

``` text
My Offers
Total Clicks
Today's Clicks
7-Day Clicks
Monthly Clicks
```

Use SQL aggregation instead of loading all Click rows into Python.

------------------------------------------------------------------------

# 31. CLICK LIST

Support:

``` text
date_from
date_to
offer_id
affiliate_id
sub_id
page
page_size
```

Default:

``` text
page=1
page_size=50
```

Maximum:

``` text
100
```

Affiliate cannot filter by another affiliate.

Manager can only filter by own affiliates.

Admin can filter globally.

------------------------------------------------------------------------

# 32. API RESPONSE FORMAT

Success:

``` json
{
  "data": {}
}
```

List:

``` json
{
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 50,
    "total": 120
  }
}
```

Error:

``` json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Offer not found."
  }
}
```

Use proper HTTP status codes.

------------------------------------------------------------------------

# 33. FRONTEND PAGES

Minimum:

``` text
/login
/dashboard
/affiliates
/affiliates/[id]
/offers
/offers/[id]
/tracking-links
/clicks
/profile
```

Admin navigation:

``` text
Dashboard
Managers
Affiliates
Offers
Tracking Links
Clicks
Profile
```

Manager navigation:

``` text
Dashboard
My Affiliates
Offers
Tracking Links
Clicks
Profile
```

Affiliate navigation:

``` text
Dashboard
My Offers
My Tracking Links
My Clicks
Profile
```

------------------------------------------------------------------------

# 34. AFFILIATE UX

The main workflow should be extremely simple.

``` text
My Offers

Kotak 811
Advertiser: Kotak

Customer Reference:
[ RAJ458 ]

[ Generate Tracking Link ]
```

Result:

``` text
Tracking Link:

https://track.example.com/c/8H3K92?sub_id=RAJ458

[ Copy Link ]
```

After copying:

``` text
Copied!
```

Do not make affiliates understand technical tracking concepts.

------------------------------------------------------------------------

# 35. PROJECT STRUCTURE

Preferred backend:

``` text
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── security.py
│   │   └── logging.py
│   ├── models/
│   ├── schemas/
│   ├── api/
│   │   └── v1/
│   ├── services/
│   └── dependencies/
├── alembic/
├── tests/
├── Dockerfile
├── docker-compose.yml
└── pyproject.toml
```

Frontend:

``` text
frontend/
├── app/
├── components/
├── hooks/
├── lib/
├── types/
└── package.json
```

Keep the application monolithic for V1.

------------------------------------------------------------------------

# 36. SERVICE-LAYER RULE

Routes should be thin.

Preferred:

``` text
HTTP route
   |
   v
auth/authorization dependency
   |
   v
service
   |
   v
database/repository
```

Do not put 200 lines of business logic into one FastAPI route.

------------------------------------------------------------------------

# 37. MIGRATIONS

Use Alembic.

Initial migration creates:

``` text
users
affiliates
offers
affiliate_offers
tracking_links
clicks
```

Every schema change gets a migration.

Do not ask developers to manually modify tables.

------------------------------------------------------------------------

# 38. SEED DATA

Create a development seed command.

Create:

``` text
Admin:
admin@example.com

Manager:
manager@example.com

Affiliate:
affiliate@example.com

Offer:
Demo Offer
```

Assign Affiliate -\> Manager.

Assign Offer -\> Affiliate.

Use a documented development-only password.

Never use real production credentials.

------------------------------------------------------------------------

# 39. ENVIRONMENT

Create `.env.example`:

``` text
DATABASE_URL=
JWT_SECRET_KEY=
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
APP_BASE_URL=http://localhost:8000
TRACKING_BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

Never commit `.env`.

------------------------------------------------------------------------

# 40. LOCAL RUNNING

The README must provide exact commands.

Preferred:

``` bash
docker compose up -d
```

Then:

``` bash
alembic upgrade head
python -m app.seed
```

Backend:

``` bash
uvicorn app.main:app --reload
```

Frontend:

``` bash
npm install
npm run dev
```

API documentation:

``` text
/docs
/openapi.json
```

------------------------------------------------------------------------

# 41. TEST REQUIREMENTS

Tests are mandatory.

## Authentication

-   valid login;
-   invalid password;
-   inactive user rejected;
-   protected endpoint requires authentication.

## RBAC

-   Admin sees all Affiliates;
-   Manager sees own Affiliates;
-   Manager cannot see another Manager's Affiliate;
-   Affiliate sees only itself;
-   Affiliate cannot create Offer;
-   Manager cannot create global Offer.

## Affiliates

-   Admin can create;
-   Manager can create under itself;
-   Manager cannot assign another Manager;
-   activation works;
-   deactivation works.

## Offers

-   Admin can create;
-   Admin can update;
-   inactive Offer cannot create link;
-   duplicate assignment cannot create duplicate rows.

## Tracking Links

-   authorized Affiliate can create;
-   unassigned Offer rejected;
-   inactive Affiliate rejected;
-   inactive Offer rejected;
-   unique tracking code generated;
-   sub-ID stored.

## Clicks

-   valid link records click;
-   unique click_id generated;
-   sub-ID stored;
-   correct Affiliate stored;
-   correct Offer stored;
-   correct redirect;
-   invalid link returns 404;
-   inactive link rejected;
-   inactive Affiliate rejected;
-   inactive Offer rejected;
-   public request cannot override destination.

## Statistics

-   Affiliate sees own data only;
-   Manager sees own network;
-   Admin sees all.

------------------------------------------------------------------------

# 42. COMPLETE END-TO-END ACCEPTANCE TEST

This must work.

### 1

Admin logs in.

### 2

Admin creates Manager:

``` text
Rahul
rahul@example.com
```

### 3

Rahul logs in.

### 4

Rahul creates Affiliate:

``` text
Amit
amit@example.com
```

### 5

Admin creates Offer:

``` text
Kotak 811
Advertiser: Kotak
Destination: https://example.com/apply
```

### 6

Admin assigns the Offer to Amit.

### 7

Amit logs in.

### 8

Amit sees Kotak 811.

### 9

Amit enters:

``` text
RAJ458
```

### 10

Amit generates a link:

``` text
https://track.example.com/c/8H3K92?sub_id=RAJ458
```

### 11

Open the link in a browser.

### 12

System creates a Click:

``` text
click_id = unique generated value
affiliate = Amit
offer = Kotak 811
sub_id = RAJ458
```

### 13

Browser redirects to the configured advertiser URL.

### 14

Amit sees the click in My Clicks.

### 15

Rahul sees the click in his Manager dashboard.

### 16

Admin sees the click in Admin dashboard.

If any of these fail, V1 is not complete.

------------------------------------------------------------------------

# 43. SECURITY

Must implement:

-   secure password hashing;
-   backend authorization;
-   input validation;
-   SQL injection protection;
-   safe URL validation;
-   safe redirect handling;
-   secure CORS;
-   rate limiting on login;
-   secret management;
-   no credentials in source code;
-   no sensitive values in logs;
-   no stack traces returned to users.

If cookie-based authentication is used, implement appropriate CSRF
protection.

------------------------------------------------------------------------

# 44. SOFT DELETE / DEACTIVATION

Do not hard-delete Affiliates or Offers that have click history.

Prefer:

``` text
ACTIVE
INACTIVE
```

This preserves historical click data.

A deactivated Affiliate cannot generate new links.

A deactivated Offer cannot generate new links.

A deactivated Tracking Link cannot receive normal clicks.

------------------------------------------------------------------------

# 45. TIME

Store all canonical timestamps in UTC.

Use:

``` text
TIMESTAMPTZ
```

in PostgreSQL.

Frontend may display browser/local time.

------------------------------------------------------------------------

# 46. LOGGING

Use structured logs.

Useful event:

``` text
event=click_recorded
click_id=...
tracking_code=...
affiliate_id=...
offer_id=...
```

Never log:

-   passwords;
-   JWTs;
-   authorization headers;
-   sensitive customer information unnecessarily.

------------------------------------------------------------------------

# 47. PERFORMANCE

The public tracking endpoint should be lightweight.

Preferred:

``` text
lookup tracking code
validate
insert click
redirect
```

Do not:

-   call external APIs;
-   send email synchronously;
-   run expensive analytics;
-   load all click history;
-   run AI;
-   perform unnecessary database queries.

The tracking endpoint may later be separated from the management API
when scale requires it. Do not do that in V1.

------------------------------------------------------------------------

# 48. TRANSACTIONS

Use database transactions for multi-step writes.

Example affiliate creation:

``` text
validate manager
create user
create affiliate
commit
```

If anything fails:

``` text
rollback
```

Example assignment:

``` text
validate affiliate
validate offer
check duplicate
insert assignment
commit
```

------------------------------------------------------------------------

# 49. IDEMPOTENCY

Offer assignment must not create duplicates.

Database constraint:

``` text
UNIQUE(affiliate_id, offer_id)
```

Repeated assignment requests should return the existing assignment or a
clear conflict.

------------------------------------------------------------------------

# 50. TRACKING CODE GENERATION

Generate random URL-safe codes.

Example:

``` text
8H3K92XQ
```

Requirements:

-   unique;
-   not sequential;
-   not derived only from IDs.

If a collision occurs, generate another code.

The database unique constraint is the final protection.

------------------------------------------------------------------------

# 51. FUTURE COMPATIBILITY

Design V1 so future features can be added without rewriting the core.

Future conversion concept:

``` text
Click
  |
  +--> Conversion
```

Future offline report:

``` text
Advertiser Excel
  |
  v
Import
  |
  v
click_id
  |
  v
Click
  |
  v
Affiliate
```

Do not implement these now.

The fields that must remain reliable for future attribution are:

``` text
click_id
affiliate_id
offer_id
sub_id
clicked_at
```

------------------------------------------------------------------------

# 52. API DOCUMENTATION

FastAPI OpenAPI must work.

Verify:

``` text
/docs
/openapi.json
```

Schemas should be understandable.

Add endpoint summaries and useful descriptions.

------------------------------------------------------------------------

# 53. README

README must contain:

1.  Product purpose.
2.  Architecture.
3.  Technology.
4.  Prerequisites.
5.  Environment variables.
6.  Local setup.
7.  Docker setup.
8.  Database migrations.
9.  Seed data.
10. Running backend.
11. Running frontend.
12. Running tests.
13. Example tracking flow.
14. API docs.
15. Project structure.

A new developer should be able to run the project without asking basic
setup questions.

------------------------------------------------------------------------

# 54. IMPLEMENTATION PHASES

Do not build everything in one uncontrolled operation.

## PHASE 1 --- FOUNDATION

Build:

-   project structure;
-   configuration;
-   PostgreSQL;
-   Docker Compose;
-   SQLAlchemy;
-   Alembic;
-   health endpoint.

Test:

``` text
GET /health
```

## PHASE 2 --- AUTH

Build:

-   users;
-   roles;
-   password hashing;
-   login;
-   current user;
-   protected routes.

Test authentication.

## PHASE 3 --- AFFILIATE HIERARCHY

Build:

-   Admin;
-   Manager;
-   Affiliate;
-   manager ownership;
-   affiliate CRUD;
-   activation/deactivation.

Test cross-manager isolation.

## PHASE 4 --- OFFERS

Build:

-   Offer CRUD;
-   activation/deactivation;
-   assignments;
-   affiliate offer list.

Test assignment and authorization.

## PHASE 5 --- TRACKING LINKS

Build:

-   tracking code;
-   customer reference;
-   link generation;
-   link list;
-   copy URL.

Test ownership and assignment rules.

## PHASE 6 --- PUBLIC TRACKING

Build:

``` text
GET /c/{tracking_code}
```

Flow:

``` text
lookup
validate
generate click_id
store click
build destination
redirect
```

Test the complete flow.

## PHASE 7 --- DASHBOARDS

Build:

-   Admin dashboard;
-   Manager dashboard;
-   Affiliate dashboard;
-   click statistics;
-   click list;
-   pagination.

Test data isolation.

## PHASE 8 --- HARDENING

Review:

-   security;
-   authorization;
-   validation;
-   CORS;
-   rate limiting;
-   redirect safety;
-   logging;
-   errors.

## PHASE 9 --- DOCUMENTATION

Finish:

-   README;
-   migrations;
-   seed;
-   tests;
-   `.env.example`;
-   Docker;
-   API documentation.

------------------------------------------------------------------------

# 55. DEFINITION OF DONE

V1 is complete only when all are true:

-   [ ] Admin login works.
-   [ ] Admin can create Managers.
-   [ ] Admin can create Affiliates.
-   [ ] Admin can assign Affiliates to Managers.
-   [ ] Manager can create Affiliates.
-   [ ] Manager sees only own Affiliates.
-   [ ] Affiliate sees only itself.
-   [ ] Admin can create Offers.
-   [ ] Admin can activate/deactivate Offers.
-   [ ] Admin can assign Offers to Affiliates.
-   [ ] Affiliate sees assigned active Offers.
-   [ ] Affiliate can enter Customer Reference.
-   [ ] Affiliate can generate Tracking Link.
-   [ ] Tracking Code is unique.
-   [ ] Public tracking endpoint requires no login.
-   [ ] Every valid click gets unique Click ID.
-   [ ] Sub-ID is stored.
-   [ ] Click stores Affiliate.
-   [ ] Click stores Offer.
-   [ ] Click stores timestamp.
-   [ ] Click redirects to configured Offer URL.
-   [ ] Public user cannot override redirect destination.
-   [ ] Affiliate sees own clicks.
-   [ ] Manager sees own network clicks.
-   [ ] Admin sees all clicks.
-   [ ] Large lists are paginated.
-   [ ] Migrations work.
-   [ ] Seed works.
-   [ ] Tests pass.
-   [ ] README works from a clean environment.
-   [ ] No secrets are committed.
-   [ ] Offline report functionality is NOT included.
-   [ ] No unnecessary microservices are included.

------------------------------------------------------------------------

# 56. FINAL MENTAL MODEL

The whole product is:

``` text
                       ADMIN
                         |
              +----------+----------+
              |                     |
           MANAGERS               OFFERS
              |
              v
          AFFILIATES
              |
              | assigned offers
              v
       GENERATE TRACKING LINK
              |
              | optional customer reference
              v
 /c/{tracking_code}?sub_id=RAJ458
              |
              v
        TRACKING SERVER
              |
        +-----+-----+
        |           |
   CREATE CLICK   RESOLVE OFFER
        |           |
        +-----+-----+
              |
              v
          REDIRECT
              |
              v
         ADVERTISER
```

Click record:

``` text
click_id
affiliate_id
offer_id
tracking_link_id
sub_id
clicked_at
ip_address
user_agent
referrer
```

The V1 goal is not to clone an entire enterprise affiliate platform.

The V1 goal is:

> **A secure, reliable, simple system where Admin manages Managers and
> Offers, Managers manage their Affiliates, Affiliates generate
> customer-specific tracking links, and every click is recorded and
> redirected to the correct advertiser.**

Do not expand scope until this workflow is working end-to-end.
