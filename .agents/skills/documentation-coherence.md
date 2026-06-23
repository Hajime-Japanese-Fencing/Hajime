---
trigger: always_on
---

# Cohérence de la Documentation

## Principe Fondamental

**Toujours vérifier et maintenir la cohérence entre tous les documents du projet.**

La documentation est un actif critique du projet. Toute incohérence entre les différents documents peut créer de la confusion et des erreurs de développement.

## Documents à Maintenir en Cohérence

### 1. Brief Projet

**Fichier** : `docs/README.md`

**Contenu** :

- Vue d'ensemble du projet
- Fonctionnalités principales
- Liste des use cases documentés
- Architecture technique
- État actuel du projet

**Responsabilité** : Document de référence principal, source de vérité pour la vision globale.

### 2. Index des Use Cases

**Fichier** : `docs/use-cases/README.md`

**Contenu** :

- Index complet de tous les use cases
- Organisé par feature
- Liens vers chaque documentation

**Responsabilité** : Doit lister TOUS les use cases documentés.

### 3. Use Cases Individuels

**Dossiers** : `docs/use-cases/<feature>/`

**Contenu** :

- Documentation détaillée de chaque use case
- Acteurs, scénarios, règles de gestion
- Exceptions et contraintes

**Responsabilité** : Doit être aligné avec le brief et l'implémentation.

### 4. README Applications

**Fichiers** : `apps/*/README.md`

**Contenu** :

- Description de l'application
- Fonctionnalités implémentées
- Architecture spécifique

**Responsabilité** : Doit refléter l'état réel de l'application.

## Règles de Cohérence

### RC-001 : Synchronisation Use Cases

**Règle** : Tout use case mentionné dans le brief doit :

1. Avoir un fichier de documentation dans `docs/use-cases/<feature>/`
2. Être listé dans l'index `docs/use-cases/README.md`
3. Correspondre à une implémentation dans `apps/store/src/domain/usecases/`

**Vérification** :

```bash
# Comparer les fichiers use cases avec l'index
ls docs/use-cases/*/
cat docs/use-cases/README.md
cat docs/README.md
```

### RC-002 : Cohérence des Acteurs

**Règle** : Les acteurs définis dans chaque use case doivent être cohérents avec :

- La section "Acteurs" du brief (`docs/README.md`)
- Les fonctionnalités décrites pour chaque acteur
- Le scénario nominal du use case

**Acteurs du projet** :

- **Licenciés** : Passent des commandes individuelles
- **Administrateurs** : Gèrent les commandes globales

**Vérification** :

- Si le use case concerne une action de licencié → Acteur principal = Licencié
- Si le use case concerne la gestion globale → Acteur principal = Administrateur

### RC-003 : Alignement Fonctionnalités

**Règle** : Les fonctionnalités listées dans le brief doivent avoir :

- Un ou plusieurs use cases documentés
- OU une justification explicite si c'est de la logique UI pure

**Fonctionnalités Licenciés** (brief) :

- ✅ Sélection du profil → Logique UI (pas de use case nécessaire)
- ✅ Consultation du catalogue → Use case `get-all-products`
- ✅ Gestion du panier → Logique UI locale (TanStack Store)
- ✅ Passage de commande → Use case `create-licensee-order`
- ✅ Historique → Use case `get-licensee-order-history`

**Fonctionnalités Administrateurs** (brief) :

- ✅ Création de commande globale → Use case `create-order`
- ✅ Gestion du statut → Use case `update-order-status`
- ✅ Consultation → Use case `get-current-order`

### RC-004 : Synchronisation Index

**Règle** : L'index `docs/use-cases/README.md` doit :

1. Lister TOUS les fichiers `.md` présents dans `docs/use-cases/*/`
2. Être organisé par feature (Order, Licensee, Product)
3. Utiliser les mêmes titres que dans les fichiers de use cases

**Vérification automatique** :

```bash
# Lister tous les use cases documentés
find docs/use-cases -name "*.md" -not -name "README.md" -not -name "template.md"

# Comparer avec l'index
grep -E "^\- \[" docs/use-cases/README.md
```

### RC-005 : Cohérence Brief ↔ Use Cases

**Règle** : La section "Use Cases Documentés" du brief (`docs/README.md`) doit :

1. Lister exactement les mêmes use cases que l'index
2. Utiliser les mêmes titres
3. Être organisé de la même manière (par feature)

**Vérification** :

- Comparer `docs/README.md` (section Use Cases Documentés)
- Avec `docs/use-cases/README.md` (section Index des Use Cases)

### RC-006 : Versionning de la Documentation

**Règle** : Lors de modifications importantes :

1. Mettre à jour la section "Historique" du use case modifié
2. Mettre à jour la date de "Dernière mise à jour" dans le brief
3. Incrémenter la version si changement majeur

**Format Historique** :

```markdown
| Date       | Version | Auteur | Modifications |
| ---------- | ------- | ------ | ------------- |
| YYYY-MM-DD | X.Y     | Nom    | Description   |
```

## Workflow de Vérification

### Avant Chaque Commit

1. **Vérifier les use cases** :
   - Tous les fichiers sont dans l'index ?
   - Tous les use cases de l'index existent ?

2. **Vérifier les acteurs** :
   - Cohérents avec le brief ?
   - Cohérents avec le scénario nominal ?

3. **Vérifier le brief** :
   - Liste des use cases à jour ?
   - Fonctionnalités alignées ?

### Lors de l'Ajout d'un Use Case

1. Créer le fichier `docs/use-cases/<feature>/<use-case>.md`
2. Ajouter à l'index `docs/use-cases/README.md`
3. Ajouter au brief `docs/README.md` (section Use Cases Documentés)
4. Vérifier la cohérence des acteurs

### Lors de la Modification d'un Use Case

1. Mettre à jour le fichier de documentation
2. Ajouter une entrée dans l'historique
3. Vérifier si le brief doit être mis à jour
4. Vérifier la cohérence avec l'implémentation

### Lors de la Suppression d'un Use Case

1. Supprimer le fichier de documentation
2. Retirer de l'index `docs/use-cases/README.md`
3. Retirer du brief `docs/README.md`
4. Supprimer l'implémentation correspondante

## Checklist de Cohérence

Avant de valider une modification de documentation :

- [ ] Tous les use cases du brief sont dans l'index
- [ ] Tous les use cases de l'index ont un fichier de documentation
- [ ] Tous les fichiers de documentation sont dans l'index
- [ ] Les acteurs sont cohérents dans tous les use cases
- [ ] Les fonctionnalités du brief ont des use cases correspondants
- [ ] Les titres sont identiques entre brief, index et fichiers
- [ ] L'organisation par feature est cohérente partout
- [ ] Les dates de mise à jour sont actuelles

## Outils de Vérification

### Script de Vérification (Future)

```bash
#!/bin/bash
# verify-docs-coherence.sh

echo "Vérification de la cohérence de la documentation..."

# 1. Lister les use cases documentés
documented=$(find docs/use-cases -name "*.md" -not -name "README.md" -not -name "template.md" | wc -l)

# 2. Compter les entrées dans l'index
indexed=$(grep -c "^\- \[" docs/use-cases/README.md)

# 3. Comparer
if [ "$documented" -eq "$indexed" ]; then
  echo "✅ Index cohérent: $documented use cases"
else
  echo "❌ Incohérence: $documented fichiers, $indexed dans l'index"
  exit 1
fi
```

## Exemples d'Incohérences à Éviter

### ❌ Use Case dans le Brief mais pas Documenté

```markdown
<!-- docs/README.md -->

### Order (Commande)

1. Créer une commande globale
2. Supprimer une commande ← Pas de fichier correspondant!
```

### ❌ Use Case Documenté mais pas dans l'Index

```
docs/use-cases/order/cancel-order.md existe
Mais absent de docs/use-cases/README.md
```

### ❌ Acteur Incohérent

```markdown
<!-- Use case: create-licensee-order.md -->

Acteur principal: Administrateur ← ERREUR!
Scénario: Le licencié ajoute des articles... ← Incohérence!
```

### ❌ Titres Différents

```markdown
<!-- docs/README.md -->

1. Créer une commande globale

<!-- docs/use-cases/README.md -->

- [Créer une commande](order/create-order.md) ← Titre différent!
```

## Responsabilités

### Développeur

- Vérifier la cohérence avant chaque commit
- Mettre à jour la documentation lors de modifications métier
- Signaler les incohérences détectées

### Cascade (AI Assistant)

- **TOUJOURS** vérifier la cohérence lors de modifications de documentation
- Proposer des corrections si incohérences détectées
- Maintenir l'alignement entre brief, index et use cases
- Vérifier les acteurs dans les use cases

### Reviewer

- Valider la cohérence lors des code reviews
- Vérifier que la documentation est à jour
- S'assurer que les use cases reflètent l'implémentation

## Maintenance

Cette règle doit être appliquée :

- ✅ Lors de la création de use cases
- ✅ Lors de la modification de use cases
- ✅ Lors de la suppression de use cases
- ✅ Lors de la mise à jour du brief
- ✅ Lors de l'ajout de fonctionnalités
- ✅ Avant chaque commit touchant `docs/`

## Références

- [Template Use Case](../../docs/use-cases/template.md)
- [Brief Projet](../../docs/README.md)
- [Index Use Cases](../../docs/use-cases/README.md)
- [Domain-Driven Design](./domain-driven-design.md)

---

**Version** : 1.0  
**Dernière mise à jour** : 26 mars 2026  
**Statut** : Always On - Règle active en permanence
