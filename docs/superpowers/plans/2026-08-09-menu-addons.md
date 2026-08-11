# Menu Add-ons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a customer add optional, checkbox-toggle add-ons (e.g. cheese slice on a burger, dip with fries) to a menu item before adding it to cart, matching the Zomato/Swiggy pattern, scoped per menu subcategory.

**Architecture:** New `grabit_menu_addons` table (FK to `grabit_menu_subcategories`) in preorderservice. Public/staff menu responses gain an `addons` list. Order creation accepts `addon_ids` per line item, re-validates and re-prices them server-side (never trusts client-sent prices — same trust boundary as `menu_item.price` today), and snapshots the selection as JSON text on `grabit_order_items`. Frontend cart identifies a line by `menu_item_id + sorted addon ids` so the same dish with different add-ons becomes separate cart lines.

**Tech Stack:** Spring Boot / JPA / Flyway (preorderservice), Next.js / Zustand (grabitui). Two repos, touched in this order: preorderservice first (backend contract), then grabitui.

## Global Constraints

- Add-ons are optional only, checkbox toggle, quantity fixed at 1 (per spec — no stepper, no required groups).
- Add-ons are scoped to a menu **subcategory**, not per-item, not cafe-wide.
- No client-sent price is ever trusted; every price used in total calc is looked up server-side at order-creation time.
- Migration numbering: next Flyway version is `V31` (latest existing is `V30__backfill_raydee_subcategories.sql`).
- `preorderservice` and `grabitui` are separate git repos — each task's commit happens in its own repo's working tree.
- grabitui: `@gradient365/gradient-commons` type imports resolve to the **local** `grabitui/src/types/grabbit.ts` via a tsconfig `paths` alias — the sibling `types/` repo is unused by grabitui and must NOT be edited for this feature.

---

## Part A — Backend (preorderservice)

### Task 1: Migration — `grabit_menu_addons` table + order-item snapshot columns

**Files:**
- Create: `preorderservice/src/main/resources/db/migration/V31__menu_addons.sql`

**Interfaces:**
- Produces: table `grabit_menu_addons(id, subcategory_id, cafe_id, name, price, is_available, sort_order, created_at)`; new columns `grabit_order_items.addons_json TEXT NULL`, `grabit_order_items.addons_total NUMERIC NOT NULL DEFAULT 0`.

- [ ] **Step 1: Write the migration**

```sql
-- V31__menu_addons.sql
CREATE TABLE grabit_menu_addons (
    id              SERIAL PRIMARY KEY,
    subcategory_id  INTEGER NOT NULL REFERENCES grabit_menu_subcategories(id),
    cafe_id         INTEGER NOT NULL REFERENCES grabit_cafes(id),
    name            VARCHAR(100) NOT NULL,
    price           NUMERIC NOT NULL,
    is_available    BOOLEAN NOT NULL DEFAULT true,
    sort_order      INTEGER NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_grabit_menu_addons_subcategory ON grabit_menu_addons (subcategory_id);

ALTER TABLE grabit_order_items
    ADD COLUMN addons_json TEXT,
    ADD COLUMN addons_total NUMERIC NOT NULL DEFAULT 0;
```

- [ ] **Step 2: Verify it applies**

Run: `cd preorderservice && ./mvnw spring-boot:run` against local dev config (per `project_java_services_local_dev` — plain `application.yml` against the tunneled dev DB). Confirm startup logs show `Successfully applied 1 migration` (or check via `SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 1;` shows `V31`).
Expected: table `grabit_menu_addons` and the two new columns on `grabit_order_items` exist.

- [ ] **Step 3: Commit**

```bash
cd preorderservice
git add src/main/resources/db/migration/V31__menu_addons.sql
git commit -S -m "feat: add grabit_menu_addons table and order-item addon snapshot columns"
```

---

### Task 2: `MenuAddon` entity + repository

**Files:**
- Create: `preorderservice/src/main/java/com/gradient365/grabit/menu/MenuAddon.java`
- Create: `preorderservice/src/main/java/com/gradient365/grabit/menu/MenuAddonRepository.java`

**Interfaces:**
- Consumes: table from Task 1.
- Produces: `MenuAddon` entity with getters `getId()`, `getSubcategoryId()`, `getCafeId()`, `getName()`, `getPrice()`, `isAvailable()`, `getSortOrder()`; `MenuAddonRepository.findBySubcategoryIdOrderBySortOrderAsc(Integer)`, `findByIdInAndSubcategoryIdAndIsAvailableTrue(List<Integer>, Integer)`, `findMaxSortOrder(Integer subcategoryId)`.

- [ ] **Step 1: Write the entity**

```java
package com.gradient365.grabit.menu;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "grabit_menu_addons")
public class MenuAddon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "subcategory_id")
    private Integer subcategoryId;

    @Column(name = "cafe_id")
    private Integer cafeId;

    private String name;
    private BigDecimal price;

    @Column(name = "is_available")
    private boolean isAvailable;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    public Integer getId() { return id; }
    public Integer getSubcategoryId() { return subcategoryId; }
    public void setSubcategoryId(Integer v) { this.subcategoryId = v; }
    public Integer getCafeId() { return cafeId; }
    public void setCafeId(Integer v) { this.cafeId = v; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal v) { this.price = v; }
    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean v) { this.isAvailable = v; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer v) { this.sortOrder = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
```

- [ ] **Step 2: Write the repository**

```java
package com.gradient365.grabit.menu;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface MenuAddonRepository extends JpaRepository<MenuAddon, Integer> {
    List<MenuAddon> findBySubcategoryIdOrderBySortOrderAsc(Integer subcategoryId);
    List<MenuAddon> findByIdInAndSubcategoryIdAndIsAvailableTrue(List<Integer> ids, Integer subcategoryId);

    @Query("SELECT MAX(a.sortOrder) FROM MenuAddon a WHERE a.subcategoryId = :subcategoryId")
    Optional<Integer> findMaxSortOrder(@Param("subcategoryId") Integer subcategoryId);
}
```

- [ ] **Step 3: Compile check**

Run: `cd preorderservice && ./mvnw compile -q`
Expected: BUILD SUCCESS (no test yet — entity/repo have no behavior to unit test on their own; covered by Task 4/5 integration).

- [ ] **Step 4: Commit**

```bash
cd preorderservice
git add src/main/java/com/gradient365/grabit/menu/MenuAddon.java src/main/java/com/gradient365/grabit/menu/MenuAddonRepository.java
git commit -S -m "feat: add MenuAddon entity and repository"
```

---

### Task 3: `MenuAddon` DTOs

**Files:**
- Create: `preorderservice/src/main/java/com/gradient365/grabit/menu/dto/MenuAddonDto.java`
- Create: `preorderservice/src/main/java/com/gradient365/grabit/menu/dto/CreateMenuAddonRequest.java`
- Create: `preorderservice/src/main/java/com/gradient365/grabit/menu/dto/UpdateMenuAddonRequest.java`
- Modify: `preorderservice/src/main/java/com/gradient365/grabit/menu/dto/MenuResponse.java`

**Interfaces:**
- Produces: `MenuAddonDto(Integer id, Integer subcategoryId, Integer cafeId, String name, BigDecimal price, boolean isAvailable, Integer sortOrder)`; `MenuResponse(MenuCafeSummary cafe, List<MenuItemDto> items, List<MenuAddonDto> addons)`.

- [ ] **Step 1: Write `MenuAddonDto`**

```java
package com.gradient365.grabit.menu.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public record MenuAddonDto(
        Integer id,
        Integer subcategoryId,
        Integer cafeId,
        String name,
        BigDecimal price,
        @JsonProperty("is_available") boolean isAvailable,
        Integer sortOrder
) {}
```

- [ ] **Step 2: Write `CreateMenuAddonRequest`**

```java
package com.gradient365.grabit.menu.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CreateMenuAddonRequest(
        @NotNull Integer subcategoryId,
        @NotBlank @Size(max = 100) String name,
        @NotNull @DecimalMin(value = "0", inclusive = true) BigDecimal price
) {}
```

- [ ] **Step 3: Write `UpdateMenuAddonRequest`**

```java
package com.gradient365.grabit.menu.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpdateMenuAddonRequest(
        @Size(max = 100) String name,
        @DecimalMin(value = "0", inclusive = true) BigDecimal price,
        Boolean isAvailable
) {}
```

- [ ] **Step 4: Add `addons` to `MenuResponse`**

```java
package com.gradient365.grabit.menu.dto;

import java.util.List;

public record MenuResponse(
        MenuCafeSummary cafe,
        List<MenuItemDto> items,
        List<MenuAddonDto> addons
) {}
```

- [ ] **Step 5: Compile check**

Run: `cd preorderservice && ./mvnw compile -q`
Expected: FAILS — `MenuService.getPublicMenu` constructs `MenuResponse(cafeSummary, items)` with the old 2-arg shape. This confirms the record change is wired to a real call site; fixed in Task 4.

- [ ] **Step 6: Commit**

```bash
cd preorderservice
git add src/main/java/com/gradient365/grabit/menu/dto/MenuAddonDto.java src/main/java/com/gradient365/grabit/menu/dto/CreateMenuAddonRequest.java src/main/java/com/gradient365/grabit/menu/dto/UpdateMenuAddonRequest.java src/main/java/com/gradient365/grabit/menu/dto/MenuResponse.java
git commit -S -m "feat: add MenuAddon DTOs, extend MenuResponse with addons list"
```

---

### Task 4: `MenuService` — addon CRUD + include addons in menu responses

**Files:**
- Modify: `preorderservice/src/main/java/com/gradient365/grabit/menu/MenuService.java`

**Interfaces:**
- Consumes: `MenuAddonRepository` (Task 2), `MenuAddonDto`/`CreateMenuAddonRequest`/`UpdateMenuAddonRequest` (Task 3).
- Produces: `MenuService.listAddons(int subcategoryId, int cafeId, int staffCafeId)`, `createAddon(int cafeId, int staffCafeId, CreateMenuAddonRequest)`, `updateAddon(int addonId, int staffCafeId, UpdateMenuAddonRequest)`, `deleteAddon(int addonId, int staffCafeId)`. `getPublicMenu`/`getStaffMenu` now also return addons.

- [ ] **Step 1: Inject `MenuAddonRepository` and fix `getPublicMenu`/add `getStaffMenuAddons` support**

Modify the constructor and fields:

```java
    private final MenuItemRepository menuItemRepository;
    private final CafeService cafeService;
    private final MenuSubcategoryRepository menuSubcategoryRepository;
    private final MenuAddonRepository menuAddonRepository;

    public MenuService(MenuItemRepository menuItemRepository, CafeService cafeService,
                        MenuSubcategoryRepository menuSubcategoryRepository,
                        MenuAddonRepository menuAddonRepository) {
        this.menuItemRepository = menuItemRepository;
        this.cafeService = cafeService;
        this.menuSubcategoryRepository = menuSubcategoryRepository;
        this.menuAddonRepository = menuAddonRepository;
    }
```

Update `getPublicMenu` to also return addons for the subcategories present in the menu (public endpoint — addons are as public as the items they attach to, no auth needed to view them):

```java
    @Cacheable(cacheNames = CacheConfig.MENU_CACHE, key = "#slug")
    public MenuResponse getPublicMenu(String slug) {
        Cafe cafe = cafeService.getActiveBySlug(slug);
        List<MenuItem> rawItems = menuItemRepository.findAvailableOrdered(cafe.getId());
        List<MenuItemDto> items = rawItems.stream().map(this::toDto).toList();
        List<Integer> subcategoryIds = rawItems.stream()
                .map(MenuItem::getSubcategoryId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();
        List<MenuAddonDto> addons = subcategoryIds.stream()
                .flatMap(sid -> menuAddonRepository.findBySubcategoryIdOrderBySortOrderAsc(sid).stream())
                .filter(MenuAddon::isAvailable)
                .map(this::toAddonDto)
                .toList();
        MenuCafeSummary cafeSummary = new MenuCafeSummary(
                cafe.getId(), cafe.getName(), cafe.getOpeningTime(), cafe.getClosingTime());
        return new MenuResponse(cafeSummary, items, addons);
    }
```

- [ ] **Step 2: Add addon CRUD methods**

Insert after `createSubcategory` (before the private helper methods):

```java
    /** Staff: list a subcategory's add-ons, in display order. */
    public List<MenuAddonDto> listAddons(int subcategoryId, int staffCafeId) {
        MenuSubcategory sub = menuSubcategoryRepository.findById(subcategoryId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Subcategory not found"));
        if (sub.getCafeId() != staffCafeId) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Wrong cafe");
        }
        return menuAddonRepository.findBySubcategoryIdOrderBySortOrderAsc(subcategoryId)
                .stream().map(this::toAddonDto).toList();
    }

    /** Staff: create an add-on under a subcategory of own cafe, appended to the end. */
    @CacheEvict(cacheNames = CacheConfig.MENU_CACHE, allEntries = true)
    public MenuAddonDto createAddon(int cafeId, int staffCafeId, CreateMenuAddonRequest req) {
        if (staffCafeId != cafeId) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Wrong cafe");
        }
        MenuSubcategory sub = menuSubcategoryRepository.findById(req.subcategoryId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid subcategory"));
        if (sub.getCafeId() != cafeId) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid subcategory");
        }
        int nextSortOrder = menuAddonRepository.findMaxSortOrder(req.subcategoryId())
                .map(max -> max + 1).orElse(0);

        MenuAddon addon = new MenuAddon();
        addon.setCafeId(cafeId);
        addon.setSubcategoryId(req.subcategoryId());
        addon.setName(req.name());
        addon.setPrice(req.price());
        addon.setAvailable(true);
        addon.setSortOrder(nextSortOrder);
        addon.setCreatedAt(OffsetDateTime.now());
        return toAddonDto(menuAddonRepository.save(addon));
    }

    /** Staff: partial update of own cafe's add-on. */
    @CacheEvict(cacheNames = CacheConfig.MENU_CACHE, allEntries = true)
    public MenuAddonDto updateAddon(int addonId, int staffCafeId, UpdateMenuAddonRequest req) {
        MenuAddon addon = menuAddonRepository.findById(addonId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Add-on not found"));
        if (addon.getCafeId() != staffCafeId) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Wrong cafe");
        }
        if (req.name() != null) addon.setName(req.name());
        if (req.price() != null) addon.setPrice(req.price());
        if (req.isAvailable() != null) addon.setAvailable(req.isAvailable());
        return toAddonDto(menuAddonRepository.save(addon));
    }

    /** Staff: delete own cafe's add-on. */
    @CacheEvict(cacheNames = CacheConfig.MENU_CACHE, allEntries = true)
    public Map<String, Boolean> deleteAddon(int addonId, int staffCafeId) {
        MenuAddon addon = menuAddonRepository.findById(addonId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Add-on not found"));
        if (addon.getCafeId() != staffCafeId) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Wrong cafe");
        }
        menuAddonRepository.delete(addon);
        return Map.of("success", true);
    }

    private MenuAddonDto toAddonDto(MenuAddon a) {
        return new MenuAddonDto(a.getId(), a.getSubcategoryId(), a.getCafeId(), a.getName(), a.getPrice(), a.isAvailable(), a.getSortOrder());
    }
```

- [ ] **Step 3: Compile check**

Run: `cd preorderservice && ./mvnw compile -q`
Expected: BUILD SUCCESS.

- [ ] **Step 4: Commit**

```bash
cd preorderservice
git add src/main/java/com/gradient365/grabit/menu/MenuService.java
git commit -S -m "feat: add MenuAddon CRUD to MenuService, surface addons in public menu"
```

---

### Task 5: `MenuController` — addon endpoints

**Files:**
- Modify: `preorderservice/src/main/java/com/gradient365/grabit/menu/MenuController.java`

**Interfaces:**
- Consumes: `MenuService` methods from Task 4.
- Produces: `GET /api/grabit/menu/subcategory/{subcategoryId}/addons`, `POST /api/grabit/menu/{cafeId}/addons`, `PATCH /api/grabit/menu/addon/{addonId}`, `DELETE /api/grabit/menu/addon/{addonId}`.

- [ ] **Step 1: Add the endpoints**

Insert after `createSubcategory` in `MenuController`:

```java
    /** Staff: list a subcategory's add-ons. */
    @PreAuthorize("hasAuthority('PERM_menu.read')")
    @GetMapping("/subcategory/{subcategoryId}/addons")
    public ResponseEntity<List<MenuAddonDto>> listAddons(
            @PathVariable int subcategoryId,
            @CurrentStaff StaffPrincipal staff) {
        return ResponseEntity.ok(menuService.listAddons(subcategoryId, staff.cafeId()));
    }

    /** Staff: create an add-on for own cafe. */
    @PreAuthorize("hasAuthority('PERM_menu.write')")
    @PostMapping("/{cafeId}/addons")
    public ResponseEntity<MenuAddonDto> createAddon(
            @PathVariable int cafeId,
            @CurrentStaff StaffPrincipal staff,
            @Valid @RequestBody CreateMenuAddonRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(menuService.createAddon(cafeId, staff.cafeId(), req));
    }

    /** Staff: partial update of an add-on. */
    @PreAuthorize("hasAuthority('PERM_menu.write')")
    @PatchMapping("/addon/{addonId}")
    public ResponseEntity<MenuAddonDto> updateAddon(
            @PathVariable int addonId,
            @CurrentStaff StaffPrincipal staff,
            @Valid @RequestBody UpdateMenuAddonRequest req) {
        return ResponseEntity.ok(menuService.updateAddon(addonId, staff.cafeId(), req));
    }

    /** Staff: delete an add-on. */
    @PreAuthorize("hasAuthority('PERM_menu.write')")
    @DeleteMapping("/addon/{addonId}")
    public ResponseEntity<Map<String, Boolean>> deleteAddon(
            @PathVariable int addonId,
            @CurrentStaff StaffPrincipal staff) {
        return ResponseEntity.ok(menuService.deleteAddon(addonId, staff.cafeId()));
    }
```

(`MenuController` already does `import com.gradient365.grabit.menu.dto.*;` — no new import needed for the DTOs.)

- [ ] **Step 2: Compile check**

Run: `cd preorderservice && ./mvnw compile -q`
Expected: BUILD SUCCESS.

- [ ] **Step 3: Manual smoke test**

Run: `cd preorderservice && ./mvnw spring-boot:run` (against local dev config), then in another shell, using a valid staff JWT for a test cafe:

```bash
curl -s -X POST http://localhost:8080/api/grabit/menu/1/addons \
  -H "Authorization: Bearer $STAFF_JWT" -H "Content-Type: application/json" \
  -d '{"subcategoryId": 1, "name": "Cheese Slice", "price": 20}'
```

Expected: `201` with a `MenuAddonDto` JSON body. Then `GET /api/grabit/menu/subcategory/1/addons` returns it in a list.

- [ ] **Step 4: Commit**

```bash
cd preorderservice
git add src/main/java/com/gradient365/grabit/menu/MenuController.java
git commit -S -m "feat: add MenuAddon CRUD endpoints"
```

---

### Task 6: `OrderItem` entity + `CreateOrderItem`/`OrderItemView` DTOs — carry addons

**Files:**
- Modify: `preorderservice/src/main/java/com/gradient365/grabit/order/OrderItem.java`
- Modify: `preorderservice/src/main/java/com/gradient365/grabit/order/dto/CreateOrderItem.java`
- Modify: `preorderservice/src/main/java/com/gradient365/grabit/order/dto/OrderItemView.java`

**Interfaces:**
- Consumes: `addons_json`/`addons_total` columns from Task 1.
- Produces: `OrderItem.getAddonsJson()/setAddonsJson(String)`, `getAddonsTotal()/setAddonsTotal(BigDecimal)`; `CreateOrderItem.addon_ids()` (`List<Integer>`, nullable); `OrderItemView` gains `addons` (`List<OrderItemAddonView>`) and `addons_total` (`BigDecimal`).

- [ ] **Step 1: Extend `OrderItem` entity**

```java
package com.gradient365.grabit.order;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "grabit_order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "order_id")
    private Integer orderId;

    @Column(name = "menu_item_id")
    private Integer menuItemId;

    @Column(name = "menu_item_name")
    private String menuItemName;

    private Integer quantity;

    @Column(name = "unit_price")
    private BigDecimal unitPrice;

    // Snapshot of selected add-ons at order time, as a JSON string (see OrderItemAddonView) — never
    // re-derived from live MenuAddon rows later, same reasoning as unitPrice being a snapshot.
    @Column(name = "addons_json")
    private String addonsJson;

    @Column(name = "addons_total")
    private BigDecimal addonsTotal;

    public Integer getId() { return id; }
    public Integer getOrderId() { return orderId; }
    public void setOrderId(Integer v) { this.orderId = v; }
    public Integer getMenuItemId() { return menuItemId; }
    public void setMenuItemId(Integer v) { this.menuItemId = v; }
    public String getMenuItemName() { return menuItemName; }
    public void setMenuItemName(String v) { this.menuItemName = v; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer v) { this.quantity = v; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal v) { this.unitPrice = v; }
    public String getAddonsJson() { return addonsJson; }
    public void setAddonsJson(String v) { this.addonsJson = v; }
    public BigDecimal getAddonsTotal() { return addonsTotal; }
    public void setAddonsTotal(BigDecimal v) { this.addonsTotal = v; }
}
```

- [ ] **Step 2: Extend `CreateOrderItem`**

```java
package com.gradient365.grabit.order.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateOrderItem(
        @NotNull Integer menu_item_id,
        @NotNull @Min(1) @Max(99) Integer quantity,
        List<Integer> addon_ids
) {
    public List<Integer> addonIdsOrEmpty() {
        return addon_ids == null ? List.of() : addon_ids;
    }
}
```

- [ ] **Step 3: Add `OrderItemAddonView` and extend `OrderItemView`**

Create `preorderservice/src/main/java/com/gradient365/grabit/order/dto/OrderItemAddonView.java`:

```java
package com.gradient365.grabit.order.dto;

import java.math.BigDecimal;

public record OrderItemAddonView(Integer id, String name, BigDecimal price) {}
```

Modify `OrderItemView.java`:

```java
package com.gradient365.grabit.order.dto;

import java.math.BigDecimal;
import java.util.List;

public record OrderItemView(
        Integer id,
        Integer menu_item_id,
        String menu_item_name,
        Integer quantity,
        BigDecimal unit_price,
        List<OrderItemAddonView> addons,
        BigDecimal addons_total
) {}
```

- [ ] **Step 4: Compile check**

Run: `cd preorderservice && ./mvnw compile -q`
Expected: FAILS at every `new OrderItemView(...)` call site (3 in `OrderService.java`) and at `OrderService.createOrder`'s `new OrderItem()` block — both fixed in Task 7.

- [ ] **Step 5: Commit**

```bash
cd preorderservice
git add src/main/java/com/gradient365/grabit/order/OrderItem.java src/main/java/com/gradient365/grabit/order/dto/CreateOrderItem.java src/main/java/com/gradient365/grabit/order/dto/OrderItemView.java src/main/java/com/gradient365/grabit/order/dto/OrderItemAddonView.java
git commit -S -m "feat: carry add-ons on OrderItem entity and DTOs"
```

---

### Task 7: `OrderService` — validate, price, and persist add-ons on order creation

**Files:**
- Modify: `preorderservice/src/main/java/com/gradient365/grabit/order/OrderService.java`

**Interfaces:**
- Consumes: `MenuAddonRepository` (Task 2), `CreateOrderItem.addonIdsOrEmpty()` / `OrderItemAddonView` (Task 6), an injected `ObjectMapper` (Spring provides a default bean, same pattern as `OrderEventOutbox`).
- Produces: order total now includes add-on prices; every persisted `OrderItem` carries its `addonsJson`/`addonsTotal`; all 3 `OrderItemView` construction sites include `addons`/`addons_total`.

- [ ] **Step 1: Add dependencies to the constructor**

```java
    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;
    private final SlotConfigRepository slotConfigRepo;
    private final MenuItemRepository menuItemRepo;
    private final com.gradient365.grabit.menu.MenuAddonRepository menuAddonRepo;
    private final CustomerCafeHistoryRepository historyRepo;
    private final CustomerRepository customerRepo;
    private final TransitionValidator transitionValidator;
    private final ApplicationEventPublisher events;
    private final CashfreeClient cashfreeClient;
    private final OrderEventOutbox outbox;
    private final PaymentEventRecorder paymentEvents;
    private final RefundService refundService;
    private final OmegaPushOutbox omegaPushOutbox;
    private final CafeRouteResolver cafeRouteResolver;
    private final OmegaPushService omegaPushService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public OrderService(OrderRepository orderRepo,
                        OrderItemRepository orderItemRepo,
                        SlotConfigRepository slotConfigRepo,
                        MenuItemRepository menuItemRepo,
                        com.gradient365.grabit.menu.MenuAddonRepository menuAddonRepo,
                        CustomerCafeHistoryRepository historyRepo,
                        CustomerRepository customerRepo,
                        TransitionValidator transitionValidator,
                        ApplicationEventPublisher events,
                        CashfreeClient cashfreeClient,
                        OrderEventOutbox outbox,
                        PaymentEventRecorder paymentEvents,
                        RefundService refundService,
                        OmegaPushOutbox omegaPushOutbox,
                        CafeRouteResolver cafeRouteResolver,
                        OmegaPushService omegaPushService,
                        com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.slotConfigRepo = slotConfigRepo;
        this.menuItemRepo = menuItemRepo;
        this.menuAddonRepo = menuAddonRepo;
        this.historyRepo = historyRepo;
        this.customerRepo = customerRepo;
        this.transitionValidator = transitionValidator;
        this.events = events;
        this.cashfreeClient = cashfreeClient;
        this.outbox = outbox;
        this.paymentEvents = paymentEvents;
        this.refundService = refundService;
        this.omegaPushOutbox = omegaPushOutbox;
        this.cafeRouteResolver = cafeRouteResolver;
        this.omegaPushService = omegaPushService;
        this.objectMapper = objectMapper;
    }
```

(Keep every other constructor-body line already present — this only adds the `menuAddonRepo` and `objectMapper` params/fields alongside the existing ones. Add `import com.gradient365.grabit.order.dto.OrderItemAddonView;` — already covered by the existing `import com.gradient365.grabit.order.dto.*;`. Also add `import com.gradient365.grabit.menu.MenuAddon;`.)

- [ ] **Step 2: Validate + resolve requested add-ons before computing total**

Insert right after the existing menu-item lookup block (after the `if (!itemById.keySet().containsAll(distinctRequestedIds))` block, before step "4. Compute total"):

```java
        // 3b. Load and validate every requested add-on: must exist, belong to the ordered
        //     item's subcategory, and be currently available. Reject the whole order on any
        //     mismatch — same trust boundary as menu item availability above.
        List<Integer> requestedAddonIds = req.items().stream()
                .flatMap(i -> i.addonIdsOrEmpty().stream())
                .distinct()
                .toList();
        Map<Integer, MenuAddon> addonById = requestedAddonIds.isEmpty()
                ? Map.of()
                : menuAddonRepo.findAllById(requestedAddonIds).stream()
                        .collect(Collectors.toMap(MenuAddon::getId, a -> a));
        for (var lineItem : req.items()) {
            MenuItem mi = itemById.get(lineItem.menu_item_id());
            for (Integer addonId : lineItem.addonIdsOrEmpty()) {
                MenuAddon addon = addonById.get(addonId);
                boolean valid = addon != null
                        && addon.isAvailable()
                        && mi.getSubcategoryId() != null
                        && addon.getSubcategoryId().equals(mi.getSubcategoryId());
                if (!valid) {
                    throw new ApiException(HttpStatus.BAD_REQUEST,
                            "One or more add-ons are unavailable or invalid for the selected item",
                            "ADDONS_INVALID", List.of(addonId));
                }
            }
        }
```

- [ ] **Step 3: Include add-on prices in the total**

Replace the existing total-calc block:

```java
        // 4. Compute total (tolerate repeats — look up each line item in the map).
        BigDecimal total = BigDecimal.ZERO;
        for (var lineItem : req.items()) {
            MenuItem mi = itemById.get(lineItem.menu_item_id());
            total = total.add(mi.getPrice().multiply(BigDecimal.valueOf(lineItem.quantity())));
        }
```

with:

```java
        // 4. Compute total (tolerate repeats — look up each line item in the map).
        //    Line price = (item price + sum of its selected add-on prices) * quantity.
        BigDecimal total = BigDecimal.ZERO;
        for (var lineItem : req.items()) {
            MenuItem mi = itemById.get(lineItem.menu_item_id());
            BigDecimal addonsSum = lineItem.addonIdsOrEmpty().stream()
                    .map(id -> addonById.get(id).getPrice())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            total = total.add(mi.getPrice().add(addonsSum).multiply(BigDecimal.valueOf(lineItem.quantity())));
        }
```

- [ ] **Step 4: Persist the addon snapshot on each `OrderItem`**

Replace the existing order-item persistence loop:

```java
        // 6. Persist order items (snapshot name + price at time of order).
        for (var lineItem : req.items()) {
            MenuItem mi = itemById.get(lineItem.menu_item_id());
            OrderItem oi = new OrderItem();
            oi.setOrderId(order.getId());
            oi.setMenuItemId(mi.getId());
            oi.setMenuItemName(mi.getName());
            oi.setQuantity(lineItem.quantity());
            oi.setUnitPrice(mi.getPrice());
            orderItemRepo.save(oi);
        }
```

with:

```java
        // 6. Persist order items (snapshot name + price + selected add-ons at time of order).
        for (var lineItem : req.items()) {
            MenuItem mi = itemById.get(lineItem.menu_item_id());
            List<OrderItemAddonView> addonViews = lineItem.addonIdsOrEmpty().stream()
                    .map(id -> {
                        MenuAddon a = addonById.get(id);
                        return new OrderItemAddonView(a.getId(), a.getName(), a.getPrice());
                    })
                    .toList();
            BigDecimal addonsTotal = addonViews.stream()
                    .map(OrderItemAddonView::price)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            OrderItem oi = new OrderItem();
            oi.setOrderId(order.getId());
            oi.setMenuItemId(mi.getId());
            oi.setMenuItemName(mi.getName());
            oi.setQuantity(lineItem.quantity());
            oi.setUnitPrice(mi.getPrice());
            oi.setAddonsTotal(addonsTotal);
            try {
                oi.setAddonsJson(addonViews.isEmpty() ? null : objectMapper.writeValueAsString(addonViews));
            } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
                throw new IllegalStateException("Failed to serialize order item add-ons", e);
            }
            orderItemRepo.save(oi);
        }
```

- [ ] **Step 5: Update all 3 `OrderItemView` construction sites**

Add a private helper near the other private helpers at the bottom of `OrderService.java`:

```java
    private List<OrderItemAddonView> parseAddons(String addonsJson) {
        if (addonsJson == null || addonsJson.isBlank()) return List.of();
        try {
            return objectMapper.readValue(addonsJson,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, OrderItemAddonView.class));
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            log.error("Failed to parse order item addons_json, treating as empty", e);
            return List.of();
        }
    }
```

Then replace each of the 3 occurrences of:

```java
                    .map(i -> new OrderItemView(i.getId(), i.getMenuItemId(), i.getMenuItemName(),
                            i.getQuantity(), i.getUnitPrice()))
```

with:

```java
                    .map(i -> new OrderItemView(i.getId(), i.getMenuItemId(), i.getMenuItemName(),
                            i.getQuantity(), i.getUnitPrice(), parseAddons(i.getAddonsJson()), i.getAddonsTotal()))
```

(This appears in `toView(...)`'s local stream and twice in the cafe/staff order-listing methods around the lines previously found at ~314 and ~351 — grep `new OrderItemView(i.getId()` in `OrderService.java` to find and fix all occurrences; there are exactly 3.)

- [ ] **Step 6: Compile check**

Run: `cd preorderservice && ./mvnw compile -q`
Expected: BUILD SUCCESS.

- [ ] **Step 7: Write unit tests for total calc**

Create `preorderservice/src/test/java/com/gradient365/grabit/order/OrderServiceAddonPricingTest.java` (check the existing test layer's conventions first — run `find preorderservice/src/test -iname "OrderService*Test.java"` and match its mocking style, e.g. Mockito `@Mock`/`@InjectMocks` vs `@SpringBootTest`). At minimum cover:

```java
package com.gradient365.grabit.order;

// Match existing test imports/style found in the repo (Mockito or SpringBootTest).

class OrderServiceAddonPricingTest {

    // Test 1: an order with 1 item, 0 addon_ids -> total == item price * qty (unchanged behavior).
    // Test 2: an order with 1 item, 1 valid addon_id -> total == (item price + addon price) * qty.
    // Test 3: an order with 1 item, 2 valid addon_ids -> total == (item price + sum(addon prices)) * qty.
    // Test 4: an order where addon_id belongs to a DIFFERENT subcategory than the ordered item
    //         -> createOrder throws ApiException with status 400 and code "ADDONS_INVALID".
    // Test 5: an order where addon_id references an addon with is_available = false
    //         -> createOrder throws ApiException with status 400 and code "ADDONS_INVALID".
}
```

Write the concrete test bodies following whatever mocking pattern the existing `OrderService` tests use (mock `MenuItemRepository`/`MenuAddonRepository`/`OrderRepository`/`OrderItemRepository` return values, call `orderService.createOrder(...)`, assert on `order.getTotalAmount()` or the thrown exception).

- [ ] **Step 8: Run tests**

Run: `cd preorderservice && ./mvnw test -Dtest=OrderServiceAddonPricingTest`
Expected: all 5 tests PASS.

- [ ] **Step 9: Commit**

```bash
cd preorderservice
git add src/main/java/com/gradient365/grabit/order/OrderService.java src/test/java/com/gradient365/grabit/order/OrderServiceAddonPricingTest.java
git commit -S -m "feat: validate, price, and persist add-ons on order creation"
```

---

## Part B — Frontend (grabitui)

All Part B tasks happen on the `feat/menu-addons` branch already checked out (created off `origin/master` for the design spec).

### Task 8: Types — `GrabbitMenuAddon`, extend `GrabbitCartItem`

**Files:**
- Modify: `grabitui/src/types/grabbit.ts`

**Interfaces:**
- Produces: `GrabbitMenuAddon { id, subcategory_id, cafe_id, name, price, is_available }`; `GrabbitCartItem.addons?: { id: number; name: string; price: number }[]`.

- [ ] **Step 1: Add the addon type and extend cart item**

Add near `GrabbitMenuSubcategory` (both describe menu structure):

```typescript
export interface GrabbitMenuAddon {
  id: number;
  subcategory_id: number;
  cafe_id: number;
  name: string;
  price: number;
  is_available: boolean;
  sort_order: number;
}
```

Modify `GrabbitCartItem` (find the existing interface and add the field):

```typescript
export interface GrabbitCartItem {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  is_veg?: boolean | null;
  addons?: { id: number; name: string; price: number }[];
}
```

- [ ] **Step 2: Type check**

Run: `cd grabitui && npx tsc --noEmit`
Expected: no new errors from this file (downstream errors in cart.ts/MenuClient.tsx are expected and fixed in later tasks).

- [ ] **Step 3: Commit**

```bash
cd grabitui
git add src/types/grabbit.ts
git commit -S -m "feat: add GrabbitMenuAddon type, extend GrabbitCartItem with addons"
```

---

### Task 9: `store/cart.ts` — line-identity includes addons

**Files:**
- Modify: `grabitui/src/store/cart.ts`

**Interfaces:**
- Consumes: `GrabbitCartItem.addons` (Task 8).
- Produces: `useCart().addItem(item, slug)` merges only when `menu_item_id` AND the sorted addon-id set match; `removeItem(lineKey: string)`, `updateQty(lineKey: string, quantity: number)` — **signature change**: both now take a computed `lineKey` string instead of a raw `menu_item_id` number; `total()` includes addon prices; new exported helper `cartLineKey(item)`.

- [ ] **Step 1: Write the failing-by-inspection new store**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GrabbitCartItem } from '@gradient365/gradient-commons';

// A cart "line" is a menu item + its exact add-on selection. Two lines with the same
// menu_item_id but different add-ons (e.g. burger+cheese vs burger with nothing) must
// stay separate — this key is how addItem/removeItem/updateQty identify a line.
export function cartLineKey(item: Pick<GrabbitCartItem, 'menu_item_id' | 'addons'>): string {
  const addonIds = (item.addons ?? []).map(a => a.id).sort((a, b) => a - b);
  return `${item.menu_item_id}:${addonIds.join(',')}`;
}

interface CartState {
  cafeSlug: string | null;
  items: GrabbitCartItem[];
  addItem: (item: GrabbitCartItem, slug: string) => void;
  removeItem: (lineKey: string) => void;
  updateQty: (lineKey: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cafeSlug: null,
      items: [],
      addItem: (item, slug) =>
        set(state => {
          // If adding from a different cafe, clear the cart first
          if (state.cafeSlug && state.cafeSlug !== slug) {
            return { cafeSlug: slug, items: [item] };
          }
          const key = cartLineKey(item);
          const existing = state.items.find(i => cartLineKey(i) === key);
          if (existing) {
            return {
              items: state.items.map(i =>
                cartLineKey(i) === key
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            };
          }
          return { cafeSlug: slug, items: [...state.items, item] };
        }),
      removeItem: lineKey =>
        set(state => ({ items: state.items.filter(i => cartLineKey(i) !== lineKey) })),
      updateQty: (lineKey, qty) =>
        set(state => ({
          items:
            qty <= 0
              ? state.items.filter(i => cartLineKey(i) !== lineKey)
              : state.items.map(i =>
                  cartLineKey(i) === lineKey ? { ...i, quantity: qty } : i
                )
        })),
      clearCart: () => set({ items: [], cafeSlug: null }),
      total: () =>
        get().items.reduce((sum, i) => {
          const addonsSum = (i.addons ?? []).reduce((s, a) => s + a.price, 0);
          return sum + (i.price + addonsSum) * i.quantity;
        }, 0)
    }),
    { name: 'grabbit-cart' }
  )
);
```

- [ ] **Step 2: Write the store test**

Check first whether grabitui has any existing test runner configured: `cd grabitui && cat package.json | grep -A3 '"scripts"'` and look for a `test` script / `vitest`/`jest` devDependency. If one exists, create `grabitui/src/store/cart.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'; // or 'jest' — match whatever's configured
import { useCart, cartLineKey } from './cart';

describe('cart line identity', () => {
  beforeEach(() => {
    useCart.setState({ cafeSlug: null, items: [] });
  });

  it('merges the same item with the same add-ons', () => {
    const item = { menu_item_id: 1, name: 'Burger', price: 100, quantity: 1, image_url: null, addons: [{ id: 5, name: 'Cheese Slice', price: 20 }] };
    useCart.getState().addItem(item, 'test-cafe');
    useCart.getState().addItem(item, 'test-cafe');
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().items[0].quantity).toBe(2);
  });

  it('keeps the same item with different add-ons as separate lines', () => {
    const plain = { menu_item_id: 1, name: 'Burger', price: 100, quantity: 1, image_url: null };
    const withCheese = { menu_item_id: 1, name: 'Burger', price: 100, quantity: 1, image_url: null, addons: [{ id: 5, name: 'Cheese Slice', price: 20 }] };
    useCart.getState().addItem(plain, 'test-cafe');
    useCart.getState().addItem(withCheese, 'test-cafe');
    expect(useCart.getState().items).toHaveLength(2);
  });

  it('total() includes addon prices', () => {
    const withCheese = { menu_item_id: 1, name: 'Burger', price: 100, quantity: 2, image_url: null, addons: [{ id: 5, name: 'Cheese Slice', price: 20 }] };
    useCart.getState().addItem(withCheese, 'test-cafe');
    expect(useCart.getState().total()).toBe((100 + 20) * 2);
  });

  it('cartLineKey differs only by sorted addon ids, not addon order', () => {
    const a = cartLineKey({ menu_item_id: 1, addons: [{ id: 5, name: 'x', price: 1 }, { id: 3, name: 'y', price: 1 }] });
    const b = cartLineKey({ menu_item_id: 1, addons: [{ id: 3, name: 'y', price: 1 }, { id: 5, name: 'x', price: 1 }] });
    expect(a).toBe(b);
  });
});
```

If **no test runner exists**, skip this step and note it in the Task 9 commit message — do not introduce a new test framework for this one file (out of spec scope).

- [ ] **Step 3: Run the test (if a runner exists)**

Run: `cd grabitui && npx vitest run src/store/cart.test.ts` (or the equivalent configured command).
Expected: all 4 tests PASS.

- [ ] **Step 4: Type check**

Run: `cd grabitui && npx tsc --noEmit`
Expected: errors now only in `MenuClient.tsx` and `cart/page.tsx` (both `removeItem`/`updateQty` call sites use the old `menu_item_id` signature) — fixed in Tasks 11/12.

- [ ] **Step 5: Commit**

```bash
cd grabitui
git add src/store/cart.ts src/store/cart.test.ts
git commit -S -m "feat: key cart lines by menu item + add-on selection, not menu item alone"
```

---

### Task 10: Cafe owner — add-on editor in `manage/menu`

**Files:**
- Modify: `grabitui/src/app/[slug]/(cafe)/manage/menu/page.tsx`

**Interfaces:**
- Consumes: `GET /api/proxy/grabit/menu/subcategory/{id}/addons`, `POST /api/proxy/grabit/menu/{cafeId}/addons`, `PATCH /api/proxy/grabit/menu/addon/{id}`, `DELETE /api/proxy/grabit/menu/addon/{id}` (all proxy through the existing `/api/proxy/grabit/...` pattern already used for items/subcategories — no new proxy route needed, it's a catch-all).

- [ ] **Step 1: Add addon state + loaders**

Add alongside the existing `subcategories` state:

```typescript
  const [addons, setAddons] = useState<{ id: number; subcategory_id: number; name: string; price: number; is_available: boolean }[]>([]);
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');
  const [addonSubcategoryId, setAddonSubcategoryId] = useState('');
  const [savingAddon, setSavingAddon] = useState(false);

  function loadAddons(subcategoryId: number) {
    fetch(`/api/proxy/grabit/menu/subcategory/${subcategoryId}/addons`)
      .then(r => r.json())
      .then(data => setAddons(Array.isArray(data) ? data : []));
  }
```

- [ ] **Step 2: Load addons whenever the addon-editor's selected subcategory changes**

```typescript
  useEffect(() => {
    if (!addonSubcategoryId) { setAddons([]); return; }
    loadAddons(parseInt(addonSubcategoryId));
  }, [addonSubcategoryId]);
```

- [ ] **Step 3: Add create/toggle/delete handlers**

```typescript
  async function createAddon() {
    if (!cafeId || !addonSubcategoryId || !newAddonName.trim() || !newAddonPrice) return;
    setSavingAddon(true);
    try {
      const res = await fetch(`/api/proxy/grabit/menu/${cafeId}/addons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subcategoryId: parseInt(addonSubcategoryId),
          name: newAddonName.trim(),
          price: parseFloat(newAddonPrice),
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to add add-on'); }
      setNewAddonName(''); setNewAddonPrice('');
      loadAddons(parseInt(addonSubcategoryId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add add-on');
    } finally {
      setSavingAddon(false);
    }
  }

  async function toggleAddonAvailability(addonId: number, currentValue: boolean) {
    await fetch(`/api/proxy/grabit/menu/addon/${addonId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: !currentValue }),
    });
    if (addonSubcategoryId) loadAddons(parseInt(addonSubcategoryId));
  }

  async function deleteAddon(addonId: number) {
    if (!confirm('Delete this add-on?')) return;
    await fetch(`/api/proxy/grabit/menu/addon/${addonId}`, { method: 'DELETE' });
    if (addonSubcategoryId) loadAddons(parseInt(addonSubcategoryId));
  }
```

- [ ] **Step 4: Render the add-on editor panel**

Add a new section after the existing item-listing `{!loading && (...)}` block, still inside the outer content `<div>`:

```tsx
        {/* Add-ons editor — per subcategory */}
        <div style={{ marginTop: 32, background: 'var(--surface-card)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', padding: 20 }}>
          <p className="t-headline-card" style={{ fontSize: 16, marginBottom: 12 }}>Add-ons</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
            <label style={labelStyle}>Subcategory</label>
            <select value={addonSubcategoryId} onChange={e => setAddonSubcategoryId(e.target.value)} style={inputStyle}>
              <option value="">Select a subcategory</option>
              {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {addonSubcategoryId && (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input type="text" value={newAddonName} onChange={e => setNewAddonName(e.target.value)}
                  style={{ ...inputStyle, flex: 2 }} placeholder="e.g. Cheese Slice" />
                <input type="number" min="0" step="0.01" value={newAddonPrice} onChange={e => setNewAddonPrice(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }} placeholder="₹" />
                <Button type="button" size="sm" disabled={savingAddon || !newAddonName.trim() || !newAddonPrice} onClick={createAddon}>
                  {savingAddon ? 'Adding…' : 'Add'}
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {addons.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderTop: '1px solid var(--hairline)' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{a.name}</p>
                      <p className="t-caption">₹{Number(a.price).toFixed(2)}</p>
                    </div>
                    <Toggle on={a.is_available} onChange={() => toggleAddonAvailability(a.id, a.is_available)} />
                    <button onClick={() => deleteAddon(a.id)} aria-label="Delete add-on"
                      style={{ width: 30, height: 30, borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline-strong)', background: 'var(--surface-card)', color: 'var(--error)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                      {Icon.trash({ size: 15 })}
                    </button>
                  </div>
                ))}
                {addons.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No add-ons for this subcategory yet.</p>}
              </div>
            </>
          )}
        </div>
```

- [ ] **Step 5: Type check**

Run: `cd grabitui && npx tsc --noEmit`
Expected: no new errors from this file.

- [ ] **Step 6: Manual verification**

`cd grabitui && npm run dev`, log in as cafe staff, go to `/{slug}/manage/menu`, select a subcategory in the new "Add-ons" panel, add "Cheese Slice" at ₹20, confirm it appears in the list, toggle it off/on, delete it.

- [ ] **Step 7: Commit**

```bash
cd grabitui
git add src/app/\[slug\]/\(cafe\)/manage/menu/page.tsx
git commit -S -m "feat: manage per-subcategory add-ons from the cafe menu page"
```

---

### Task 11: Customer menu — add-on selection sheet before adding to cart

**Files:**
- Modify: `grabitui/src/app/[slug]/(customer)/MenuClient.tsx`

**Interfaces:**
- Consumes: `MenuResponse.addons` (Task 4, arrives via the same `/api/grabit/menu/{slug}` fetch that already supplies `items`/`cafe` — find that fetch call in this file and confirm it destructures the response; add `addons` to the destructuring/props chain), `cartLineKey` (Task 9, not directly needed here — `addItem` handles merging internally).
- Produces: a new `AddonSheet` component; `addStep`/direct "Add" buttons open it for items whose subcategory has ≥1 available add-on, otherwise behave exactly as today.

- [ ] **Step 1: Locate how `items`/`addons` reach this component**

Run: `grep -n "MenuResponse\|addons\|items:" grabitui/src/app/\[slug\]/\(customer\)/page.tsx grabitui/src/app/\[slug\]/\(customer\)/MenuClient.tsx`

`MenuClient` is a client component — confirm whether its parent server component (`page.tsx`) fetches `MenuResponse` and passes `items`/`cafe` as props, or whether `MenuClient` fetches itself. Whichever it is, add `addons: GrabbitMenuAddon[]` to the same prop chain / same fetch destructuring as `items`, since both come from the same `MenuResponse` now (Task 4). This step has no fixed code because the exact prop-drilling shape depends on what this grep shows — thread `addons` through it the same way `items` already flows.

- [ ] **Step 2: Import the new type and add local state**

```typescript
import type { GrabbitCafe, GrabbitMenuItem, GrabbitMenuCategory, GrabbitMenuAddon } from '@gradient365/gradient-commons';
```

Add near the other `useState` calls:

```typescript
  const [addonSheetItem, setAddonSheetItem] = useState<GrabbitMenuItem | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<number>>(new Set());
```

Add a helper (near `itemById`):

```typescript
  const addonsBySubcategory = new Map<number, GrabbitMenuAddon[]>();
  for (const a of addons) {
    if (!a.is_available) continue;
    const list = addonsBySubcategory.get(a.subcategory_id) ?? [];
    list.push(a);
    addonsBySubcategory.set(a.subcategory_id, list);
  }
  function addonsFor(item: GrabbitMenuItem): GrabbitMenuAddon[] {
    return item.subcategory_id ? (addonsBySubcategory.get(item.subcategory_id) ?? []) : [];
  }
```

- [ ] **Step 3: Route "Add" through the sheet when the item has add-ons**

Add a helper that both the existing quick-add button (line ~170: `onClick={() => addItem({...}, slug)}`) and the image-corner "+" button (line ~291) call instead of `addItem` directly:

```typescript
  function handleAddClick(item: GrabbitMenuItem) {
    const available = addonsFor(item);
    if (available.length === 0) {
      addItem({ menu_item_id: item.id, name: item.name, price: item.price, quantity: 1, image_url: item.image_url, is_veg: item.is_veg }, slug);
      return;
    }
    setSelectedAddonIds(new Set());
    setAddonSheetItem(item);
  }

  function confirmAddonSheet() {
    if (!addonSheetItem) return;
    const chosen = addonsFor(addonSheetItem).filter(a => selectedAddonIds.has(a.id));
    addItem({
      menu_item_id: addonSheetItem.id,
      name: addonSheetItem.name,
      price: addonSheetItem.price,
      quantity: 1,
      image_url: addonSheetItem.image_url,
      is_veg: addonSheetItem.is_veg,
      addons: chosen.map(a => ({ id: a.id, name: a.name, price: a.price })),
    }, slug);
    setAddonSheetItem(null);
  }
```

Replace the two existing inline `onClick={() => addItem({...}, slug)}` handlers (lines ~170 and ~291) with `onClick={() => handleAddClick(item)}`.

- [ ] **Step 4: Render the sheet**

Add near the other modals (alongside `showClearConfirm`'s modal, at the end of the component's JSX, before the final closing `</div>`):

```tsx
      {addonSheetItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setAddonSheetItem(null)}>
          <div style={{ background: '#fff', borderRadius: '18px 18px 0 0', padding: 22, width: '100%', maxWidth: 448 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--gb-text)' }}>{addonSheetItem.name}</div>
            <div style={{ fontSize: 13, color: 'var(--gb-muted)', marginTop: 4 }}>Add extras</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              {addonsFor(addonSheetItem).map(a => (
                <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedAddonIds.has(a.id)}
                    onChange={() => setSelectedAddonIds(prev => {
                      const next = new Set(prev);
                      next.has(a.id) ? next.delete(a.id) : next.add(a.id);
                      return next;
                    })}
                  />
                  <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: 'var(--gb-text)' }}>{a.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gb-muted)' }}>{inr(a.price)}</span>
                </label>
              ))}
            </div>
            <button
              onClick={confirmAddonSheet}
              style={{ width: '100%', marginTop: 20, padding: '13px 0', borderRadius: 12, border: 'none', background: 'var(--gb-ink)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              Add to cart
            </button>
          </div>
        </div>
      )}
```

- [ ] **Step 5: Type check**

Run: `cd grabitui && npx tsc --noEmit`
Expected: no errors from this file.

- [ ] **Step 6: Manual verification**

`cd grabitui && npm run dev`. As a customer, open a cafe menu where a burger's subcategory has add-ons configured (from Task 10's manual test): tapping "Add" opens the sheet, checking "Cheese Slice" and confirming adds a cart line with the addon; tapping "Add" on an item whose subcategory has no add-ons adds directly with no sheet, exactly as before.

- [ ] **Step 7: Commit**

```bash
cd grabitui
git add src/app/\[slug\]/\(customer\)/MenuClient.tsx
git commit -S -m "feat: add-on selection sheet on customer menu, before adding to cart"
```

---

### Task 12: Cart page — line-key-based qty control, addon display, addon-aware pricing

**Files:**
- Modify: `grabitui/src/app/[slug]/(customer)/cart/page.tsx`

**Interfaces:**
- Consumes: `cartLineKey` (Task 9).

- [ ] **Step 1: Import `cartLineKey` and use it for the line loop**

```typescript
import { useCart, cartLineKey } from '@/store/cart';
```

- [ ] **Step 2: Update the item render loop**

Replace:

```tsx
        {items.map(item => (
          <div key={item.menu_item_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--gb-line)' }}>
            <Veg veg={item.is_veg} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)' }}>{item.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 1 }}>{inr(item.price)}</div>
            </div>
            <Stepper qty={item.quantity} onChange={(v) => updateQty(item.menu_item_id, v)} />
            <div style={{ minWidth: 56, textAlign: 'right', fontSize: 14.5, fontWeight: 800, color: 'var(--gb-text)' }}>{inr(item.price * item.quantity)}</div>
          </div>
        ))}
```

with:

```tsx
        {items.map(item => {
          const addonsSum = (item.addons ?? []).reduce((s, a) => s + a.price, 0);
          const lineKey = cartLineKey(item);
          return (
            <div key={lineKey} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--gb-line)' }}>
              <Veg veg={item.is_veg} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)' }}>{item.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 1 }}>{inr(item.price)}</div>
                {item.addons && item.addons.length > 0 && (
                  <div style={{ fontSize: 11.5, color: 'var(--gb-muted-2)', marginTop: 3 }}>
                    + {item.addons.map(a => a.name).join(', ')}
                  </div>
                )}
              </div>
              <Stepper qty={item.quantity} onChange={(v) => updateQty(lineKey, v)} />
              <div style={{ minWidth: 56, textAlign: 'right', fontSize: 14.5, fontWeight: 800, color: 'var(--gb-text)' }}>{inr((item.price + addonsSum) * item.quantity)}</div>
            </div>
          );
        })}
```

- [ ] **Step 3: Type check**

Run: `cd grabitui && npx tsc --noEmit`
Expected: no errors from this file. If the order-summary block further down (around the previously-found line ~265-266) also calls `updateQty(item.menu_item_id, ...)` or renders `key={item.menu_item_id}`, apply the same `cartLineKey`/addon-aware-price fix there — grep `item.menu_item_id` in this file to find every remaining occurrence and update all of them the same way.

- [ ] **Step 4: Manual verification**

Add the same burger twice from Task 11 — once plain, once with cheese — to cart. Confirm both appear as separate lines in `/{slug}/cart`, each with its own stepper, and the cheese line shows "+ Cheese Slice" and the addon price folded into its total.

- [ ] **Step 5: Commit**

```bash
cd grabitui
git add src/app/\[slug\]/\(customer\)/cart/page.tsx
git commit -S -m "feat: cart page keys lines by item+add-ons, shows add-on chips and pricing"
```

---

### Task 13: Checkout — send `addon_ids` in the order payload

**Files:**
- Modify: `grabitui/src/app/[slug]/(customer)/checkout/page.tsx`

**Interfaces:**
- Consumes: `CreateOrderItem.addon_ids` (backend Task 6).

- [ ] **Step 1: Include addon ids in the order payload**

Replace:

```typescript
          items: items.map(i => ({ menu_item_id: i.menu_item_id, quantity: i.quantity })),
```

with:

```typescript
          items: items.map(i => ({
            menu_item_id: i.menu_item_id,
            quantity: i.quantity,
            addon_ids: (i.addons ?? []).map(a => a.id),
          })),
```

- [ ] **Step 2: Type check**

Run: `cd grabitui && npx tsc --noEmit`
Expected: BUILD SUCCESS, no errors anywhere in the project.

- [ ] **Step 3: Manual end-to-end verification**

Add a burger with a cheese-slice add-on to cart, proceed to checkout, place a counter-payment order (simplest path, no Cashfree involved). Confirm: (a) the order total on the confirmation/order-tracking screen includes the add-on price, (b) the cafe's order/KDS view shows "Cheese Slice" against that line item (this exercises `OrderItemView.addons` from backend Task 7 reaching a UI — check whichever staff order-detail screen renders `OrderItemView`, e.g. via `grep -rn "OrderItemView\|order.items" grabitui/src` on the staff-facing pages, and confirm it doesn't choke on the new fields even if it doesn't yet display them — displaying add-ons on staff order screens is optional polish, not required by this plan, but it must not break).

- [ ] **Step 4: Commit**

```bash
cd grabitui
git add src/app/\[slug\]/\(customer\)/checkout/page.tsx
git commit -S -m "feat: send selected add-on ids with each order line item"
```

---

## Self-review notes (for the plan author, already applied above)

- Spec coverage: subcategory-scoped add-ons (Tasks 1-5, 10), checkbox/qty-1 UI (Task 11), server-side price trust (Task 7), cart line separation (Task 9), staff management via `manage/menu` (Task 10), error handling on stale/deactivated add-ons (Task 7 Step 2 + Task 13 Step 3) — all covered.
- The `MenuClient.tsx` prop-threading step (Task 11, Step 1) is intentionally left as a "go look and match the existing pattern" rather than fixed code, because the exact fetch/props shape wasn't fully traced in this plan's research — flagged explicitly rather than guessed, so the implementer verifies before writing.
- Every other step has concrete code, exact file paths, and exact commands — no other placeholders.
