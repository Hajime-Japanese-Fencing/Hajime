---
trigger: always_on
---

# Règles Composants Vue

## Typologie des Composants

### 1. Composants Dumb (Design System)

**Définition** : Composants de présentation pure, réutilisables, sans logique métier.

**Caractéristiques :**

- ✅ Props/Events uniquement
- ✅ Pas d'accès aux stores
- ✅ Pas d'appels API
- ✅ Pas de logique métier
- ✅ Styles DaisyUI/BEM
- ✅ Réutilisables dans tout le projet
- ✅ Peuvent être externalisés dans le package UI

**Emplacement :** `presentation/components/ui/`

```vue
<!-- presentation/components/ui/ProductCard.vue -->
<script setup lang="ts">
interface Props {
  name: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

interface Emits {
  (e: "add-to-cart"): void;
  (e: "view-details"): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<template>
  <div class="card card--product bg-base-100 shadow-xl">
    <figure v-if="imageUrl" class="card__figure">
      <img :src="imageUrl" :alt="name" class="card__image" />
    </figure>
    <div class="card-body">
      <h2 class="card-title card__title">{{ name }}</h2>
      <p class="card__price text-2xl font-bold">{{ price }}€</p>
      <div class="card-actions justify-end">
        <button
          class="btn btn-primary btn-sm"
          :disabled="!isAvailable"
          @click="$emit('add-to-cart')"
        >
          Add to Cart
        </button>
        <button class="btn btn-ghost btn-sm" @click="$emit('view-details')">
          Details
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* BEM naming for custom styles */
.card--product {
  /* Custom styles if needed */
}

.card__figure {
  /* Custom styles */
}
</style>
```

### 2. Composants Business (Métier)

**Définition** : Wrappers des composants dumb avec logique UI spécifique.

**Caractéristiques :**

- ✅ Utilise composants dumb
- ✅ Accède aux stores via container
- ✅ Contient logique UI (pas métier)
- ✅ Utilise composables pour extraction logique
- ❌ Pas de logique métier directe

**Emplacement :** `presentation/components/business/`

```vue
<!-- presentation/components/business/ProductCardWithCart.vue -->
<script setup lang="ts">
import { computed } from "vue";
import ProductCard from "../ui/ProductCard.vue";
import { useProductActions } from "./useProductActions";
import type { Product } from "@/domain/entities/Product";

interface Props {
  product: Product;
}

const props = defineProps<Props>();

// Extract UI logic to composable
const { addToCart, viewDetails, isAvailable } = useProductActions(
  props.product,
);

const formattedPrice = computed(() => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(props.product.price);
});
</script>

<template>
  <ProductCard
    :name="product.name"
    :price="formattedPrice"
    :image-url="product.imageUrl"
    :is-available="isAvailable"
    @add-to-cart="addToCart"
    @view-details="viewDetails"
  />
</template>
```

### 3. Composables (Logique UI)

**Définition** : Extraction de la logique UI réutilisable.

**Caractéristiques :**

- ✅ Au plus près du composant qui l'utilise
- ✅ Accède aux stores
- ✅ Peut utiliser TanStack Query
- ✅ Logique UI, pas métier
- ✅ Nommage : `use<Feature>.ts`

**Emplacement :** À côté du composant ou dans `presentation/composables/`

```typescript
// presentation/components/business/useProductActions.ts
import { computed } from "vue";
import { useRouter } from "vue-router";
import { container } from "@/application/container";
import type { Product } from "@/domain/entities/Product";

export function useProductActions(product: Product) {
  const router = useRouter();
  const basketStore = container.basketStore;

  // UI logic: check availability
  const isAvailable = computed(() => product.stock > 0);

  // UI action: add to cart
  function addToCart() {
    basketStore.addItem(product.id, 1);
    // UI feedback
    showToast("Product added to cart");
  }

  // UI action: navigate to details
  function viewDetails() {
    router.push({ name: "product-details", params: { id: product.id } });
  }

  return {
    isAvailable,
    addToCart,
    viewDetails,
  };
}
```

### 4. Pages

**Définition** : Composants route/page qui orchestrent les composants business.

**Caractéristiques :**

- ✅ Gèrent la navigation
- ✅ Orchestrent les composants business
- ✅ Peuvent utiliser TanStack Query directement
- ✅ Layout et structure de la page

**Emplacement :** `presentation/pages/`

```vue
<!-- presentation/pages/ProductsPage.vue -->
<script setup lang="ts">
import { useProducts } from "../composables/useProducts";
import ProductCardWithCart from "../components/business/ProductCardWithCart.vue";

const { products, isLoading, error } = useProducts();
</script>

<template>
  <div class="page page--products min-h-screen bg-base-200">
    <div class="page__header navbar bg-base-100 shadow-lg">
      <h1 class="page__title text-xl">Products</h1>
    </div>

    <div class="page__content container mx-auto p-4">
      <div v-if="isLoading" class="page__loading">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <div v-else-if="error" class="alert alert-error">
        {{ error.message }}
      </div>

      <div v-else class="page__grid grid grid-cols-1 md:grid-cols-3 gap-4">
        <ProductCardWithCart
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* BEM for page-specific styles */
.page--products {
  /* Custom styles */
}
</style>
```

## Composition API - Script Setup

**Toujours utiliser `<script setup>` :**

```vue
<script setup lang="ts">
// ✅ GOOD - Modern, concise
import { ref, computed } from "vue";

interface Props {
  title: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: "submit"): void }>();

const count = ref(0);
const doubled = computed(() => count.value * 2);
</script>
```

## Séparation Logique UI

### Quand Extraire dans un Composable ?

**Extraire si :**

- Logique réutilisée dans plusieurs composants
- Logique complexe (>20 lignes)
- Accès aux stores/services
- Logique de navigation
- Gestion d'état UI complexe

**Garder dans le composant si :**

- Logique simple (<10 lignes)
- Spécifique à ce composant uniquement
- Formatage simple
- Handlers d'événements simples

### Exemple de Séparation

```vue
<!-- ❌ BAD - Tout dans le composant -->
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { container } from "@/application/container";

const router = useRouter();
const basketStore = container.basketStore;
const products = ref([]);
const isLoading = ref(false);
const selectedCategory = ref(null);

onMounted(async () => {
  isLoading.value = true;
  await loadProducts();
  isLoading.value = false;
});

async function loadProducts() {
  // 50 lines of logic...
}

function addToCart(product) {
  // 20 lines of logic...
}

const filteredProducts = computed(() => {
  // 30 lines of logic...
});
</script>
```

```vue
<!-- ✅ GOOD - Logique extraite -->
<script setup lang="ts">
import { useProductList } from "./useProductList";
import ProductCard from "../ui/ProductCard.vue";

const {
  products,
  isLoading,
  selectedCategory,
  filteredProducts,
  addToCart,
  selectCategory,
} = useProductList();
</script>

<template>
  <!-- Clean template -->
</template>
```

```typescript
// useProductList.ts - Composable avec la logique
export function useProductList() {
  const basketStore = container.basketStore;
  const products = ref<Product[]>([]);
  const isLoading = ref(false);
  const selectedCategory = ref<string | null>(null);

  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: () => container.getProductRepository().getAll(),
  });

  watch(data, (newProducts) => {
    if (newProducts) products.value = newProducts;
  });

  const filteredProducts = computed(() => {
    if (!selectedCategory.value) return products.value;
    return products.value.filter((p) => p.category === selectedCategory.value);
  });

  function addToCart(product: Product) {
    basketStore.addItem(product.id, 1);
  }

  function selectCategory(category: string) {
    selectedCategory.value = category;
  }

  return {
    products,
    isLoading,
    selectedCategory,
    filteredProducts,
    addToCart,
    selectCategory,
  };
}
```

## Tests sur les Composants

### Règle Générale : Pas de Tests

**Ne pas tester les composants** sauf si :

- ✅ UX très complexe (formulaire multi-étapes, drag & drop)
- ✅ Spécifications UI précises et critiques
- ✅ Logique d'interaction complexe
- ✅ Demande explicite du client

### Pourquoi Pas de Tests ?

1. Les composants dumb sont testés visuellement
2. La logique métier est testée dans les use cases
3. La logique UI est testée dans les composables (si critique)
4. Les tests de composants sont coûteux à maintenir
5. Les tests E2E couvriront les parcours critiques (plus tard)

### Si Tests Nécessaires

```typescript
// presentation/components/business/__tests__/ComplexForm.test.ts
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import ComplexForm from "../ComplexForm.vue";

describe("ComplexForm", () => {
  it("should validate step 1 before allowing step 2", async () => {
    const wrapper = mount(ComplexForm);

    const nextButton = wrapper.find('[data-testid="next-step"]');
    expect(nextButton.attributes("disabled")).toBeDefined();

    await wrapper.find('input[name="email"]').setValue("test@example.com");
    expect(nextButton.attributes("disabled")).toBeUndefined();
  });
});
```

## Props et Events

### Props

```typescript
// ✅ GOOD - Typed props
interface Props {
  product: Product;
  quantity?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  quantity: 1,
  disabled: false,
});
```

### Events

```typescript
// ✅ GOOD - Typed events
interface Emits {
  (e: "add-to-cart", productId: string, quantity: number): void;
  (e: "remove", productId: string): void;
}

const emit = defineEmits<Emits>();

function handleAdd() {
  emit("add-to-cart", props.product.id, props.quantity);
}
```

## Accès aux Stores

### Dans les Composants Business

```vue
<script setup lang="ts">
import { container } from "@/application/container";

// ✅ Direct access in business components
const basketStore = container.basketStore;
const orderStore = container.orderStore;
</script>
```

### Dans les Composants Dumb

```vue
<script setup lang="ts">
// ❌ NO store access in dumb components
// Only props and events
</script>
```

## Organisation des Fichiers

### Composant Simple

```
ProductCard.vue
```

### Composant avec Composable

```
ProductCard.vue
useProductCard.ts
```

### Composant avec Styles Custom

```
ProductCard.vue
useProductCard.ts
ProductCard.css
```

### Composant Complexe

```
ComplexForm/
  ComplexForm.vue
  useComplexForm.ts
  ComplexFormStep1.vue
  ComplexFormStep2.vue
  complexForm.css
```

## Slots et Composition

### Utiliser les Slots pour Flexibilité

```vue
<!-- ui/Card.vue - Dumb component with slots -->
<template>
  <div class="card bg-base-100 shadow-xl">
    <div v-if="$slots.header" class="card__header">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="$slots.actions" class="card-actions">
      <slot name="actions" />
    </div>
  </div>
</template>
```

```vue
<!-- Usage in business component -->
<template>
  <Card>
    <template #header>
      <h2>{{ product.name }}</h2>
    </template>

    {{ product.description }}

    <template #actions>
      <button @click="addToCart">Add to Cart</button>
    </template>
  </Card>
</template>
```

## Réactivité

### Refs vs Reactive

```typescript
// ✅ Prefer ref for primitives and single values
const count = ref(0);
const user = ref<User | null>(null);

// ✅ Reactive for complex objects (if needed)
const state = reactive({
  count: 0,
  user: null as User | null,
});

// ❌ Avoid mixing
```

### Computed

```typescript
// ✅ GOOD - Derived state
const total = computed(() => {
  return items.value.reduce((sum, item) => sum + item.price, 0);
});

// ❌ BAD - Side effects in computed
const total = computed(() => {
  saveToLocalStorage(items.value); // Side effect!
  return items.value.reduce((sum, item) => sum + item.price, 0);
});
```

## Lifecycle Hooks

```typescript
// ✅ Use onMounted for initialization
onMounted(async () => {
  await loadData();
});

// ✅ Use onUnmounted for cleanup
onUnmounted(() => {
  subscription.unsubscribe();
});

// ✅ Use watch for reactive side effects
watch(selectedCategory, (newCategory) => {
  loadProductsByCategory(newCategory);
});
```

## TypeScript

### Toujours Typer

```vue
<script setup lang="ts">
// ✅ GOOD - Everything typed
interface Props {
  items: Product[];
  total: number;
}

interface Emits {
  (e: "submit", data: OrderData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
</script>
```

### Éviter Any

```typescript
// ❌ BAD
function handleData(data: any) { ... }

// ✅ GOOD
function handleData(data: Product) { ... }

// ✅ GOOD - Generic if needed
function handleData<T>(data: T) { ... }
```

## Checklist Composant Dumb

Avant de créer/valider un composant dumb :

- [ ] Pas d'import de stores
- [ ] Pas d'import de use cases
- [ ] Pas d'import de repositories
- [ ] Pas d'appels API
- [ ] Uniquement props/events
- [ ] Styles DaisyUI ou BEM
- [ ] TypeScript strict
- [ ] Réutilisable dans plusieurs contextes

## Checklist Composant Business

Avant de créer/valider un composant business :

- [ ] Utilise composants dumb
- [ ] Logique UI extraite dans composable si >20 lignes
- [ ] Accède aux stores via container
- [ ] Pas de logique métier directe
- [ ] TypeScript strict
- [ ] Gère les états loading/error

## Exemples Anti-Patterns

### ❌ Logique Métier dans Composant

```vue
<script setup lang="ts">
// BAD - Business logic in component
function calculateDiscount(product: Product): number {
  if (product.category === "electronics") {
    return product.price * 0.1;
  }
  return 0;
}
</script>
```

**Solution** : Déplacer dans `domain/utils/` ou use case.

### ❌ Appel Direct Repository

```vue
<script setup lang="ts">
import { ApiProductRepository } from "@/infrastructure/...";

// BAD - Direct repository access
const repository = new ApiProductRepository();
const products = await repository.getAll();
</script>
```

**Solution** : Utiliser TanStack Query ou store.

### ❌ Store Access dans Composant Dumb

```vue
<!-- ui/Button.vue -->
<script setup lang="ts">
import { container } from "@/application/container";

// BAD - Store in dumb component
const store = container.someStore;
</script>
```

**Solution** : Passer les données via props.

## Références

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vue 3 TypeScript](https://vuejs.org/guide/typescript/overview.html)
