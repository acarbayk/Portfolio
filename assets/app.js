(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Translations (English lives in the HTML) ---------- */
  var TR = {
    'skip': 'İçeriğe geç',
    'nav.about': 'Hakkımda', 'nav.work': 'Projeler', 'nav.exp': 'Deneyim', 'nav.skills': 'Yetenekler', 'nav.contact': 'İletişim',
    'hero.status': 'Basit kurallardan dünyalar kuruyorum',
    'hero.hi': 'Merhaba, ben',
    'hero.role': 'Yapay zekâ ajanları ve otonom sistemler geliştiren yazılımcı.',
    'hero.bio': 'Doğu Akdeniz Üniversitesi’nde bilişim teknolojileri 4. sınıf öğrencisiyim. Şu an VeriTeknik’te stajyerim ve açık kaynak MCP platformu pluggedin.ai’ye katkı veriyorum.',
    'cta.work': 'Projelerime bak', 'cta.resume': 'Özgeçmişi indir',
    'stat.agents': 'tarayıcıda eşzamanlı simüle edilen ajan',
    'stat.aws': 'AWS makine öğrenmesi ve üretken YZ eğitim sertifikası',
    'stat.mentor': 'yıllık gönüllü mentorluk',
    'about.label': 'Hakkımda',
    'about.title': 'Karmaşık sistemlerin nasıl ortaya çıktığını merak ediyorum',
    'about.p1': 'Yazılım geliştiriciyim ve Doğu Akdeniz Üniversitesi’nde bilişim teknolojileri 4. sınıf öğrencisiyim. Basit kuralların şaşırtıcı davranışlar doğurduğu projeleri severim: ajan simülasyonları, otonom araçlar ve bunları ayakta tutan altyapı.',
    'about.p2': 'VeriTeknik’te altyapı izleme ve müşteri taleplerine destek veriyorum; açık kaynak MCP sunucu platformu pluggedin.ai’ye bir düzeltme katkısında bulundum. İş dışında lise öğrencilerine TÜBİTAK araştırmaları için mentorluk yapıyorum ve Erasmus+ ile Portekiz’de bulundum.',
    'work.label': 'Seçili işler', 'work.title': 'Geliştirdiklerim',
    'civ.tab1': 'Harita', 'civ.tab2': '99. yıl', 'civ.tab3': 'Tarih kitabı', 'civ.tab4': 'Krallıklar',
    'civ.badge': 'Öne çıkan proje',
    'civ.desc': 'Her vatandaş; Big Five kişiliği, ihtiyaçları, anıları ve ilişkileri olan bağımsız bir ajan. Krallıklar, savaşlar, hanedanlar ve isyanlar bu etkileşimlerden doğuyor; her çalıştırma farklı bir tarih yazıyor.',
    'civ.b1': 'Web Worker mimarisi 500+ eşzamanlı ajanı akıcı çalıştırıyor',
    'civ.b2': 'Framework kullanmadan, saf JavaScript ve HTML5 Canvas ile yazıldı',
    'civ.b3': 'Ajanlar yaşlanır, evlenir, çocuk yetiştirir, hanedan kurar ve isyan eder',
    'civ.demo': 'Canlı demo', 'civ.src': 'Kaynak kod',
    'other.title': 'Katkılar ve küçük işler',
    'other.pi': 'Fix #172: açık kaynak bir MCP sunucu platformunda Streamable HTTP transport anahtarı aktarım hatasını çözdüm.',
    'other.bh': 'Zafiyet tespitini ve CI/CD entegrasyonunu otomatikleştiren otonom bug bounty ajanı.',
    'other.cb': 'Minimax ve alfa-beta budama kullanan, yaklaşık 1200–1600 Elo’luk satranç motoru. Hamleleri vurgulayan ve ses çalan bir arayüzü var.',
    'other.ap': 'Lisede TÜBİTAK mentorluğunda geliştirilen, dairesel tarım sistemleri üzerine Teknofest araştırma projesi.',
    'other.more.t': 'Yenileri yolda',
    'other.more.p': 'Yeni projeleri yaptıkça ekliyorum. GitHub’dan takip edebilirsin.',
    'exp.label': 'Deneyim', 'exp.title': 'Çalıştığım yerler',
    'exp.vt.date': 'Tem 2026 — Günümüz', 'exp.vt.title': 'Destek ve Altyapı Stajyeri',
    'exp.vt.desc': 'Altyapı izleme, müşteri desteği ve talep çözümü. Açık kaynak MCP sunucu platformu pluggedin-app’e fix #172 katkısında bulundum.',
    'exp.mt.date': 'Eyl 2021 — Günümüz', 'exp.mt.title': 'Gönüllü Mentor',
    'exp.mt.org': 'Halit Özpirinç Anadolu Lisesi, İzmir',
    'exp.mt.desc': 'TÜBİTAK bilim araştırması mentorluğu. Teknofest’e sunulan dairesel tarım projesi Apollo 6’ya liderlik ettim.',
    'exp.also': 'Ayrıca',
    'exp.rpg': 'EMU RPG Kulübü’nü kurucu ortak olarak kurdum; kulüp 300 üyeye ulaştı ve iki sponsorluk sağlandı (2023–2025).',
    'ada.badge': 'Kurucu projesi', 'ada.date': 'Kas 2023 — May 2024 · Kurucu', 'ada.date2': 'Kas 2023 — May 2024', 'ada.role': 'Kurucu',
    'ada.desc': 'Türkçe konuşan bir kitleye blokzincir ve Web3 okuryazarlığı kazandırmak için Cardano destekli bir eğitim girişimi kurdum ve yürüttüm; ilk fikirden yayınlanan içeriklere ve canlı topluluk etkinliklerine kadar süreci yönettim.',
    'ada.b1': 'Podcast bölümleri ve YouTube içerikleri ürettim', 'ada.b2': 'Topluluk buluşmaları düzenledim', 'ada.b3': 'Project Catalyst (Fund 10) tarafından fonlandı: 40.333 ADA, tamamlandı',
    'ada.link': 'Project Catalyst’te gör', 'ada.w1': 'Kas 2023', 'ada.w2': 'Oca 2024', 'ada.w3': 'Nis 2024', 'ada.s1': 'İçerik ve büyüme', 'ada.s2': 'İçerik ve büyüme', 'ada.s3': 'Türk Cardano Topluluğu’nu kurma',
    'ada.tl': 'Türkiye için Cardano destekli bir blokzincir eğitim girişimi kurdum: podcast, YouTube içerikleri ve topluluk buluşmaları.',
    'skills.label': 'Yetenekler', 'skills.title': 'Kullandığım teknolojiler',
    'skills.g1': 'Diller', 'skills.g2': 'Web ve veri', 'skills.g3': 'Yapay zekâ ve araçlar',
    'edu.title': 'Eğitim', 'edu.emu': 'Bilişim Teknolojileri, 4. sınıf', 'edu.erasmus': 'Portekiz’de Erasmus+ değişim programı',
    'edu.lang': 'Türkçe · İngilizce · Japonca (başlangıç)',
    'cert.title': 'Sertifikalar',
    'cert.aws': '8 AWS Training & Certification tamamlama: makine öğrenmesi (6), üretken YZ (2)',
    'cert.awsd': 'SageMaker, ML terminolojisi ve proje planlama dahil · Temmuz 2025',
    'cert.udemy': 'Python: Sıfırdan İleri Seviye (40+ saat), Udemy · Şubat 2023',
    'contact.label': 'İletişim', 'contact.title': 'Konuşalım',
    'contact.lead': 'İlginç iş birliklerine ve yapay zekâ ajanları ile otonom sistemler üzerine sohbetlere açığım. Bana ulaşmanın en hızlı yolu e-posta.',
    'contact.copy': 'E-postayı kopyala',
    'form.name': 'Ad', 'form.email': 'E-posta', 'form.msg': 'Mesaj', 'form.send': 'Mesajı gönder',
    'footer.copy': '© 2026 Kaya Acarbay · HTML, CSS ve JavaScript ile elle yazıldı'
  };
  var UI = {
    en: { copied: 'Copied', copy: 'Copy email', sending: 'Sending…', ok: 'Thanks! Your message was sent.', err: 'Something went wrong. Please email me directly.',
          toLight: 'Switch to light theme', toDark: 'Switch to dark theme', menu: 'Menu', langLabel: 'Language', shots: 'Screenshots',
          title: 'Kaya Acarbay — Software Developer (AI agents & autonomous systems)',
          desc: 'Kaya Acarbay is a 4th-year IT student and software developer building AI agents and autonomous systems. Intern at VeriTeknik. Open to internships.' },
    tr: { copied: 'Kopyalandı', copy: 'E-postayı kopyala', sending: 'Gönderiliyor…', ok: 'Teşekkürler! Mesajın gönderildi.', err: 'Bir şeyler ters gitti. Lütfen doğrudan e-posta gönder.',
          toLight: 'Açık temaya geç', toDark: 'Koyu temaya geç', menu: 'Menü', langLabel: 'Dil', shots: 'Ekran görüntüleri',
          title: 'Kaya Acarbay — Yazılım Geliştirici (YZ ajanları ve otonom sistemler)',
          desc: 'Kaya Acarbay, yapay zekâ ajanları ve otonom sistemler geliştiren, bilişim teknolojileri 4. sınıf öğrencisi bir yazılımcı. VeriTeknik stajyeri.' }
  };
  var ALT = {
    'assets/img/civ-overview.webp': { en: "The simulation map in year 7: kingdoms, pixel citizens and a ruler's profile panel", tr: 'Simülasyon haritası, 7. yıl: krallıklar, pixel vatandaşlar ve bir hükümdarın profil paneli' },
    'assets/img/civ-late-game.webp': { en: 'The simulation in year 99: kingdoms at war, new dynasties and a rebellion in the event feed', tr: 'Simülasyon, 99. yıl: savaşan krallıklar, yeni hanedanlar ve olay akışında bir isyan' },
    'assets/img/civ-chronicle.webp': { en: 'The Book of History: population chart of the kingdoms over a century and a list of turning points', tr: 'Tarih Kitabı: krallıkların yüzyıl boyunca nüfus grafiği ve dönüm noktaları listesi' },
    'assets/img/civ-kingdoms.webp': { en: 'Kingdom ranking panel with population, cities and alliances', tr: 'Nüfus, şehir ve ittifakları gösteren krallık sıralama paneli' }
  };
  var EN = {};
  $$('[data-i18n]').forEach(function (el) { EN[el.dataset.i18n] = el.textContent; });
  var lang = root.lang === 'tr' ? 'tr' : 'en';

  function setLang(l, persist) {
    lang = l === 'tr' ? 'tr' : 'en';
    root.lang = lang;
    if (persist) store.set('lang', lang);
    $$('[data-i18n]').forEach(function (el) {
      var k = el.dataset.i18n;
      el.textContent = lang === 'tr' && TR[k] ? TR[k] : EN[k];
    });
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    var u = UI[lang];
    document.title = u.title;
    $('meta[name="description"]').setAttribute('content', u.desc);
    $('.lang').setAttribute('aria-label', u.langLabel);
    $('#menu-btn').setAttribute('aria-label', u.menu);
    $('.tabs').setAttribute('aria-label', u.shots);
    var cur = $('#civ-shot').getAttribute('src');
    if (ALT[cur]) $('#civ-shot').alt = ALT[cur][lang];
    $$('.tabs button').forEach(function (b) { b.dataset.alt = ALT[b.dataset.shot][lang]; });
    $('#copy-mail').textContent = u.copy;
    updateThemeLabel();
    if (window.__refreshWorldCaption) window.__refreshWorldCaption();
  }
  $$('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang, true); }); });

  /* ---------- Theme ---------- */
  var themeBtn = $('#theme-btn');
  function updateThemeLabel() {
    themeBtn.setAttribute('aria-label', root.dataset.theme === 'dark' ? UI[lang].toLight : UI[lang].toDark);
    var m = $('meta[name="theme-color"]');
    if (m) m.setAttribute('content', root.dataset.theme === 'dark' ? '#0B0A13' : '#F6F5FB');
  }
  themeBtn.addEventListener('click', function () {
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    store.set('theme', next);
    updateThemeLabel();
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('#menu-btn'), links = $('#nav-links');
  function closeMenu() { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  $$('a', links).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); menuBtn.focus(); } });

  /* ---------- Active section ---------- */
  var navMap = {};
  $$('[data-nav]').forEach(function (a) { navMap[a.dataset.nav] = a; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && navMap[en.target.id]) {
          Object.keys(navMap).forEach(function (k) { navMap[k].removeAttribute('aria-current'); });
          navMap[en.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { spy.observe(s); });

    var rev = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); } });
    }, { threshold: 0.1 });
    $$('.reveal').forEach(function (el) { rev.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Screenshot tabs ---------- */
  $$('.tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.tabs button').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      var img = $('#civ-shot');
      img.src = b.dataset.shot;
      img.alt = b.dataset.alt;
    });
  });

  /* ---------- Copy email ---------- */
  $('#copy-mail').addEventListener('click', function () {
    var btn = this, addr = 'kaya-acarbay8@hotmail.com';
    function done() {
      btn.textContent = UI[lang].copied;
      $('#copy-live').textContent = UI[lang].copied;
      setTimeout(function () { btn.textContent = UI[lang].copy; $('#copy-live').textContent = ''; }, 2000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(addr).then(done, function () { location.href = 'mailto:' + addr; });
    else location.href = 'mailto:' + addr;
  });

  /* ---------- Contact form (Netlify, AJAX with normal-submit fallback) ---------- */
  var form = $('#contact-form'), status = $('#form-status');
  form.addEventListener('submit', function (e) {
    if (!window.fetch || location.protocol === 'file:' || /^(localhost|127\.)/.test(location.hostname)) {
      if (location.protocol === 'file:' || /^(localhost|127\.)/.test(location.hostname)) { e.preventDefault(); status.className = 'ok'; status.textContent = UI[lang].ok; form.reset(); }
      return;
    }
    e.preventDefault();
    status.className = ''; status.textContent = UI[lang].sending;
    var body = new URLSearchParams(new FormData(form)).toString();
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
      .then(function (r) { if (!r.ok) throw new Error(r.status); status.className = 'ok'; status.textContent = UI[lang].ok; form.reset(); })
      .catch(function () { status.className = 'err'; status.textContent = UI[lang].err; });
  });

  /* ---------- Pixel world strip (see world.js) ---------- */
  (function () {
    var cv = $('#world'), cap = $('#world-cap');
    if (!cv || !cv.getContext || !window.PixelWorld) return;
    var ctx = cv.getContext('2d'), SC = 4, H = 40, world = null, timer = null, vis = true, W = 0;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)');
    var T = { en: { year: 'Year', kingdom: 'Kingdom of Kaya', vill: 'villagers', built: 'built', done: 'Kingdom founded!', hint: 'Click the map to cheer them on.' },
              tr: { year: 'Yıl', kingdom: 'Kaya Krallığı', vill: 'köylü', built: 'yapı', done: 'Krallık kuruldu!', hint: 'Haritaya tıklayıp onları alkışla.' } };
    function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
    function opts() {
      var dark = root.dataset.theme !== 'light';
      return { dark: dark, sky: css('--bg-alt') || '#100F1B', grass: dark ? '#1F6F4A' : '#4FAE78', grassHi: dark ? '#278A5C' : '#63C48C', dirt: dark ? '#2A2842' : '#B9B5D6' };
    }
    function draw() { if (world) world.draw(ctx, opts()); }
    function caption() {
      if (!cap || !world) return;
      var s = world.stats(), t = T[lang];
      cap.textContent = '';
      function add(cls, txt) { var e = document.createElement('span'); e.className = cls; e.textContent = txt; cap.appendChild(e); return e; }
      add('cap-year', t.year + ' ' + s.year);
      add('cap-k', t.kingdom);
      add('cap-k', s.pop + ' ' + t.vill);
      add('cap-k' + (s.founded ? ' cap-done' : ''), s.founded ? t.done : s.built + '/' + s.total + ' ' + t.built);
      add('cap-hint', t.hint);
    }
    function build() {
      var w = Math.max(80, Math.floor(cv.clientWidth / SC));
      if (w === W && world) return;
      W = w; cv.width = W; cv.height = H; world = new PixelWorld.World(W, H);
      if (reduce.matches) for (var i = 0; i < 760; i++) world.update();
      draw(); caption();
    }
    function loop() { world.update(); draw(); if (world.tick % 6 === 0) caption(); }
    function run() { stop(); if (!reduce.matches && vis && !document.hidden) timer = setInterval(loop, 80); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    cv.addEventListener('click', function (e) { var r = cv.getBoundingClientRect(); world.bless((e.clientX - r.left) / r.width * W); draw(); });
    build(); window.addEventListener('resize', build);
    reduce.addEventListener && reduce.addEventListener('change', run);
    document.addEventListener('visibilitychange', run);
    new MutationObserver(draw).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; run(); }).observe(cv);
    window.__refreshWorldCaption = caption;
    run();
  })();

  setLang(lang, false);
})();
