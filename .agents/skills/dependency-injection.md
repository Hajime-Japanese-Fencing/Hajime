---
trigger: always_on
---

# Dependency Injection and Inversion

## SOLID Principles

### Dependency Inversion Principle (DIP)

**Rule**: High-level modules should not depend on low-level modules. Both should depend on abstractions.

```typescript
// ❌ BAD - High-level depends on low-level
class OrderService {
  private repository = new ApiOrderRepository(); // Direct dependency!

  async createOrder(items: OrderItem[]) {
    return this.repository.save(items);
  }
}

// ✅ GOOD - Both depend on abstraction
interface IOrderRepository {
  save(items: OrderItem[]): Promise<Order>;
}

class OrderService {
  constructor(private repository: IOrderRepository) {} // Depends on interface

  async createOrder(items: OrderItem[]) {
    return this.repository.save(items);
  }
}

class ApiOrderRepository implements IOrderRepository {
  async save(items: OrderItem[]): Promise<Order> {
    // Implementation
  }
}
```

## Ports and Adapters

### Ports (Interfaces)

Defined in the **Domain**, represent business needs.

```typescript
// domain/ports/IProductRepository.ts
export interface IProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  save(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}

// domain/ports/INotificationService.ts
export interface INotificationService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendSMS(to: string, message: string): Promise<void>;
}

// domain/ports/IStorageService.ts
export interface IStorageService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}
```

### Adapters (Implementations)

Defined in **Infrastructure**, implement the ports.

```typescript
// infrastructure/adapters/repositories/ApiProductRepository.ts
export class ApiProductRepository implements IProductRepository {
  constructor(private apiClient: ApiClient) {}

  async getAll(): Promise<Product[]> {
    const dtos = await this.apiClient.get<ProductDTO[]>("/products");
    return dtos.map(mapProductFromApi);
  }

  async getById(id: string): Promise<Product | null> {
    const dto = await this.apiClient.get<ProductDTO>(`/products/${id}`);
    return dto ? mapProductFromApi(dto) : null;
  }

  async save(product: Product): Promise<Product> {
    const dto = mapProductToApi(product);
    const savedDto = await this.apiClient.post<ProductDTO>("/products", dto);
    return mapProductFromApi(savedDto);
  }

  async delete(id: string): Promise<void> {
    await this.apiClient.delete(`/products/${id}`);
  }
}

// infrastructure/adapters/repositories/LocalStorageProductRepository.ts
export class LocalStorageProductRepository implements IProductRepository {
  constructor(private storage: IStorageService) {}

  async getAll(): Promise<Product[]> {
    return this.storage.get<Product[]>("products") || [];
  }

  async save(product: Product): Promise<Product> {
    const products = await this.getAll();
    const index = products.findIndex((p) => p.id === product.id);

    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }

    this.storage.set("products", products);
    return product;
  }

  // ... other methods
}
```

## Container Pattern

### Container Responsibilities

1. **Create** dependency instances
2. **Inject** dependencies into constructors
3. **Manage** lifecycle (singletons, transients)
4. **Expose** public services

### Implementation

```typescript
// application/container.ts
import type { IProductRepository } from "@/domain/ports/IProductRepository";
import type { IOrderRepository } from "@/domain/ports/IOrderRepository";
import { ApiProductRepository } from "@/infrastructure/adapters/repositories/ApiProductRepository";
import { ApiOrderRepository } from "@/infrastructure/adapters/repositories/ApiOrderRepository";
import { ApiClient } from "@/infrastructure/adapters/api/ApiClient";
import { GetAllProductsUseCase } from "@/domain/usecases/GetAllProductsUseCase";
import { CreateOrderUseCase } from "@/domain/usecases/CreateOrderUseCase";
import { ProductStore } from "./stores/productStore";
import { OrderStore } from "./stores/orderStore";

export class Container {
  // Infrastructure - Singletons
  private readonly apiClient = new ApiClient(import.meta.env.VITE_API_URL);

  // Repositories - Singletons
  private readonly productRepository: IProductRepository = new ApiProductRepository(this.apiClient);

  private readonly orderRepository: IOrderRepository = new ApiOrderRepository(this.apiClient);

  // Use Cases - Transients (new instance each time)
  public getGetAllProductsUseCase(): GetAllProductsUseCase {
    return new GetAllProductsUseCase(this.productRepository);
  }

  public getCreateOrderUseCase(): CreateOrderUseCase {
    return new CreateOrderUseCase(this.orderRepository, this.productRepository);
  }

  // Stores - Singletons
  public readonly productStore = new ProductStore(this.getGetAllProductsUseCase());

  public readonly orderStore = new OrderStore(this.getCreateOrderUseCase());

  // Expose repositories for testing/advanced use
  public getProductRepository(): IProductRepository {
    return this.productRepository;
  }

  public getOrderRepository(): IOrderRepository {
    return this.orderRepository;
  }
}

// Global singleton instance
export const container = new Container();
```

## Injection into Use Cases

### Constructor Injection

```typescript
// domain/usecases/CreateOrderUseCase.ts
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productRepository: IProductRepository,
    private readonly notificationService: INotificationService,
  ) {}

  async execute(items: OrderItem[]): Promise<Order> {
    // Validate items
    validateOrderItems(items);

    // Check products availability
    for (const item of items) {
      const product = await this.productRepository.getById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
    }

    // Create order
    const order = createOrder(items);
    const savedOrder = await this.orderRepository.save(order);

    // Send notification
    await this.notificationService.sendEmail(
      "admin@example.com",
      "New Order",
      `Order ${savedOrder.id} created`,
    );

    return savedOrder;
  }
}
```

### Benefits

- ✅ Testability: Easy to mock dependencies
- ✅ Flexibility: Change implementation without modifying the use case
- ✅ Clarity: Dependencies are explicit
- ✅ Reusability: Use case independent from infrastructure

## Injection into Stores

### Constructor Injection

```typescript
// application/stores/productStore.ts
export class ProductStore extends Store<ProductState> {
  constructor(
    private readonly getAllProductsUseCase: GetAllProductsUseCase,
    private readonly searchProductsUseCase: SearchProductsUseCase,
  ) {
    super({
      products: [],
      isLoading: false,
      error: null,
      searchQuery: "",
    });
  }

  async loadProducts() {
    this.setState((state) => ({ ...state, isLoading: true, error: null }));

    try {
      const products = await this.getAllProductsUseCase.execute();
      this.setState((state) => ({ ...state, products, isLoading: false }));
    } catch (error) {
      this.setState((state) => ({
        ...state,
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      }));
    }
  }

  async searchProducts(query: string) {
    this.setState((state) => ({
      ...state,
      searchQuery: query,
      isLoading: true,
    }));

    try {
      const products = await this.searchProductsUseCase.execute(query);
      this.setState((state) => ({ ...state, products, isLoading: false }));
    } catch (error) {
      this.setState((state) => ({
        ...state,
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      }));
    }
  }
}
```

## Injection into Components

### Via Container

```vue
<script setup lang="ts">
import { container } from "@/application/container";

// ✅ GOOD - Get from container
const productStore = container.productStore;
const orderStore = container.orderStore;

// Access use cases if needed
const createOrderUseCase = container.getCreateOrderUseCase();
</script>
```

### Provide/Inject (Alternative)

For specific cases where the container is not sufficient.

```typescript
// main.ts
import { createApp } from "vue";
import { container } from "@/application/container";

const app = createApp(App);

app.provide("container", container);
```

```vue
<script setup lang="ts">
import { inject } from "vue";
import type { Container } from "@/application/container";

const container = inject<Container>("container")!;
const productStore = container.productStore;
</script>
```

## Environment Configuration

### Configuration Injection

```typescript
// infrastructure/config/ApiConfig.ts
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

// infrastructure/adapters/api/ApiClient.ts
export class ApiClient {
  constructor(private config: ApiConfig) {}

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.config.baseUrl}${path}`, {
      signal: AbortSignal.timeout(this.config.timeout),
    });
    return response.json();
  }
}

// application/container.ts
export class Container {
  private readonly apiConfig: ApiConfig = {
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
    timeout: 30000,
    retries: 3,
  };

  private readonly apiClient = new ApiClient(this.apiConfig);
}
```

## Tests with Injection

### Testing Use Cases

```typescript
// domain/usecases/__tests__/CreateOrderUseCase.test.ts
describe("CreateOrderUseCase", () => {
  let useCase: CreateOrderUseCase;
  let mockOrderRepo: IOrderRepository;
  let mockProductRepo: IProductRepository;
  let mockNotificationService: INotificationService;

  beforeEach(() => {
    // Create mocks
    mockOrderRepo = {
      save: vi.fn().mockResolvedValue(mockOrder),
    } as any;

    mockProductRepo = {
      getById: vi.fn().mockResolvedValue(mockProduct),
    } as any;

    mockNotificationService = {
      sendEmail: vi.fn().mockResolvedValue(undefined),
    } as any;

    // Inject mocks
    useCase = new CreateOrderUseCase(mockOrderRepo, mockProductRepo, mockNotificationService);
  });

  it("should create order and send notification", async () => {
    const items = [{ productId: "1", quantity: 2 }];

    await useCase.execute(items);

    expect(mockOrderRepo.save).toHaveBeenCalled();
    expect(mockNotificationService.sendEmail).toHaveBeenCalled();
  });
});
```

### Testing Stores

```typescript
// application/stores/__tests__/productStore.test.ts
describe("ProductStore", () => {
  let store: ProductStore;
  let mockGetAllUseCase: GetAllProductsUseCase;

  beforeEach(() => {
    mockGetAllUseCase = {
      execute: vi.fn().mockResolvedValue([mockProduct]),
    } as any;

    store = new ProductStore(mockGetAllUseCase);
  });

  it("should load products", async () => {
    await store.loadProducts();

    expect(store.state.products).toHaveLength(1);
    expect(mockGetAllUseCase.execute).toHaveBeenCalled();
  });
});
```

### Testing Adapters

```typescript
// infrastructure/adapters/__tests__/ApiProductRepository.test.ts
describe("ApiProductRepository", () => {
  let repository: ApiProductRepository;
  let mockApiClient: ApiClient;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
    } as any;

    repository = new ApiProductRepository(mockApiClient);
  });

  it("should fetch products", async () => {
    mockApiClient.get = vi.fn().mockResolvedValue([mockDto]);

    const products = await repository.getAll();

    expect(mockApiClient.get).toHaveBeenCalledWith("/products");
    expect(products).toHaveLength(1);
  });
});
```

## Advanced Patterns

### Factory Pattern

For creating complex instances.

```typescript
// application/factories/RepositoryFactory.ts
export class RepositoryFactory {
  constructor(private apiClient: ApiClient) {}

  createProductRepository(): IProductRepository {
    return new ApiProductRepository(this.apiClient);
  }

  createOrderRepository(): IOrderRepository {
    return new ApiOrderRepository(this.apiClient);
  }
}

// application/container.ts
export class Container {
  private readonly apiClient = new ApiClient(config);
  private readonly repositoryFactory = new RepositoryFactory(this.apiClient);

  private readonly productRepository = this.repositoryFactory.createProductRepository();
  private readonly orderRepository = this.repositoryFactory.createOrderRepository();
}
```

### Strategy Pattern

For injecting different strategies.

```typescript
// domain/ports/IPaymentStrategy.ts
export interface IPaymentStrategy {
  process(amount: number): Promise<PaymentResult>;
}

// infrastructure/adapters/payment/CreditCardPayment.ts
export class CreditCardPayment implements IPaymentStrategy {
  async process(amount: number): Promise<PaymentResult> {
    // Credit card processing
  }
}

// infrastructure/adapters/payment/PayPalPayment.ts
export class PayPalPayment implements IPaymentStrategy {
  async process(amount: number): Promise<PaymentResult> {
    // PayPal processing
  }
}

// domain/usecases/ProcessPaymentUseCase.ts
export class ProcessPaymentUseCase {
  constructor(private paymentStrategy: IPaymentStrategy) {}

  async execute(amount: number): Promise<PaymentResult> {
    return this.paymentStrategy.process(amount);
  }
}

// application/container.ts
export class Container {
  public getProcessPaymentUseCase(method: "card" | "paypal"): ProcessPaymentUseCase {
    const strategy = method === "card" ? new CreditCardPayment() : new PayPalPayment();

    return new ProcessPaymentUseCase(strategy);
  }
}
```

## Dependency Lifecycle

### Singleton

A single shared instance across the entire application.

```typescript
export class Container {
  // ✅ Singleton - Created once
  public readonly productStore = new ProductStore(this.getGetAllProductsUseCase());

  private readonly apiClient = new ApiClient(config);

  private readonly productRepository = new ApiProductRepository(this.apiClient);
}
```

### Transient

New instance on each request.

```typescript
export class Container {
  // ✅ Transient - New instance each call
  public getCreateOrderUseCase(): CreateOrderUseCase {
    return new CreateOrderUseCase(this.orderRepository, this.productRepository);
  }

  public getSearchProductsUseCase(): SearchProductsUseCase {
    return new SearchProductsUseCase(this.productRepository);
  }
}
```

### When to Use Which?

**Singleton:**

- Stores (shared state)
- Repositories (no state, just methods)
- API Clients (shared configuration)
- Stateless services

**Transient:**

- Use Cases (if temporary state)
- Services with temporary state
- Configurable strategies

## Dependency Composition

### Use Case Depending on Other Use Cases

```typescript
// domain/usecases/PlaceOrderUseCase.ts
export class PlaceOrderUseCase {
  constructor(
    private readonly validateOrderUseCase: ValidateOrderUseCase,
    private readonly calculateShippingUseCase: CalculateShippingUseCase,
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly sendConfirmationUseCase: SendConfirmationUseCase,
  ) {}

  async execute(items: OrderItem[], address: Address): Promise<Order> {
    // Orchestrate multiple use cases
    await this.validateOrderUseCase.execute(items);

    const shipping = await this.calculateShippingUseCase.execute(items, address);

    const order = await this.createOrderUseCase.execute(items, shipping);

    await this.sendConfirmationUseCase.execute(order);

    return order;
  }
}

// application/container.ts
export class Container {
  public getPlaceOrderUseCase(): PlaceOrderUseCase {
    return new PlaceOrderUseCase(
      this.getValidateOrderUseCase(),
      this.getCalculateShippingUseCase(),
      this.getCreateOrderUseCase(),
      this.getSendConfirmationUseCase(),
    );
  }
}
```

## Multi-Environment Configuration

### Environment-Based Injection

```typescript
// application/container.ts
export class Container {
  private readonly productRepository: IProductRepository;

  constructor() {
    // Choose implementation based on environment
    if (import.meta.env.MODE === "development") {
      this.productRepository = new FakeProductRepository();
    } else if (import.meta.env.MODE === "test") {
      this.productRepository = new MockProductRepository();
    } else {
      this.productRepository = new ApiProductRepository(this.apiClient);
    }
  }
}
```

### Feature Flags

```typescript
export class Container {
  private readonly orderRepository: IOrderRepository;

  constructor() {
    const useNewOrderApi = import.meta.env.VITE_USE_NEW_ORDER_API === "true";

    this.orderRepository = useNewOrderApi
      ? new ApiV2OrderRepository(this.apiClient)
      : new ApiOrderRepository(this.apiClient);
  }
}
```

## Lazy Loading

### Lazy Initialization

To optimize application startup.

```typescript
export class Container {
  private _productRepository?: IProductRepository;

  public get productRepository(): IProductRepository {
    if (!this._productRepository) {
      this._productRepository = new ApiProductRepository(this.apiClient);
    }
    return this._productRepository;
  }

  // Or with getter method
  public getProductRepository(): IProductRepository {
    if (!this._productRepository) {
      this._productRepository = new ApiProductRepository(this.apiClient);
    }
    return this._productRepository;
  }
}
```

## Testing the Container

### Testing the Container Itself

```typescript
// application/__tests__/container.test.ts
import { describe, it, expect } from "vitest";
import { Container } from "../container";

describe("Container", () => {
  it("should create singleton stores", () => {
    const container = new Container();

    const store1 = container.productStore;
    const store2 = container.productStore;

    expect(store1).toBe(store2); // Same instance
  });

  it("should create transient use cases", () => {
    const container = new Container();

    const useCase1 = container.getCreateOrderUseCase();
    const useCase2 = container.getCreateOrderUseCase();

    expect(useCase1).not.toBe(useCase2); // Different instances
  });

  it("should inject dependencies correctly", () => {
    const container = new Container();

    const useCase = container.getCreateOrderUseCase();

    expect(useCase).toBeDefined();
    // Verify use case has access to repositories
  });
});
```

### Test Container for Tests

Create a specific container for tests.

```typescript
// application/__tests__/TestContainer.ts
export class TestContainer extends Container {
  constructor(
    private mockProductRepo?: IProductRepository,
    private mockOrderRepo?: IOrderRepository
  ) {
    super()
  }

  protected createProductRepository(): IProductRepository {
    return this.mockProductRepo || super.createProductRepository()
  }

  protected createOrderRepository(): IOrderRepository {
    return this.mockOrderRepo || super.createOrderRepository()
  }
}

// Usage in tests
const mockProductRepo = { ... }
const testContainer = new TestContainer(mockProductRepo)
const store = testContainer.productStore
```

## Usage Patterns

### In Composables

```typescript
// presentation/composables/useProductManagement.ts
import { container } from "@/application/container";

export function useProductManagement() {
  const productStore = container.productStore;
  const createProductUseCase = container.getCreateProductUseCase();

  async function createProduct(data: CreateProductData) {
    const product = await createProductUseCase.execute(data);
    await productStore.loadProducts(); // Refresh
    return product;
  }

  return {
    products: computed(() => productStore.state.products),
    createProduct,
  };
}
```

### In Pages

```vue
<script setup lang="ts">
import { onMounted } from "vue";
import { container } from "@/application/container";

const productStore = container.productStore;

onMounted(async () => {
  await productStore.loadProducts();
});
</script>
```

## Benefits of Dependency Injection

1. **Testability**: Easy to mock dependencies
2. **Flexibility**: Change implementation without modifying code
3. **Decoupling**: Independent modules
4. **Maintainability**: Clearer and more organized code
5. **Reusability**: Reusable components with different implementations

## Dependency Injection Checklist

Before implementing a new feature:

- [ ] Are dependencies injected via constructor?
- [ ] Are interfaces (ports) defined in the domain?
- [ ] Are implementations (adapters) in the infrastructure?
- [ ] Does the container manage instance creation?
- [ ] Do use cases depend on interfaces, not implementations?
- [ ] Do stores receive use cases via constructor?
- [ ] Is the code testable with mocks?

## Anti-Patterns

### ❌ Direct Dependency

```typescript
// BAD
export class CreateOrderUseCase {
  async execute(items: OrderItem[]) {
    const repository = new ApiOrderRepository(); // Direct instantiation!
    return repository.save(items);
  }
}
```

### ❌ Global Import

```typescript
// BAD
import { apiClient } from "@/infrastructure/api";

export class CreateOrderUseCase {
  async execute(items: OrderItem[]) {
    return apiClient.post("/orders", items); // Global dependency!
  }
}
```

### ❌ Service Locator

```typescript
// BAD
export class CreateOrderUseCase {
  async execute(items: OrderItem[]) {
    const repository = ServiceLocator.get("orderRepository"); // Service locator!
    return repository.save(items);
  }
}
```

### ❌ New inside Use Case

```typescript
// BAD
export class CreateOrderUseCase {
  async execute(items: OrderItem[]) {
    const validator = new OrderValidator(); // Creating dependency!
    validator.validate(items);
  }
}

// GOOD
export class CreateOrderUseCase {
  constructor(private validator: IOrderValidator) {}

  async execute(items: OrderItem[]) {
    this.validator.validate(items);
  }
}
```

## References

- [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
- [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
