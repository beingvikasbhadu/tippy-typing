# Tippy Typing for kids: typing.thornbyte.in

A free typing website for children aged 4 to 10. It's a plain static site (HTML/CSS/JS, no build step) hosted free on GitHub Pages.
Your agency site stays at thornbyte.in. This one lives on the subdomain **typing.thornbyte.in**, so you don't need a new domain.

## What's inside
| File | What it is |
|---|---|
| index.html | Home: game picker, sticker book, FAQ |
| learn.html | 19 lessons (F J → all letters → numbers) with finger guide |
| balloon-pop.html | Letter game (ages 4–8) |
| space-words.html | Word game (ages 6–10) |
| parents.html | Long guide for parents and teachers (SEO + AdSense approval) |
| about.html, privacy.html, 404.html | Required pages |
| assets/app.js | Shared engine: sounds, voice, keyboard, stars, stickers, **ads switch** |
| assets/data.js | Lessons and word lists (add words here) |
| assets/music.js | Background songs, one per page (`<body data-music="home|calm|sky|space">`). Plays recordings from `assets/music/` for the names listed in `RECORDED`, otherwise a live Web Audio version |
| assets/voice/ | Spoken hints and messages (natural voice, made with the Kokoro neural voice, Apache-2.0) |
| assets/og-image.png, icon-*.png | Share image (1200×630) and app icons |

## Test on your laptop
In this folder run `python -m http.server 8000`, then open http://localhost:8000

## Go live (one time, about 20 minutes)
1. **GitHub:** the repo is `beingvikasbhadu/tippy-typing` (public). Push changes to `main` and Pages republishes in about a minute.
2. **Pages:** repo > Settings > Pages > Source: "Deploy from a branch", branch `main`, folder `/ (root)` > Save.
   Then, under Custom domain, enter `typing.thornbyte.in` > Save. (The CNAME file already contains it.)
3. **GoDaddy DNS:** Domain Portfolio > thornbyte.in > DNS > Add new record:
   `Type: CNAME   Name: typing   Value: beingvikasbhadu.github.io   TTL: 1 hour`
   Leave the agency site's existing records alone.
   Before the DNS record exists, the site is also reachable at https://beingvikasbhadu.github.io/tippy-typing/ (it redirects to the custom domain once DNS works).
4. Wait 10–60 minutes, then go back to Settings > Pages and tick **Enforce HTTPS**.
5. **Contact email:** the site shows `hello@thornbyte.in` on the About and Privacy pages. Create it for free with GoDaddy email forwarding (forward it to your Gmail), or replace it in about.html and privacy.html.

## Get found on Google
- Google Search Console > Add property > Domain `thornbyte.in` (covers the subdomain), or URL prefix `https://typing.thornbyte.in/`. Then submit `https://typing.thornbyte.in/sitemap.xml`.
- Add a link to the typing site on your agency site's footer. Post it in parent and teacher groups (Facebook, Reddit r/Parenting, r/Teachers, WhatsApp school groups) and on Pinterest.

## Turn on ads (Google AdSense)
1. Apply at adsense.google.com with the site **after** it's live and has a few weeks of traffic. Approval for game sites can take several tries, which is why the parents guide and FAQ exist.
2. In AdSense, **tag the site as child-directed** (it's for kids under 13). Google requires this (COPPA). Ads will then be non-personalised and pay less, which is normal for kids' sites.
3. In `assets/app.js`, set `ADSENSE_CLIENT = 'ca-pub-XXXXXXXX'`.
4. Create display ad units in AdSense and paste each unit id into the empty `data-ad-slot=""` attributes (index.html, learn.html, parents.html).
5. Add a file `ads.txt` to the repo root containing the line AdSense gives you.
Ad slots stay invisible until both values are filled. Never put ads inside games (it's against policy and bad for kids).

## Ideas to earn more later
- Printable "Typing Certificate" page (parents share it, which brings free traffic)
- More games (each new game page = more Google traffic)
- A paid school or teacher version with class progress reports
- Hindi/Spanish versions of the pages for more countries

## Credits
- Voice clips: generated with [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M) (Apache-2.0), voice `af_heart`.
- Font: Fredoka (Google Fonts, OFL). All artwork, music and sounds are made in code for this site.
