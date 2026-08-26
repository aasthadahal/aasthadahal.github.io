/* Site analytics: GoatCounter pageviews + time-on-page + outbound link events. */
(function () {
  var s = document.createElement('script');
  s.async = true; s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', 'https://aasthadahal.goatcounter.com/count');
  document.head.appendChild(s);

  var page = (location.pathname.replace(/\/index\.html$/, '/') || '/') + (location.hash || '');
  var start = Date.now(), sent = false;
  function bucket(sec) {
    if (sec < 10) return 'under-10s';
    if (sec < 30) return '10-30s';
    if (sec < 60) return '30-60s';
    if (sec < 180) return '1-3min';
    if (sec < 300) return '3-5min';
    if (sec < 600) return '5-10min';
    return 'over-10min';
  }
  function count(path, title) {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: path, title: title || path, event: true });
    }
  }
  function sendTime() {
    if (sent) return; sent = true;
    var sec = Math.round((Date.now() - start) / 1000);
    count('time-on-page' + page + '/' + bucket(sec), 'Time on ' + page + ': ' + bucket(sec));
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') sendTime(); });
  window.addEventListener('pagehide', sendTime);

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (a.classList.contains('lb') || a.classList.contains('addr-link')) {
      var site = a.classList.contains('addr-link') ? 'maps' : ({G: 'maps', Z: 'zillow', R: 'redfin'}[a.textContent.trim()] || 'link');
      var addr = (a.closest('.addr') && a.closest('.addr').getAttribute('data-a')) || '';
      count('click/' + site + '/' + addr.split(',')[0], 'Clicked ' + site + ': ' + addr);
    } else if (/^https?:\/\//.test(h) && h.indexOf(location.host) === -1) {
      count('click/outbound/' + h.replace(/^https?:\/\//, '').slice(0, 80), 'Outbound: ' + h);
    }
  }, true);
})();
