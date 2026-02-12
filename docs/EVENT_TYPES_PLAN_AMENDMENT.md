# Event types plan – amendment (enum and categories)

This amends the event-types-and-auto-select plan with the agreed enum and category mapping.

---

## Event category enum (DB and app)

**Replace** the current `event_category` enum with:

- `sunday_service`
- `midweek_service`
- `fasting`
- `zonal_fellowship`
- `lectureship`
- `other`

**Where it appears**

- **DB:** `event_category` enum type (used by `events.category` and, in the new plan, `event_types.category`).
- **App:** [`front-end/app/lib/db/schema/enums.ts`](front-end/app/lib/db/schema/enums.ts) and backend schema equivalent; all UI that shows “service type” or “category” should use these values with clear labels (e.g. “Sunday service”, “Midweek service”, “Fasting”, “Zonal fellowship”, “Lectureship”, “Other”).

**Migration**

- Postgres: add new enum values and migrate existing rows from old values to new (e.g. `church_service` → `sunday_service`, `lecture` → `lectureship`, `other` → `other`), then drop old enum values or introduce a new type and switch the column. Use duplicate-check / safe migration pattern per project rules.

---

## Event type seed → category mapping

| Event type name    | Weekday | Category (enum)   |
|--------------------|--------|--------------------|
| Sunday Service     | 0 (Sun) | `sunday_service`   |
| Youth Class        | 1 (Mon) | `midweek_service`  |
| Bible Study        | 3 (Wed) | `midweek_service`  |
| Zonal Fellowship   | 4 (Thu) | `zonal_fellowship` |
| Zonal Fellowship   | 5 (Fri) | `zonal_fellowship` |
| Song Classes       | 6 (Sat) | `midweek_service`  |

**Note:** Song Classes is intentionally categorized as `midweek_service` so the category list stays simple; the **name** “Song Classes” still identifies it everywhere.

---

## Create service form and Settings

- **Service type** dropdown options should be the six enum values above (with human-friendly labels), not the old “Sunday / Midweek / Special”.
- Event types (Settings > Services Setup) and the Create service form should both use this same enum for the `category` field.
