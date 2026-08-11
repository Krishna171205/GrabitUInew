# Menu Add-ons — Design Spec

Date: 2026-08-09
Status: approved, pending implementation plan

## Problem

Customers cannot customize orders (e.g. "add cheese slice" to a burger, "add dip" to fries) the way Zomato/Swiggy allow. `GrabbitMenuItem` / `GrabbitCartItem` / `GrabbitOrderItem` have no add-on/modifier concept today (verified: neither the local `grabitui/src/types/grabbit.ts` nor the sibling `types/` package — which is unused by grabitui, shadowed by a tsconfig `paths` alias — has any such field).

## Scope (v1)

- Add-ons are **optional only** (no required/min-max groups).
- Selection UI is a **checkbox toggle**, quantity fixed at 1 (no stepper).
- Add-ons are scoped to a **menu subcategory** (e.g. all items under "Burgers" share the same add-on list; "Fries" has its own). Not per-item, not cafe-wide.
- Cafe owner manages the add-on list per subcategory from the existing `manage/menu` page.

Out of scope: required customization groups, multi-quantity add-ons, per-item (as opposed to per-subcategory) add-on lists, relational addon-sales reporting (JSON persistence chosen over a child table — see below).

## Data model

### New table: `grabit_menu_addons`

```
id              serial PK
subcategory_id  int FK -> grabit_menu_subcategories(id)
cafe_id         int   -- denormalized, matches existing MenuItem/MenuSubcategory pattern
name            text
price           numeric
is_available    boolean default true
sort_order      int
```

### `grabit_order_items` — persist selected add-ons as JSON

Add nullable `addons` jsonb column: `[{"id": 1, "name": "Cheese Slice", "price": 20.00}]`.

Chosen over a relational `grabit_order_item_addons` child table: qty is fixed at 1, no reporting requirement in v1, and JSON avoids a new entity/repo/migration surface for a snapshot value that's never queried standalone. Revisit if per-addon sales reporting is asked for later.

Add nullable `addons_total` numeric column to `grabit_order_items` (sum of the JSON addon prices, snapshotted) so existing `unit_price` keeps its current meaning (base item price only) and receipts/refunds can itemize base vs. add-ons without re-parsing JSON.

## Backend (preorderservice)

- `MenuAddon` JPA entity (`grabit_menu_addons`) + `MenuAddonRepository`.
- CRUD endpoints on the existing menu controller, scoped under a subcategory (list/create/update/delete), mirroring the current `MenuSubcategory` CRUD shape.
- `CreateOrderItem` DTO gains `addon_ids: List<Integer>` (nullable/empty allowed). Client sends **IDs only** — never prices; server resolves each ID to a live `MenuAddon` row.
- `OrderService.createOrder`:
  - For each line item, validate every `addon_id` (a) exists, (b) belongs to the ordered menu item's `subcategory_id`, (c) `is_available = true`. Reject the whole order (400) on any mismatch — same trust boundary already applied to `menu_item.is_available`.
  - Total calc becomes `sum((menuItem.price + sum(selected addon prices)) * quantity)`.
  - Persist `OrderItem.addons` (JSON) and `OrderItem.addonsTotal` per line; `unitPrice` stays base-item-only as today.
- `OrderItemView` / `GrabitOrderWithItems` (and any KDS/order-tracking read DTOs that surface order items) gain the addon list so kitchen staff and the customer's order-tracking screen both show what was added.

## Frontend — cafe owner (`manage/menu`)

New add-on editor per subcategory in `grabitui/src/app/[slug]/(cafe)/manage/menu/page.tsx`: add/edit/delete add-ons (name, price, availability toggle), reusing the list-editor UI pattern already used for subcategories on that page.

## Frontend — customer (menu → cart → checkout)

- `GrabbitMenuItem` (`types/grabbit.ts`) already has `subcategory_id`; no change needed there. New `GrabbitMenuAddon` type: `{ id, subcategory_id, name, price, is_available }`.
- `MenuClient.tsx`: tapping an item whose subcategory has ≥1 available add-on opens a small selection sheet (item name/price + checkbox list of that subcategory's add-ons) before "Add to cart." Items in subcategories with no add-ons keep today's direct-add behavior — no modal shown.
- `GrabbitCartItem` gains `addons?: { id: number; name: string; price: number }[]`.
- `store/cart.ts`:
  - `addItem` merge key changes from `menu_item_id` alone to `menu_item_id` + sorted `addon ids` — the same burger with different add-ons must be separate cart lines, not merged into one.
  - `total()` sums `(item.price + (item.addons?.reduce(sum price) ?? 0)) * item.quantity`.
- `cart/page.tsx` and checkout: render addon names as chips/sub-line under each cart line item; price already folded into that line's total, no separate line-item math needed in the UI.

## Error handling

- Cafe owner deletes/deactivates an add-on that's sitting in a customer's persisted cart (zustand `persist`, can be stale across sessions): order creation re-validates server-side (see above) and rejects with a clear message; frontend surfaces it the same way it already handles "item no longer available" at checkout.
- No client-sent price is ever trusted — every price used in total calc is looked up server-side from `MenuAddon`/`MenuItem` at order-creation time.

## Testing

- Backend: unit tests on `OrderService` total calc — 0 add-ons, 1 add-on, multiple add-ons; a rejected case where `addon_id` belongs to a different subcategory than the ordered item.
- Frontend: `store/cart.ts` test for the new merge-key behavior (same item + different addon sets stay separate lines; same item + same addon set merges as today).
- No end-to-end/UI test infra changes proposed — grabitui has no existing test setup for this layer beyond manual QA; out of scope for this spec to introduce one.
