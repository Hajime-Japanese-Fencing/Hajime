---
trigger: always_on
---

# Domain-Driven Design (DDD)

## Introduction

Le Domain-Driven Design (DDD) est une approche de conception logicielle qui met l'accent sur la modélisation du domaine métier et la collaboration entre experts techniques et experts métier. Cette documentation présente les concepts clés du DDD appliqués à notre projet.

## Concepts Fondamentaux

### 1. Ubiquitous Language (Langage Omniprésent)

Un langage partagé entre les développeurs et les experts métier, utilisé dans le code, la documentation et les conversations. Ce langage doit être cohérent et refléter fidèlement les concepts du domaine.

**Exemple dans notre projet :**

- `Licensee` (licencié)
- `Order` (commande)
- `Product` (produit)

### 2. Bounded Context (Contexte Délimité)

Une limite explicite dans laquelle un modèle de domaine particulier est défini et applicable. Chaque bounded context a son propre modèle et son propre langage omniprésent.

**Dans notre architecture :**

```
apps/store/src/
├── features/
│   ├── order/          # Bounded Context: Gestion des commandes
│   ├── licensee/       # Bounded Context: Gestion des licenciés
│   └── product/        # Bounded Context: Gestion des produits
```

### 3. Entities (Entités)

Objets définis par leur identité plutôt que par leurs attributs. Deux entités avec les mêmes attributs mais des identités différentes sont considérées comme distinctes.

**Caractéristiques :**

- Possède un identifiant unique
- Peut changer d'état au cours du temps
- L'identité persiste tout au long du cycle de vie

**Exemple :**

```typescript
interface Licensee {
  id: string; // Identité unique
  firstName: string;
  lastName: string;
  licenseNumber: string;
  // ...
}
```

### 4. Value Objects (Objets Valeur)

Objets définis uniquement par leurs attributs, sans identité conceptuelle. Deux value objects avec les mêmes attributs sont considérés comme identiques.

**Caractéristiques :**

- Immuables
- Pas d'identifiant
- Définis par leurs valeurs

**Exemple :**

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

### 5. Aggregates (Agrégats)

Un cluster d'objets de domaine (entités et value objects) traités comme une unité pour les modifications de données. Chaque agrégat a une racine (Aggregate Root) et une limite.

**Règles :**

- L'accès externe se fait uniquement via la racine de l'agrégat
- Les invariants métier sont maintenus à l'intérieur de l'agrégat
- Les transactions ne doivent pas traverser les limites des agrégats

**Exemple :**

```typescript
// Order est la racine de l'agrégat
interface Order {
  id: string;
  licenseeId: string;
  items: OrderItem[]; // Entités internes à l'agrégat
  totalAmount: Money; // Value object
  status: OrderStatus;

  // Méthodes qui maintiennent les invariants
  addItem(item: OrderItem): void;
  removeItem(itemId: string): void;
  calculateTotal(): Money;
}
```

### 6. Domain Services (Services de Domaine)

Opérations qui ne relèvent naturellement d'aucune entité ou value object. Ils encapsulent la logique métier qui implique plusieurs objets du domaine.

**Quand utiliser un Domain Service :**

- L'opération représente un concept métier important
- L'opération implique plusieurs agrégats
- L'opération ne relève naturellement d'aucune entité

**Exemple :**

```typescript
class OrderPricingService {
  calculateOrderTotal(items: OrderItem[], licensee: Licensee): Money {
    // Logique de calcul complexe impliquant
    // plusieurs objets du domaine
  }
}
```

### 7. Repositories (Dépôts)

Abstractions qui encapsulent la logique d'accès aux données et fournissent une interface orientée collection pour accéder aux agrégats.

**Responsabilités :**

- Récupérer et persister les agrégats
- Fournir une abstraction sur la couche de persistance
- Maintenir l'illusion d'une collection en mémoire

**Exemple :**

```typescript
interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByLicenseeId(licenseeId: string): Promise<Order[]>;
  save(order: Order): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### 8. Domain Events (Événements de Domaine)

Représentent quelque chose qui s'est passé dans le domaine et qui est important pour les experts métier.

**Caractéristiques :**

- Nommés au passé (OrderCreated, PaymentProcessed)
- Immuables
- Contiennent toutes les informations nécessaires

**Exemple :**

```typescript
interface OrderCreatedEvent {
  orderId: string;
  licenseeId: string;
  items: OrderItem[];
  createdAt: Date;
}
```

## Couches de l'Architecture DDD

### 1. Domain Layer (Couche Domaine)

Le cœur de l'application, contient la logique métier pure.

**Contenu :**

- Entities
- Value Objects
- Aggregates
- Domain Services
- Domain Events
- Repository Interfaces

**Localisation :**

```
features/[feature-name]/domain/
├── entities/
├── value-objects/
├── services/
├── events/
└── repositories/
```

### 2. Application Layer (Couche Application)

Coordonne les opérations de l'application et orchestre le flux de données.

**Contenu :**

- Use Cases (cas d'utilisation)
- Application Services
- DTOs (Data Transfer Objects)
- Command/Query Handlers

**Localisation :**

```
features/[feature-name]/application/
└── use-cases/
    ├── create-order/
    │   ├── create-order.use-case.ts
    │   └── create-order.dto.ts
    └── get-order/
```

### 3. Infrastructure Layer (Couche Infrastructure)

Implémentations techniques des interfaces définies dans le domaine.

**Contenu :**

- Repository Implementations
- External Services Adapters
- Database Access
- API Clients

**Localisation :**

```
features/[feature-name]/infrastructure/
└── adapters/
    ├── repositories/
    └── services/
```

### 4. Presentation Layer (Couche Présentation)

Interface utilisateur et points d'entrée de l'application.

**Contenu :**

- Components
- Pages
- Composables
- View Models

**Localisation :**

```
presentation/
├── components/
├── pages/
└── composables/
```

## Patterns Tactiques DDD

### 1. Specification Pattern

Encapsule la logique métier de validation ou de sélection dans des objets réutilisables.

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

Encapsule la logique complexe de création d'objets du domaine.

```typescript
class OrderFactory {
  static createFromLicensee(licensee: Licensee, items: OrderItem[]): Order {
    // Logique complexe de création
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

Permet de définir une famille d'algorithmes et de les rendre interchangeables.

```typescript
interface PricingStrategy {
  calculatePrice(order: Order): Money;
}

class StandardPricingStrategy implements PricingStrategy {
  calculatePrice(order: Order): Money {
    // Calcul standard
  }
}

class MemberPricingStrategy implements PricingStrategy {
  calculatePrice(order: Order): Money {
    // Calcul avec réduction membre
  }
}
```

## Principes de Conception DDD

### 1. Maintenir l'Intégrité du Modèle

- Les invariants métier doivent toujours être respectés
- Les agrégats sont responsables de leur propre cohérence
- Les transactions respectent les limites des agrégats

### 2. Isoler le Domaine

- La logique métier ne dépend pas de l'infrastructure
- Les dépendances pointent vers le domaine (Dependency Inversion)
- Le domaine est testable sans infrastructure

### 3. Modéliser de Manière Expressive

- Le code reflète le langage métier
- Les noms sont significatifs et cohérents
- La structure du code suit la structure du domaine

### 4. Itérer avec les Experts Métier

- Collaboration continue avec le métier
- Raffiner le modèle en fonction des retours
- Adapter le code aux changements de compréhension

## Anti-Patterns à Éviter

### 1. Anemic Domain Model

Un modèle où les entités ne contiennent que des données sans comportement.

**❌ Mauvais :**

```typescript
interface Order {
  id: string;
  items: OrderItem[];
  total: number;
}

// Logique métier dans un service
class OrderService {
  calculateTotal(order: Order): number {
    // ...
  }
}
```

**✅ Bon :**

```typescript
class Order {
  constructor(
    private id: string,
    private items: OrderItem[],
  ) {}

  calculateTotal(): Money {
    // Logique métier dans l'entité
  }
}
```

### 2. God Object

Un objet qui en sait trop ou fait trop de choses.

**Solution :** Diviser en agrégats plus petits et cohérents.

### 3. Ignorer les Bounded Contexts

Mélanger des concepts de différents contextes dans un seul modèle.

**Solution :** Définir clairement les limites et créer des modèles séparés.

## Ressources Complémentaires

- **Livre de référence :** "Domain-Driven Design" par Eric Evans
- **Livre pratique :** "Implementing Domain-Driven Design" par Vaughn Vernon
- **Documentation projet :** Voir les règles d'architecture dans `.windsurf/rules/`

## Application dans Notre Projet

Notre projet utilise DDD en combinaison avec l'architecture hexagonale. Consultez les documents suivants pour plus de détails :

- `@.windsurf/rules/01-architecture-hexagonale.md` - Architecture globale
- `@.windsurf/rules/02-feature-folders-structure.md` - Organisation des features
- `@docs/use-cases/` - Exemples de cas d'utilisation
