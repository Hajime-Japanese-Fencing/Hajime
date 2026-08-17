# General

> **Language**: The language of expression for this project is **English**. All code, comments, documentation, and contributions must be written in English.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

<!-- rtk-instructions v2 -->

## RTK (Rust Token Killer) — Toujours utiliser

**Toujours préfixer les commandes avec `rtk`**. Si RTK a un filtre dédié, il l'utilise. Sinon, la commande passe telle quelle. RTK est toujours sûr à utiliser.

**Important** : Même dans les chaînes avec `&&`, utiliser `rtk` :

```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

### Commandes RTK par workflow

**Build & Compile** (80-90% savings)

```bash
rtk tsc        # TypeScript errors groupés par fichier (83%)
rtk lint       # ESLint/Biome violations groupées (84%)
rtk next build # Next.js build avec route metrics (87%)
```

**Test** (60-99% savings)

```bash
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk jest                # Jest failures only (99.5%)
```

**Git** (59-80% savings)

```bash
rtk git status   # Compact status
rtk git log      # Compact log (fonctionne avec tous les flags git)
rtk git diff     # Compact diff (80%)
rtk git add      # Confirmations ultra-compactes (59%)
rtk git commit   # Confirmations ultra-compactes (59%)
rtk git push     # Confirmations ultra-compactes
```

**JavaScript/TypeScript** (70-90% savings)

```bash
rtk pnpm install    # Compact install output (90%)
rtk pnpm list       # Compact dependency tree (70%)
rtk pnpm outdated   # Compact outdated packages (80%)
```

**Files & Search** (60-75% savings)

```bash
rtk ls <path>        # Tree format, compact (65%)
rtk grep <pattern>   # Search groupé par fichier (75%)
rtk find <pattern>   # Find groupé par répertoire (70%)
```

**Meta**

```bash
rtk gain            # Voir les statistiques de savings
rtk gain --history  # Historique des commandes avec savings
```

<!-- /rtk-instructions -->
