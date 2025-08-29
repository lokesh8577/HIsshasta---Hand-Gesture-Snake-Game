# Create a complete multi-page website for a clipping & reposting service
import os, textwrap, zipfile, json, pathlib, shutil

root = "/mnt/data/clips-reposting-site"
assets = os.path.join(root, "assets")
os.makedirs(assets, exist_ok=True)

# Shared head with links
head_common = """\
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark light" />
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="/assets/style.css" />
  <script defer src="/assets/script.js"></script>
"""

nav = """\
  <header class="site-header">
    <div class="container row between center">
      <a class="brand" href="/index.html">
        <img src="/assets/logo.svg" alt="ClipMint logo" width="28" height="28" />
        <span>ClipMint</span>
      </a>
      <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">☰</button>
      <nav class="nav">
        <a href="/services.html">Services</a>
        <a href="/pricing.html">Pricing</a>
        <a href="/portfolio.html">Portfolio</a>
        <a href="/about.html">About</a>
        <a href="/order.html" class="btn btn-primary">Order Now</a>
      </nav>
    </div>
  </header>
"""

footer = """\
  <footer class="site-footer">
    <div class="container grid-3">
      <div>
        <h4>ClipMint</h4>
        <p>AI-powered clipping & multi-platform reposting for creators and brands.</p>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="/about.html">About</a></li>
          <li><a href="/portfolio.html">Portfolio</a></li>
          <li><a href="/pricing.html">Pricing</a></li>
          <li><a href="/order.html">Order</a></li>
        </ul>
      </div>
      <div>
        <h4>Legal</h4>
        <ul>
          <li><a href="/terms.html">Terms</a></li>
          <li><a href="/privacy.html">Privacy</a></li>
        </ul>
      </div>
    </div>
    <div class="container subfooter row between center">
      <small>©️ {year} ClipMint. All rights reserved.</small>
      <div class="socials">
        <a href="#" aria-label="Instagram">IG</a>
        <a href="#" aria-label="YouTube">YT</a>
        <a href="#" aria-label="X">X</a>
        <a href="#" aria-label="LinkedIn">in</a>
      </div>
    </div>
  </footer>
""".format(year=2025)

# Pages content
index_html = f"""\
<!doctype html>
<html lang="en">
<head>
  <title>ClipMint — Clip, Caption, Repost. On Autopilot.</title>
  <meta name="description" content="Turn long videos into viral shorts and auto-repost to all platforms. Fast, branded, trend-ready." />
{head_common}
</head>
<body>
{nav}
  <main>
    <section class="hero container">
      <div class="hero-text">
        <h1>Turn <span class="accent">one video</span> into <span class="accent">10+ shorts</span> — posted everywhere.</h1>
        <p>We clip your long-form, add captions & branding, and auto-repost to YouTube Shorts, Instagram, TikTok & more.</p>
        <div class="cta-row">
          <a class="btn btn-primary btn-lg" href="/order.html">Get Your First Clip Free</a>
          <a class="btn btn-outline btn-lg" href="/pricing.html">See Pricing</a>
        </div>
        <div class="trust-row">
          <img src="/assets/badges.svg" alt="Trusted by creators" />
          <p>Trusted by streamers, coaches, and startups.</p>
        </div>
      </div>
      <div class="hero-media">
        <div class="mockup">
          <video autoplay muted loop playsinline src="/assets/demo.mp4" poster="/assets/hero-poster.webp"></video>
        </div>
      </div>
    </section>

    <section class="container features grid-3">
      <div class="card">
        <h3>Smart Clipping</h3>
        <p>AI + editors find highlights, remove silence, punch in, and add emojis & b-roll.</p>
      </div>
      <div class="card">
        <h3>Brand-Perfect</h3>
        <p>Your fonts, colors, lower-thirds, and subtitles that pop (burned-in or SRT).</p>
      </div>
      <div class="card">
        <h3>Everywhere, Instantly</h3>
        <p>Scheduled reposting to Shorts, Reels, TikTok, LinkedIn, and more — hands free.</p>
      </div>
    </section>

    <section class="container highlight row between center">
      <div class="copy">
        <h2>Less editing. More posting.</h2>
        <p>Stop juggling editors and uploaders. We deliver ready-to-post clips and publish them on your schedule.</p>
        <ul class="checks">
          <li>15–60s vertical formats (9:16)</li>
          <li>Captions with keywords & emojis</li>
          <li>Hook detection & chaptering</li>
          <li>Trend-matched templates</li>
        </ul>
        <a class="btn btn-primary" href="/services.html">Explore Services</a>
      </div>
      <div class="illustration">
        <img src="/assets/boards.webp" alt="Workflow illustration" />
      </div>
    </section>

    <section class="container logos">
      <p>Publish to:</p>
      <ul class="logo-row">
        <li>YT</li><li>IG</li><li>TT</li><li>FB</li><li>LN</li><li>TW</li>
      </ul>
    </section>

    <section class="container testimonials grid-2">
      <div class="quote card">
        <p>“Went from posting 1 clip a week to 30. Views and leads doubled in 30 days.”</p>
        <span>— Arjun, Fitness Coach</span>
      </div>
      <div class="quote card">
        <p>“They nail hooks and captions. Posting schedule runs itself now.”</p>
        <span>— Riya, Startup Marketer</span>
      </div>
    </section>

    <section class="container cta-box">
      <h2>Ready to scale your content?</h2>
      <p>Start with a free sample clip. No commitment.</p>
      <a class="btn btn-primary btn-lg" href="/order.html">Start Free</a>
    </section>
  </main>
{footer}
</body>
</html>
"""

services_html = f"""\
<!doctype html>
<html lang="en">
<head>
  <title>Services — ClipMint</title>
{head_common}
</head>
<body>
{nav}
<main class="container">
  <section class="page-hero">
    <h1>Services</h1>
    <p>From highlight discovery to multi-platform publishing.</p>
  </section>

  <section class="grid-3">
    <div class="card tall">
      <h3>Highlight Clipping</h3>
      <ul class="checks">
        <li>Auto-detect key moments</li>
        <li>Silence cuts & jump zooms</li>
        <li>B-roll & sound effects</li>
      </ul>
    </div>
    <div class="card tall">
      <h3>Captions + Branding</h3>
      <ul class="checks">
        <li>Kinetic subtitles (burned-in)</li>
        <li>Your fonts & colors</li>
        <li>Animated lower-thirds</li>
      </ul>
    </div>
    <div class="card tall">
      <h3>Reposting & Scheduling</h3>
      <ul class="checks">
        <li>Shorts, Reels, TikTok, LinkedIn</li>
        <li>Hashtags & descriptions</li>
        <li>Calendar-based scheduling</li>
      </ul>
    </div>
  </section>

  <section class="grid-2">
    <div class="card">
      <h3>Add‑ons</h3>
      <ul>
        <li>Thumbnail packs</li>
        <li>Hook scripts</li>
        <li>Voiceover cleaning</li>
        <li>SRT delivery</li>
      </ul>
    </div>
    <div class="card">
      <h3>Turnarounds</h3>
      <p>Standard: 48–72h • Rush: 24h • Same‑day on request</p>
      <a class="btn btn-outline" href="/order.html">Book a Slot</a>
    </div>
  </section>
</main>
{footer}
</body>
</html>
"""

pricing_html = f"""\
<!doctype html>
<html lang="en">
<head>
  <title>Pricing — ClipMint</title>
{head_common}
</head>
<body>
{nav}
<main class="container">
  <section class="page-hero">
    <h1>Pricing</h1>
    <p>Simple plans that scale with you.</p>
    <div class="toggle">
      <label><input type="checkbox" id="billingToggle"> <span>Bill yearly & save 15%</span></label>
    </div>
  </section>

  <section class="grid-3 cards-pricing">
    <div class="card price" data-monthly="7999" data-yearly="6799">
      <h3>Starter</h3>
      <p class="price-amt">₹7,999<span>/mo</span></p>
      <ul class="checks">
        <li>10 clips / month</li>
        <li>Captions + templates</li>
        <li>Reposting to 2 platforms</li>
      </ul>
      <a class="btn btn-primary" href="/order.html?plan=starter">Choose Starter</a>
    </div>
    <div class="card price featured" data-monthly="14999" data-yearly="12749">
      <div class="badge">Most Popular</div>
      <h3>Growth</h3>
      <p class="price-amt">₹14,999<span>/mo</span></p>
      <ul class="checks">
        <li>25 clips / month</li>
        <li>Brand kit + thumbnails</li>
        <li>Reposting to 4 platforms</li>
      </ul>
      <a class="btn btn-primary" href="/order.html?plan=growth">Choose Growth</a>
    </div>
    <div class="card price" data-monthly="29999" data-yearly="25499">
      <h3>Scale</h3>
      <p class="price-amt">₹29,999<span>/mo</span></p>
      <ul class="checks">
        <li>60 clips / month</li>
        <li>Dedicated editor</li>
        <li>Posting calendar & analytics</li>
      </ul>
      <a class="btn btn-primary" href="/order.html?plan=scale">Choose Scale</a>
    </div>
  </section>
  <p class="footnote">Need enterprise or agency white‑label? <a href="/contact.html">Contact us</a>.</p>
</main>
{footer}
</body>
</html>
"""

portfolio_html = f"""\
<!doctype html>
<html lang="en">
<head>
  <title>Portfolio — ClipMint</title>
{head_common}
</head>
<body>
{nav}
<main class="container">
  <section class="page-hero">
    <h1>Portfolio</h1>
    <p>Recent clips & brand templates.</p>
  </section>
  <section class="masonry">
    <a class="tile" href="#" aria-label="Sample clip 1">
      <img src="/assets/sample1.webp" alt="Sample 1" />
    </a>
    <a class="tile" href="#" aria-label="Sample clip 2">
      <img src="/assets/sample2.webp" alt="Sample 2" />
    </a>
    <a class="tile" href="#" aria-label="Sample clip 3">
      <img src="/assets/sample3.webp" alt="Sample 3" />
    </a>
    <a class="tile" href="#" aria-label="Sample clip 4">
      <img src="/assets/sample4.webp" alt="Sample 4" />
    </a>
  </section>
  <section class="container cta-box">
    <h2>Want results like these?</h2>
    <a class="btn btn-primary" href="/order.html">Start Your Project</a>
  </section>
</main>
{footer}
</body>
</html>
"""

about_html = f"""\
<!doctype html>
<html lang="en">
<head>
  <title>About — ClipMint</title>
{head_common}
</head>
<body>
{nav}
<main class="container">
  <section class="page-hero">
    <h1>About</h1>
    <p>We help creators ship more content with less effort.</p>
  </section>
  <section class="grid-2">
    <div class="card">
      <h3>Our Mission</h3>
      <p>Make high-quality short-form content affordable and effortless for everyone.</p>
      <p>Founded in 2025, ClipMint blends AI detection with human storytelling for scroll-stopping clips.</p>
    </div>
    <div class="card">
      <h3>How We Work</h3>
      <ol>
        <li>You share long-form links or files.</li>
        <li>We propose hooks and style.</li>
        <li>We deliver clips + publish on schedule.</li>
      </ol>
      <a class="btn btn-outline" href="/contact.html">Talk to Us</a>
    </div>
  </section>
</main>
{footer}
</body>
</html>
"""

contact_html = f"""\
<!doctype html>
<html lang="en">
<head>
  <title>Contact — ClipMint</title>
{head_common}
</head>
<body>
{nav}
<main class="container">
  <section class="page-hero">
    <h1>Contact</h1>
    <p>Questions, partnerships, or custom quotes — we’d love to hear from you.</p>
  </section>
  <section class="grid-2">
    <form class="card form" action="mailto:hello@yourdomain.com" method="post" enctype="text/plain">
      <label>Name<input type="text" name="name" required></label>
      <label>Email<input type="email" name="email" required></label>
      <label>Message<textarea name="message" rows="6" required></textarea></label>
      <button class="btn btn-primary" type="submit">Send</button>
    </form>
    <div class="card">
      <h3>Details</h3>
      <p>Email: hello@yourdomain.com</p>
      <p>WhatsApp: +91 90000 00000</p>
      <p>Location: Jaipur, India</p>
      <p>Hours: Mon–Sat, 10:00–18:00 IST</p>
    </div>
  </section>
</main>
{footer}
</body>
</html>
"""

order_html = f"""\
<!doctype html>
<html lang="en">
<head>
  <title>Order — ClipMint</title>
{head_common}
</head>
<body>
{nav}
<main class="container">
  <section class="page-hero">
    <h1>Start Your Order</h1>
    <p>Free sample clip included for new clients.</p>
  </section>
  <form class="card form" id="orderForm" action="/thank-you.html" method="get">
    <div class="grid-2">
      <label>Full Name<input type="text" name="name" required></label>
      <label>Email<input type="email" name="email" required></label>
    </div>
    <div class="grid-2">
      <label>Choose Plan
        <select name="plan" id="planSelect">
          <option value="starter">Starter (10 clips)</option>
          <option value="growth">Growth (25 clips)</option>
          <option value="scale">Scale (60 clips)</option>
        </select>
      </label>
      <label>Preferred Turnaround
        <select name="tat">
          <option>48–72h</option>
          <option>24h (Rush)</option>
          <option>Same‑day</option>
        </select>
      </label>
    </div>
    <label>Links to Source Videos (YouTube / Drive / Dropbox)
      <textarea name="links" rows="4" placeholder="One per line" required></textarea>
    </label>
    <label>Notes / Style Preferences
      <textarea name="notes" rows="4" placeholder="Fonts, colors, references"></textarea>
    </label>
    <label>Upload Brand Kit (optional)
      <input type="file" name="brandkit" multiple>
    </label>
    <div class="row between center">
      <label><input type="checkbox" required> I agree to the <a href="/terms.html" target="_blank">Terms</a>.</label>
      <button class="btn btn-primary" type="submit">Submit Order</button>
    </div>
    <p class="footnote">After submission, we’ll email you an invoice and secure upload link.</p>
  </form>
</main>
{footer}
</body>
</html>
"""

terms_html = f"""\
<!doctype html>
<html lang="en">
<head>
  <title>Terms — ClipMint</title>
{head_common}
</head>
<body>
{nav}
<main class="container">
  <section class="page-hero"><h1>Terms of Service</h1></section>
  <article class="legal card">
    <h3>1. Service</h3>
    <p>We provide video clipping, captioning, template design, and multi‑platform reposting.</p>
    <h3>2. Content Rights</h3>
    <p>You warrant you own or have rights to all content supplied. You grant us a license to edit and publish on your behalf.</p>
    <h3>3. Payments & Refunds</h3>
    <p>Work begins after invoice is paid. Rush fees may apply. Refunds are at our discretion for unused scope.</p>
    <h3>4. Revisions</h3>
    <p>Each clip includes 1 round of revisions unless specified in your plan.</p>
    <h3>5. Platform Policies</h3>
    <p>We comply with platform rules and may refuse reposting that violates guidelines.</p>
    <h3>6. Liability</h3>
    <p>We are not liable for platform penalties resulting from policy changes or algorithmic decisions.</p>
  </article>
</main>
{footer}
</body>
</html>
"""

privacy_html = f"""\
<!doctype html>
<html lang="en">
<head>
  <title>Privacy — ClipMint</title>
{head_common}
</head>
<body>
{nav}
<main class="container">
  <section class="page-hero"><h1>Privacy Policy</h1></section>
  <article class="legal card">
    <h3>Data We Collect</h3>
    <p>Contact details, project files, and publishing credentials (if provided for reposting).</p>
    <h3>How We Use Data</h3>
    <p>To deliver services, provide support, and improve quality. We never sell your data.</p>
    <h3>Storage & Security</h3>
    <p>Files stored on secure cloud storage with access controls. Credentials stored encrypted.</p>
    <h3>Your Choices</h3>
    <p>Request deletion or export of your data at any time.</p>
  </article>
</main>
{footer}
</body>
</html>
"""

thankyou_html = f"""\
<!doctype html>
<html lang="en">
<head>
  <title>Thank You — ClipMint</title>
{head_common}
</head>
<body>
{nav}
<main class="container">
  <section class="page-hero">
    <h1>Thank you!</h1>
    <p>Your order has been received. We’ll email you next steps within a few hours.</p>
    <a class="btn btn-primary" href="/index.html">Back to Home</a>
  </section>
</main>
{footer}
</body>
</html>
"""

style_css = """\
:root{
  --bg: #0b0d10;
  --card: #12151a;
  --text: #e7ecf3;
  --muted:#a7b0bf;
  --accent:#ffd166;
  --accent-2:#66ffd1;
  --border:#1f2430;
  --shadow: 0 10px 30px rgba(0,0,0,.35);
}

*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
  background: radial-gradient(1200px 600px at 10% -20%, rgba(255,209,102,.06), transparent 40%),
              radial-gradient(1200px 800px at 110% 20%, rgba(102,255,209,.06), transparent 40%), var(--bg);
  color: var(--text);
  line-height:1.6;
}

a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}

.container{width:min(1100px, 92%); margin:0 auto;}

.row{display:flex; gap:16px}
.between{justify-content:space-between}
.center{align-items:center}

.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}

.site-header{position:sticky;top:0;backdrop-filter: blur(8px);background:rgba(11,13,16,.6);border-bottom:1px solid var(--border);z-index:10}
.site-header .container{padding:14px 0}
.brand{display:flex;gap:10px;align-items:center;font-weight:700}
.brand span{letter-spacing:.2px}
.nav{display:flex;gap:18px;align-items:center}
.nav a{opacity:.9}
.nav a.btn{opacity:1}
.nav-toggle{display:none;background:none;border:1px solid var(--border);padding:6px 10px;border-radius:10px;color:var(--text)}

.btn{display:inline-block;border:1px solid var(--border);padding:10px 16px;border-radius:12px;box-shadow:var(--shadow);transition:.2s}
.btn:hover{transform:translateY(-1px)}
.btn-primary{background:linear-gradient(135deg,var(--accent),#ff9d66);color:#111;border-color:transparent;font-weight:700}
.btn-outline{background:transparent}
.btn-lg{padding:14px 18px;font-size:1.05rem}

.hero{display:grid;grid-template-columns: 1.1fr .9fr; gap:28px; padding:46px 0 24px}
.hero h1{font-size:clamp(32px, 2.8vw, 48px); line-height:1.15}
.hero .accent{background:linear-gradient(135deg, var(--accent), var(--accent-2)); -webkit-background-clip:text; background-clip:text; color:transparent}
.hero .hero-media .mockup{border:1px solid var(--border);border-radius:18px;overflow:hidden;background:#0a0c10;box-shadow:var(--shadow)}
.hero .trust-row{display:flex;gap:16px;align-items:center;margin-top:16px;opacity:.9}

.card{background:linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.0)); border:1px solid var(--border); padding:20px;border-radius:16px;box-shadow:var(--shadow)}
.card.tall{min-height:240px}
.badge{display:inline-block;background:rgba(255,209,102,.15);color:var(--accent);border:1px solid rgba(255,209,102,.35);border-radius:999px;padding:4px 10px;font-size:.85rem;margin-bottom:8px}

.features{margin:40px auto}
.highlight{margin:40px auto; gap:24px}
.illustration img{border-radius:16px;border:1px solid var(--border)}

.logos{margin:20px auto 30px; text-align:center}
.logo-row{display:flex;gap:14px;justify-content:center;list-style:none;padding:0;margin:12px 0 0}
.logo-row li{border:1px dashed var(--border);padding:8px 12px;border-radius:12px;opacity:.8}

.testimonials .quote p{font-size:1.05rem}
.cta-box{margin:50px auto; text-align:center}
.cta-box .btn{margin-top:8px}

.page-hero{padding:28px 0 10px}
.page-hero h1{margin:0 0 6px}

.masonry{columns: 3 260px; column-gap:16px}
.masonry .tile{break-inside: avoid; margin-bottom:16px; display:block}
.masonry img{border-radius:14px;border:1px solid var(--border)}

.cards-pricing .price-amt{font-size:1.8rem; font-weight:800}
.cards-pricing .price.featured{border-color: rgba(255,209,102,.5); box-shadow: 0 10px 50px rgba(255,209,102,.08)}
.cards-pricing .price .badge{float:right}

.checks{list-style:none;padding-left:0}
.checks li{position:relative;padding-left:24px;margin:6px 0}
.checks li::before{content:"✔";position:absolute;left:0;top:0;opacity:.8;color:var(--accent)}

.form label{display:block;margin-bottom:12px}
.form input[type="text"], .form input[type="email"], .form input[type="file"], .form textarea, .form select{
  width:100%; background:#0a0c10; border:1px solid var(--border); border-radius:12px; padding:10px 12px; color:var(--text);
}
.form .row{margin-top:10px}

.legal h3{margin-top:8px}

.site-footer{margin-top:50px;border-top:1px solid var(--border);padding:24px 0 8px}
.site-footer .grid-3{gap:24px}
.site-footer ul{list-style:none;padding:0;margin:0}
.site-footer li{margin:6px 0}
.subfooter{margin-top:10px;padding-top:10px;border-top:1px solid var(--border)}
.socials a{margin-left:10px; border:1px solid var(--border); padding:6px 10px;border-radius:12px}

.footnote{opacity:.8;font-size:.95rem}

@media (max-width: 900px){
  .grid-3{grid-template-columns:1fr}
  .grid-2{grid-template-columns:1fr}
  .hero{grid-template-columns:1fr}
  .nav{display:none; position:absolute; top:64px; right:4%; background:rgba(11,13,16,.95); border:1px solid var(--border); padding:14px; border-radius:14px; box-shadow:var(--shadow); flex-direction:column; gap:12px}
  .nav.open{display:flex}
  .nav-toggle{display:block}
}
"""

script_js = """\
document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
  }

  // Pricing toggle
  const billingToggle = document.getElementById('billingToggle');
  if (billingToggle) {
    const cards = document.querySelectorAll('.card.price');
    const updatePrices = () => {
      const yearly = billingToggle.checked;
      cards.forEach(c => {
        const m = Number(c.dataset.monthly);
        const y = Number(c.dataset.yearly);
        const amt = c.querySelector('.price-amt');
        if (yearly) {
          amt.innerHTML = `₹${y.toLocaleString()}<span>/mo</span>`;
        } else {
          amt.innerHTML = `₹${m.toLocaleString()}<span>/mo</span>`;
        }
      });
    };
    billingToggle.addEventListener('change', updatePrices);
    updatePrices();
  }

  // Pull ?plan from URL onto order select
  const planSelect = document.getElementById('planSelect');
  if (planSelect) {
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan');
    if (plan) planSelect.value = plan;
  }
});
"""

# SVG assets
logo_svg = """\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="256" height="256">
  <defs>
    <linearGradient id="g" x1="0" x2="1">
      <stop offset="0" stop-color="#ffd166"/>
      <stop offset="1" stop-color="#66ffd1"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="60" height="60" rx="14" fill="#0a0c10" stroke="#222931"/>
  <path d="M18 20h14l6 8h8a6 6 0 010 12H38l-6 8H18a6 6 0 01-6-6V26a6 6 0 016-6z" fill="url(#g)" opacity=".95"/>
</svg>
"""

favicon_svg = """\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="14" fill="#0a0c10" stroke="#222931"/>
  <path d="M8 9h7l3 4h6a4 4 0 110 8h-6l-3 4H8a4 4 0 01-4-4V13a4 4 0 014-4z" fill="#ffd166"/>
</svg>
"""

badges_svg = """\
<svg xmlns="http://www.w3.org/2000/svg" width="420" height="40" viewBox="0 0 420 40">
  <g fill="#a7b0bf">
    <rect x="10" y="8" width="90" height="24" rx="12" fill="#12151a" stroke="#1f2430"/>
    <text x="55" y="25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="12">YouTube</text>
    <rect x="110" y="8" width="90" height="24" rx="12" fill="#12151a" stroke="#1f2430"/>
    <text x="155" y="25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="12">Instagram</text>
    <rect x="210" y="8" width="90" height="24" rx="12" fill="#12151a" stroke="#1f2430"/>
    <text x="255" y="25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="12">TikTok</text>
    <rect x="310" y="8" width="90" height="24" rx="12" fill="#12151a" stroke="#1f2430"/>
    <text x="355" y="25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="12">LinkedIn</text>
  </g>
</svg>
"""

# Placeholder media
open(os.path.join(assets, "style.css"), "w").write(style_css)
open(os.path.join(assets, "script.js"), "w").write(script_js)
open(os.path.join(assets, "logo.svg"), "w").write(logo_svg)
open(os.path.join(assets, "favicon.svg"), "w").write(favicon_svg)
open(os.path.join(assets, "badges.svg"), "w").write(badges_svg)

# Placeholder images/videos
for name in ["sample1.webp","sample2.webp","sample3.webp","sample4.webp","boards.webp","hero-poster.webp"]:
    open(os.path.join(assets, name), "wb").write(b"\x00")
open(os.path.join(assets, "demo.mp4"), "wb").write(b"\x00")

# Write pages
pages = {
    "index.html": index_html,
    "services.html": services_html,
    "pricing.html": pricing_html,
    "portfolio.html": portfolio_html,
    "about.html": about_html,
    "contact.html": contact_html,
    "order.html": order_html,
    "terms.html": terms_html,
    "privacy.html": privacy_html,
    "thank-you.html": thankyou_html,
}

for filename, html in pages.items():
    open(os.path.join(root, filename), "w", encoding="utf-8").write(html)

# Zip it
zip_path = "/mnt/data/clipmint-website.zip"
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for folder, _, files in os.walk(root):
        for f in files:
            p = os.path.join(folder, f)
            z.write(p, arcname=os.path.relpath(p, root))

zip_path