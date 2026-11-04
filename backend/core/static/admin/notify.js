/* Polls the order queue and surfaces new orders while the admin is open:
   updates the sidebar badge, prefixes the tab title, and shows a toast. */
(function () {
  var POLL_MS = 20000;
  var KEY = "bp_last_order_id";
  var baseTitle = document.title;

  function badgeEl() {
    var link = document.querySelector('a[href="/admin/orders/order/"]');
    return link ? link.querySelector("span.bg-red-600, span.bp-badge") : null;
  }

  function setBadge(count) {
    var el = badgeEl();
    var link = document.querySelector('a[href="/admin/orders/order/"]');
    if (!link) return;
    if (!el && count > 0) {
      el = document.createElement("span");
      el.className = "bp-badge bg-red-600 font-semibold ml-2 px-1 relative rounded-sm text-xs text-white";
      link.appendChild(el);
    }
    if (el) {
      el.textContent = count > 0 ? String(count) : "";
      el.style.display = count > 0 ? "" : "none";
    }
    document.title = (count > 0 ? "(" + count + ") " : "") + baseTitle;
  }

  function toast(order) {
    var box = document.querySelector(".bp-toasts");
    if (!box) { box = document.createElement("div"); box.className = "bp-toasts"; document.body.appendChild(box); }
    var a = document.createElement("a");
    a.className = "bp-toast";
    a.href = "/admin/orders/order/" + order.id + "/change/";
    a.innerHTML = "<strong>New order " + order.number + "</strong><span>" + order.customer + " · $" + order.total + "</span>";
    box.appendChild(a);
    setTimeout(function () { a.remove(); }, 8000);
  }

  function poll() {
    fetch("/api/inventory/orders/queue/", { credentials: "same-origin", headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return;
        setBadge(data.to_fulfil);
        var last = parseInt(localStorage.getItem(KEY) || "0", 10);
        var fresh = data.latest.filter(function (o) { return o.id > last; });
        if (last > 0) fresh.slice(0, 3).forEach(toast);
        if (data.latest.length) localStorage.setItem(KEY, String(Math.max(last, data.latest[0].id)));
      })
      .catch(function () {});
  }

  document.addEventListener("DOMContentLoaded", function () { poll(); setInterval(poll, POLL_MS); });
})();
