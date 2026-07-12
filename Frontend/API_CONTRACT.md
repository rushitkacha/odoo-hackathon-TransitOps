# TransitOps Frontend ↔ FastAPI Contract

Base URL: `/api/v1`

## Authentication

- `POST /auth/login` — OAuth2 form fields `username` (email) and `password`
- Response: `{ "access_token": "...", "token_type": "bearer", "user": {...} }`

## Core endpoints

- `GET/POST /vehicles`; `GET/PATCH/DELETE /vehicles/{id}`; `GET /vehicles/available`
- `GET/POST /drivers`; `GET/PATCH/DELETE /drivers/{id}`; `GET /drivers/available`
- `GET/POST /trips`; `POST /trips/{id}/dispatch`; `POST /trips/{id}/complete`; `POST /trips/{id}/cancel`
- `GET/POST /maintenance`; `POST /maintenance/{id}/close`
- `GET/POST /fuel-logs`; `PATCH/DELETE /fuel-logs/{id}`
- `GET/POST /expenses`; `PATCH/DELETE /expenses/{id}`
- `GET /dashboard`
- `GET /reports/vehicles`
- `GET /users`; `PATCH /users/{id}`

List endpoints accept `skip`, `limit`, `search`, `sort_by`, `sort_dir` and module filters and return:

```json
{ "items": [], "total": 0 }
```

## Exact statuses

- Vehicle: `Available`, `On Trip`, `In Shop`, `Retired`
- Driver: `Available`, `On Trip`, `Off Duty`, `Suspended`
- Trip: `Draft`, `Dispatched`, `Completed`, `Cancelled`
- Maintenance: `Active`, `Closed`

## Key fields

Vehicle: `registration_number`, `name_model`, `vehicle_type`, `max_load_capacity_kg`, `odometer_km`, `acquisition_cost`, `region`, `status`.

Driver: `name`, `license_number`, `license_category`, `license_expiry_date`, `contact_number`, `safety_score`, `status`.

Trip: `source`, `destination`, `vehicle_id`, `driver_id`, `cargo_weight_kg`, `planned_distance_km`, `actual_distance_km`, `revenue`, `status`.

Maintenance: `vehicle_id`, `maintenance_type`, `description`, `start_date`, `end_date`, `cost`, `status`.

Fuel: `vehicle_id`, optional `trip_id`, `liters`, `cost`, `date`, `odometer_km`.

Expense: `vehicle_id`, optional `trip_id`, `expense_type`, `amount`, `expense_date`, `description`.
