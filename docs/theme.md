# Theme development

We are transitioning from a Bootstrap 4 theme to a custom Svelte-component-based
design system.

- [Bootstrap 4 theme](https://github.com/tradingstrategy-ai/theme) (phasing-out)
- [Trading Strategy Design System](https://github.com/tradingstrategy-ai/design-system) (phasing-in)

The Bootstrap theme is included as a submodule under `deps/theme`. You can start a
dev server for the theme:

```shell
( cd deps/theme && npx gulp )
```

Most theme configuration options can be edited in: `deps/theme/src/scss/neumorphism/_variables.scss`.

## Color scheme

- Primary background: #fdf8f2 - light beige
- Primary darker: #d9c4a6 - dark beige
- Secondary/accent color: #a9a9b2 - light gray
- Bullish green: #22b554
- Bearish red: #f62f2f

## Fonts

Logo font: Saira Condensed

Headings: Exo 2

Body Text: Open Sans

## Icons and decorative pictures

[Licensed Streamline Freehand icons](https://app.streamlinehq.com/icons/streamline-freehand)
