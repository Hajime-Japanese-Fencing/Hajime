---
trigger: always_on
---

# Architecture Hexagonale Adaptée au Frontend

## Principes Fondamentaux (Clean Architecture - Uncle Bob)

### The Dependency Rule

**Règle d'or** : Les dépendances du code source pointent toujours vers l'intérieur. Rien dans un cercle intérieur ne peut connaître quoi que ce soit d'un cercle extérieur.

- **Domain** (centre) : Entités métier, règles métier enterprise-wide
- **Application** : Use cases, logique métier applicative
- **Infrastructure** : Adapters, implémentations techniques (API, storage)
- **Presentation** : UI, composants Vue, framework-specific code

### Inversion de Dépendances

Les couches internes définissent des **ports** (interfaces), les couches externes fournissent des **adapters** (implémentations).

```typescript
// ✅ CORRECT - Domain définit l'interface
// domain/ports/IUserRepository.ts
export interface IUserRepository {
  getById(id: string): Promise<User>;
  save(user: User): Promise<void>;
}

// ✅ CORRECT - Infrastructure implémente
// infrastructure/adapters/ApiUserRepository.ts
export class ApiUserRepository implements IUserRepository {
  async getById(id: string): Promise<User> {
    // Implementation with fetch/axios
  }
}

// ✅ CORRECT - Use case dépend de l'interface
// application/use-cases/GetUserUseCase.ts
export class GetUserUseCase {
  constructor(private repository: IUserRepository) {}

  async execute(id: string): Promise<User> {
    return this.repository.getById(id);
  }
}
```

## Structure Feature Folders (Vertical Slicing)

Organisation par fonctionnalité métier plutôt que par couche technique.

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

### Avantages du Vertical Slicing

- Toute la logique d'une feature au même endroit
- Facilite l'ajout/suppression de features
- Meilleure cohésion, couplage réduit entre features
- Développement plus rapide (moins de navigation)

## Couches Détaillées

### Domain (Cœur Métier)

**Contenu :**

- **Entities** : Types TypeScript représentant les objets métier
- **Ports** : Interfaces des repositories et services
- **Utils** : Fonctions métier pures, validations, règles de gestion

**Règles :**

- ❌ Aucune dépendance externe (pas de Vue, pas de fetch, pas de localStorage)
- ✅ Code 100% framework-agnostic
- ✅ Fonctions pures autant que possible
- ✅ Validations métier dans le domain

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

**Contenu :**

- **Use Cases** : Orchestration de la logique métier
- **Stores** : TanStack Store pour état applicatif

**Règles :**

- ✅ Dépend uniquement du Domain (ports)
- ✅ Framework-agnostic (sauf TanStack Store autorisé)
- ✅ Reçoit les repositories via injection de dépendances
- ❌ Ne connaît pas l'infrastructure concrète

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

**Contenu :**

- **Adapters/Repositories** : Implémentations concrètes des ports
- **Adapters/API** : Clients HTTP (fetch, axios)
- **DTOs** : Types pour communication externe
- **Mappers** : Transformation DTO ↔ Entity

**Règles :**

- ✅ Implémente les interfaces du Domain
- ✅ Gère les détails techniques (HTTP, storage, etc.)
- ✅ Transforme les DTOs en entities
- ❌ Ne contient pas de logique métier

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

**Contenu :**

- **Components/UI** : Composants dumb du design system
- **Components/Business** : Composants métier avec logique UI
- **Composables** : Logique UI réutilisable
- **Pages** : Composants page/route

**Règles :**

- ✅ Peut dépendre de Application (stores, use cases via container)
- ✅ Framework-specific (Vue, TanStack Query autorisés)
- ✅ Composables au plus près des composants
- ❌ Pas de logique métier directement dans les composants

## Injection de Dépendances

### Container Pattern

Utiliser un container pour gérer les dépendances et leur cycle de vie.

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

  // Getters pour use cases si nécessaire
  public getCreateOrderUseCase() {
    return this.createOrderUseCase;
  }
}

export const container = new Container();
```

### Utilisation dans les Composants

```typescript
// presentation/pages/OrderPage.vue
import { container } from "@/application/container";

const orderStore = container.orderStore;
```

## Règles de Passage de Données

### DTOs vs Entities

- **DTOs** : Format externe (API, localStorage)
- **Entities** : Format interne (domain)
- **Mappers** : Transformation entre les deux

**Ne jamais passer de DTOs vers le domain/application !**

```typescript
// ❌ INCORRECT
const user = await api.get("/users/1"); // Returns DTO
await useCase.execute(user); // Passing DTO to use case

// ✅ CORRECT
const userDto = await api.get("/users/1");
const user = mapUserFromApi(userDto); // Transform to entity
await useCase.execute(user);
```

## Testabilité

L'architecture hexagonale rend le code intrinsèquement testable :

- **Domain** : Tests unitaires purs, pas de mocks
- **Application** : Tests unitaires avec mocks des repositories
- **Infrastructure** : Tests d'intégration avec vrais adapters
- **Presentation** : Tests uniquement si UX complexe

## Anti-Patterns à Éviter

❌ **Logique métier dans les composants**

```typescript
// BAD
function addToCart(product: Product) {
  if (product.stock <= 0) {
    // Business rule in component!
    alert("Out of stock");
  }
}
```

✅ **Logique métier dans le domain**

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

❌ **Use case dépendant de l'infrastructure**

```typescript
// BAD
import { apiClient } from "@/infrastructure/api";

export class GetUserUseCase {
  async execute(id: string) {
    return apiClient.get(`/users/${id}`); // Direct dependency!
  }
}
```

✅ **Use case dépendant du port**

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

Code réutilisé par plusieurs features :

- Domain entities communes
- Infrastructure clients (HTTP, storage)
- Presentation components design system

### Feature-Specific

Code spécifique à une feature :

- Domain entities spécifiques
- Use cases
- Stores
- Repositories adapters
- Components business

## Références

- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
