---
trigger: always_on
---

# Testing Strategy with Vitest

## General Philosophy

**Test business behavior, not technical implementation.**

## Mandatory Rules

### ✅ Use Cases - Mandatory Tests

**ABSOLUTE RULE**: Every use case MUST have a corresponding test file.

This rule is **non-negotiable** and applies to **all** use cases without exception.

**Requirements**:

- **Location**: `__tests__/` at the same level as the use case
- **Naming**: `<UseCase>.test.ts` (same name as the use case)
- **Minimum mandatory coverage**:
  - ✅ **Nominal scenario** (happy path) - The case where everything works correctly
  - ✅ **Input validation** - Verify that invalid data is rejected
  - ✅ **Business error handling** - Test business rules that can fail
  - ✅ **Edge cases** - Null values, empty arrays, etc.

**Mandatory structure**:

```
application/use-cases/
  CreateOrderUseCase.ts
  __tests__/
    CreateOrderUseCase.test.ts  ← MANDATORY
```

**Minimal acceptable example**:

```typescript
// application/use-cases/__tests__/CreateOrderUseCase.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateOrderUseCase } from "../CreateOrderUseCase";
import type { OrderRepository } from "@/domain/ports/OrderRepository";

describe("CreateOrderUseCase", () => {
  let useCase: CreateOrderUseCase;
  let mockOrderRepo: OrderRepository;

  beforeEach(() => {
    mockOrderRepo = {
      save: vi.fn().mockResolvedValue({ id: "1" }),
      // ... other mocked methods
    } as any;

    useCase = new CreateOrderUseCase(mockOrderRepo);
  });

  // ✅ MANDATORY - Nominal scenario
  it("should create order successfully", async () => {
    const result = await useCase.execute(validData);
    expect(result).toBeDefined();
    expect(mockOrderRepo.save).toHaveBeenCalled();
  });

  // ✅ MANDATORY - Validation
  it("should throw error for invalid input", async () => {
    await expect(useCase.execute(invalidData)).rejects.toThrow();
  });

  // ✅ MANDATORY - Business error handling
  it("should handle business rule violation", async () => {
    // Test specific business rules
  });
});
```

**Consequences of non-compliance**:

- ❌ A use case without tests is considered **incomplete**
- ❌ Code cannot be merged without tests
- ❌ Code review must systematically check for test presence

### ✅ Stores - Recommended Tests

**RULE**: Stores that contain business logic MUST be tested.

- If the store only encapsulates use cases → Tests optional
- If the store contains logic (calculations, transformations) → Tests mandatory

### ✅ Adapters - Mandatory Integration Tests

**RULE**: Every repository adapter MUST have integration tests.

- Verify DTO ↔ Entity mapping
- Test HTTP/Storage error handling
- Validate data transformations

## Test Scope

### Unit Tests

**Target**: Business behavior unit (use cases) via store or boundary before TanStack Query.

**Location**: `__tests__/` closest to the tested code

```
domain/
  usecases/
    CreateOrderUseCase.ts
    __tests__/
      CreateOrderUseCase.test.ts
application/
  stores/
    orderStore.ts
    __tests__/
      orderStore.test.ts
```

### Integration Tests

**Target**: Adapters only (repositories, API clients).

**Location**: `infrastructure/adapters/__tests__/`

```
infrastructure/
  adapters/
    repositories/
      ApiOrderRepository.ts
      __tests__/
        ApiOrderRepository.test.ts
```

### E2E Tests

**Status**: Not prioritized for now.

## Unit Tests - Use Cases

### Principle

Test business logic in isolation with mocked repositories.

```typescript
// domain/usecases/__tests__/CreateOrderUseCase.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateOrderUseCase } from "../CreateOrderUseCase";
import type { IOrderRepository } from "@/domain/ports/IOrderRepository";
import type { IProductRepository } from "@/domain/ports/IProductRepository";

describe("CreateOrderUseCase", () => {
  let useCase: CreateOrderUseCase;
  let mockOrderRepo: IOrderRepository;
  let mockProductRepo: IProductRepository;

  beforeEach(() => {
    // Mock repositories
    mockOrderRepo = {
      save: vi.fn().mockResolvedValue({ id: "1", items: [], total: 0 }),
      getById: vi.fn(),
      getAll: vi.fn(),
    };

    mockProductRepo = {
      getById: vi.fn().mockResolvedValue({
        id: "1",
        name: "Product",
        price: 10,
        stock: 5,
      }),
      getAll: vi.fn(),
    };

    useCase = new CreateOrderUseCase(mockOrderRepo, mockProductRepo);
  });

  it("should create order with valid items", async () => {
    const items = [{ productId: "1", quantity: 2 }];

    const order = await useCase.execute(items);

    expect(order).toBeDefined();
    expect(mockProductRepo.getById).toHaveBeenCalledWith("1");
    expect(mockOrderRepo.save).toHaveBeenCalled();
  });

  it("should throw error when items array is empty", async () => {
    await expect(useCase.execute([])).rejects.toThrow(
      "Order must contain at least one item",
    );
  });

  it("should throw error when product does not exist", async () => {
    mockProductRepo.getById = vi.fn().mockResolvedValue(null);
    const items = [{ productId: "999", quantity: 2 }];

    await expect(useCase.execute(items)).rejects.toThrow(
      "Product 999 not found",
    );
  });

  it("should throw error when quantity is invalid", async () => {
    const items = [{ productId: "1", quantity: 0 }];

    await expect(useCase.execute(items)).rejects.toThrow(
      "Quantity must be greater than 0",
    );
  });

  it("should throw error when insufficient stock", async () => {
    mockProductRepo.getById = vi.fn().mockResolvedValue({
      id: "1",
      stock: 1,
    });
    const items = [{ productId: "1", quantity: 5 }];

    await expect(useCase.execute(items)).rejects.toThrow(
      "Insufficient stock for product 1",
    );
  });
});
```

## Unit Tests - Stores

### Principle

Test store behavior with mocked use cases.

```typescript
// application/stores/__tests__/basketStore.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { BasketStore } from "../basketStore";

describe("BasketStore", () => {
  let store: BasketStore;

  beforeEach(() => {
    store = new BasketStore();
  });

  it("should start with empty basket", () => {
    expect(store.state.items).toEqual([]);
    expect(store.state.totalAmount).toBe(0);
  });

  it("should add item to basket", () => {
    store.addItem("product-1", 2);

    expect(store.state.items).toHaveLength(1);
    expect(store.state.items[0]).toMatchObject({
      productId: "product-1",
      quantity: 2,
    });
  });

  it("should calculate total amount correctly", () => {
    store.addItem("product-1", 2); // 2 * 10 = 20
    store.addItem("product-2", 1); // 1 * 15 = 15

    expect(store.state.totalAmount).toBe(35);
  });

  it("should remove item from basket", () => {
    store.addItem("product-1", 2);
    store.addItem("product-2", 1);

    store.removeItem("product-1");

    expect(store.state.items).toHaveLength(1);
    expect(store.state.items[0].productId).toBe("product-2");
  });

  it("should clear basket", () => {
    store.addItem("product-1", 2);
    store.addItem("product-2", 1);

    store.clear();

    expect(store.state.items).toEqual([]);
    expect(store.state.totalAmount).toBe(0);
  });

  it("should update quantity of existing item", () => {
    store.addItem("product-1", 2);
    store.updateQuantity("product-1", 5);

    expect(store.state.items[0].quantity).toBe(5);
  });
});
```

### Tests with Mocked Use Cases

```typescript
// application/stores/__tests__/orderStore.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { OrderStore } from "../orderStore";
import type { CreateOrderUseCase } from "@/domain/usecases/CreateOrderUseCase";

describe("OrderStore", () => {
  let store: OrderStore;
  let mockCreateOrderUseCase: CreateOrderUseCase;

  beforeEach(() => {
    mockCreateOrderUseCase = {
      execute: vi.fn().mockResolvedValue({
        id: "1",
        items: [],
        total: 100,
      }),
    } as any;

    store = new OrderStore(mockCreateOrderUseCase);
  });

  it("should create order successfully", async () => {
    const items = [{ productId: "1", quantity: 2 }];

    await store.createOrder(items);

    expect(store.state.order).toBeDefined();
    expect(store.state.order?.id).toBe("1");
    expect(store.state.isProcessing).toBe(false);
    expect(mockCreateOrderUseCase.execute).toHaveBeenCalledWith(items);
  });

  it("should handle error during order creation", async () => {
    mockCreateOrderUseCase.execute = vi
      .fn()
      .mockRejectedValue(new Error("Insufficient stock"));

    await store.createOrder([{ productId: "1", quantity: 2 }]);

    expect(store.state.error).toBe("Insufficient stock");
    expect(store.state.isProcessing).toBe(false);
    expect(store.state.order).toBeNull();
  });

  it("should set loading state during order creation", async () => {
    const promise = store.createOrder([{ productId: "1", quantity: 2 }]);

    expect(store.state.isProcessing).toBe(true);

    await promise;

    expect(store.state.isProcessing).toBe(false);
  });
});
```

## Integration Tests - Adapters

### Principle

Test adapters with real HTTP or storage mocks.

```typescript
// infrastructure/adapters/repositories/__tests__/ApiOrderRepository.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiOrderRepository } from "../ApiOrderRepository";
import type { ApiClient } from "@/infrastructure/adapters/api/ApiClient";
import type { Order } from "@/domain/entities/Order";

describe("ApiOrderRepository", () => {
  let repository: ApiOrderRepository;
  let mockApiClient: ApiClient;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as any;

    repository = new ApiOrderRepository(mockApiClient);
  });

  it("should fetch order by id", async () => {
    const mockDto = {
      id: "1",
      items: [{ product_id: "p1", qty: 2 }],
      total: 100,
      status: "pending",
    };

    mockApiClient.get = vi.fn().mockResolvedValue(mockDto);

    const order = await repository.getById("1");

    expect(mockApiClient.get).toHaveBeenCalledWith("/orders/1");
    expect(order).toBeDefined();
    expect(order?.id).toBe("1");
    expect(order?.items).toHaveLength(1);
    expect(order?.items[0].productId).toBe("p1");
    expect(order?.items[0].quantity).toBe(2);
  });

  it("should save order", async () => {
    const order: Order = {
      id: "1",
      items: [{ productId: "p1", quantity: 2 }],
      totalAmount: 100,
      status: "pending",
    };

    const mockDto = {
      id: "1",
      items: [{ product_id: "p1", qty: 2 }],
      total: 100,
      status: "pending",
    };

    mockApiClient.post = vi.fn().mockResolvedValue(mockDto);

    const savedOrder = await repository.save(order);

    expect(mockApiClient.post).toHaveBeenCalledWith("/orders", {
      id: "1",
      items: [{ product_id: "p1", qty: 2 }],
      total: 100,
      status: "pending",
    });
    expect(savedOrder.id).toBe("1");
  });

  it("should handle API errors", async () => {
    mockApiClient.get = vi.fn().mockRejectedValue(new Error("Network error"));

    await expect(repository.getById("1")).rejects.toThrow("Network error");
  });

  it("should map DTO to entity correctly", async () => {
    const mockDto = {
      id: "1",
      items: [{ product_id: "p1", qty: 2, price_cents: 1000 }],
      total_cents: 2000,
      status: "confirmed",
    };

    mockApiClient.get = vi.fn().mockResolvedValue(mockDto);

    const order = await repository.getById("1");

    // Verify mapping
    expect(order?.totalAmount).toBe(20); // cents to euros
    expect(order?.status).toBe("confirmed");
  });
});
```

## Domain Utils Tests

### Pure Functions

```typescript
// domain/utils/__tests__/orderValidation.test.ts
import { describe, it, expect } from "vitest";
import { validateOrderItems, calculateOrderTotal } from "../orderValidation";

describe("orderValidation", () => {
  describe("validateOrderItems", () => {
    it("should throw error for empty items", () => {
      expect(() => validateOrderItems([])).toThrow(
        "Order must contain at least one item",
      );
    });

    it("should throw error for invalid quantity", () => {
      const items = [{ productId: "1", quantity: 0 }];

      expect(() => validateOrderItems(items)).toThrow(
        "Quantity must be greater than 0",
      );
    });

    it("should pass for valid items", () => {
      const items = [
        { productId: "1", quantity: 2 },
        { productId: "2", quantity: 1 },
      ];

      expect(() => validateOrderItems(items)).not.toThrow();
    });
  });

  describe("calculateOrderTotal", () => {
    it("should calculate total correctly", () => {
      const items = [
        { productId: "1", quantity: 2, price: 10 },
        { productId: "2", quantity: 1, price: 15 },
      ];

      const total = calculateOrderTotal(items);

      expect(total).toBe(35);
    });

    it("should return 0 for empty items", () => {
      expect(calculateOrderTotal([])).toBe(0);
    });
  });
});
```

## No Tests on...

### ❌ Components (except complex UX)

```typescript
// DON'T test simple components
// presentation/components/ui/__tests__/Button.test.ts
// Not needed unless very complex UX
```

### ❌ TanStack Query/Mutations

```typescript
// DON'T test Query hooks directly
// presentation/composables/__tests__/useProducts.test.ts
// Query is already tested by TanStack
```

### ❌ Simple Mappers

```typescript
// DON'T test trivial mappers
// infrastructure/mappers/__tests__/productMapper.test.ts
// Unless complex transformation logic
```

### ❌ TypeScript Types

```typescript
// DON'T test types
// domain/entities/__tests__/Product.test.ts
// TypeScript checks types at compile time
```

## Vitest Configuration

### vite.config.ts

```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "happy-dom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "**/*.test.ts",
        "**/*.config.ts",
        "**/types/",
        "**/dtos/",
        "**/presentation/components/**", // Exclude components
      ],
    },
  },
});
```

### package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

## Test Patterns

### AAA Pattern (Arrange-Act-Assert)

```typescript
it("should add item to basket", () => {
  // Arrange
  const store = new BasketStore();
  const productId = "product-1";
  const quantity = 2;

  // Act
  store.addItem(productId, quantity);

  // Assert
  expect(store.state.items).toHaveLength(1);
  expect(store.state.items[0]).toMatchObject({ productId, quantity });
});
```

### Given-When-Then (BDD Style)

```typescript
it("should calculate discount when user is premium", () => {
  // Given
  const user = createUser({ isPremium: true });
  const product = createProduct({ price: 100 });
  const useCase = new CalculateDiscountUseCase();

  // When
  const discount = useCase.execute(user, product);

  // Then
  expect(discount).toBe(10); // 10% discount
});
```

## Mocking

### Mock Repositories

```typescript
const mockRepository: IProductRepository = {
  getAll: vi.fn().mockResolvedValue([]),
  getById: vi.fn().mockResolvedValue(null),
  save: vi.fn().mockResolvedValue(mockProduct),
  delete: vi.fn().mockResolvedValue(undefined),
};
```

### Mock Use Cases

```typescript
const mockUseCase: CreateOrderUseCase = {
  execute: vi.fn().mockResolvedValue(mockOrder),
} as any;
```

### Mock API Client

```typescript
const mockApiClient: ApiClient = {
  get: vi.fn().mockResolvedValue(mockData),
  post: vi.fn().mockResolvedValue(mockData),
  put: vi.fn().mockResolvedValue(mockData),
  delete: vi.fn().mockResolvedValue(undefined),
} as any;
```

## Asynchronous Tests

### Async/Await

```typescript
it("should load products asynchronously", async () => {
  const store = new ProductStore(mockUseCase);

  await store.loadProducts();

  expect(store.state.products).toHaveLength(3);
  expect(store.state.isLoading).toBe(false);
});
```

### Promises

```typescript
it("should reject with error", async () => {
  mockRepository.save = vi.fn().mockRejectedValue(new Error("Save failed"));

  await expect(useCase.execute(product)).rejects.toThrow("Save failed");
});
```

## State Tests

### Verify State Transitions

```typescript
it("should transition through loading states", async () => {
  const store = new ProductStore(mockUseCase);

  // Initial state
  expect(store.state.isLoading).toBe(false);
  expect(store.state.error).toBeNull();

  // Start loading
  const promise = store.loadProducts();
  expect(store.state.isLoading).toBe(true);

  // After loading
  await promise;
  expect(store.state.isLoading).toBe(false);
  expect(store.state.products).toBeDefined();
});
```

## Error Tests

### Test Error Cases

```typescript
describe("error handling", () => {
  it("should handle repository error", async () => {
    mockRepository.getAll = vi
      .fn()
      .mockRejectedValue(new Error("Network error"));

    await store.loadProducts();

    expect(store.state.error).toBe("Network error");
    expect(store.state.isLoading).toBe(false);
  });

  it("should handle validation error", async () => {
    const invalidItems = [{ productId: "1", quantity: -1 }];

    await expect(useCase.execute(invalidItems)).rejects.toThrow(
      "Quantity must be greater than 0",
    );
  });
});
```

## Business Rule Tests

### Validate Business Rules

```typescript
describe("business rules", () => {
  it("should apply 10% discount for premium users", () => {
    const user = createUser({ isPremium: true });
    const order = createOrder({ total: 100 });

    const discount = calculateDiscount(user, order);

    expect(discount).toBe(10);
  });

  it("should not allow order with insufficient stock", async () => {
    mockProductRepo.getById = vi.fn().mockResolvedValue({
      id: "1",
      stock: 1,
    });

    const items = [{ productId: "1", quantity: 5 }];

    await expect(useCase.execute(items)).rejects.toThrow("Insufficient stock");
  });

  it("should calculate shipping based on weight", () => {
    const items = [
      { productId: "1", weight: 2, quantity: 1 },
      { productId: "2", weight: 3, quantity: 2 },
    ];

    const shipping = calculateShipping(items);

    expect(shipping).toBe(8); // 2 + (3 * 2) = 8kg
  });
});
```

## Fixtures and Test Data

### Create Factories

```typescript
// domain/entities/__tests__/fixtures/productFixtures.ts
export function createTestProduct(overrides?: Partial<Product>): Product {
  return {
    id: "test-product-1",
    name: "Test Product",
    price: 10,
    stock: 5,
    category: "electronics",
    ...overrides,
  };
}

export function createTestOrder(overrides?: Partial<Order>): Order {
  return {
    id: "test-order-1",
    items: [],
    totalAmount: 0,
    status: "pending",
    ...overrides,
  };
}
```

### Usage

```typescript
it("should calculate total with discount", () => {
  const product = createTestProduct({ price: 100 });
  const order = createTestOrder({
    items: [{ productId: product.id, quantity: 2 }],
  });

  const total = calculateTotal(order, 0.1); // 10% discount

  expect(total).toBe(180); // 200 - 20
});
```

## Coverage

### Coverage Goals

- **Domain**: 100% (critical business code)
- **Application**: 90%+ (use cases and stores)
- **Infrastructure**: 80%+ (adapters)
- **Presentation**: 0% (except complex UX)

### Commands

```bash
# Run tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage report
pnpm test:coverage

# UI mode
pnpm test:ui
```

## Test Naming

### Conventions

```typescript
// ✅ GOOD - Descriptive test names
it("should add item to basket", () => {});
it("should throw error when quantity is zero", () => {});
it("should calculate total with tax", () => {});

// ❌ BAD - Vague test names
it("works", () => {});
it("test 1", () => {});
it("should work correctly", () => {});
```

### Describe Blocks

```typescript
describe("BasketStore", () => {
  describe("addItem", () => {
    it("should add item to empty basket", () => {});
    it("should update quantity if item exists", () => {});
    it("should throw error for invalid quantity", () => {});
  });

  describe("removeItem", () => {
    it("should remove item from basket", () => {});
    it("should do nothing if item not found", () => {});
  });
});
```

## Test Checklist

Before creating tests:

- [ ] Does the tested code contain business logic?
- [ ] Is it a use case or a store?
- [ ] Is it an adapter (repository)?
- [ ] Are dependencies mocked?
- [ ] Are error cases tested?
- [ ] Are business rules validated?
- [ ] Are tests closest to the code?

## Anti-Patterns

### ❌ Testing the Implementation

```typescript
// BAD - Testing implementation details
it("should call setState with correct arguments", () => {
  const spy = vi.spyOn(store, "setState");
  store.addItem("1", 2);
  expect(spy).toHaveBeenCalledWith(expect.any(Function));
});

// GOOD - Testing behavior
it("should add item to basket", () => {
  store.addItem("1", 2);
  expect(store.state.items).toHaveLength(1);
});
```

### ❌ Fragile Tests

```typescript
// BAD - Fragile test
it("should have correct structure", () => {
  expect(store.state).toEqual({
    items: [],
    totalAmount: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
  });
});

// GOOD - Test what matters
it("should start with empty basket", () => {
  expect(store.state.items).toEqual([]);
  expect(store.state.totalAmount).toBe(0);
});
```

### ❌ Coupled Tests

```typescript
// BAD - Tests depend on each other
it("test 1", () => {
  store.addItem("1", 2);
});

it("test 2", () => {
  // Assumes test 1 ran first
  expect(store.state.items).toHaveLength(1);
});

// GOOD - Independent tests
it("test 1", () => {
  store.addItem("1", 2);
  expect(store.state.items).toHaveLength(1);
});

it("test 2", () => {
  store.addItem("1", 2);
  store.addItem("2", 1);
  expect(store.state.items).toHaveLength(2);
});
```

## References

- [Vitest Docs](https://vitest.dev/guide/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
