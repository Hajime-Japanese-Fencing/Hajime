---
trigger: always_on
---

# Feature Folders Structure - Organisation par Modules

## Principe du Vertical Slicing

Organiser le code par **fonctionnalité métier** plutôt que par couche technique.

### ❌ Organisation Horizontale (à éviter)

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

**Problème** : Pour développer une feature "Order", il faut naviguer dans 3+ dossiers différents.

### ✅ Organisation Verticale (recommandée)

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

**Avantage** : Toute la logique d'une feature est au même endroit.

## Structure Complète d'une Feature

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
        <component>.css (si nécessaire)
      business/
        <BusinessComponent>.vue
        <businessComponent>.composable.ts
    pages/
      <Page>.vue
    composables/
      use<Feature>.ts
```

## Règles par Dossier

### `domain/entities/`

- Types TypeScript des entités métier
- Enums pour les états/statuts
- Pas de classes, préférer les types + factory functions

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

- Interfaces des repositories
- Interfaces des services externes
- Nommage : `<Name>Repository` ou `<Name>Service` (sans préfixe I)
- Les adapters auront la notion de l'infrastructure dans le nom (ex: `ApiProductRepository`, `FakeProductRepository`)

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

- Fonctions métier pures
- Validations métier
- Calculs métier
- Guards et prédicats

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

- Un fichier par use case
- Nommage : `<Verb><Entity>UseCase.ts`
- Reçoit les repositories via constructeur
- Orchestre la logique métier

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

- TanStack Store pour état applicatif
- Un store par feature ou sous-domaine
- Utilise les use cases
- Voir règle `03-tanstack-usage.md` pour détails

### `infrastructure/adapters/repositories/`

- Implémentations concrètes des ports
- Nommage : `<Type><Entity>Repository.ts` (ex: `ApiProductRepository`, `LocalStorageProductRepository`)
- Utilise les API clients
- Transforme DTOs en entities via mappers

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

- Clients HTTP spécifiques à la feature
- Configuration endpoints
- Gestion erreurs HTTP

### `infrastructure/dtos/`

- Types pour communication externe
- Représentent le contrat API/storage
- Peuvent différer des entities domain

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

- Transformations DTO ↔ Entity
- Nommage : `map<Entity>FromApi`, `map<Entity>ToApi`
- Isolent les différences de format

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

- Composants dumb du design system
- Props/events uniquement
- Pas de logique métier
- Réutilisables
- Voir règle `04-vue-components.md`

### `presentation/components/business/`

- Composants métier spécifiques
- Wrappers des composants UI
- Contient logique UI (pas métier)
- Utilise stores/composables

### `presentation/composables/`

- Logique UI réutilisable
- Au plus près du composant qui l'utilise
- Nommage : `use<Feature>.ts`

### `presentation/pages/`

- Composants page/route
- Orchestrent les composants business
- Gèrent la navigation

## Shared Code

Pour le code partagé entre features :

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

## Nommage des Fichiers

### Conventions

- **Entities** : PascalCase (ex: `Product.ts`, `Order.ts`)
- **Ports** : PascalCase sans préfixe I (ex: `ProductRepository.ts`, `NotificationService.ts`)
- **Use Cases** : PascalCase + `UseCase` suffix (ex: `CreateProductUseCase.ts`)
- **Stores** : camelCase + `Store` suffix (ex: `productStore.ts`)
- **Repositories** : Infrastructure prefix + PascalCase + `Repository` suffix (ex: `ApiProductRepository.ts`, `FakeProductRepository.ts`)
- **DTOs** : PascalCase + `DTO` suffix (ex: `ProductDTO.ts`)
- **Mappers** : camelCase + `Mapper` suffix (ex: `productMapper.ts`)
- **Composables** : camelCase + `use` prefix (ex: `useProduct.ts`)
- **Components** : PascalCase (ex: `ProductCard.vue`)

### Tests

- Dossier `__tests__/` au plus près du code testé
- Nommage : `<FileName>.test.ts`

## Migration d'une Feature Existante

### Étapes

1. Créer la nouvelle structure de dossiers
2. Déplacer les entities vers `domain/entities/`
3. Extraire les interfaces vers `domain/ports/`
4. Déplacer les use cases vers `application/use-cases/`
5. Déplacer les stores vers `application/stores/`
6. Déplacer les repositories vers `infrastructure/adapters/repositories/`
7. Créer les DTOs et mappers dans `infrastructure/`
8. Déplacer les composants vers `presentation/`
9. Mettre à jour les imports
10. Exécuter les tests

## Exemples Complets

Voir les features existantes comme référence :

- `src/features/order/`
- `src/features/product/`
- `src/features/licensee/`
