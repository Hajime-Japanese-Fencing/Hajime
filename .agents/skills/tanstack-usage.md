---
name: tanstack-usage
description: Guide de choix entre TanStack Store et TanStack Query. Utilise quand tu gères de l'état ou des données distantes pour choisir le bon outil selon le contexte (état local/partagé vs données serveur).
---

# TanStack Store vs TanStack Query - When to Use Which

## Overview

### TanStack Store

**Synchronous application state and business logic**

### TanStack Query

**Asynchronous server operations**

## General Rule

```
┌─────────────────────────────────────────────────────────────┐
│  TanStack Store                                             │
│  • Local feature state                                      │
│  • Synchronous business logic                               │
│  • Use cases orchestration                                  │
│  • Complex UI state                                         │
│  • Derived calculations                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TanStack Query                                             │
│  • Fetching server data                                     │
│  • Automatic cache                                          │
│  • Server synchronization                                   │
│  • API mutations                                            │
│  • Invalidation/refetch                                     │
└─────────────────────────────────────────────────────────────┘
```

## TanStack Store - Use Cases

### 1. Local Application State

Client-side state, not persisted on the server.

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

### 2. Use Case Orchestration

Store that encapsulates business use cases.

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
      // Business validation via use case
      await this.validateOrderUseCase.execute(items);

      // Creation via use case
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

### 3. Complex UI State

Multi-step UI state management, wizards, complex forms.

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

### 4. Derived State and Calculations

Calculations based on state, memoization.

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

## TanStack Query - Use Cases

### 1. Fetching Server Data

Data retrieval with automatic cache.

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

### 2. API Mutations

Modifying data on the server.

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

### 3. Invalidation and Synchronization

Automatic synchronization after mutations.

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

Optimistic UI update before server confirmation.

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

## Decision Matrix

| Need                          | TanStack Store | TanStack Query |
| ----------------------------- | -------------- | -------------- |
| Local UI state (basket, form) | ✅             | ❌             |
| Fetching server data          | ❌             | ✅             |
| Server data cache             | ❌             | ✅             |
| API mutations                 | ❌             | ✅             |
| Synchronous business logic    | ✅             | ❌             |
| Use cases orchestration       | ✅             | ❌             |
| Derived state/calculations    | ✅             | ❌             |
| Automatic invalidation        | ❌             | ✅             |
| Optimistic updates            | ❌             | ✅             |
| Background refetch            | ❌             | ✅             |
| Retry logic                   | ❌             | ✅             |

## Integration Patterns

### Pattern 1: Separate Store + Query

Store for business logic, Query for data fetching.

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

### Pattern 2: Store Uses Query Data

Store reacts to Query data.

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

### Pattern 3: Query Uses Store State

Query depends on store state.

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

## Anti-Patterns to Avoid

### ❌ Duplicating State

```typescript
// BAD - State duplicated between Store and Query
const productStore = new Store({ products: [] })
const { data: products } = useQuery({ queryKey: ['products'], ... })
// Now we have products in 2 places!
```

### ❌ Business Logic in Query

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

### ❌ Store for Server Data

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

## Test Boundaries

### Unit Tests - Use Cases via Store

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

### Integration Tests - Adapters before Query

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

### No Tests on Query/Mutation

TanStack Query is already tested. Only test:

- Use cases called by Query
- Adapters used by Query

## TanStack Query Configuration

### Global Setup

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

## Practical Examples

### Example 1: Product List

```typescript
// ✅ Query for fetching
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => container.getProductRepository().getAll(),
  });
}

// ✅ Store for selection and filters
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

### Example 2: Shopping Cart

```typescript
// ✅ Store for basket (local state)
export class BasketStore extends Store<BasketState> {
  addItem(productId: string, quantity: number) { ... }
  removeItem(productId: string) { ... }
  clear() { ... }
}

// ✅ Mutation to submit order
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

### Example 3: Multi-Step Form

```typescript
// ✅ Store for form state
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

// ✅ Mutation for final submission
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

## Composition Rules

### 1. Don't Mix Responsibilities

```typescript
// ❌ BAD - Store that fetches
export class ProductStore extends Store<ProductState> {
  async loadProducts() {
    const products = await fetch("/api/products");
    this.setState({ products });
  }
}

// ✅ GOOD - Clear separation
// Query for fetching
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => container.getProductRepository().getAll(),
  });
}

// Store for business logic
export class ProductStore extends Store<ProductState> {
  selectProduct(product: Product) {
    this.setState({ selectedProduct: product });
  }
}
```

### 2. Use Cases as Interface

Use cases are the interface between Store/Query and Infrastructure.

```typescript
// ✅ GOOD - Use case called by Query
export function useCreateProduct() {
  return useMutation({
    mutationFn: (data: CreateProductData) => {
      const useCase = container.getCreateProductUseCase()
      return useCase.execute(data)
    }
  })
}

// ✅ GOOD - Use case called by Store
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

### 3. Store for Coordination

Store can coordinate multiple use cases.

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

## Decision Checklist

Before choosing between Store and Query, ask yourself:

1. **Does the data come from the server?**
   - Yes → TanStack Query
   - No → TanStack Store

2. **Does the state need to be synchronized with the server?**
   - Yes → TanStack Query
   - No → TanStack Store

3. **Is there complex business logic?**
   - Yes → TanStack Store (with use cases)
   - No → Maybe just Query

4. **Is the state purely UI?**
   - Yes and simple → Vue ref/reactive
   - Yes and complex → TanStack Store
   - No (server data) → TanStack Query

5. **Need automatic cache and invalidation?**
   - Yes → TanStack Query
   - No → TanStack Store

## References

- [TanStack Store Docs](https://tanstack.com/store/latest/docs/overview)
- [TanStack Query Docs](https://tanstack.com/query/v5/docs/framework/vue/overview)
