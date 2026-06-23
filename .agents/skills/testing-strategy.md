---
trigger: always_on
---

# Stratégie de Tests avec Vitest

## Philosophie Générale

**Tester le comportement métier, pas l'implémentation technique.**

## Règles Obligatoires

### ✅ Use Cases - Tests Obligatoires

**RÈGLE ABSOLUE** : Chaque use case DOIT avoir un fichier de test correspondant.

Cette règle est **non-négociable** et s'applique à **tous** les use cases sans exception.

**Exigences** :

- **Emplacement** : `__tests__/` au même niveau que le use case
- **Nommage** : `<UseCase>.test.ts` (même nom que le use case)
- **Couverture minimale obligatoire** :
  - ✅ **Scénario nominal** (happy path) - Le cas où tout fonctionne correctement
  - ✅ **Validation des entrées** - Vérifier que les données invalides sont rejetées
  - ✅ **Gestion des erreurs métier** - Tester les règles de gestion qui peuvent échouer
  - ✅ **Cas limites** (edge cases) - Valeurs nulles, tableaux vides, etc.

**Structure obligatoire** :

```
application/use-cases/
  CreateOrderUseCase.ts
  __tests__/
    CreateOrderUseCase.test.ts  ← OBLIGATOIRE
```

**Exemple minimal acceptable** :

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
      // ... autres méthodes mockées
    } as any;

    useCase = new CreateOrderUseCase(mockOrderRepo);
  });

  // ✅ OBLIGATOIRE - Scénario nominal
  it("should create order successfully", async () => {
    const result = await useCase.execute(validData);
    expect(result).toBeDefined();
    expect(mockOrderRepo.save).toHaveBeenCalled();
  });

  // ✅ OBLIGATOIRE - Validation
  it("should throw error for invalid input", async () => {
    await expect(useCase.execute(invalidData)).rejects.toThrow();
  });

  // ✅ OBLIGATOIRE - Gestion erreur métier
  it("should handle business rule violation", async () => {
    // Test des règles métier spécifiques
  });
});
```

**Conséquences du non-respect** :

- ❌ Un use case sans test est considéré comme **incomplet**
- ❌ Le code ne peut pas être mergé sans tests
- ❌ La revue de code doit systématiquement vérifier la présence des tests

### ✅ Stores - Tests Recommandés

**RÈGLE** : Les stores qui contiennent de la logique métier DOIVENT être testés.

- Si le store ne fait qu'encapsuler des use cases → Tests optionnels
- Si le store contient de la logique (calculs, transformations) → Tests obligatoires

### ✅ Adapters - Tests d'Intégration Obligatoires

**RÈGLE** : Chaque repository adapter DOIT avoir des tests d'intégration.

- Vérifier le mapping DTO ↔ Entity
- Tester la gestion des erreurs HTTP/Storage
- Valider les transformations de données

## Périmètre des Tests

### Tests Unitaires

**Cible** : Unité de comportement métier (use cases) via store ou frontière avant TanStack Query.

**Emplacement** : `__tests__/` au plus près du code testé

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

### Tests d'Intégration

**Cible** : Adapters uniquement (repositories, API clients).

**Emplacement** : `infrastructure/adapters/__tests__/`

```
infrastructure/
  adapters/
    repositories/
      ApiOrderRepository.ts
      __tests__/
        ApiOrderRepository.test.ts
```

### Tests E2E

**Statut** : Non privilégiés pour le moment.

## Tests Unitaires - Use Cases

### Principe

Tester la logique métier en isolation avec des mocks des repositories.

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

## Tests Unitaires - Stores

### Principe

Tester le comportement du store avec des mocks des use cases.

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

### Tests avec Use Cases Mockés

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

## Tests d'Intégration - Adapters

### Principe

Tester les adapters avec des mocks HTTP ou storage réels.

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

## Tests Domain Utils

### Fonctions Pures

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

## Pas de Tests sur...

### ❌ Composants (sauf UX complexe)

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

### ❌ Mappers Simples

```typescript
// DON'T test trivial mappers
// infrastructure/mappers/__tests__/productMapper.test.ts
// Unless complex transformation logic
```

### ❌ Types TypeScript

```typescript
// DON'T test types
// domain/entities/__tests__/Product.test.ts
// TypeScript checks types at compile time
```

## Configuration Vitest

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

### Scripts package.json

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

## Patterns de Tests

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

## Tests Asynchrones

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

## Tests d'État

### Vérifier les Transitions d'État

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

## Tests d'Erreurs

### Tester les Cas d'Erreur

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

## Tests de Règles Métier

### Valider les Règles de Gestion

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

## Fixtures et Test Data

### Créer des Factories

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

### Utilisation

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

### Objectifs de Couverture

- **Domain** : 100% (code métier critique)
- **Application** : 90%+ (use cases et stores)
- **Infrastructure** : 80%+ (adapters)
- **Presentation** : 0% (sauf UX complexe)

### Commandes

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

## Nommage des Tests

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

## Checklist Tests

Avant de créer des tests :

- [ ] Le code testé contient-il de la logique métier ?
- [ ] Est-ce un use case ou un store ?
- [ ] Est-ce un adapter (repository) ?
- [ ] Les dépendances sont-elles mockées ?
- [ ] Les cas d'erreur sont-ils testés ?
- [ ] Les règles métier sont-elles validées ?
- [ ] Les tests sont-ils au plus près du code ?

## Anti-Patterns

### ❌ Tester l'Implémentation

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

### ❌ Tests Fragiles

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

### ❌ Tests Couplés

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

## Références

- [Vitest Docs](https://vitest.dev/guide/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
