---
trigger: always_on
---

# TanStack Store vs TanStack Query - Quand Utiliser Quoi

## Vue d'Ensemble

### TanStack Store

**État applicatif synchrone et logique métier**

### TanStack Query

**Opérations asynchrones avec le serveur**

## Règle Générale

```
┌─────────────────────────────────────────────────────────────┐
│  TanStack Store                                             │
│  • État local à la feature                                  │
│  • Logique métier synchrone                                 │
│  • Use cases orchestration                                  │
│  • État UI complexe                                         │
│  • Calculs dérivés                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TanStack Query                                             │
│  • Fetching données serveur                                 │
│  • Cache automatique                                        │
│  • Synchronisation serveur                                  │
│  • Mutations API                                            │
│  • Invalidation/refetch                                     │
└─────────────────────────────────────────────────────────────┘
```

## TanStack Store - Cas d'Usage

### 1. État Applicatif Local

État géré côté client, pas persisté sur le serveur.

```typescript
// application/stores/basketStore.ts
import { Store } from "@tanstack/store";

interface BasketState {
  items: BasketItem[];
  totalAmount: number;
}

export class BasketStore extends Store<BasketState> {
  constructor() {
    super({
      items: [],
      totalAmount: 0,
    });
  }

  addItem(productId: string, quantity: number) {
    this.setState((state) => {
      const items = [...state.items, { productId, quantity }];
      return {
        items,
        totalAmount: this.calculateTotal(items),
      };
    });
  }

  private calculateTotal(items: BasketItem[]): number {
    // Business logic calculation
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
```

### 2. Orchestration de Use Cases

Store qui encapsule des use cases métier.

```typescript
// application/stores/orderStore.ts
export class OrderStore extends Store<OrderState> {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly validateOrderUseCase: ValidateOrderUseCase,
  ) {
    super({ order: null, isProcessing: false, error: null });
  }

  async createOrder(items: OrderItem[]) {
    this.setState((state) => ({ ...state, isProcessing: true, error: null }));

    try {
      // Validation métier via use case
      await this.validateOrderUseCase.execute(items);

      // Création via use case
      const order = await this.createOrderUseCase.execute(items);

      this.setState((state) => ({
        ...state,
        order,
        isProcessing: false,
      }));
    } catch (error) {
      this.setState((state) => ({
        ...state,
        error: error instanceof Error ? error.message : "Unknown error",
        isProcessing: false,
      }));
    }
  }
}
```

### 3. État UI Complexe

Gestion d'état UI multi-étapes, wizards, formulaires complexes.

```typescript
// application/stores/checkoutStore.ts
interface CheckoutState {
  currentStep: number;
  steps: CheckoutStep[];
  formData: CheckoutFormData;
  isValid: boolean;
}

export class CheckoutStore extends Store<CheckoutState> {
  nextStep() {
    this.setState((state) => ({
      ...state,
      currentStep: Math.min(state.currentStep + 1, state.steps.length - 1),
    }));
  }

  updateFormData(data: Partial<CheckoutFormData>) {
    this.setState((state) => {
      const formData = { ...state.formData, ...data };
      return {
        ...state,
        formData,
        isValid: this.validateForm(formData),
      };
    });
  }
}
```

### 4. État Dérivé et Calculs

Calculs basés sur l'état, memoization.

```typescript
// application/stores/cartStore.ts
export class CartStore extends Store<CartState> {
  // Derived state
  get itemCount(): number {
    return this.state.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get subtotal(): number {
    return this.state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get tax(): number {
    return this.subtotal * 0.2;
  }

  get total(): number {
    return this.subtotal + this.tax;
  }
}
```

## TanStack Query - Cas d'Usage

### 1. Fetching Données Serveur

Récupération de données avec cache automatique.

```typescript
// presentation/composables/useProducts.ts
import { useQuery } from "@tanstack/vue-query";
import { container } from "@/application/container";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const repository = container.getProductRepository();
      return repository.getAll();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

### 2. Mutations API

Modifications de données sur le serveur.

```typescript
// presentation/composables/useCreateProduct.ts
import { useMutation, useQueryClient } from "@tanstack/vue-query";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductData) => {
      const useCase = container.getCreateProductUseCase();
      return useCase.execute(data);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
```

### 3. Invalidation et Synchronisation

Synchronisation automatique après mutations.

```typescript
// presentation/composables/useDeleteProduct.ts
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const useCase = container.getDeleteProductUseCase();
      return useCase.execute(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("Failed to delete product:", error);
    },
  });
}
```

### 4. Optimistic Updates

Mise à jour optimiste de l'UI avant confirmation serveur.

```typescript
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      const useCase = container.getUpdateProductUseCase();
      return useCase.execute(product);
    },
    onMutate: async (newProduct) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["products", newProduct.id],
      });

      // Snapshot previous value
      const previousProduct = queryClient.getQueryData(["products", newProduct.id]);

      // Optimistically update
      queryClient.setQueryData(["products", newProduct.id], newProduct);

      return { previousProduct };
    },
    onError: (err, newProduct, context) => {
      // Rollback on error
      queryClient.setQueryData(["products", newProduct.id], context?.previousProduct);
    },
    onSettled: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ["products", newProduct?.id] });
    },
  });
}
```

## Matrice de Décision

| Besoin                             | TanStack Store | TanStack Query |
| ---------------------------------- | -------------- | -------------- |
| État local UI (panier, formulaire) | ✅             | ❌             |
| Fetching données serveur           | ❌             | ✅             |
| Cache données serveur              | ❌             | ✅             |
| Mutations API                      | ❌             | ✅             |
| Logique métier synchrone           | ✅             | ❌             |
| Use cases orchestration            | ✅             | ❌             |
| État dérivé/calculs                | ✅             | ❌             |
| Invalidation automatique           | ❌             | ✅             |
| Optimistic updates                 | ❌             | ✅             |
| Background refetch                 | ❌             | ✅             |
| Retry logic                        | ❌             | ✅             |

## Patterns d'Intégration

### Pattern 1 : Store + Query Séparés

Store pour logique métier, Query pour data fetching.

```typescript
// application/stores/productStore.ts
export class ProductStore extends Store<ProductState> {
  constructor(private calculateDiscountUseCase: CalculateDiscountUseCase) {
    super({ selectedProduct: null, appliedDiscount: 0 });
  }

  selectProduct(product: Product) {
    const discount = this.calculateDiscountUseCase.execute(product);
    this.setState({ selectedProduct: product, appliedDiscount: discount });
  }
}

// presentation/composables/useProducts.ts
export function useProducts() {
  const productStore = container.productStore;

  // Query for server data
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => container.getProductRepository().getAll(),
  });

  // Store for business logic
  const selectProduct = (product: Product) => {
    productStore.selectProduct(product);
  };

  return { products, isLoading, selectProduct };
}
```

### Pattern 2 : Store Utilise Query Data

Store réagit aux données de Query.

```typescript
// presentation/composables/useOrderManagement.ts
export function useOrderManagement() {
  const orderStore = container.orderStore;

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: () => container.getOrderRepository().getAll(),
  });

  // Watch query data and update store
  watch(orders, (newOrders) => {
    if (newOrders) {
      orderStore.setOrders(newOrders);
    }
  });

  return { orderStore };
}
```

### Pattern 3 : Query Utilise Store State

Query dépend de l'état du store.

```typescript
export function useOrderDetails() {
  const orderStore = container.orderStore;
  const selectedOrderId = computed(() => orderStore.state.selectedOrderId);

  return useQuery({
    queryKey: ["order", selectedOrderId],
    queryFn: () => {
      if (!selectedOrderId.value) return null;
      return container.getOrderRepository().getById(selectedOrderId.value);
    },
    enabled: computed(() => !!selectedOrderId.value),
  });
}
```

## Anti-Patterns à Éviter

### ❌ Dupliquer l'État

```typescript
// BAD - État dupliqué entre Store et Query
const productStore = new Store({ products: [] })
const { data: products } = useQuery({ queryKey: ['products'], ... })
// Maintenant on a products dans 2 endroits!
```

### ❌ Logique Métier dans Query

```typescript
// BAD - Business logic in queryFn
const { data } = useQuery({
  queryKey: ["products"],
  queryFn: async () => {
    const products = await api.get("/products");
    // Business logic here!
    return products.filter((p) => p.price > 0 && p.stock > 0);
  },
});

// GOOD - Business logic in use case
const { data } = useQuery({
  queryKey: ["available-products"],
  queryFn: () => container.getAvailableProductsUseCase().execute(),
});
```

### ❌ Store pour Données Serveur

```typescript
// BAD - Using Store for server data
export class ProductStore extends Store<{ products: Product[] }> {
  async loadProducts() {
    const products = await api.get("/products");
    this.setState({ products }); // Don't do this, use Query!
  }
}

// GOOD - Use Query for server data
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => container.getProductRepository().getAll(),
  });
}
```

## Frontière des Tests

### Tests Unitaires - Use Cases via Store

```typescript
// application/stores/__tests__/basketStore.test.ts
describe("BasketStore", () => {
  it("should calculate total correctly", () => {
    const store = new BasketStore();

    store.addItem("product-1", 2, 10);
    store.addItem("product-2", 1, 15);

    expect(store.state.totalAmount).toBe(35);
  });
});
```

### Tests d'Intégration - Adapters avant Query

```typescript
// infrastructure/adapters/__tests__/ApiProductRepository.test.ts
describe("ApiProductRepository", () => {
  it("should fetch products from API", async () => {
    const repository = new ApiProductRepository(mockApiClient);

    const products = await repository.getAll();

    expect(products).toHaveLength(2);
    expect(products[0]).toMatchObject({ id: "1", name: "Product 1" });
  });
});
```

### Pas de Tests sur Query/Mutation

TanStack Query est déjà testé. Tester uniquement :

- Les use cases appelés par Query
- Les adapters utilisés par Query

## Configuration TanStack Query

### Setup Global

```typescript
// main.ts
import { VueQueryPlugin } from "@tanstack/vue-query";

const app = createApp(App);

app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  },
});
```

## Exemples Pratiques

### Exemple 1 : Liste de Produits

```typescript
// ✅ Query pour fetching
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => container.getProductRepository().getAll(),
  });
}

// ✅ Store pour sélection et filtres
export class ProductStore extends Store<ProductState> {
  constructor() {
    super({
      selectedProductId: null,
      filters: { category: null, priceRange: null },
    });
  }

  selectProduct(id: string) {
    this.setState((state) => ({ ...state, selectedProductId: id }));
  }

  setFilters(filters: ProductFilters) {
    this.setState((state) => ({ ...state, filters }));
  }
}
```

### Exemple 2 : Panier d'Achat

```typescript
// ✅ Store pour panier (état local)
export class BasketStore extends Store<BasketState> {
  addItem(productId: string, quantity: number) { ... }
  removeItem(productId: string) { ... }
  clear() { ... }
}

// ✅ Mutation pour soumettre la commande
export function useSubmitOrder() {
  const basketStore = container.basketStore

  return useMutation({
    mutationFn: async () => {
      const items = basketStore.state.items
      const useCase = container.getCreateOrderUseCase()
      return useCase.execute(items)
    },
    onSuccess: () => {
      basketStore.clear()
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}
```

### Exemple 3 : Formulaire Multi-Étapes

```typescript
// ✅ Store pour état du formulaire
export class CheckoutFormStore extends Store<CheckoutFormState> {
  constructor(private validateStepUseCase: ValidateStepUseCase) {
    super({
      currentStep: 0,
      formData: {},
      errors: {},
    });
  }

  async nextStep() {
    const isValid = await this.validateStepUseCase.execute(
      this.state.currentStep,
      this.state.formData,
    );

    if (isValid) {
      this.setState((state) => ({
        ...state,
        currentStep: state.currentStep + 1,
      }));
    }
  }
}

// ✅ Mutation pour soumission finale
export function useSubmitCheckout() {
  const formStore = container.checkoutFormStore;

  return useMutation({
    mutationFn: () => {
      const useCase = container.getSubmitCheckoutUseCase();
      return useCase.execute(formStore.state.formData);
    },
  });
}
```

## Règles de Composition

### 1. Ne Pas Mélanger les Responsabilités

```typescript
// ❌ BAD - Store qui fait du fetching
export class ProductStore extends Store<ProductState> {
  async loadProducts() {
    const products = await fetch("/api/products");
    this.setState({ products });
  }
}

// ✅ GOOD - Séparation claire
// Query pour fetching
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => container.getProductRepository().getAll(),
  });
}

// Store pour logique métier
export class ProductStore extends Store<ProductState> {
  selectProduct(product: Product) {
    this.setState({ selectedProduct: product });
  }
}
```

### 2. Use Cases comme Interface

Les use cases sont l'interface entre Store/Query et Infrastructure.

```typescript
// ✅ GOOD - Use case appelé par Query
export function useCreateProduct() {
  return useMutation({
    mutationFn: (data: CreateProductData) => {
      const useCase = container.getCreateProductUseCase()
      return useCase.execute(data)
    }
  })
}

// ✅ GOOD - Use case appelé par Store
export class ProductStore extends Store<ProductState> {
  constructor(private validateProductUseCase: ValidateProductUseCase) {
    super({ ... })
  }

  async validateAndSelect(product: Product) {
    const isValid = await this.validateProductUseCase.execute(product)
    if (isValid) {
      this.setState({ selectedProduct: product })
    }
  }
}
```

### 3. Store pour Coordination

Store peut coordonner plusieurs use cases.

```typescript
export class OrderProcessingStore extends Store<OrderProcessingState> {
  constructor(
    private validateOrderUseCase: ValidateOrderUseCase,
    private calculateShippingUseCase: CalculateShippingUseCase,
    private applyDiscountUseCase: ApplyDiscountUseCase
  ) {
    super({ ... })
  }

  async processOrder(order: Order) {
    // Orchestrate multiple use cases
    await this.validateOrderUseCase.execute(order)
    const shipping = await this.calculateShippingUseCase.execute(order)
    const discount = await this.applyDiscountUseCase.execute(order)

    this.setState({
      order,
      shipping,
      discount,
      total: order.amount + shipping - discount
    })
  }
}
```

## Checklist de Décision

Avant de choisir entre Store et Query, posez-vous ces questions :

1. **Les données viennent-elles du serveur ?**
   - Oui → TanStack Query
   - Non → TanStack Store

2. **L'état doit-il être synchronisé avec le serveur ?**
   - Oui → TanStack Query
   - Non → TanStack Store

3. **Y a-t-il de la logique métier complexe ?**
   - Oui → TanStack Store (avec use cases)
   - Non → Peut-être juste Query

4. **L'état est-il purement UI ?**
   - Oui et simple → ref/reactive Vue
   - Oui et complexe → TanStack Store
   - Non (données serveur) → TanStack Query

5. **Besoin de cache et invalidation automatique ?**
   - Oui → TanStack Query
   - Non → TanStack Store

## Références

- [TanStack Store Docs](https://tanstack.com/store/latest/docs/overview)
- [TanStack Query Docs](https://tanstack.com/query/v5/docs/framework/vue/overview)
