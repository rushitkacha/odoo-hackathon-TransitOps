# TransitOps — Features

TransitOps is a fleet & transport operations management system that lets an
operator run their entire fleet from one place: vehicles, drivers, trips,
maintenance, fuel, expenses, and the reporting that ties them together. Every
feature below is implemented and verifiable in the running app (backend at
`/docs`, frontend at `/login.html`).

> Judges: each item maps to a real endpoint or screen. The business rules
> (status transitions, validations, auto-generated records) are enforced
> server-side, not just in the UI.

---

## Authentication & access control

- **Email + password login** using the OAuth2 form standard, returning a signed
  **JWT** the frontend uses as a `Bearer` token.
- **Protected API** — every data endpoint requires a valid token; unauthenticated
  requests are rejected with `401` and the UI redirects to login.
- **Five seeded roles** — Fleet Manager, Dispatcher, Safety Officer, Financial
  Analyst, and Admin — with a role-checking dependency available for
  route-level authorization.
- **User management** — list users and update a user's role/status
  (`Active` / `Inactive`).
- Passwords are stored **hashed** (bcrypt), never in plain text.

## Vehicles

- **Full CRUD** for vehicles with registration number, model, type, load
  capacity, odometer, acquisition cost, and region.
- **Lifecycle statuses:** `Available`, `On Trip`, `In Shop`, `Retired`.
- **Validation:** duplicate registration numbers are blocked (`409`); load
  capacity must be greater than zero (`422`).
- **Safe deletes:** a vehicle that is `On Trip` or `In Shop` cannot be deleted.
- **Available-vehicles endpoint** feeds the trip and maintenance forms so users
  can only pick eligible vehicles.

## Drivers

- **Full CRUD** with name, licence number, licence category, licence expiry,
  contact, and safety score.
- **Lifecycle statuses:** `Available`, `On Trip`, `Off Duty`, `Suspended`.
- **Validation:** duplicate licence numbers are blocked; safety score is
  constrained to 0–100.
- **Eligibility logic:** an eligible driver must be `Available` **and** hold a
  non-expired licence — exposed via an available-drivers endpoint and a
  per-driver eligibility check.
- **Safe deletes:** a driver who is `On Trip` cannot be deleted.

## Trips (dispatch workflow)

- **Create trips as drafts** with source, destination, vehicle, driver, cargo
  weight, planned distance, and revenue.
- **Pre-flight validation on creation:** the chosen vehicle and driver must be
  available, the driver's licence must be valid, and **cargo weight cannot
  exceed the vehicle's capacity**.
- **Full lifecycle with side effects:**
  - **Dispatch** — moves the trip to `Dispatched` and automatically flips the
    assigned vehicle and driver to `On Trip`.
  - **Complete** — records actual distance, revenue, and final odometer;
    returns the vehicle and driver to `Available`; and **auto-generates a fuel
    log** if fuel consumption is entered.
  - **Cancel** — releases the vehicle and driver back to `Available` if the trip
    was already dispatched.
- **Joined data** — trip records carry the vehicle name/registration and driver
  name so tables and the dashboard read cleanly.

## Maintenance

- **Open maintenance** on a vehicle, which automatically moves it to `In Shop`.
- **Guards:** a vehicle that is `On Trip` or `Retired` can't enter maintenance,
  and a vehicle can't have two active maintenance records at once.
- **Close maintenance** with an end date, final cost, and closing notes, which
  returns the vehicle to `Available`.

## Fuel logs

- **Full CRUD** for fuel entries (litres, cost, date, odometer), optionally
  linked to a completed trip.
- **Validation:** litres must be positive; a linked trip must belong to the
  same vehicle; and the **odometer cannot move backwards**.
- Recording fuel **updates the vehicle's odometer** automatically.

## Expenses

- **Full CRUD** for operational expenses, optionally linked to a trip.
- **Expense types:** `Toll`, `Parking`, `Repair`, `Other`.
- **Validation:** amounts can't be negative; a linked trip must belong to the
  selected vehicle.

## Operations dashboard

- **Live fleet snapshot:** total vehicles, available, on-trip, and in-shop
  counts.
- **Trip activity:** active (dispatched) and pending (draft) trips.
- **Driver readiness:** count of available drivers with valid licences.
- **Fleet utilization %** and **total operational cost** (fuel + maintenance).
- **Actionable widgets:** recent trips, active maintenance alerts, and
  **licences expiring within 60 days**.
- **Filterable** by vehicle type, region, and status.

## Reporting & analytics

- **Per-vehicle performance report** covering completed trips, total distance,
  fuel litres, fuel cost, maintenance cost, other expenses, and total
  operational cost.
- **Derived metrics:** **fuel efficiency** (km per litre) and **ROI %**
  (net of operational cost against acquisition cost).
- Reports are paginated and searchable like every other list.

## Cross-cutting platform features

- **Consistent list API** — every list endpoint supports search, field filters,
  sorting, and pagination, returning `{ items, total }`.
- **Standardized errors** with clear messages and correct HTTP status codes
  (`401`, `404`, `409`, `422`).
- **CORS** configured for the frontend origin; **request logging** middleware
  with timing on every call.
- **Zero-setup database** — SQLite by default with **automatic table creation
  and demo-data seeding on first run**; PostgreSQL is a one-line config switch.

## Frontend experience

- **No build step** — pure HTML/CSS/JS, served as static files.
- **Single-page app feel** with a hash router across nine screens (Dashboard,
  Vehicles, Drivers, Trips, Maintenance, Fuel, Expenses, Reports, Settings).
- **Reusable UI kit:** data tables with search/sort/pagination, modals, toast
  notifications, confirm dialogs, and colour-coded status badges.
- **Guided forms** — e.g. the trip form shows the selected vehicle's capacity
  and flags overloads before submission.
- **Localised for India** — `₹` currency formatting throughout.
- **Offline demo mode** — a single config flag runs the entire UI on
  `localStorage` with no backend, useful for quick demos.

---

### Demo credentials

| Role          | Email                  | Password    |
| ------------- | ---------------------- | ----------- |
| Fleet Manager | fleet@transitops.com   | password123 |

Other seeded roles (Dispatcher, Safety Officer, Financial Analyst, Admin) are
listed in the project README.
