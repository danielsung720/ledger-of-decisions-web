# Icon Usage Guidelines

## Purpose

- Keep UI icon style consistent with `AppIcon + IconKey`.
- Prevent direct emoji usage in icon contexts.

## Single Entry

- Always render icons via `AppIcon`.
- Add new icon names in `types/icon.ts`.
- Add icon SVG node mapping in `utils/icons.ts`.

## Allowed Pattern

- Constants should store icon keys only.
- Example: `{ label: '生活', icon: 'home' }`

## Forbidden Pattern

- Do not put emoji directly in `components/`, `pages/`, or `utils/constants.ts` for icon purposes.
- Example forbidden: `icon: '🏠'`.

## Fallback Strategy

- Unknown or missing icons must fallback to `help-circle`.
- Keep fallback behavior inside `AppIcon`/`ICON_MAP` flow.

## Guard Command

```bash
cd ledger-of-decisions-web
npm run guard:emoji-icons
```

## CI Behavior

- CI runs emoji icon guard before E2E workflow execution.
- If any guarded file contains emoji-like icon characters, the workflow fails.
