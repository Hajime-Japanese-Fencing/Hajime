---
trigger: always_on
---

# Domain-Driven Design (DDD)

## Introduction

Domain-Driven Design (DDD) is a software design approach that emphasizes modeling the business domain and collaboration between technical experts and business experts. This documentation presents the key DDD concepts applied to our project.

## Core Concepts

### 1. Ubiquitous Language

A shared language between developers and business experts, used in code, documentation, and conversations. This language must be consistent and faithfully reflect domain concepts.

**Examples in our project:**

- `Licensee`
- `Order`
- `Product`

### 2. Bounded Context

An explicit boundary within which a particular domain model is defined and applicable. Each bounded context has its own model and its own ubiquitous language.

**In our architecture:**

```
apps/store/src/
├── features/
│   ├── order/          # Bounded Context: Order management
│   ├── licensee/       # Bounded Context: Licensee management
│   └── product/        # Bounded Context: Product management
```

### 3. Entities

Objects defined by their identity rather than their attributes. Two entities with the same attributes but different identities are considered distinct.

**Characteristics:**

- Has a unique identifier
- Can change state over time
- Identity persists throughout the lifecycle

**Example:**

```typescript
interface Licensee {
  id: string; // Unique identity
  firstName: string;
  lastName: string;
  licenseNumber: string;
  // ...
}
```

### 4. Value Objects

Objects defined solely by their attributes, without conceptual identity. Two value objects with the same attributes are considered identical.

**Characteristics:**

- Immutable
- No identifier
- Defined by their values

**Example:**

```typescript
interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Money {
  amount: number;
  currency: string;
}
```

### 5. Aggregates

A cluster of domain objects (entities and value objects) treated as a unit for data changes. Each aggregate has a root (Aggregate Root) and a boundary.

**Rules:**

- External access only through the aggregate root
- Business invariants are maintained inside the aggregate
- Transactions must not cross aggregate boundaries

**Example:**

```typescript
// Order is the aggregate root
interface Order {
  id: string;
  licenseeId: string;
  items: OrderItem[]; // Entities internal to the aggregate
  totalAmount: Money; // Value object
  status: OrderStatus;

  // Methods that maintain invariants
  addItem(item: OrderItem): void;
  removeItem(itemId: string): void;
  calculateTotal(): Money;
}
```

### 6. Domain Services

Operations that don't naturally belong to any entity or value object. They encapsulate business logic that involves multiple domain objects.

**When to use a Domain Service:**

- The operation represents an important business concept
- The operation involves multiple aggregates
- The operation doesn't naturally belong to any entity

**Example:**

```typescript
class OrderPricingService {
  calculateOrderTotal(items: OrderItem[], licensee: Licensee): Money {
    // Complex calculation logic involving
    // multiple domain objects
  }
}
```

### 7. Repositories

Abstractions that encapsulate data access logic and provide a collection-oriented interface for accessing aggregates.

**Responsibilities:**

- Retrieve and persist aggregates
- Provide an abstraction over the persistence layer
- Maintain the illusion of an in-memory collection

**Example:**

```typescript
interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByLicenseeId(licenseeId: string): Promise<Order[]>;
  save(order: Order): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### 8. Domain Events

Represent something that happened in the domain that is important to business experts.

**Characteristics:**

- Named in past tense (OrderCreated, PaymentProcessed)
- Immutable
- Contain all necessary information

**Example:**

```typescript
interface OrderCreatedEvent {
  orderId: string;
  licenseeId: string;
  items: OrderItem[];
  createdAt: Date;
}
```

## DDD Architecture Layers

### 1. Domain Layer

The core of the application, contains pure business logic.

**Contents:**

- Entities
- Value Objects
- Aggregates
- Domain Services
- Domain Events
- Repository Interfaces

**Location:**

```
features/[feature-name]/domain/
├── entities/
├── value-objects/
├── services/
├── events/
└── repositories/
```

### 2. Application Layer

Coordinates application operations and orchestrates data flow.

**Contents:**

- Use Cases
- Application Services
- DTOs (Data Transfer Objects)
- Command/Query Handlers

**Location:**

```
features/[feature-name]/application/
└── use-cases/
    ├── create-order/
    │   ├── create-order.use-case.ts
    │   └── create-order.dto.ts
    └── get-order/
```

### 3. Infrastructure Layer

Technical implementations of interfaces defined in the domain.

**Contents:**

- Repository Implementations
- External Services Adapters
- Database Access
- API Clients

**Location:**

```
features/[feature-name]/infrastructure/
└── adapters/
    ├── repositories/
    └── services/
```

### 4. Presentation Layer

User interface and application entry points.

**Contents:**

- Components
- Pages
- Composables
- View Models

**Location:**

```
presentation/
├── components/
├── pages/
└── composables/
```

## DDD Tactical Patterns

### 1. Specification Pattern

Encapsulates validation or selection business logic in reusable objects.

```typescript
interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
}

class MinimumAgeSpecification implements Specification<Licensee> {
  constructor(private minAge: number) {}

  isSatisfiedBy(licensee: Licensee): boolean {
    return licensee.age >= this.minAge;
  }
}
```

### 2. Factory Pattern

Encapsulates complex domain object creation logic.

```typescript
class OrderFactory {
  static createFromLicensee(licensee: Licensee, items: OrderItem[]): Order {
    // Complex creation logic
    return {
      id: generateId(),
      licenseeId: licensee.id,
      items,
      status: "pending",
      createdAt: new Date(),
    };
  }
}
```

### 3. Strategy Pattern

Allows defining a family of algorithms and making them interchangeable.

```typescript
interface PricingStrategy {
  calculatePrice(order: Order): Money;
}

class StandardPricingStrategy implements PricingStrategy {
  calculatePrice(order: Order): Money {
    // Standard calculation
  }
}

class MemberPricingStrategy implements PricingStrategy {
  calculatePrice(order: Order): Money {
    // Calculation with member discount
  }
}
```

## DDD Design Principles

### 1. Maintain Model Integrity

- Business invariants must always be respected
- Aggregates are responsible for their own consistency
- Transactions respect aggregate boundaries

### 2. Isolate the Domain

- Business logic does not depend on infrastructure
- Dependencies point toward the domain (Dependency Inversion)
- The domain is testable without infrastructure

### 3. Model Expressively

- Code reflects business language
- Names are meaningful and consistent
- Code structure follows domain structure

### 4. Iterate with Business Experts

- Continuous collaboration with the business
- Refine the model based on feedback
- Adapt code to changes in understanding

## Anti-Patterns to Avoid

### 1. Anemic Domain Model

A model where entities contain only data without behavior.

**❌ Bad:**

```typescript
interface Order {
  id: string;
  items: OrderItem[];
  total: number;
}

// Business logic in a service
class OrderService {
  calculateTotal(order: Order): number {
    // ...
  }
}
```

**✅ Good:**

```typescript
class Order {
  constructor(
    private id: string,
    private items: OrderItem[],
  ) {}

  calculateTotal(): Money {
    // Business logic in the entity
  }
}
```

### 2. God Object

An object that knows too much or does too many things.

**Solution:** Divide into smaller, cohesive aggregates.

### 3. Ignoring Bounded Contexts

Mixing concepts from different contexts in a single model.

**Solution:** Define clear boundaries and create separate models.

## Additional Resources

- **Reference book:** "Domain-Driven Design" by Eric Evans
- **Practical book:** "Implementing Domain-Driven Design" by Vaughn Vernon
- **Project documentation:** See architecture rules in `.windsurf/rules/`

## Application in Our Project

Our project uses DDD in combination with hexagonal architecture. See the following documents for more details:

- `@.windsurf/rules/01-architecture-hexagonale.md` - Overall architecture
- `@.windsurf/rules/02-feature-folders-structure.md` - Feature organization
- `@docs/use-cases/` - Use case examples
