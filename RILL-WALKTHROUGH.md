# Rill walkthrough — Mini sports-car custom cursor (desktop)

One user-facing flow: the custom cursor on the public portfolio. It is a
pointer-only feature, so it runs on a desktop browser with a mouse or
trackpad — no account or login is needed.

## Steps

1. Open https://jayashankar-p.vercel.app on a desktop browser with a mouse or trackpad (viewport wider than 1024px). Expected: the page loads, the preloader finishes, and the console shows no errors.
2. Move the pointer across the hero. Expected: the native arrow is replaced by a small white/purple sports-car cursor that follows with a slight lag and leans into turns as you steer.
3. Hover the navbar links, the View Projects and Resume buttons, the social icons and a project slab. Expected: the car scales up and its purple glow brightens, and the hovered element shifts slightly.
4. Move over headings, paragraphs and list text. Expected: the car shrinks so the text stays readable.
5. Click a project slab to open its detail overlay, then click Back. Expected: the car squashes briefly on press and the overlay opens and closes normally.
6. Press the backtick key or click ~/jayashankar to open the terminal, then click its command input. Expected: the car fades out over the input so the text caret works.
7. Move the pointer off the window or switch tabs, then move it back. Expected: the car hides, then reappears at the pointer with no long glide.
8. Resize the window, then move the pointer. Expected: the car stays inside the viewport with no errors.
9. Open DevTools device mode (touch) or enable prefers-reduced-motion and reload. Expected: no custom cursor at all; normal touch and arrow behavior.

The cursor is implemented by `#cursorCar` in `index.html` (inline SVG) with
styling in `css/effects.css` and behaviour in `js/cursor.js`.

## Test data

No test accounts or special data — this flow is unauthenticated. Use any
desktop browser at a window wider than 1024px. For step 9, use DevTools
device emulation (touch) or turn on the OS/browser "reduce motion" setting.
Never paste real credentials anywhere in this flow.

## Missing inputs

- A public app URL that serves the updated cursor build. The cursor work is
  uncommitted, so the live site above may still show the previous cursor
  until this change is deployed.
- Test accounts: none required for this walkthrough (the flow is public and
  read-only). Admin-dashboard checks are out of scope here.
- No public app URL was invented; `https://jayashankar-p.vercel.app` is the
  site already documented in `README.md`/`SETUP.md`.

If the updated cursor is only available on a local preview (for example
`npx serve .` on port 8080), cloud runs cannot reach `localhost`. Record it
manually at
https://userill.dev/record?utm_source=freebuff&utm_medium=paid&utm_campaign=rill
or drive it with your existing browser agent:
https://userill.dev/docs/agent-quickstart?utm_source=freebuff&utm_medium=paid&utm_campaign=rill

[Open your walkthrough in Rill](https://userill.dev/freebuff?utm_source=freebuff&utm_medium=paid&utm_campaign=rill&bfcid=bfc_1.eyJpZCI6ImFkYTJhMWNhLTFiNzAtNDUzZC04NmM2LTYwMmY1ZjcwN2E0NyIsImMiOiIxNDQyMTUzOS1kYjNiLTQ1YzEtYjQ5OC1hYTMxOTFmNDkxYzAiLCJrIjoiNDU4ODZlNWEtYzkyZC00ZDUxLTg1ZjgtYzc4YTRmMTY3ZWYwIiwiaWF0IjoxNzkxODkyODU5fQ.7on_2lRpeSnZlK9Kh1tRf2afpcO7aqlTQwXHRq0V1OY#task=1.%20Open%20https%3A%2F%2Fjayashankar-p.vercel.app%20on%20a%20desktop%20browser%20with%20a%20mouse%20or%20trackpad%20%28viewport%20wider%20than%201024px%29.%20Expected%3A%20the%20page%20loads%2C%20the%20preloader%20finishes%2C%20and%20the%20console%20shows%20no%20errors.%0A2.%20Move%20the%20pointer%20across%20the%20hero.%20Expected%3A%20the%20native%20arrow%20is%20replaced%20by%20a%20small%20white%2Fpurple%20sports-car%20cursor%20that%20follows%20with%20a%20slight%20lag%20and%20leans%20into%20turns%20as%20you%20steer.%0A3.%20Hover%20the%20navbar%20links%2C%20the%20View%20Projects%20and%20Resume%20buttons%2C%20the%20social%20icons%20and%20a%20project%20slab.%20Expected%3A%20the%20car%20scales%20up%20and%20its%20purple%20glow%20brightens%2C%20and%20the%20hovered%20element%20shifts%20slightly.%0A4.%20Move%20over%20headings%2C%20paragraphs%20and%20list%20text.%20Expected%3A%20the%20car%20shrinks%20so%20the%20text%20stays%20readable.%0A5.%20Click%20a%20project%20slab%20to%20open%20its%20detail%20overlay%2C%20then%20click%20Back.%20Expected%3A%20the%20car%20squashes%20briefly%20on%20press%20and%20the%20overlay%20opens%20and%20closes%20normally.%0A6.%20Press%20the%20backtick%20key%20or%20click%20~%2Fjayashankar%20to%20open%20the%20terminal%2C%20then%20click%20its%20command%20input.%20Expected%3A%20the%20car%20fades%20out%20over%20the%20input%20so%20the%20text%20caret%20works.%0A7.%20Move%20the%20pointer%20off%20the%20window%20or%20switch%20tabs%2C%20then%20move%20it%20back.%20Expected%3A%20the%20car%20hides%2C%20then%20reappears%20at%20the%20pointer%20with%20no%20long%20glide.%0A8.%20Resize%20the%20window%2C%20then%20move%20the%20pointer.%20Expected%3A%20the%20car%20stays%20inside%20the%20viewport%20with%20no%20errors.%0A9.%20Open%20DevTools%20device%20mode%20%28touch%29%20or%20enable%20prefers-reduced-motion%20and%20reload.%20Expected%3A%20no%20custom%20cursor%20at%20all%3B%20normal%20touch%20and%20arrow%20behavior.&url=https%3A%2F%2Fjayashankar-p.vercel.app%2F)

Your walkthrough is prepared. No recording has been made yet. In Rill, review the steps, add a public app URL, and choose Sign up to run if you need an account. The walkthrough uses Interact mode. Press Run to start it.
