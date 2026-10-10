/* Shared behaviour for inner pages: theme, language, mobile menu, reveal. */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var TR = {
    'skip': 'İçeriğe geç', 'back': 'Projelere dön',
    'nav.about': 'Hakkımda', 'nav.work': 'Projeler', 'nav.exp': 'Deneyim', 'nav.skills': 'Yetenekler', 'nav.contact': 'İletişim',
    'civ.demo': 'Canlı demo', 'civ.src': 'Kaynak kod',
    'cs.label': 'Vaka çalışması',
    'cs.lead': 'Bir toplumdaki herkese kişilik, aile ve hafıza verip hikâyeyi kimsenin yazmadığı bir dünyada neler olacağını görmek istedim. Krallıklar, isyanlar ve hanedanlar kendiliğinden ortaya çıkıyor, her çalıştırma farklı bir tarih yazıyor.',
    'f.role': 'Rol', 'f.role.v': 'Tek geliştirici',
    'f.stack': 'Teknoloji', 'f.stack.v': 'Saf JavaScript ve HTML5 Canvas, framework yok',
    'f.scale': 'Ölçek', 'f.scale.v': 'Dört krallıkta 1.100’e kadar insan',
    'f.open': 'Açık kaynak', 'f.open.v': 'MIT lisansı, tarayıcıda oynanabilir (arayüz Türkçe)',
    'cap.1': 'Harita, 7. yıl: dört krallık, binlerce küçük karar ve sağda bir hükümdarın profili.',
    'q.label': 'Soru', 'q.title': 'Bir uygarlığın hikâyesinin ne kadarı basit kurallardan doğabilir?',
    'q.p1': 'Çoğu simülasyon dramını senaryolar. Ben dramın kurallardan çıkmasını istedim. Bu yüzden her insan yalnızca kendi ihtiyaçlarını, ilişkilerini ve değerlerini biliyor; bir krallık, bir savaş ya da bir hanedan gibi daha büyük her şey, bu insanların yaptıklarından kurulmak zorunda.',
    'q.p2': 'Sonuçta planlamadığım bir dünya çıkıyor. Krallıklar şehir kuruyor, ittifak yapıp birbirine ihanet ediyor, bazen bir isyanla parçalanıyor. Üreteç tohumlu olduğu için herhangi bir tarihi aynen yeniden oynatıp neden öyle olduğunu inceleyebiliyorum.',
    'h.label': 'Nasıl çalışıyor', 'h.title': 'Dört fikir her şeyi bir arada tutuyor',
    'h.c1.t': 'İç dünyası olan insanlar', 'h.c1.p': 'Her insanın Big Five kişiliği, değerleri, ailesi, dostları ve hasımları, anıları ve intikam almak ya da eş bulmak gibi bir hedefi var. Yaşlanıyor, evleniyor, çocuk yetiştiriyor ve ölüyorlar.',
    'h.c2.t': 'Hükümdarlar da insan', 'h.c2.p': 'Hükümdarın kişiliği krallığın savaş, barış ve ihanet kararlarını belirliyor; bu yüzden aynı harita bir çalıştırmadan ötekine çok farklı gidebiliyor.',
    'h.c3.t': 'Karşılık veren bir dünya', 'h.c3.p': 'Arazi, mevsimler, tarlalar ve kuraklıklar yiyeceği ve göçü şekillendiriyor. İsyanlar Epstein’in (2002) sivil şiddet modelini izliyor, eşik değeri ölçümle ayarlandı.',
    'h.c4.t': 'Yeniden oynatılabilen tarih', 'h.c4.p': 'Tohumlu bir rastgele sayı üreteci her çalıştırmayı tekrarlanabilir kılıyor: aynı seed aynı tarihi oynatıyor. Simülasyon ve arayüz ayrı rastgele akışlar kullanıyor, bu yüzden haritada gezinmek olanları değiştirmiyor.',
    'd.label': 'Tasarım kararı', 'd.title': 'İnsan başına bir dil modeli yerine kural tabanlı zihinler',
    'd.p1': 'Sosyal katmanı yazmadan önce üretken ajanlar üzerine araştırmaları ve Dwarf Fortress ile Crusader Kings gibi oyunların insanları nasıl modellediğini okudum. Yüzlerce insan için her adımda bir dil modelini çağırmak pratik değil; bu yüzden her zihin kural tabanlı: hafıza, ilişkiler, kişilik ve hedefler.',
    'd.p2': 'Plan, dil modelini yalnızca efsanevi bir figürün biyografisini yazmak gibi nadir anlarda kullanmak. Notlar ve kaynaklar repoda.',
    'p.label': 'Zor kısımlar', 'p.title': 'En çok emek isteyen üç şey',
    'p.1.t': 'Yüzlerce insanla hız', 'p.1.p': 'Nüfus 1.100 ile sınırlı (krallık başına 110) ve insanlar yalnızca bir uzamsal ızgara üzerinden komşularına bakıyor. Simülasyon ana iş parçacığında çalışıyor: yaklaşık 600 kişide 8× hız pratikte 2-3× kadar. Bilgisayar yetişemediğinde arayüz gerçek hızı gösteriyor, yetişiyormuş gibi davranmıyor.',
    'p.2.t': 'Dengeyi bulmak', 'p.2.p': 'Krallıklar ilk elli yılda her şey çökmeden yükselip düşmeli. Kuralları çalıştırmaları ölçerek ayarladım; örneğin isyan eşiği makaledeki 0,1 yerine 0,13. Demografiyi de tarihsel aralıklara karşı kontrol ettim: sanayi öncesi toplumlarda çocukların yaklaşık yarısı yetişkinliğe ulaşmadan ölürdü ve benim çalıştırmalarımda doğumda beklenen ömür otuzlu yaşların ortasında.',
    'p.3.t': 'İnsanları inandırıcı yapmak', 'p.3.p': 'İlişkiler Crusader Kings’teki gibi tek yönlü: A’nın B hakkında düşündüğü, B’nin A hakkında düşündüğü değil. Anılar önemli olmadıkça sönüyor. Yas, gurur ve açlık ruh hâlini ve korkuyu değiştiriyor. Olaylar dünyanın gerçek durumundan yazılıyor, bu yüzden tarih bir kayıt gibi değil bir hikâye gibi okunuyor.',
    'g.label': 'Gör', 'g.title': 'Aynı dünya, bir yüzyıl sonra',
    'cap.2': '99. yıl: olay akışında savaşlar, yeni hanedanlar ve bir isyan.', 'cap.3': 'Tarih Kitabı her krallığın nüfusunu çizgi grafikle gösteriyor ve dönüm noktalarını listeliyor.', 'cap.4': 'Krallıklar paneli: nüfus, şehirler, ittifaklar ve huzursuzluk.',
    'g.tip': 'İpucu: Boşluk duraklatır, + ve − hızı değiştirir, F bir kişiyi takip eder. Haritada birine tıklayıp hayatını okuyabilirsin.',
    'u.label': 'Dürüst durum', 'u.title': 'Henüz bitmeyenler',
    'u.p1': 'Repoda bilinen eksiklerin düz bir listesini tutuyorum. Danışmanın kararlarının etkisini dünyanın gürültüsünde görmek hâlâ zor, savaş gerekçeleri yalnızca birkaç şablondan geliyor ve gerçek oyuncularla henüz test yapmadım.',
    'u.p2': 'Bu sınırları yazmak ve onlara karşı ölçmek, bu projede çalışma biçimimin bir parçası.',
    'u.talk': 'Bunu benimle konuşalım',
    'footer.copy': '© 2026 Kaya Acarbay · HTML, CSS ve JavaScript ile elle yazıldı'
  };
  var UI = {
    en: { toLight: 'Switch to light theme', toDark: 'Switch to dark theme', menu: 'Menu', langLabel: 'Language', title: 'Agent-Based Civilization Simulation: case study | Kaya Acarbay' },
    tr: { toLight: 'Açık temaya geç', toDark: 'Koyu temaya geç', menu: 'Menü', langLabel: 'Dil', title: 'Agent-Based Civilization Simulation: vaka çalışması | Kaya Acarbay' }
  };
  var EN = {};
  $$('[data-i18n]').forEach(function (el) { EN[el.dataset.i18n] = el.textContent; });
  var lang = root.lang === 'tr' ? 'tr' : 'en';
  var themeBtn = $('#theme-btn');
  function themeLabel() { themeBtn.setAttribute('aria-label', root.dataset.theme === 'dark' ? UI[lang].toLight : UI[lang].toDark); }
  function setLang(l, persist) {
    lang = l === 'tr' ? 'tr' : 'en'; root.lang = lang; if (persist) store.set('lang', lang);
    $$('[data-i18n]').forEach(function (el) { var k = el.dataset.i18n; el.textContent = lang === 'tr' && TR[k] ? TR[k] : EN[k]; });
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    document.title = UI[lang].title; $('.lang').setAttribute('aria-label', UI[lang].langLabel); $('#menu-btn').setAttribute('aria-label', UI[lang].menu);
    themeLabel();
  }
  $$('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang, true); }); });
  themeBtn.addEventListener('click', function () { var n = root.dataset.theme === 'dark' ? 'light' : 'dark'; root.dataset.theme = n; store.set('theme', n); themeLabel(); });
  var menuBtn = $('#menu-btn'), links = $('#nav-links');
  menuBtn.addEventListener('click', function () { var o = links.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', String(o)); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); } });
  setLang(lang, false);
})();
