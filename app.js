(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* Theme toggle, remembered across pages */
  var themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme');
      if (!current) current = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('jkn-theme', next); } catch (e) {}
    });
  }

  /* Mobile menu */
  var menuBtn = document.getElementById('menu-btn');
  var top = document.querySelector('.top');
  if (menuBtn && top) {
    menuBtn.addEventListener('click', function () {
      var open = top.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* Typed code window */
  var lines = document.querySelectorAll('#code .ln');
  var delay = 300;
  lines.forEach(function (ln) {
    var n = Math.max(ln.textContent.length, 1);
    ln.style.setProperty('--n', n);
    ln.style.setProperty('--d', delay + 'ms');
    delay += n * 28 + 120;
  });

  /* Rotating role */
  var rot = document.getElementById('rot');
  if (rot && !reduce) {
    var words = ['websites', 'Express APIs', 'PostgreSQL databases', 'brand designs', 'tools for real businesses'];
    var wi = 0, ci = words[0].length, deleting = true;
    setTimeout(function tick() {
      if (deleting) {
        ci--; rot.textContent = words[wi].slice(0, ci);
        if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
        setTimeout(tick, 45);
      } else {
        ci++; rot.textContent = words[wi].slice(0, ci);
        if (ci === words[wi].length) { deleting = true; setTimeout(tick, 2000); }
        else setTimeout(tick, 75);
      }
    }, 2200);
  }

  /* Hero glow follows pointer */
  var hero = document.getElementById('hero');
  if (hero && !reduce) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--gx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    });
  }

  /* Stock demo (sample data) */
  var rowsEl = document.getElementById('rows');
  if (rowsEl) {
    var stock = {
      3:  [['TotalEnergies', 6, 2], ['K-Gas', 4, 3], ['Hashi', 5, 1]],
      6:  [['TotalEnergies', 9, 4], ['K-Gas', 7, 5], ['Hashi', 6, 3]],
      13: [['TotalEnergies', 8, 5], ['K-Gas', 5, 6], ['Hashi', 7, 2]],
      50: [['TotalEnergies', 2, 1], ['K-Gas', 1, 2], ['Hashi', 2, 0]]
    };
    var size = 13;
    var logEl = document.getElementById('log');
    var render = function () {
      var list = stock[size];
      var max = 1;
      list.forEach(function (b) { max = Math.max(max, b[1] + b[2]); });
      rowsEl.innerHTML = '';
      list.forEach(function (b, i) {
        var row = document.createElement('div');
        row.className = 'row';
        row.innerHTML =
          '<div class="row-top"><b>' + b[0] + '</b><span>' + b[1] + ' full · ' + b[2] + ' empty</span></div>' +
          '<div class="bar"><div class="f" style="width:' + (b[1] / max * 100) + '%"></div><div class="e" style="width:' + (b[2] / max * 100) + '%"></div></div>';
        var btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'row-btn'; btn.id = 'sell-' + size + '-' + i;
        btn.textContent = 'Sell refill';
        btn.disabled = b[1] === 0;
        btn.addEventListener('click', function () {
          if (b[1] === 0) return;
          b[1]--; b[2]++;
          logEl.textContent = '✓ Sold 1 × ' + size + 'kg ' + b[0] + ' refill. Empty received.';
          render();
        });
        row.appendChild(btn);
        rowsEl.appendChild(row);
      });
    };
    document.querySelectorAll('.tab').forEach(function (t) {
      t.addEventListener('click', function () {
        document.querySelectorAll('.tab').forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
        t.setAttribute('aria-selected', 'true');
        size = Number(t.dataset.size);
        render();
      });
    });
    document.getElementById('supplier').addEventListener('click', function () {
      var total = 0;
      Object.keys(stock).forEach(function (k) { stock[k].forEach(function (b) { total += b[2]; b[1] += b[2]; b[2] = 0; }); });
      logEl.textContent = total ? '✓ Supplier returned ' + total + ' refilled cylinders. All empties now full.' : 'No empties waiting for the supplier.';
      render();
    });
    render();
  }

  /* Copy buttons */
  document.querySelectorAll('.copy').forEach(function (btn) {
    var original = btn.textContent;
    btn.addEventListener('click', function () {
      var el = document.getElementById(btn.dataset.target);
      var text = el.textContent.trim();
      function done(msg) {
        btn.textContent = msg; btn.classList.add('done');
        setTimeout(function () { btn.textContent = original; btn.classList.remove('done'); }, 1800);
      }
      function selectIt() {
        var r = document.createRange(); r.selectNodeContents(el);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        done('Selected, press Ctrl+C');
      }
      try { navigator.clipboard.writeText(text).then(function () { done('Copied'); }, selectIt); }
      catch (e) { selectIt(); }
    });
  });
})();

/* Contact form: prepares an email for the visitor's own mail app */
(function () {
  var form = document.getElementById('cform');
  if (!form) return;
  var TO = 'kamaujoseph.dev@gmail.com';
  var f = {
    name: document.getElementById('f-name'),
    email: document.getElementById('f-email'),
    topic: document.getElementById('f-topic'),
    msg: document.getElementById('f-msg')
  };
  var errs = { name: document.getElementById('e-name'), email: document.getElementById('e-email'), msg: document.getElementById('e-msg') };
  var ready = document.getElementById('ready');
  var preview = document.getElementById('preview');
  var mailLink = document.getElementById('mail-link');
  var copyBtn = document.getElementById('copy-msg');
  var body = '';

  function setErr(key, text) {
    errs[key].textContent = text;
    f[key].parentElement.classList.toggle('bad', !!text);
  }
  ['name', 'email', 'msg'].forEach(function (k) {
    f[k].addEventListener('input', function () { setErr(k, ''); ready.hidden = true; });
  });
  f.topic.addEventListener('change', function () { ready.hidden = true; });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = f.name.value.trim(), email = f.email.value.trim(), msg = f.msg.value.trim();
    var ok = true;
    if (!name) { setErr('name', 'Enter your name.'); ok = false; }
    if (!email) { setErr('email', 'Enter your email so Joseph can reply.'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('email', 'Check your email address. It should look like name@example.com.'); ok = false; }
    if (msg.length < 10) { setErr('msg', 'Write a short message, at least 10 characters.'); ok = false; }
    if (!ok) { ready.hidden = true; return; }

    var subject = f.topic.value + ' from ' + name;
    body = msg + '\n\n' + name + '\n' + email;
    preview.textContent = 'To: ' + TO + '\nSubject: ' + subject + '\n\n' + body;
    mailLink.href = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    ready.hidden = false;
    ready.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  copyBtn.addEventListener('click', function () {
    var text = preview.textContent;
    function done(m) { copyBtn.textContent = m; setTimeout(function () { copyBtn.textContent = 'Copy message'; }, 1800); }
    function selectIt() {
      var r = document.createRange(); r.selectNodeContents(preview);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      done('Selected, press Ctrl+C');
    }
    try { navigator.clipboard.writeText(text).then(function () { done('Copied'); }, selectIt); }
    catch (err) { selectIt(); }
  });
})();

/* Certificate viewer */
(function () {
  var box = document.getElementById('cert-box');
  var openBtn = document.getElementById('open-cert');
  if (!box || !openBtn) return;
  var closeBtn = document.getElementById('close-cert');
  function open() { box.hidden = false; closeBtn.focus(); document.body.style.overflow = 'hidden'; }
  function close() { box.hidden = true; document.body.style.overflow = ''; openBtn.focus(); }
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) close(); });
})();

/* Generic image viewers: [data-open="id"] opens, [data-close="id"] closes */
(function () {
  var last = null;
  function open(id, from) {
    var box = document.getElementById(id); if (!box) return;
    last = from; box.hidden = false; document.body.style.overflow = 'hidden';
    var c = box.querySelector('[data-close]'); if (c) c.focus();
  }
  function close(box) {
    box.hidden = true; document.body.style.overflow = '';
    if (last) last.focus();
  }
  document.querySelectorAll('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () { open(b.getAttribute('data-open'), b); });
  });
  document.querySelectorAll('[data-close]').forEach(function (b) {
    b.addEventListener('click', function () { close(document.getElementById(b.getAttribute('data-close'))); });
  });
  document.querySelectorAll('.lightbox').forEach(function (box) {
    box.addEventListener('click', function (e) { if (e.target === box) close(box); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.lightbox').forEach(function (box) { if (!box.hidden) close(box); });
  });
})();

/* Resume download. On a normal host the link downloads the PDF directly.
   Inside the Claude artifact viewer, plain download links are blocked, so
   the downloads capability saves the file instead. */
(function () {
  var links = document.querySelectorAll('.resume-dl');
  if (!links.length || !window.claude || typeof window.claude.use !== 'function') return;
  var FILE = 'Joseph-Kamau-Ngigi-Resume.pdf';
  var dlPromise = window.claude.use('downloads');
  function note(link, text) {
    var n = document.getElementById('dl-note-about');
    if (n && link.id === 'dl-about') { n.textContent = text; return; }
    var original = link.dataset.label || link.lastChild.textContent;
    link.dataset.label = original;
    link.lastChild.textContent = ' ' + text;
    setTimeout(function () { link.lastChild.textContent = original; }, 2600);
  }
  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      dlPromise.then(function (downloads) {
        if (!downloads) { note(link, 'Download is not available in this view'); return; }
        return fetch(FILE).then(function (r) {
          if (!r.ok) throw { code: 'unavailable' };
          return r.blob();
        }).then(function (blob) {
          return downloads.save({ filename: FILE, data: blob });
        }).then(function () {
          note(link, 'Resume saved');
        }, function (err) {
          var code = err && err.code;
          if (code === 'declined') return;
          if (code === 'rate_limited') { note(link, 'A save prompt is already open'); return; }
          note(link, 'Download is not available in this view');
        });
      });
    });
  });
})();

/* Design gallery: filters and viewer */
(function () {
  var works = window.DESIGN_WORKS;
  var gallery = document.getElementById('gallery');
  if (!works || !gallery) return;
  var items = gallery.querySelectorAll('.work');
  var filters = document.querySelectorAll('.filter');
  var box = document.getElementById('gal-box');
  var img = document.getElementById('gal-img');
  var visible = works.map(function (_, i) { return i; });
  var pos = 0, opener = null;

  filters.forEach(function (f) {
    f.addEventListener('click', function () {
      var cat = f.dataset.filter;
      filters.forEach(function (x) { x.setAttribute('aria-pressed', x === f ? 'true' : 'false'); });
      visible = [];
      items.forEach(function (el, i) {
        var show = cat === 'all' || el.dataset.cat === cat;
        el.hidden = !show;
        if (show) visible.push(i);
      });
    });
  });

  function show(p) {
    pos = (p + visible.length) % visible.length;
    var w = works[visible[pos]];
    img.src = w.src; img.alt = w.title;
    document.getElementById('gal-cat').textContent = w.cat;
    document.getElementById('gal-title').textContent = w.title;
    document.getElementById('gal-desc').textContent = w.desc;
    document.getElementById('gal-count').textContent = (pos + 1) + ' of ' + visible.length;
  }
  function open(i, from) {
    opener = from;
    show(Math.max(0, visible.indexOf(i)));
    box.hidden = false; document.body.style.overflow = 'hidden';
    document.getElementById('gal-close').focus();
  }
  function close() {
    box.hidden = true; document.body.style.overflow = '';
    if (opener) opener.focus();
  }
  gallery.querySelectorAll('.work-btn').forEach(function (b) {
    b.addEventListener('click', function () { open(Number(b.dataset.index), b); });
  });
  document.getElementById('gal-prev').addEventListener('click', function () { show(pos - 1); });
  document.getElementById('gal-next').addEventListener('click', function () { show(pos + 1); });
  document.getElementById('gal-close').addEventListener('click', close);
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(pos - 1);
    else if (e.key === 'ArrowRight') show(pos + 1);
  });
  var sx = null;
  box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) show(pos + (dx < 0 ? 1 : -1));
  });
})();

/* Only one video plays at a time */
document.addEventListener('play', function (e) {
  if (e.target.tagName !== 'VIDEO') return;
  document.querySelectorAll('video').forEach(function (v) { if (v !== e.target) v.pause(); });
}, true);
