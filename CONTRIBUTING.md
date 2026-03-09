# Contribute to the Versatile Thermostat Website

Hi! Welcome on the Vesatile Termostat project. This is your first step before make a contribution on the website.

- [Contribute to the Versatile Thermostat Website](#contribute-to-the-versatile-thermostat-website)
  - [Translations](#translations)
  - [Device compatibility database](#device-compatibility-database)
    - [Main database: devices.json](#main-database-devicesjson)
      - [State property explanation](#state-property-explanation)
      - [Type property explanation](#type-property-explanation)
    - [Device description](#device-description)
    - [Device configuration](#device-configuration)
  - [Source code](#source-code)
    - [Branch Policy](#branch-policy)
      - [Protected Branches](#protected-branches)
      - [Branch Naming](#branch-naming)
      - [Merge Strategy](#merge-strategy)
    - [TypeScript Only — No JavaScript](#typescript-only--no-javascript)
    - [Next.js Conventions](#nextjs-conventions)
    - [Component Guidelines](#component-guidelines)
    - [Dependency Policy](#dependency-policy)
    - [Secrets \& Environment Variables](#secrets--environment-variables)
      - [Rules](#rules)
      - [If You Accidentally Commit a Secret](#if-you-accidentally-commit-a-secret)
    - [Performance](#performance)
      - [Client Bundle](#client-bundle)
      - [Images](#images)
      - [Data Fetching](#data-fetching)
      - [Core Web Vitals](#core-web-vitals)
    - [Pull Request Requirements](#pull-request-requirements)
      - [PR Description Template](#pr-description-template)
      - [Scope](#scope)
    - [Commit Convention](#commit-convention)

## Translations

The website is currently in 3 languages (EN / DE / FR). The main language is English. We have frensh speaking contributor but we don't have any skills on the main team with other language.

Thanks to @FMainz for the first translation in german.

We accept other contributions and any translations in all Versatile Thermostat supported language:
- EN
- FR
- DE
- CS
- EL
- IT
- PL
- RU
- SK

You can see all supported languages [on the git tree of Versatile Thermostat](https://github.com/jmcollin78/versatile_thermostat/tree/main/custom_components/versatile_thermostat/translations). All other language will not be accepted. If you want to add another language than supported by Versatile Thermostat, add a translation on the main project first.


## Device compatibility database

The website introduce a [device compatibility database](https://www.versatile-thermostat.org/en/devices/). You have two ways to contribute on this database:

- Option A: Create [an issue type device](https://github.com/bontiv/vtherm-website/issues/new?template=new_device.yml) (recommanded).
- Option B: Create a Pull Request.

With the issue contribution, we will help you to add a device on the database.


The device database use 3 files:
1. devices.json: base information about the device.
2. config.json: The preconfigured setting for this device.
3. README.md: More informations about the device.


### Main database: devices.json

The [devices.json](devicesdb/devices.json) is the main database of devices. It's a single file in the databasesdb directory. This file describe the base informations about a device.

The file is an array of devices objects like this:
```json
{
    "manufacturer": "Eutronic",
    "title": "Eutronic Comet",
    "model": "CoZB_dha",
    "img": "https://www.zigbee2mqtt.io/images/devices/CoZB_dha.png",
    "state": "community",
    "slug": "over-climate-valve",
    "type": "trv"
}
```

The device property are:

| Property | Mandatory | Type | Description |
| --- | --- | --- | --- |
| manufacturer | yes | `string` | Manufacturer of the device |
| title | no | `string` | Device display name |
| model | yes | `string` | Model number of the device |
| img | yes | `string` | Picture of the device |
| state | yes | "supported" "community" "partially" "unsupported" | Status of the device |
| slug | yes | `string` | Name of the device details directory |
| type | yes | "trv" "climate" "electric" | Type of device |

The slug is use for all device details. Many devices can have the same slug if all of them use the same configuration (like many models of the same manufacturer).

#### State property explanation
- **supported**: Reserved to main Versatile Thermostat core team. These device is actively tested by the core team.
- **community**: Tested and fully fonctionnal device, added by the community.
- **partially**: The device work with some limitations. Many features will not work or you will not have a best regulation on these devices.
- **unsuported**: These devices is known as not working at all.

#### Type property explanation
- **trv**: Electric valve, in use with water radiators.
- **climate**: The device expose a climate like a heat pump.
- **electric**: Electric heater.

### Device description

Each device must have a slug. A name of a directory (and will be a part of path in URL) in devicesdb. You can view the [example of Sonoff TRVZB](devicesdb/sonoff-trvzb/).

On this directory, you can add a `README.md`. This readme will be show on the device page, before the configuration wizard.

You can write any additional informations for this device. How to configure it, best blueprint to use with and whatever you want.

If you write a `README.md`, the english is mandatory. You can add a readme in any other supported languages on the same directory with the language on the filename like:

- `README-FR.md` for french,
- `README-DE.md` for german.

### Device configuration

You must have a `config.json` file for each slug. This file is located on the child directory of [devicesdb](devicesdb/) with the device slug as name. It's the same directory as the device `README.md`. This file is mandatory.

Example, [config.json of Heatzy](devicesdb/heatzy/config.json):

```json
{
    "title": "Heatzy",
    "config": {
        "thermostat_type": "thermostat_over_switch",
        "minimal_activation_delay": 30,
        "minimal_deactivation_delay": 30
    }
}
```

The title key is recommanded. The title will be use as the device detail page title.

The config key is an object that represent the recommanded config for this device. This key is a mapping of property - values as they are recorded by versatile thermostat.

All key of the config must exist on [const.py of Versatile Thermostat](https://github.com/jmcollin78/versatile_thermostat/blob/main/custom_components/versatile_thermostat/const.py).

For example
```python
CONF_MINIMAL_ACTIVATION_DELAY = "minimal_activation_delay"
```

You can use `minimal_activation_delay` as a key of the config object and set a recommanded value.

> [!IMPORTANT]
> Defined configurations should only be recommandations for device usage in all cases.
> You must not define configuration for device tuning.

If you set `minimal_activation_delay` on the device configuration, it's because they are a minimal activation delay for the device to work. Below the minimal activation delay, the device will not answer and will not turn off. It's a generic case. Not a tuning.

## Source code

### Branch Policy

#### Protected Branches

| Branch / tag | Purpose | Direct push |
|--------|---------|-------------|
| `production` (tag) | Production-ready code | ❌ Forbidden |
| `main` | Pre-production integration | ❌ Forbidden |

All changes to `main` **must go through a Pull Request** with at least **1 approved review**. Force-pushes are disabled on both branches.

The `production` tag is only updated on the `main` branch.

#### Branch Naming

Create your working branch from `main` using the following convention:

```
<type>/<short-description>
```

| Prefix | When to use |
|--------|-------------|
| `feat/` | New feature (e.g., `feat/user-authentication`) |
| `fix/` | Bug fix (e.g., `fix/header-hydration-mismatch`) |
| `chore/` | Tooling, deps, config (e.g., `chore/upgrade-next-15`) |
| `refactor/` | Code restructuring (e.g., `refactor/api-layer`) |
| `docs/` | Documentation only (e.g., `docs/update-contributing`) |


#### Merge Strategy

- All PRs are merged using **Squash and Merge** to keep `main` history linear and readable.
- The squashed commit message must follow the [Commit Convention](#commit-convention).
- Delete your branch after merging.

### TypeScript Only — No JavaScript

This project is **100% TypeScript**. JavaScript files (`.js`, `.jsx`, `.mjs`, `.cjs`) are **not accepted** anywhere in the codebase, including configuration files, scripts, or tests.

- Every file must use the `.ts` or `.tsx` extension.
- All variables, function parameters, and return types **must be explicitly typed**. Avoid relying on implicit inference for public-facing APIs and component props.
- The use of `any` is **forbidden**. Use `unknown` and type narrowing, or define a proper interface/type.
- Prefer `interface` for object shapes and `type` for unions, intersections, and mapped types.

```ts
// ❌ Bad
const fetchUser = async (id) => { ... }

// ✅ Good
const fetchUser = async (id: string): Promise => { ... }
```

### Next.js Conventions

- Use the **App Router** (`/app` directory) exclusively. Do not mix App Router and Pages Router patterns.
- Prefer **React Server Components** (RSC) by default. Only add `"use client"` when strictly necessary (event handlers, browser APIs, client-side state).
- Do not use `getServerSideProps` or `getStaticProps` — use `fetch` with Next.js cache options inside Server Components instead.


### Component Guidelines

- One component per file.
- Component files must be named in **PascalCase** (e.g., `UserCard.tsx`).
- Utility/helper functions must be placed in `/lib` and named in **camelCase**.
- Do not use default exports for utilities — use named exports.


---

### Dependency Policy

> **Adding a new dependency requires explicit justification.**

Dependencies increase bundle size, maintenance burden, and security surface area. Before adding any package, you must demonstrate that:

1. The functionality **cannot reasonably be implemented** in a few lines of native TypeScript/JavaScript.
2. The package is **actively maintained**, has a healthy community, and a compatible license (MIT, ISC, Apache-2.0).
3. The package does **not introduce a significantly heavier alternative** to something already in the project (e.g., do not add `moment` if `date-fns` is already present).

If your PR introduces a new dependency, include in the PR description:

- The package name and version
- The reason it cannot be avoided
- A brief audit: weekly downloads, last publish date, license, known vulnerabilities

**Development-only dependencies** (`devDependencies`) are subject to the same policy.

---

### Secrets & Environment Variables

> **Never commit secrets, API keys, tokens, or credentials of any kind.**

This is a hard rule with no exceptions. A secret pushed to a repository — even briefly before being removed — must be considered **compromised** and rotated immediately.

#### Rules

- All environment variables must be declared in a **`.env.local`** file locally (already in `.gitignore` — do not remove that entry).
- `.env.example` is the only env file versioned in the repository. It must list all required variable names with **placeholder values** and a short comment describing each:

```bash
# Base URL of the application
NEXT_PUBLIC_APP_URL=https://example.com

# Secret key used to sign session tokens — generate with: openssl rand -base64 32
AUTH_SECRET=your-secret-here

# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
```

- Never use `NEXT_PUBLIC_` prefix for sensitive values. Variables prefixed with `NEXT_PUBLIC_` are **inlined into the client bundle** and visible to anyone.
- Validate all environment variables at startup using a typed schema (e.g., with `zod`). Declare their types in a dedicated `src/env.ts` file so that invalid or missing variables cause an explicit build error rather than a silent runtime failure:

```ts
// src/env.ts
import { z } from 'zod';

const envSchema = z.object({
  AUTH_SECRET: z.string().min(32),
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

- If you add a new environment variable, you **must** update both `.env.example` and `src/env.ts` in the same PR.

#### If You Accidentally Commit a Secret

1. **Rotate the secret immediately** — assume it is already compromised.
2. Notify a maintainer.
3. Do not rely on `git revert` or history rewriting to "hide" it — the rotation is the only real fix.

---

### Performance

Performance is a first-class concern in this project. The following rules apply to any PR that touches UI, data fetching, or adds new dependencies.

#### Client Bundle

- Prefer **React Server Components** over Client Components whenever possible. Every `"use client"` boundary adds to the client bundle.
- Do not import large libraries in Client Components without verifying their impact. Use [bundlephobia.com](https://bundlephobia.com) or the Next.js Bundle Analyzer before adding anything non-trivial:

```bash
ANALYZE=true npm run build
```

- Use **dynamic imports** (`next/dynamic`) for components that are heavy, below the fold, or only rendered conditionally:

```ts
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => ,
});
```

#### Images

- Always use the **`<Image>`** component from `next/image` instead of the native `<img>` tag. It enforces lazy loading, modern formats (WebP/AVIF), and prevents layout shift.
- Always provide explicit `width` and `height` props, or use `fill` with a sized parent container.
- Never use `unoptimized={true}` without a comment explaining why.

```tsx
// ❌ Bad


// ✅ Good

```

#### Data Fetching

- Default to **static rendering** (`fetch` without `cache: 'no-store'`). Only opt into dynamic rendering when the data genuinely changes per request.
- Use `loading.tsx` and `Suspense` boundaries to stream content progressively instead of blocking the entire page on slow data.
- Avoid waterfalls: fetch data in parallel using `Promise.all` when multiple independent requests are needed.

```ts
// ❌ Bad — sequential waterfall
const user = await getUser(id);
const posts = await getPosts(id);

// ✅ Good — parallel
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
```

#### Core Web Vitals

PRs introducing significant UI changes should not regress Core Web Vitals. Run Lighthouse locally against a production build before opening the PR:

```bash
npm run build && npm run start
# Then run Lighthouse in Chrome DevTools or via CLI
```

Target thresholds: **LCP < 2.5s**, **CLS < 0.1**, **INP < 200ms**.

---

### Pull Request Requirements

All PRs **must** satisfy the following before being reviewed:

| Check | Command | Requirement |
|-------|---------|-------------|
| TypeScript build | `npm run build` | Zero errors |
| ESLint | `npm run lint` | Zero errors, zero warnings |
| Formatting | `npm run format:check` | No diff |
| Tests (if applicable) | `npm run test` | All tests pass |

PRs that fail any of these checks **will not be reviewed** until they are fixed.

#### PR Description Template

When opening a PR, please fill in the following:

```markdown
## Summary


## Motivation


## Changes


## New Dependencies (if any)


## Screenshots (if applicable)
<!-- For UI changes, include before/after screenshots -->
```

#### Scope

- Keep PRs **small and focused**. One PR = one concern.
- Do not mix refactoring with feature work in the same PR.
- If a PR becomes too large, split it into smaller ones and open a tracking issue.

---

### Commit Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

```
<type>(optional scope): <short description>

[optional body]

[optional footer]
```

**Allowed types:**

| Type | When to use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `chore` | Tooling, config, dependency updates |
| `refactor` | Code restructuring without behavior change |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `docs` | Documentation changes only |
| `style` | Formatting, whitespace (no logic change) |
| `ci` | CI/CD pipeline changes |

**Examples:**

```bash
feat(auth): add OAuth2 login with GitHub
fix(header): resolve hydration mismatch on mobile
chore: upgrade next to 15.1.0
docs: update contributing guide with dependency policy
```
