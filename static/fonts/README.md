# Fonts

This directory contains the font assets used by the frontend.

Some files here are committed to the repo, but the licensed `Neue Haas Grotesk` files are intentionally not.

To fetch and sync the missing font files from the companion fonts repository, run:

```shell
bash scripts/setup-fonts.sh
```

You can also point the script at an existing checkout or a specific ref:

```shell
bash scripts/setup-fonts.sh /path/to/fonts-checkout
bash scripts/setup-fonts.sh /path/to/fonts-checkout main
```

The script reads [`fonts5.css`](./fonts5.css) and syncs the referenced font directories into `static/fonts`.
