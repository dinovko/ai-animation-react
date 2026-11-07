# ai-animation-react

Personal React library. A block appears as if an AI agent were drawing it: a colored cursor drags a selection frame, and the content is uncovered behind a moving `clip-path`.

Личная React-библиотека. Блок появляется так, будто его рисует AI-агент: цветной курсор тянет рамку выделения, а содержимое открывается по движущемуся `clip-path`.

Жеке React кітапханасы. Блокты AI-агент салып жатқандай көрсетеді: түсті курсор таңдау жақтауын сүйрейді, мазмұн қозғалатын `clip-path` арқылы ашылады.

**English** · [Русский](#русский) · [Қазақша](#қазақша)

---

## English

### What it does

`AgentReveal` wraps existing markup. It does not restyle the child. While the scan runs, the wrapper is clipped to the revealed region, a fixed overlay draws a Figma-like frame (handles, live `width × height`) and a cursor with the agent name. When the scan finishes, the clip, the frame, and the cursor go away. The wrapper stays a plain `div`.

Geometry is measured, not configured. Every animation frame reads `getBoundingClientRect()` of the wrapper’s children, so scroll, resize, and content changes are followed. Margins outside the children do not inflate the frame.

Four built-in agents (`alpha`, `beta`, `gamma`, `delta`) are presentation only: a name, a color, a role. They are not models. Items that share an agent run one after another. Different agents run at the same time.

The page controller is a module singleton. No provider.

### Install

The package is not on npm. Install it from this repository. The published `dist` is committed, so a fresh install does not need a build.

```bash
npm install github:dinovko/ai-animation-react
```

Peer dependency: React 18 or newer, plus `react-dom`.

Styles are imported by `AgentReveal` and `RevealControls`. Vite picks that CSS up from the dependency. If a bundler drops CSS that lives inside `node_modules`, import it once at the app entry:

```ts
import "ai-animation-react/style.css";
```

The package ships ESM for a bundler (Vite, webpack). Internal imports have no file extensions, so do not load `dist` from plain Node.

After you change `src` in a clone:

```bash
npm install
npm run build
```

`npm run typecheck` runs `tsc` without emitting files.

### Quick start

```tsx
import { AgentReveal, RevealControls } from "ai-animation-react";

export function Page() {
  return (
    <>
      <AgentReveal id="hero" agent="alpha" duration={900}>
        <h1>Title</h1>
      </AgentReveal>

      <AgentReveal id="lead" agent="beta" reveal="horizontal" duration={700} delay={200}>
        <p>The paragraph opens left to right after it enters the viewport.</p>
      </AgentReveal>

      <RevealControls />
    </>
  );
}
```

`id` is required for the “play once” memory. Without `id`, `once` cannot remember the item, and a remount will play again.

### Several blocks

Same agent: a queue. `alpha` finishes the title before it starts the card. `beta` can scan its own card while `alpha` is still working.

```tsx
<AgentReveal id="section:title" agent="alpha" duration={450}>
  <h2>Section</h2>
</AgentReveal>

<AgentReveal id="section:card" agent="alpha" duration={1000} delay={300}>
  <article>...</article>
</AgentReveal>

<AgentReveal id="section:aside" agent="beta" duration={900} delay={300}>
  <aside>...</aside>
</AgentReveal>
```

`delay` starts only after the wrapper intersects the viewport (and after it has a non-zero content box). It is not a delay from mount.

A staggered list:

```tsx
const agents = ["alpha", "beta", "gamma", "delta"] as const;

items.map((item, i) => (
  <AgentReveal
    key={item.id}
    id={`list:${item.id}`}
    agent={agents[i % agents.length]}
    duration={900}
    delay={200 + i * 120}
  >
    <Card item={item} />
  </AgentReveal>
));
```

Keep `id` stable. An index is fine when the list order is stable. A changing index makes `once` treat the row as a new item.

### Whole page, automatic

`AgentRevealAuto` reveals a whole subtree without wrapping each block. It splits the subtree into layers (text, media, controls, boxes with a background or border) and a pool of agents draws them one by one. A layer starts after its parent layer is done. Each layer gets a frame with a `w × h` chip, a cursor (arrow, text beam or crosshair), and a placeholder that fades out. About 5% of layers get a red frame.

```tsx
import { AgentRevealAuto } from "ai-animation-react";

<AgentRevealAuto id="app" agents={28} hud>
  <App />
</AgentRevealAuto>
```

Main props: `agents` (pool size or your own list, default 16), `speed` (0.5, 1, 2, 4), `hud` (bottom bar: agents, layers done / total, Tour, speed, close; default only in dev mode), `labels` (`"size"`, `"name"`, `"both"`, `"none"`), `flag` (selector for red frames), `flagRate`, `maxLayers`, `viewportOnly`, `filter`. Put `data-ar-skip` on an element to leave it out. The wrapper is `display: contents`.

### Props

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Markup to reveal. The frame bounds the union of element children that have a size. |
| `id` | `string` | — | Stable id. With `once`, this is the key stored in the in-memory “already played” set. |
| `agent` | `string` | `"alpha"` | Who scans this item. Unknown ids fall back to Alpha. One agent, one item at a time. |
| `reveal` | `RevealKind` | `"diagonal"` | `diagonal`, `horizontal`, `vertical`, or `rectangle`. |
| `duration` | `number` | `1200` | Scan length in milliseconds. Eased with an in-out cubic. |
| `delay` | `number` | `0` | Wait after the element is in view and has size, before it joins the agent queue. |
| `disabled` | `boolean` | `false` | Skip the animation for this instance. The content is shown immediately. |
| `cursor` | `boolean` | `true` | Draw the agent cursor and name tag. |
| `frame` | `boolean` | `true` | Draw the selection frame, handles, and the size label. |
| `once` | `boolean` | `true` | Play at most once per page load for this `id`, until `agentReveal.replay()`. |
| `className` | `string` | — | Extra class on the wrapper. The wrapper always has class `ar`. |
| `onStart` | `() => void` | — | Called when this item actually starts scanning (after the queue and the delay). |
| `onComplete` | `() => void` | — | Called after a natural finish. Not called if the run is cancelled by unmount. |

`RevealKind`:

- `diagonal` — the cursor pulls the bottom-right corner along the diagonal. The visible region is that rectangle with the leading corner cut by a line perpendicular to the diagonal, just behind the cursor.
- `horizontal` — a full-height strip grows to the right. The cursor sits on the right edge, vertically centered.
- `vertical` — a full-width strip grows downward. The cursor sits on the bottom edge.
- `rectangle` — both width and height grow together. The cursor sits on the bottom-right corner. No diagonal cut.

### Agents

| id | Name | Color | Role label |
| --- | --- | --- | --- |
| `alpha` | Alpha | `#2563EB` | Main architecture |
| `beta` | Beta | `#7C3AED` | Backend & services |
| `gamma` | Gamma | `#0891B2` | Data & infrastructure |
| `delta` | Delta | `#EA580C` | Supporting components |

The role is a tooltip in the developer panel. The cursor tag shows the name. Colors are 600-level shades so the white label stays readable.

```ts
import { AGENTS, AGENT_LIST } from "ai-animation-react";
import type { AgentDef } from "ai-animation-react";
```

There is no registry. To add an agent, edit `src/engine/agents.ts` and rebuild. `getAgent` is internal and maps any unknown id to Alpha.

### When the animation does not run

`shouldAnimate` returns false, the clip is cleared, and `data-ar-phase` is `done` when any of these is true:

- this item’s `disabled` prop is set;
- the page switch is off (`agentReveal.setDisabled(true)`, stored in `localStorage` under `agentReveal.disabled`);
- the page is in static mode after `agentReveal.reset()`;
- the user prefers reduced motion (`prefers-reduced-motion: reduce`);
- `once` is set, `id` is set, and this id has already finished in the current page session.

The first paint uses the same check, so a finished or skipped item does not flash the empty clip. A pending item is clipped from the first paint (`data-ar-phase="pending"`) so the finished layout does not flash before the effect runs.

While the item is pending or running, the wrapper is `inert`: hidden content is not focusable or clickable. `inert` is removed when the scan finishes, when the animation is skipped, or when the component unmounts.

### Phase

The wrapper sets `data-ar-phase`:

- `pending` — waiting for size, for the viewport, for the delay, or for the agent queue. Fully clipped.
- `running` — the scan is on screen.
- `done` — clip removed. Frame and cursor fade out on their own timers (about 700ms) and are then removed from the overlay.

### Programmatic control

```ts
import { agentReveal } from "ai-animation-react";

agentReveal.replay();
agentReveal.reset();
agentReveal.setDisabled(true);
```

- `replay()` — auto mode, clears the played set, the per-agent queues, and the status map, then bumps an epoch. Every mounted `AgentReveal` runs again.
- `reset()` — static mode. Everything is shown at once, with no scan, until the next `replay()`.
- `setDisabled(true | false)` — same as a global off switch. Persists in `localStorage` (`agentReveal.disabled` = `"1"` or `"0"`). If storage is unavailable, the switch still works for the current page.

`agentReveal` is the store. It implements `useSyncExternalStore`: `subscribe`, `getEpoch`, `getControls`, `getAgents`. A custom panel can subscribe the same way `RevealControls` does. Status values are `idle`, `waiting`, `working`, and `done`. `working` carries `progress` (0..1, quantized to steps of 0.05 so subscribers are not woken on every frame), `target` (the item id), `queued`, and `done`.

Do not call `acquire` or `track` from application code. `AgentReveal` owns the queue.

### Developer panel

```tsx
import { RevealControls, isRevealDevMode } from "ai-animation-react";

<RevealControls />
```

The panel renders nothing unless `isRevealDevMode()` is true:

- a development build (`import.meta.env.DEV`, `import.meta.env.MODE === "development"`, or `NODE_ENV === "development"`), or
- any build whose URL contains the `agents` query flag.

The flag is read from both the search string and the hash, so it works with a hash router: `https://example.com/app?agents` and `https://example.com/#/page?agents`.

The panel lists each agent (dot color, name, status) and three controls: Play / Replay, Reset, and Off. It is `position: fixed` at the bottom-left, `z-index: 9100`. It uses these CSS variables when the page defines them, otherwise the fallbacks in parentheses: `--surface` (`#fff`), `--ink` (`#111`), `--line` (`#ccc`), `--muted` (`#666`).

### Overlay

All frames and cursors live in one `div.ar-overlay` appended to `document.body`: `position: fixed`, `inset: 0`, `z-index: 9000`, `pointer-events: none`, `aria-hidden`. The overlay is created on the first scan and reused. Nothing in the overlay receives clicks.

The cursor flips its name tag to the left when it is within 150px of the right edge of the window, so the tag is not clipped.

If the app has a modal or a toast above `z-index: 9000`, raise that layer or lower `.ar-overlay` / `.ar-dev` in your own CSS.

### Layout contract

- The wrapper is a `div.ar`. A `div` is `display: block`, so it can break an inline parent. Put the component where a block is acceptable, or pass a `className` that sets the display you need.
- Library CSS does not set margin, padding, width, font, or color on `.ar`.
- The frame measures element children, and skips children whose border box is 0×0. Text nodes alone are not measured; wrap text in an element.
- The wrapper needs at least one child with a non-zero box before the scan starts. A `ResizeObserver` waits for that size, then an `IntersectionObserver` waits for the viewport.

The intersection root margin is `0px 0px -8% 0px`. Coming in from the bottom, the scan starts once the element is about 8% of the viewport above the bottom edge, not the instant a single pixel appears.

### Accessibility

- `prefers-reduced-motion: reduce` skips the scan and hides `.ar-overlay`.
- The overlay is `aria-hidden`.
- Pending and running wrappers are `inert`.
- The developer panel is a `role="group"` with an accessible name. It is a tool for the author, not part of the product UI. Leave it out of production routes, or rely on `isRevealDevMode` (it is already off in a production build unless the URL contains `agents`).

### Server rendering

The component renders a `div` on the server. Browser APIs run in an effect. Two values are read during the first render and can disagree with the server:

- `localStorage["agentReveal.disabled"]` — on the server the read fails and the switch is treated as off. If the browser has the switch on, the client’s first render may not match the server HTML.
- `prefers-reduced-motion` — on the server this is false. A reader who prefers reduced motion can also mismatch for one render.

If that hydration warning matters, render `AgentReveal` only after mount.

`replay`, `reset`, and the played-set live in the module. A full reload clears them. Client-side route changes do not, so a visited `id` stays “already played” until reload or `replay()`. Give each reveal a distinct `id` across routes (`"home:hero"`, `"settings:hero"`).

### Browser notes

The scan uses `clip-path`, `IntersectionObserver`, `ResizeObserver`, `requestAnimationFrame`, and `inert`. The frame glow uses `color-mix()`. The border, the cursor, and the clip still work where `color-mix` is missing; only the soft halo is lost. `color-mix` needs a current Chrome, Safari 16.2+, or Firefox 113+.

### Project layout

```
src/
  index.ts                 public exports
  types/index.ts           AgentReveal props and agent types
  components/AgentReveal.tsx
  components/RevealControls.tsx
  engine/agents.ts         the four agents
  engine/store.ts          singleton: epoch, queue, played set, status
  engine/runReveal.ts      one scan, rAF loop
  engine/presets.ts        reveal geometry and clip-path
  engine/geometry.ts       content box, easing, half-plane clip
  engine/overlay.ts        frame and cursor DOM
  styles/agent-reveal.css
dist/                      tsc output plus the copied stylesheet
```

Public exports: `AgentReveal`, `RevealControls`, `isRevealDevMode`, `agentReveal`, `AGENTS`, `AGENT_LIST`, and the types `AgentDef`, `AgentRevealProps`, `RevealKind`, `AgentState`, `AgentStatus`.

### Using it in another Vite app

```bash
npm install github:dinovko/ai-animation-react
```

```tsx
import { AgentReveal, RevealControls } from "ai-animation-react";
```

No Vite alias is required. The package entry is `dist/index.js`, and the components import the CSS next to them.

To point at a local checkout while changing the library:

```bash
npm install ../ai-animation-react
```

Rebuild `dist` in the library after every source change (`npm run build`). Vite prebundles dependencies; if the new build does not show up, restart the dev server or clear `node_modules/.vite`.

This repository is a personal library (`UNLICENSED`). It is for reuse in my own projects.

---

## Русский

### Что это

`AgentReveal` оборачивает уже готовую вёрстку и не перекрашивает ребёнка. Пока идёт скан, обёртка обрезана по открытой области, а поверх страницы (fixed-оверлей) рисуется рамка в духе Figma: угловые маркеры и живой размер `ширина × высота`. Рядом курсор с именем агента. Когда скан заканчивается, `clip-path`, рамка и курсор исчезают. Обёртка остаётся обычным `div`.

Геометрия не задаётся пропсами. На каждом кадре читается `getBoundingClientRect()` у детей обёртки, поэтому прокрутка, ресайз и смена содержимого подхватываются сами. Поля снаружи детей рамку не раздувают.

Четыре агента (`alpha`, `beta`, `gamma`, `delta`) — это только подача: имя, цвет, роль. Это не модели. Блоки одного агента идут по очереди. Разные агенты работают параллельно.

Контроллер страницы — синглтон модуля. Провайдер не нужен.

### Установка

Пакета нет в npm. Ставится из этого репозитория. Каталог `dist` уже в git, отдельная сборка после установки не нужна.

```bash
npm install github:dinovko/ai-animation-react
```

Нужен React 18+ и `react-dom` (peer dependency).

Стили импортируют сами `AgentReveal` и `RevealControls`. Vite подхватывает этот CSS из зависимости. Если сборщик выкидывает CSS из `node_modules`, один раз подключите его во входе приложения:

```ts
import "ai-animation-react/style.css";
```

Это ESM для бандлера (Vite, webpack). Внутренние импорты без расширений, в голый Node `dist` не загружается.

После правок в клоне:

```bash
npm install
npm run build
```

`npm run typecheck` — это `tsc` без записи файлов.

### Быстрый старт

```tsx
import { AgentReveal, RevealControls } from "ai-animation-react";

export function Page() {
  return (
    <>
      <AgentReveal id="hero" agent="alpha" duration={900}>
        <h1>Заголовок</h1>
      </AgentReveal>

      <AgentReveal id="lead" agent="beta" reveal="horizontal" duration={700} delay={200}>
        <p>Абзац открывается слева направо, когда попадает в экран.</p>
      </AgentReveal>

      <RevealControls />
    </>
  );
}
```

`id` нужен, чтобы «один раз» запоминалось. Без `id` флаг `once` нечего записать, и повторный mount проиграет анимацию снова.

### Несколько блоков

Один агент — одна очередь. `alpha` сначала заканчивает заголовок, потом берёт карточку. `beta` в это же время может сканировать свой блок.

```tsx
<AgentReveal id="section:title" agent="alpha" duration={450}>
  <h2>Раздел</h2>
</AgentReveal>

<AgentReveal id="section:card" agent="alpha" duration={1000} delay={300}>
  <article>...</article>
</AgentReveal>

<AgentReveal id="section:aside" agent="beta" duration={900} delay={300}>
  <aside>...</aside>
</AgentReveal>
```

`delay` отсчитывается после попадания в viewport и после того, как у содержимого появился ненулевой размер. Это не задержка от mount.

Список с шагом:

```tsx
const agents = ["alpha", "beta", "gamma", "delta"] as const;

items.map((item, i) => (
  <AgentReveal
    key={item.id}
    id={`list:${item.id}`}
    agent={agents[i % agents.length]}
    duration={900}
    delay={200 + i * 120}
  >
    <Card item={item} />
  </AgentReveal>
));
```

`id` должен быть стабильным. Индекс годится, только если порядок списка не прыгает. Новый индекс для `once` — это уже другой элемент.

### Вся страница, автоматически

`AgentRevealAuto` открывает целое поддерево без обёртки на каждый блок. Оно делится на слои (текст, медиа, контролы, боксы с фоном или рамкой), и пул агентов рисует их по очереди. Слой стартует после того, как готов родительский слой. У каждого слоя своя рамка с подписью `ширина × высота`, свой курсор (стрелка, текстовая «I», перекрестие) и плейсхолдер, который гаснет. Около 5% слоёв получают красную рамку.

```tsx
<AgentRevealAuto id="app" agents={28} hud>
  <App />
</AgentRevealAuto>
```

Главные пропы: `agents` (размер пула или свой список, по умолчанию 16), `speed` (0.5, 1, 2, 4), `hud` (нижняя панель: агенты, слои готово / всего, Tour, скорость, закрыть; по умолчанию только в dev), `labels`, `flag` (селектор красных рамок), `flagRate`, `maxLayers`, `viewportOnly`, `filter`. Атрибут `data-ar-skip` исключает элемент. Обёртка — `display: contents`.

### Пропы

| Проп | Тип | По умолчанию | Смысл |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Что открывать. Рамка охватывает объединение элементных детей с ненулевым размером. |
| `id` | `string` | — | Стабильный идентификатор. При `once` это ключ во множестве «уже показано» (только в памяти вкладки). |
| `agent` | `string` | `"alpha"` | Кто сканирует блок. Неизвестное имя заменяется на Alpha. У одного агента одновременно один блок. |
| `reveal` | `RevealKind` | `"diagonal"` | `diagonal`, `horizontal`, `vertical` или `rectangle`. |
| `duration` | `number` | `1200` | Длительность скана в миллисекундах. Сглаживание — cubic in-out. |
| `delay` | `number` | `0` | Пауза после появления в экране и наличия размера, до постановки в очередь агента. |
| `disabled` | `boolean` | `false` | Не анимировать этот экземпляр. Содержимое видно сразу. |
| `cursor` | `boolean` | `true` | Рисовать курсор и табличку с именем. |
| `frame` | `boolean` | `true` | Рисовать рамку, маркеры углов и подпись размера. |
| `once` | `boolean` | `true` | Не больше одного раза за загрузку страницы для этого `id`, пока не вызван `agentReveal.replay()`. |
| `className` | `string` | — | Дополнительный класс обёртки. Класс `ar` стоит всегда. |
| `onStart` | `() => void` | — | В момент реального старта скана (после очереди и `delay`). |
| `onComplete` | `() => void` | — | После нормального конца. При размонтировании и отмене не вызывается. |

Виды `reveal`:

- `diagonal` — курсор тянет правый нижний угол по диагонали. Видимая область — этот прямоугольник, у которого передний угол срезан прямой, перпендикулярной диагонали, сразу за курсором.
- `horizontal` — полоса на всю высоту растёт вправо. Курсор на правом крае, по вертикали в центре.
- `vertical` — полоса на всю ширину растёт вниз. Курсор на нижнем крае.
- `rectangle` — ширина и высота растут вместе. Курсор в правом нижнем углу. Диагонального среза нет.

### Агенты

| id | Имя | Цвет | Подпись роли |
| --- | --- | --- | --- |
| `alpha` | Alpha | `#2563EB` | Main architecture |
| `beta` | Beta | `#7C3AED` | Backend & services |
| `gamma` | Gamma | `#0891B2` | Data & infrastructure |
| `delta` | Delta | `#EA580C` | Supporting components |

Роль видна как tooltip в панели разработчика. На курсоре написано имя. Оттенки уровня 600, чтобы белая подпись читалась.

```ts
import { AGENTS, AGENT_LIST } from "ai-animation-react";
import type { AgentDef } from "ai-animation-react";
```

Реестра снаружи нет. Новый агент добавляется в `src/engine/agents.ts`, затем нужна пересборка. Неизвестный `agent` внутри всегда становится Alpha.

### Когда анимации нет

Скан не запускается, клип снимается, `data-ar-phase` равен `done`, если выполняется хотя бы одно условие:

- у этого экземпляра передан `disabled`;
- выключено на всю страницу (`agentReveal.setDisabled(true)`, ключ `localStorage` — `agentReveal.disabled`);
- страница в статичном режиме после `agentReveal.reset()`;
- у пользователя `prefers-reduced-motion: reduce`;
- стоит `once`, задан `id`, и этот id уже доиграл в текущей сессии страницы.

Та же проверка делается на первом рендере, поэтому уже показанный или пропущенный блок не мигает пустым клипом. Ожидающий блок обрезан с первой отрисовки (`data-ar-phase="pending"`), готовая вёрстка не вспыхивает до эффекта.

Пока фаза `pending` или `running`, обёртка `inert`: скрытое нельзя сфокусировать и нажать. `inert` снимается в конце скана, при пропуске анимации и при размонтировании.

### Фазы

На обёртке стоит `data-ar-phase`:

- `pending` — ждёт размер, экран, `delay` или очередь агента. Обрезано полностью.
- `running` — скан на экране.
- `done` — клип снят. Рамка и курсор гаснут сами (около 700 мс) и удаляются из оверлея.

### Управление из кода

```ts
import { agentReveal } from "ai-animation-react";

agentReveal.replay();
agentReveal.reset();
agentReveal.setDisabled(true);
```

- `replay()` — режим auto, очищает множество сыгранных id, очереди агентов и карту статусов, увеличивает эпоху. Каждый смонтированный `AgentReveal` играет снова.
- `reset()` — статичный режим. Всё видно сразу, без скана, до следующего `replay()`.
- `setDisabled(true | false)` — общий выключатель. Пишется в `localStorage` (`agentReveal.disabled` = `"1"` или `"0"`). Если хранилища нет, выключатель всё равно работает до перезагрузки.

`agentReveal` — это стор под `useSyncExternalStore`: `subscribe`, `getEpoch`, `getControls`, `getAgents`. Свою панель можно подписать так же, как это делает `RevealControls`. Статусы: `idle`, `waiting`, `working`, `done`. У `working` есть `progress` (0..1, шаг 0.05, чтобы не будить подписчиков каждый кадр), `target` (id блока), `queued` и `done`.

`acquire` и `track` из приложения не вызывать. Очередью владеет `AgentReveal`.

### Панель разработчика

```tsx
import { RevealControls, isRevealDevMode } from "ai-animation-react";

<RevealControls />
```

Панель ничего не рисует, пока `isRevealDevMode()` ложен. Он истинен, если:

- это development-сборка (`import.meta.env.DEV`, `import.meta.env.MODE === "development"` или `NODE_ENV === "development"`), или
- в URL есть флаг `agents`.

Флаг читается и из search, и из hash, поэтому подходит hash-роутер: `https://example.com/app?agents` и `https://example.com/#/page?agents`.

В панели — каждый агент (цветная точка, имя, статус) и три кнопки: Play / Replay, Reset, Off. Она `position: fixed` слева снизу, `z-index: 9100`. Если на странице заданы CSS-переменные, панель их берёт, иначе запасные значения: `--surface` (`#fff`), `--ink` (`#111`), `--line` (`#ccc`), `--muted` (`#666`).

### Оверлей

Все рамки и курсоры живут в одном `div.ar-overlay` на `document.body`: `position: fixed`, `inset: 0`, `z-index: 9000`, `pointer-events: none`, `aria-hidden`. Узел создаётся на первом скане и переиспользуется. Клики сквозь него проходят.

Табличка курсора переворачивается влево, если курсор ближе 150px к правому краю окна, чтобы её не обрезало.

Если модалка или тост выше `z-index: 9000`, поднимите их или переопределите `.ar-overlay` и `.ar-dev` у себя.

### Вёрстка

- Обёртка — `div.ar`. У `div` по умолчанию `display: block`, внутри строки это ломает строку. Ставьте компонент там, где блок уместен, либо задайте нужный display через `className`.
- CSS библиотеки не задаёт у `.ar` поля, отступы, ширину, шрифт и цвет.
- Рамка меряет элементных детей и пропускает тех, чей border box равен 0×0. Голый текстовый узел не меряется: оберните текст в элемент.
- Скан не начнётся, пока нет хотя бы одного ребёнка с ненулевым боксом. Сначала ждёт `ResizeObserver`, потом viewport — `IntersectionObserver`.

`rootMargin` наблюдателя: `0px 0px -8% 0px`. Снизу скан стартует, когда элемент уже примерно на 8% высоты экрана выше нижнего края, а не в пиксель первого касания.

### Доступность

- `prefers-reduced-motion: reduce` отменяет скан и прячет `.ar-overlay`.
- Оверлей помечен `aria-hidden`.
- Обёртки в `pending` и `running` получают `inert`.
- Панель — `role="group"` с доступным именем. Это инструмент автора, не интерфейс продукта. В боевые маршруты её можно не ставить. В production она и так скрыта, пока в URL нет `agents`.

### Серверный рендер

На сервере это `div`. Браузерные API вызываются в эффекте. Два значения читаются уже на первом рендере и могут разойтись с сервером:

- `localStorage["agentReveal.disabled"]` — на сервере чтение не удаётся, выключатель считается выключенным. Если в браузере он включён, первый клиентский рендер может не совпасть с HTML сервера.
- `prefers-reduced-motion` — на сервере это false. У читателя с уменьшенным движением тоже возможен один несовпадающий рендер.

Если предупреждение гидрации мешает, монтируйте `AgentReveal` только после появления клиента.

`replay`, `reset` и множество сыгранных id живут в модуле. Полная перезагрузка их сбрасывает. Клиентский переход между маршрутами — нет, поэтому посещённый `id` остаётся «уже показанным» до reload или `replay()`. Давайте разные id на разных маршрутах (`"home:hero"`, `"settings:hero"`).

### Браузеры

Скан использует `clip-path`, `IntersectionObserver`, `ResizeObserver`, `requestAnimationFrame` и `inert`. Мягкое свечение рамки — через `color-mix()`. Без `color-mix` остаются рамка, курсор и обрезка, пропадает только ореол. `color-mix` есть в актуальном Chrome, в Safari 16.2+ и в Firefox 113+.

### Состав

```
src/
  index.ts                 публичные экспорты
  types/index.ts           пропы и типы агента
  components/AgentReveal.tsx
  components/RevealControls.tsx
  engine/agents.ts         четыре агента
  engine/store.ts          синглтон: эпоха, очередь, сыгранные id, статус
  engine/runReveal.ts      один скан, цикл rAF
  engine/presets.ts        геометрия раскрытия и clip-path
  engine/geometry.ts       бокс содержимого, easing, отсечение полуплоскостью
  engine/overlay.ts        DOM рамки и курсора
  styles/agent-reveal.css
dist/                      вывод tsc и скопированный CSS
```

Наружу отдаются: `AgentReveal`, `RevealControls`, `isRevealDevMode`, `agentReveal`, `AGENTS`, `AGENT_LIST` и типы `AgentDef`, `AgentRevealProps`, `RevealKind`, `AgentState`, `AgentStatus`.

### В другом Vite-приложении

```bash
npm install github:dinovko/ai-animation-react
```

```tsx
import { AgentReveal, RevealControls } from "ai-animation-react";
```

Алиас в Vite не нужен. Точка входа — `dist/index.js`, компоненты сами импортируют CSS.

Локальная копия, пока правится библиотека:

```bash
npm install ../ai-animation-react
```

После каждой правки `src` пересоберите `dist` (`npm run build`). Vite пребандлит зависимости: если новый билд не виден, перезапустите dev-сервер или очистите `node_modules/.vite`.

Это личная библиотека (`UNLICENSED`) для повторного использования в моих проектах.

---

## Қазақша

### Бұл не

`AgentReveal` дайын белгілеуді орайды және бала элементтің стилін өзгертпейді. Скан жүріп жатқанда орауыш ашылған аймақ бойынша қиылады, беттің үстіне (fixed оверлей) Figma-ға ұқсас жақтау салынады: бұрыш маркерлері және тірі өлшем `ені × биіктігі`. Жанында агент аты жазылған курсор тұрады. Скан біткенде `clip-path`, жақтау және курсор кетеді. Орауыш кәдімгі `div` болып қалады.

Геометрия проппен берілмейді. Әр кадрда орауыштың балаларының `getBoundingClientRect()` мәні оқылады, сондықтан айналдыру, өлшем өзгеруі және мазмұн ауысуы өздігінен ілеседі. Балалардың сыртындағы margin жақтауды үлкейтпейді.

Төрт агент (`alpha`, `beta`, `gamma`, `delta`) — тек көрсету: аты, түсі, рөлі. Бұлар модель емес. Бір агенттің блоктары кезекпен жүреді. Әр түрлі агенттер қатар жұмыс істейді.

Бет контроллері — модуль синглтоны. Провайдер керек емес.

### Орнату

Пакет npm-де жоқ. Осы репозиторийден орнатылады. `dist` каталогы git-те тұр, орнатқаннан кейін қайта жинаудың қажеті жоқ.

```bash
npm install github:dinovko/ai-animation-react
```

React 18+ және `react-dom` керек (peer dependency).

Стильді `AgentReveal` пен `RevealControls` өздері импорттайды. Vite бұл CSS-ті тәуелділіктен алады. Егер жинақтаушы `node_modules` ішіндегі CSS-ті тастаса, қолданба кіреберісінде бір рет қосыңыз:

```ts
import "ai-animation-react/style.css";
```

Бұл бандлерге арналған ESM (Vite, webpack). Ішкі импорттарда кеңейтім жоқ, жалаң Node `dist`-ті жүктемейді.

Клондағы `src` өзгергеннен кейін:

```bash
npm install
npm run build
```

`npm run typecheck` — файл жазбайтын `tsc`.

### Жылдам бастау

```tsx
import { AgentReveal, RevealControls } from "ai-animation-react";

export function Page() {
  return (
    <>
      <AgentReveal id="hero" agent="alpha" duration={900}>
        <h1>Тақырып</h1>
      </AgentReveal>

      <AgentReveal id="lead" agent="beta" reveal="horizontal" duration={700} delay={200}>
        <p>Абзац экранға кіргенде солдан оңға қарай ашылады.</p>
      </AgentReveal>

      <RevealControls />
    </>
  );
}
```

«Бір рет» есте сақталуы үшін `id` керек. `id` болмаса, `once` жазатын кілт жоқ, қайта mount анимацияны қайта ойнатады.

### Бірнеше блок

Бір агент — бір кезек. `alpha` алдымен тақырыпты бітіреді, содан кейін карточканы алады. Сол кезде `beta` өз блогын сканерлей алады.

```tsx
<AgentReveal id="section:title" agent="alpha" duration={450}>
  <h2>Бөлім</h2>
</AgentReveal>

<AgentReveal id="section:card" agent="alpha" duration={1000} delay={300}>
  <article>...</article>
</AgentReveal>

<AgentReveal id="section:aside" agent="beta" duration={900} delay={300}>
  <aside>...</aside>
</AgentReveal>
```

`delay` элемент viewport-қа кіргеннен және мазмұнның өлшемі нөлден үлкен болғаннан кейін саналады. Бұл mount сәтінен басталатын кідіріс емес.

Қадаммен тізім:

```tsx
const agents = ["alpha", "beta", "gamma", "delta"] as const;

items.map((item, i) => (
  <AgentReveal
    key={item.id}
    id={`list:${item.id}`}
    agent={agents[i % agents.length]}
    duration={900}
    delay={200 + i * 120}
  >
    <Card item={item} />
  </AgentReveal>
));
```

`id` тұрақты болуы керек. Индекс тізім реті өзгермесе ғана жарайды. Жаңа индекс `once` үшін басқа элемент болып саналады.

### Бүкіл бет, автоматты түрде

`AgentRevealAuto` әр блокты орамай-ақ бүкіл ішкі ағашты ашады. Ол қабаттарға бөлінеді (мәтін, медиа, басқару элементтері, фоны немесе жақтауы бар бокстар), агенттер пулы оларды кезекпен салады. Қабат ата-ана қабаты дайын болғаннан кейін басталады. Әр қабатта `ені × биіктігі` жазуы бар жақтау, өз курсоры (көрсеткі, мәтін «I», айқас) және сөніп қалатын толтырғыш болады. Қабаттардың шамамен 5%-ына қызыл жақтау беріледі.

```tsx
<AgentRevealAuto id="app" agents={28} hud>
  <App />
</AgentRevealAuto>
```

Негізгі проптар: `agents` (пул өлшемі немесе өз тізіміңіз, әдепкі 16), `speed` (0.5, 1, 2, 4), `hud` (төменгі панель; әдепкіде тек dev режимінде), `labels`, `flag`, `flagRate`, `maxLayers`, `viewportOnly`, `filter`. `data-ar-skip` элементті алып тастайды. Орауыш — `display: contents`.

### Проптар

| Проп | Түрі | Әдепкі | Мағынасы |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Не ашылатыны. Жақтау өлшемі бар элемент-балалардың бірігуін қамтиды. |
| `id` | `string` | — | Тұрақты идентификатор. `once` кезінде бұл «көрсетілді» жиынының кілті (тек қойынды жадында). |
| `agent` | `string` | `"alpha"` | Блокты кім сканерлейді. Белгісіз атау Alpha-ға ауысады. Бір агентте бір уақытта бір блок. |
| `reveal` | `RevealKind` | `"diagonal"` | `diagonal`, `horizontal`, `vertical` немесе `rectangle`. |
| `duration` | `number` | `1200` | Скан ұзақтығы, миллисекунд. Тегістеу — cubic in-out. |
| `delay` | `number` | `0` | Экранға кіргеннен және өлшем пайда болғаннан кейін, агент кезегіне тұрғанға дейінгі кідіріс. |
| `disabled` | `boolean` | `false` | Осы дананы анимацияламау. Мазмұн бірден көрінеді. |
| `cursor` | `boolean` | `true` | Курсор мен ат тақтайшасын салу. |
| `frame` | `boolean` | `true` | Жақтауды, бұрыш маркерлерін және өлшем жазуын салу. |
| `once` | `boolean` | `true` | Осы `id` үшін бет жүктелгенде ең көбі бір рет, `agentReveal.replay()` шақырылғанша. |
| `className` | `string` | — | Орауыштың қосымша класы. `ar` класы әрқашан тұрады. |
| `onStart` | `() => void` | — | Скан шынымен басталғанда (кезек пен `delay` кейін). |
| `onComplete` | `() => void` | — | Қалыпты аяқталудан кейін. Unmount және болдырмау кезінде шақырылмайды. |

`reveal` түрлері:

- `diagonal` — курсор оң жақ төменгі бұрышты диагональ бойымен тартады. Көрінетін аймақ — сол тіктөртбұрыш, оның алдыңғы бұрышы диагональға перпендикуляр сызықпен, курсордың дәл артынан кесіледі.
- `horizontal` — толық биіктіктегі жолақ оңға қарай өседі. Курсор оң жиекте, тігінен ортада.
- `vertical` — толық ендегі жолақ төмен қарай өседі. Курсор төменгі жиекте.
- `rectangle` — ені мен биіктігі бірге өседі. Курсор оң жақ төменгі бұрышта. Диагональ кесіндісі жоқ.

### Агенттер

| id | Аты | Түсі | Рөл жазуы |
| --- | --- | --- | --- |
| `alpha` | Alpha | `#2563EB` | Main architecture |
| `beta` | Beta | `#7C3AED` | Backend & services |
| `gamma` | Gamma | `#0891B2` | Data & infrastructure |
| `delta` | Delta | `#EA580C` | Supporting components |

Рөл әзірлеуші панелінде tooltip болып көрінеді. Курсорда аты жазылады. Түстер 600-деңгейде, ақ жазу оқылады.

```ts
import { AGENTS, AGENT_LIST } from "ai-animation-react";
import type { AgentDef } from "ai-animation-react";
```

Сыртқы тізілім жоқ. Жаңа агент `src/engine/agents.ts` ішіне қосылады, содан кейін қайта жинау керек. Белгісіз `agent` іште әрқашан Alpha болады.

### Анимация қашан жүрмейді

Скан басталмайды, клип алынады, `data-ar-phase` мәні `done` болады, егер мынаның бірі орындалса:

- осы данаға `disabled` берілген;
- бүкіл бет өшірілген (`agentReveal.setDisabled(true)`, `localStorage` кілті — `agentReveal.disabled`);
- `agentReveal.reset()` кейін бет статикалық режимде;
- пайдаланушыда `prefers-reduced-motion: reduce` тұр;
- `once` қосулы, `id` берілген және осы id ағымдағы бет сессиясында ойнап болған.

Сол тексеру бірінші рендерде де жасалады, сондықтан көрсетілген немесе өткізілген блок бос клиппен жыпықтамайды. Күтудегі блок бірінші бояудан қиылады (`data-ar-phase="pending"`), дайын орналасу эффектіден бұрын жарқ етпейді.

Фаза `pending` немесе `running` болғанда орауыш `inert`: жасырын мазмұнға фокус және шерту түспейді. `inert` скан біткенде, анимация өткізілгенде және компонент алынғанда алынады.

### Фазалар

Орауышта `data-ar-phase` тұрады:

- `pending` — өлшемді, экранды, `delay`-ді немесе агент кезегін күтеді. Толық қиылған.
- `running` — скан экранда.
- `done` — клип алынған. Жақтау мен курсор өздігінен сөнеді (шамамен 700 мс) және оверлейден өшеді.

### Кодтан басқару

```ts
import { agentReveal } from "ai-animation-react";

agentReveal.replay();
agentReveal.reset();
agentReveal.setDisabled(true);
```

- `replay()` — auto режимі, ойналған id жиынын, агент кезектерін және күй картасын тазалайды, дәуірді арттырады. Монтаждалған әр `AgentReveal` қайта ойнайды.
- `reset()` — статикалық режим. Келесі `replay()` дейін бәрі бірден көрінеді, скан жоқ.
- `setDisabled(true | false)` — жалпы ажыратқыш. `localStorage`-ке жазылады (`agentReveal.disabled` = `"1"` немесе `"0"`). Қойма болмаса, ажыратқыш бет жабылғанша жұмыс істейді.

`agentReveal` — `useSyncExternalStore` сторы: `subscribe`, `getEpoch`, `getControls`, `getAgents`. Өз панеліңізді `RevealControls` сияқты жазылуға болады. Күйлер: `idle`, `waiting`, `working`, `done`. `working` ішінде `progress` (0..1, қадам 0.05, жазылушылар әр кадрда оянбауы үшін), `target` (блок id-і), `queued` және `done` бар.

`acquire` мен `track` қолданбадан шақырылмайды. Кезек `AgentReveal`-ге тиесілі.

### Әзірлеуші панелі

```tsx
import { RevealControls, isRevealDevMode } from "ai-animation-react";

<RevealControls />
```

`isRevealDevMode()` жалған болса, панель ештеңе салмайды. Ол ақиқат, егер:

- бұл development жинағы (`import.meta.env.DEV`, `import.meta.env.MODE === "development"` немесе `NODE_ENV === "development"`), немесе
- URL-де `agents` жалауы бар.

Жалау search-тен де, hash-тен де оқылады, сондықтан hash-роутерге жарайды: `https://example.com/app?agents` және `https://example.com/#/page?agents`.

Панельде әр агент (түсті нүкте, аты, күйі) және үш батырма бар: Play / Replay, Reset, Off. Ол сол жақ төменде `position: fixed`, `z-index: 9100`. Бетте CSS айнымалылары болса, панель соларды алады, әйтпесе қосалқы мәндер: `--surface` (`#fff`), `--ink` (`#111`), `--line` (`#ccc`), `--muted` (`#666`).

### Оверлей

Барлық жақтау мен курсор `document.body` ішіндегі бір `div.ar-overlay`-де тұрады: `position: fixed`, `inset: 0`, `z-index: 9000`, `pointer-events: none`, `aria-hidden`. Түйін бірінші сканда жасалады және қайта қолданылады. Шертулер одан өтіп кетеді.

Курсор терезенің оң жиегіне 150px-тен жақын болса, ат тақтайшасы солға аударылады, кесілмеуі үшін.

Модаль немесе тост `z-index: 9000`-ден жоғары болса, соларды көтеріңіз немесе өз CSS-іңізде `.ar-overlay` пен `.ar-dev` мәнін ауыстырыңыз.

### Орналасу

- Орауыш — `div.ar`. `div` әдепкіде `display: block`, жолдың ішінде жолды бөледі. Компонентті блок орнына қойыңыз немесе `className` арқылы керек display беріңіз.
- Кітапхана CSS-і `.ar` үшін margin, padding, ен, қаріп және түс бермейді.
- Жақтау элемент-балаларды өлшейді және border box-ы 0×0 болғандарды өткізеді. Жалаң мәтін түйіні өлшенбейді: мәтінді элементке ораңыз.
- Кемінде бір баланың өлшемі нөлден үлкен болмай, скан басталмайды. Алдымен `ResizeObserver` өлшемді күтеді, содан кейін viewport-ты `IntersectionObserver` күтеді.

Бақылаушының `rootMargin` мәні: `0px 0px -8% 0px`. Төменнен скан элемент төменгі жиектен экран биіктігінің шамамен 8%-ына жоғары шыққанда басталады, бір пиксель тиген сәтте емес.

### Қолжетімділік

- `prefers-reduced-motion: reduce` сканды өшіреді және `.ar-overlay`-ді жасырады.
- Оверлей `aria-hidden` деп белгіленген.
- `pending` және `running` орауыштары `inert` алады.
- Панель — қолжетімді аты бар `role="group"`. Бұл автор құралы, өнім интерфейсі емес. Жұмыс маршруттарына қоймауға болады. Production-да URL-де `agents` болмаса, панель өздігінен жасырын.

### Серверде рендер

Серверде бұл `div`. Браузер API-і эффект ішінде шақырылады. Екі мән бірінші рендерде оқылады және сервермен сәйкеспеуі мүмкін:

- `localStorage["agentReveal.disabled"]` — серверде оқу сәтсіз, ажыратқыш өшірулі деп саналады. Браузерде ол қосулы болса, клиенттің бірінші рендері сервер HTML-імен сәйкеспеуі мүмкін.
- `prefers-reduced-motion` — серверде бұл false. Қозғалысты азайтқан оқырманда да бір рендер сәйкеспеуі мүмкін.

Гидрация ескертуі кедергі болса, `AgentReveal`-ді клиент шыққаннан кейін ғана монтаждаңыз.

`replay`, `reset` және ойналған id жиыны модульде тұрады. Толық қайта жүктеу оларды тазалайды. Маршруттар арасындағы клиенттік өту тазаламайды, сондықтан көрілген `id` reload немесе `replay()` болғанша «көрсетілді» болып қалады. Маршруттарда әр түрлі id беріңіз (`"home:hero"`, `"settings:hero"`).

### Браузерлер

Скан `clip-path`, `IntersectionObserver`, `ResizeObserver`, `requestAnimationFrame` және `inert` қолданады. Жақтаудың жұмсақ сәулесі `color-mix()` арқылы. `color-mix` болмаса жақтау, курсор және қию қалады, тек ореол жоғалады. `color-mix` қазіргі Chrome-да, Safari 16.2+ және Firefox 113+ ішінде бар.

### Құрамы

```
src/
  index.ts                 жария экспорттар
  types/index.ts           проптар және агент типтері
  components/AgentReveal.tsx
  components/RevealControls.tsx
  engine/agents.ts         төрт агент
  engine/store.ts          синглтон: дәуір, кезек, ойналған id, күй
  engine/runReveal.ts      бір скан, rAF циклі
  engine/presets.ts        ашылу геометриясы және clip-path
  engine/geometry.ts       мазмұн боксы, easing, жарты жазықтықпен қию
  engine/overlay.ts        жақтау мен курсордың DOM-ы
  styles/agent-reveal.css
dist/                      tsc шығысы және көшірілген CSS
```

Сыртқа беріледі: `AgentReveal`, `RevealControls`, `isRevealDevMode`, `agentReveal`, `AGENTS`, `AGENT_LIST` және `AgentDef`, `AgentRevealProps`, `RevealKind`, `AgentState`, `AgentStatus` типтері.

### Басқа Vite қолданбасында

```bash
npm install github:dinovko/ai-animation-react
```

```tsx
import { AgentReveal, RevealControls } from "ai-animation-react";
```

Vite алиасы керек емес. Кіру нүктесі — `dist/index.js`, компоненттер CSS-ті өздері импорттайды.

Кітапхана жөнделіп жатқанда жергілікті көшірме:

```bash
npm install ../ai-animation-react
```

`src` әр өзгерген сайын `dist`-ті қайта жинаңыз (`npm run build`). Vite тәуелділікті алдын ала жинайды: жаңа жинақ көрінбесе, dev-серверді қайта іске қосыңыз немесе `node_modules/.vite` тазалаңыз.

Бұл менің жобаларымда қайта қолдануға арналған жеке кітапхана (`UNLICENSED`).
