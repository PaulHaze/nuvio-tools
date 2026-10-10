# Epic: UI (design system)

Branches `ui-01` to `ui-04`, worked one at a time in order. Scope: settle the look, land it as
tokens, and apply it to the site shell and today's Listio screens. No components in this epic.
Usage rules live in [`docs/DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md) (from ui-02); values live in
`src/lib/ui/main.css`.

| #   | Sprint                                                  | One line                                                                                         | Status      |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------- |
| 01  | [Design system mood board](./01_Mood_Board.md)          | Mood boards in `../html_UI_mocks/`; chosen direction and final values recorded                   | done        |
| 02  | [Dark-only tokens and fonts](./02_Tokens_And_Fonts.md)  | Rewrite `main.css` as dark-only tokens with `data-page`/`data-tool`, swap fonts, drop the toggle | not started |
| 03  | [Site shell and home page](./03_Site_Shell_And_Home.md) | Layout wiring, brand header, footer, shell classes, home hero and tool cards, holding pages      | not started |
| 04  | [Listio visual pass](./04_Listio_Pass.md)               | Move Listio CSS into `src/tools/listio/`, restyle its existing classes with the new tokens       | not started |

**After this epic:** a shared components epic (used by all three tools), then the Listio rebuild.
See [`docs/roadmap.md`](../../roadmap.md).
