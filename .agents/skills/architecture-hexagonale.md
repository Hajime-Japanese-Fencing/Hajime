---
trigger: always_on
---

# Hexagonal Architecture Adapted for Frontend

## Core Principles (Clean Architecture - Uncle Bob)

### The Dependency Rule

**Golden rule**: Source code dependencies always point inward. Nothing in an inner circle can know anything about something in an outer circle.

- **Domain** (center): Business entities, enterprise-wide business rules
- **Application**: Use cases, application business logic
- **Infrastructure**: Adapters, technical implementations (API, storage)
- **Presentation**: UI, Vue components, framework-specific code

### Dependency Inversion

Inner layers define **ports** (interfaces), outer layers provide **adapters** (implementations).

```typescript
// ✅ CORRECT - Domain defines the interface
// domain/ports/IUserRepository.ts
export interface IUserRepository {
  getById(id: string): Promise<User>;
  save(user: User): Promise<void>;
}

// ✅ CORRECT - Infrastructure implements
// infrastructure/adapters/ApiUserRepository.ts
export class ApiUserRepository implements IUserRepository {
  async getById(id: string): Promise<User> {
    // Implementation with fetch/axios
  }
}

// ✅ CORRECT - Use case depends on the interface
// application/use-cases/GetUserUseCase.ts
export class GetUserUseCase {
  constructor(private repository: IUserRepository) {}

  async execute(id: string): Promise<User> {
    return this.repository.getById(id);
  }
}
```

## Feature Folders Structure (Vertical Slicing)

Organization by business functionality rather than technical layer.

```
src/
  features/
    <feature-name>/
      domain/
        entities/
        ports/
        utils/
      application/
        use-cases/
        stores/
      infrastructure/
        adapters/
          repositories/
          api/
        dtos/
        mappers/
      presentation/
        components/
          ui/
          business/
        composables/
        pages/
  shared/
    domain/
    infrastructure/
    presentation/
```

### Benefits of Vertical Slicing

- All feature logic in one place
- Easier to add/remove features
- Better cohesion, reduced coupling between features
- Faster development (less navigation)

## Detailed Layers

### Domain (Business Core)

**Contents:**

- **Entities**: TypeScript types representing business objects
- **Ports**: Repository and service interfaces
- **Utils**: Pure business functions, validations, business rules

**Rules:**

- ❌ No external dependencies (no Vue, no fetch, no localStorage)
- ✅ 100% framework-agnostic code
- ✅ Pure functions whenever possible
- ✅ Business validations in the domain

```typescript
// domain/entities/Order.ts
export interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
}

// domain/utils/orderValidation.ts
export function validateOrderItems(items: OrderItem[]): void {
  if (items.length === 0) {
    throw new Error("Order must contain at least one item");
  }

  items.forEach((item) => {
    if (item.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
  });
}
```

### Application (Use Cases)

**Contents:**

- **Use Cases**: Orchestration of business logic
- **Stores**: TanStack Store for application state

**Rules:**

- ✅ Depends only on Domain (ports)
- ✅ Framework-agnostic (except TanStack Store allowed)
- ✅ Receives repositories via dependency injection
- ❌ Does not know the concrete infrastructure

```typescript
// application/use-cases/CreateOrderUseCase.ts
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(items: OrderItem[]): Promise<Order> {
    validateOrderItems(items);

    // Verify products exist
    for (const item of items) {
      const product = await this.productRepository.getById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
    }

    const order = createOrder(items);
    return this.orderRepository.save(order);
  }
}
```

### Infrastructure (Adapters)

**Contents:**

- **Adapters/Repositories**: Concrete implementations of ports
- **Adapters/API**: HTTP clients (fetch, axios)
- **DTOs**: Types for external communication
- **Mappers**: DTO ↔ Entity transformation

**Rules:**

- ✅ Implements Domain interfaces
- ✅ Handles technical details (HTTP, storage, etc.)
- ✅ Transforms DTOs into entities
- ❌ Contains no business logic

```typescript
// infrastructure/dtos/OrderDTO.ts
export interface OrderApiDTO {
  id: string;
  items: Array<{ product_id: string; qty: number }>;
  total: number;
  status: string;
}

// infrastructure/mappers/orderMapper.ts
export function mapOrderFromApi(dto: OrderApiDTO): Order {
  return {
    id: dto.id,
    items: dto.items.map((item) => ({
      productId: item.product_id,
      quantity: item.qty,
    })),
    totalAmount: dto.total,
    status: dto.status as OrderStatus,
  };
}

// infrastructure/adapters/repositories/ApiOrderRepository.ts
export class ApiOrderRepository implements IOrderRepository {
  constructor(private apiClient: ApiClient) {}

  async getById(id: string): Promise<Order | null> {
    const dto = await this.apiClient.get<OrderApiDTO>(`/orders/${id}`);
    return dto ? mapOrderFromApi(dto) : null;
  }

  async save(order: Order): Promise<Order> {
    const dto = mapOrderToApi(order);
    const savedDto = await this.apiClient.post<OrderApiDTO>("/orders", dto);
    return mapOrderFromApi(savedDto);
  }
}
```

### Presentation (UI)

**Contents:**

- **Components/UI**: Dumb components from the design system
- **Components/Business**: Business components with UI logic
- **Composables**: Reusable UI logic
- **Pages**: Page/route components

**Rules:**

- ✅ Can depend on Application (stores, use cases via container)
- ✅ Framework-specific (Vue, TanStack Query allowed)
- ✅ Composables close to the components
- ❌ No business logic directly in components

## Dependency Injection

### Container Pattern

Use a container to manage dependencies and their lifecycle.

```typescript
// application/container.ts
export class Container {
  // Repositories (Singletons)
  private orderRepository = new ApiOrderRepository(this.apiClient);
  private productRepository = new ApiProductRepository(this.apiClient);

  // Use Cases
  private createOrderUseCase = new CreateOrderUseCase(this.orderRepository, this.productRepository);

  // Stores (Singletons)
  public orderStore = new OrderStore(this.createOrderUseCase);

  // Getters for use cases if needed
  public getCreateOrderUseCase() {
    return this.createOrderUseCase;
  }
}

export const container = new Container();
```

### Usage in Components

```typescript
// presentation/pages/OrderPage.vue
import { container } from "@/application/container";

const orderStore = container.orderStore;
```

## Data Passing Rules

### DTOs vs Entities

- **DTOs**: External format (API, localStorage)
- **Entities**: Internal format (domain)
- **Mappers**: Transformation between the two

**Never pass DTOs to domain/application!**

```typescript
// ❌ INCORRECT
const user = await api.get("/users/1"); // Returns DTO
await useCase.execute(user); // Passing DTO to use case

// ✅ CORRECT
const userDto = await api.get("/users/1");
const user = mapUserFromApi(userDto); // Transform to entity
await useCase.execute(user);
```

## Testability

Hexagonal architecture makes code inherently testable:

- **Domain**: Pure unit tests, no mocks
- **Application**: Unit tests with mocked repositories
- **Infrastructure**: Integration tests with real adapters
- **Presentation**: Tests only for complex UX

## Anti-Patterns to Avoid

❌ **Business logic in components**

```typescript
// BAD
function addToCart(product: Product) {
  if (product.stock <= 0) {
    // Business rule in component!
    alert("Out of stock");
  }
}
```

✅ **Business logic in the domain**

```typescript
// GOOD - domain/utils/productValidation.ts
export function canAddToCart(product: Product): boolean {
  return product.stock > 0;
}

// Component just calls the domain function
function addToCart(product: Product) {
  if (!canAddToCart(product)) {
    showError("Out of stock");
  }
}
```

❌ **Use case depending on infrastructure**

```typescript
// BAD
import { apiClient } from "@/infrastructure/api";

export class GetUserUseCase {
  async execute(id: string) {
    return apiClient.get(`/users/${id}`); // Direct dependency!
  }
}
```

✅ **Use case depending on the port**

```typescript
// GOOD
export class GetUserUseCase {
  constructor(private repository: IUserRepository) {}

  async execute(id: string) {
    return this.repository.getById(id);
  }
}
```

## Shared vs Feature-Specific

### Shared

Code reused by multiple features:

- Common domain entities
- Infrastructure clients (HTTP, storage)
- Presentation design system components

### Feature-Specific

Code specific to a feature:

- Feature-specific domain entities
- Use cases
- Stores
- Repository adapters
- Business components

## References

- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
