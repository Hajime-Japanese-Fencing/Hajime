---
name: feature-folders-structure
description: Convention d'organisation des fichiers par feature (vertical slicing). Utilise quand tu crées un nouveau module, feature ou fichier pour respecter la structure de dossiers attendue et éviter l'organisation horizontale par couche technique.
---

# Feature Folders Structure - Module Organization

## Vertical Slicing Principle

Organize code by **business functionality** rather than technical layer.

### ❌ Horizontal Organization (to avoid)

```
src/
  domain/
    entities/
      User.ts
      Order.ts
      Product.ts
  application/
    use-cases/
      CreateUser.ts
      CreateOrder.ts
  infrastructure/
    repositories/
      UserRepository.ts
      OrderRepository.ts
```

**Problem**: To develop an "Order" feature, you have to navigate through 3+ different folders.

### ✅ Vertical Organization (recommended)

```
src/
  features/
    user/
      domain/
      application/
      infrastructure/
      presentation/
    order/
      domain/
      application/
      infrastructure/
      presentation/
```

**Advantage**: All feature logic is in one place.

## Complete Feature Structure

```
src/features/<feature-name>/
  domain/
    entities/
      <Entity>.ts
    ports/
      I<Entity>Repository.ts
      I<Service>.ts
    utils/
      <entity>Validation.ts
      <entity>Helpers.ts
    __tests__/
      <entity>Validation.test.ts

  application/
    use-cases/
      <UseCase>.ts
      __tests__/
        <UseCase>.test.ts
    stores/
      <feature>Store.ts
      __tests__/
        <feature>Store.test.ts

  infrastructure/
    adapters/
      repositories/
        <Implementation>Repository.ts
        __tests__/
          <Implementation>Repository.test.ts
      api/
        <feature>ApiClient.ts
    dtos/
      <Entity>DTO.ts
    mappers/
      <entity>Mapper.ts

  presentation/
    components/
      ui/
        <Component>.vue
        <component>.composable.ts
        <component>.css (if needed)
      business/
        <BusinessComponent>.vue
        <businessComponent>.composable.ts
    pages/
      <Page>.vue
    composables/
      use<Feature>.ts
```

## Rules per Folder

### `domain/entities/`

- TypeScript types for business entities
- Enums for states/statuses
- No classes, prefer types + factory functions

```typescript
// domain/entities/Product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export function createProduct(data: Omit<Product, "id">): Product {
  return {
    id: generateId(),
    ...data,
  };
}
```

### `domain/ports/`

- Repository interfaces
- External service interfaces
- Naming: `<Name>Repository` or `<Name>Service` (no I prefix)
- Adapters will have the infrastructure notion in their name (e.g. `ApiProductRepository`, `FakeProductRepository`)

```typescript
// domain/ports/ProductRepository.ts
export interface ProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  save(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
```

### `domain/utils/`

- Pure business functions
- Business validations
- Business calculations
- Guards and predicates

```typescript
// domain/utils/productValidation.ts
export function validateProduct(product: Product): void {
  if (!product.name || product.name.trim().length === 0) {
    throw new Error("Product name is required");
  }

  if (product.price < 0) {
    throw new Error("Product price must be positive");
  }
}

export function isProductAvailable(product: Product): boolean {
  return product.stock > 0;
}
```

### `application/use-cases/`

- One file per use case
- Naming: `<Verb><Entity>UseCase.ts`
- Receives repositories via constructor
- Orchestrates business logic

```typescript
// application/use-cases/CreateProductUseCase.ts
export class CreateProductUseCase {
  constructor(private readonly repository: IProductRepository) {}

  async execute(data: Omit<Product, "id">): Promise<Product> {
    const product = createProduct(data);
    validateProduct(product);
    return this.repository.save(product);
  }
}
```

### `application/stores/`

- TanStack Store for application state
- One store per feature or subdomain
- Uses use cases
- See `03-tanstack-usage.md` rule for details

### `infrastructure/adapters/repositories/`

- Concrete implementations of ports
- Naming: `<Type><Entity>Repository.ts` (e.g. `ApiProductRepository`, `LocalStorageProductRepository`)
- Uses API clients
- Transforms DTOs into entities via mappers

```typescript
// infrastructure/adapters/repositories/ApiProductRepository.ts
export class ApiProductRepository implements ProductRepository {
  constructor(private apiClient: ApiClient) {}

  async getAll(): Promise<Product[]> {
    const dtos = await this.apiClient.get<ProductDTO[]>("/products");
    return dtos.map(mapProductFromApi);
  }

  async save(product: Product): Promise<Product> {
    const dto = mapProductToApi(product);
    const savedDto = await this.apiClient.post<ProductDTO>("/products", dto);
    return mapProductFromApi(savedDto);
  }
}
```

### `infrastructure/adapters/api/`

- Feature-specific HTTP clients
- Endpoint configuration
- HTTP error handling

### `infrastructure/dtos/`

- Types for external communication
- Represent the API/storage contract
- May differ from domain entities

```typescript
// infrastructure/dtos/ProductDTO.ts
export interface ProductApiDTO {
  id: string;
  product_name: string; // Different naming convention
  price_cents: number; // Different unit
  stock_quantity: number;
  __typename?: string; // GraphQL pollution
}
```

### `infrastructure/mappers/`

- DTO ↔ Entity transformations
- Naming: `map<Entity>FromApi`, `map<Entity>ToApi`
- Isolate format differences

```typescript
// infrastructure/mappers/productMapper.ts
export function mapProductFromApi(dto: ProductApiDTO): Product {
  return {
    id: dto.id,
    name: dto.product_name,
    price: dto.price_cents / 100,
    stock: dto.stock_quantity,
  };
}

export function mapProductToApi(entity: Product): ProductApiDTO {
  return {
    id: entity.id,
    product_name: entity.name,
    price_cents: Math.round(entity.price * 100),
    stock_quantity: entity.stock,
  };
}
```

### `presentation/components/ui/`

- Dumb design system components
- Props/events only
- No business logic
- Reusable
- See `04-vue-components.md` rule

### `presentation/components/business/`

- Feature-specific business components
- Wrappers of UI components
- Contains UI logic (not business)
- Uses stores/composables

### `presentation/composables/`

- Reusable UI logic
- Close to the component that uses it
- Naming: `use<Feature>.ts`

### `presentation/pages/`

- Page/route components
- Orchestrate business components
- Handle navigation

## Shared Code

For code shared between features:

```
src/shared/
  domain/
    entities/
    ports/
    utils/
  infrastructure/
    adapters/
      api/
        baseApiClient.ts
      storage/
        localStorage.ts
  presentation/
    components/
      ui/  # Design system components
    composables/
    layouts/
```

## File Naming

### Conventions

- **Entities**: PascalCase (e.g. `Product.ts`, `Order.ts`)
- **Ports**: PascalCase without I prefix (e.g. `ProductRepository.ts`, `NotificationService.ts`)
- **Use Cases**: PascalCase + `UseCase` suffix (e.g. `CreateProductUseCase.ts`)
- **Stores**: camelCase + `Store` suffix (e.g. `productStore.ts`)
- **Repositories**: Infrastructure prefix + PascalCase + `Repository` suffix (e.g. `ApiProductRepository.ts`, `FakeProductRepository.ts`)
- **DTOs**: PascalCase + `DTO` suffix (e.g. `ProductDTO.ts`)
- **Mappers**: camelCase + `Mapper` suffix (e.g. `productMapper.ts`)
- **Composables**: camelCase + `use` prefix (e.g. `useProduct.ts`)
- **Components**: PascalCase (e.g. `ProductCard.vue`)

### Tests

- `__tests__/` folder closest to the tested code
- Naming: `<FileName>.test.ts`

## Migrating an Existing Feature

### Steps

1. Create the new folder structure
2. Move entities to `domain/entities/`
3. Extract interfaces to `domain/ports/`
4. Move use cases to `application/use-cases/`
5. Move stores to `application/stores/`
6. Move repositories to `infrastructure/adapters/repositories/`
7. Create DTOs and mappers in `infrastructure/`
8. Move components to `presentation/`
9. Update imports
10. Run tests

## Complete Examples

See existing features as reference:

- `src/features/order/`
- `src/features/product/`
- `src/features/licensee/`
