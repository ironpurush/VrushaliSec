# Vrushali Pote — Portfolio Website

A single-page, dark-mode-only portfolio built from your resume.
3D animated network background made with Three.js. No frameworks,
no build step — just 3 files.

## Files
- `index.html` — all content (text, sections, structure)
- `style.css` — all colors, fonts, spacing, layout, responsive rules
- `script.js` — nav menu, scroll effects, terminal animation, 3D background

## How to view it
Just double-click `index.html` to open it in any browser. No installation
needed. (The 3D background and fonts load from the internet, so you need
an internet connection to see them — the page still works fine without
one, just with a plain dark background and a system font instead.)

## How to upload it online
Any of these work, and are all free:
- **Netlify** — go to app.netlify.com/drop and drag the whole folder in.
- **Vercel** — `vercel.com/new`, drag and drop the folder.
- **GitHub Pages** — upload the 3 files to a GitHub repo, enable Pages
  in repo Settings.
You don't need to change anything in the code to deploy — it works as-is.

## How to edit content
Open `index.html` in any text editor (Notepad, VS Code, etc).
The file is split into clearly labeled sections, each wrapped in a comment
block like:
```
<!-- ============================================================
   SECTION: SKILLS
   ============================================================ -->
```
Find the section you want to change and edit the text directly.

### Add or remove a skill
In the `SKILLS` section, find `<ul class="skills__list">` and add or
delete a `<li>...</li>` line.

### Change a skill proficiency bar
In the `SKILLS` section, find `<div class="skillbars">` — each bar looks
like this:
```html
<div class="skillbar" style="--pct: 92">
  <div class="skillbar__head">
    <span class="skillbar__label">Web Application VAPT</span>
    <span class="skillbar__pct">92%</span>
  </div>
  <div class="skillbar__track"><div class="skillbar__fill"></div></div>
</div>
```
Change the `--pct` number and the `92%` text together (they should always
match) to adjust how full the bar appears. Copy a whole block to add a
new skill, or delete one to remove it.

### Change the impact numbers
In the `IMPACT` section, find `<div class="impact__grid">` — each stat is
a `<div class="impact__card">` block with a number (`.impact__num`) and a
label underneath (`.impact__label`). Edit, copy, or delete a block to
change, add, or remove a stat.

### Add or remove a job in Experience
In the `EXPERIENCE` section, find the block starting with
`<div class="timeline__item">` — copy a whole block to add a new role,
or delete one to remove a role. Nothing else needs to change.

### Add or remove a bug bounty / finding
In the `FINDINGS` section, copy or delete a `<div class="findings__card">`
block.

### Add or remove a certification
In the `CERTIFICATIONS` section, copy or delete a `<span class="cert__chip">`
line.

### Change contact details
Contact details appear in two places — both need updating if your
email, phone, or LinkedIn changes:
1. The `HERO` section, near the top — find `.hero__meta`.
2. The `CONTACT` section, at the bottom — find `.contact__grid`.

In both places, replace the LinkedIn `href="#"` with your real profile
URL.

### Change the terminal animation text
Open `script.js`, find `initTerminalTyping()` near the top — there's a
`lines` array you can edit, add to, or shorten.

### Change the boot/loading screen text
Open `script.js`, find `initBootSequence()` — there's a `bootLines`
array near the top of that function. Each line looks like:
```js
{ text: 'permission level ............. ROOT ACCESS GRANTED', className: 'boot-root', delay: 380 }
```
- `text` — what gets typed out
- `className` — color: `boot-ok` (green), `boot-warn` (amber),
  `boot-root` (bold red, used for the "root access" line), `boot-dim`
  (muted gray), or leave it out for the default color
- `delay` — extra pause in milliseconds after this line before the
  next one starts typing

To remove the boot screen entirely: delete the `<div class="boot" id="boot">`
block near the top of `index.html`, just after `<body>`. The script
automatically skips the boot logic if that element isn't found, so
nothing else breaks.

## How to edit colors / fonts
Open `style.css` and look at the very top — the `:root { ... }` block.
Every color and font used across the whole site is defined once there.
Change a value there and it updates everywhere automatically. For example:
- `--accent` — the green highlight color
- `--bg` — the main background color
- `--font-display` — the heading font

## Notes
- This site is **dark mode only** by design — no light/dark toggle.
- There is **no contact form** — contact details are shown directly,
  both near the top (hero) and again in a dedicated `Contact` section
  at the end of the page, so people can reach out via their own
  email/phone app.
- The old "Objective" section has been replaced with an **Impact**
  section that leads with real numbers from the resume (servers/network
  devices assessed, web apps assessed, mobile apps assessed, etc.)
  instead of a generic mission statement.
- Skills are shown as **proficiency bars** (Web App VAPT, Mobile App
  VAPT, Network Penetration Testing, API Security, etc.) that fill in
  as you scroll to them, alongside the existing tool/framework chips.
- A **boot/loading screen** plays once when the page first loads,
  simulating a system login ("verifying credentials", "ROOT ACCESS
  GRANTED") before the site reveals itself. It respects "reduce
  motion" settings (skips straight to the site) and has a safety
  timeout so it can never get stuck on screen.
- No GitHub or Projects sections are included, since they weren't in
  the resume. Add a new section using the same comment-block pattern
  if you want one later.
- The 3D background automatically disables itself on devices/browsers
  that don't support WebGL, and respects "reduce motion" accessibility
  settings — it will never break the page or throw errors.
