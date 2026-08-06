/* Robert Afiakwa Owusu — site scripts.
   No build step, no dependencies. Content comes from /data/*.json so you can
   add a publication, a photo album or a repo without touching any HTML. */

(function () {
  "use strict";

  /* ---------------------------------------------------------------- helpers */
  var ROOT = document.body.getAttribute("data-root") || "";

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  function esc(s) {
    return String(s === undefined || s === null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getJSON(path) {
    return fetch(ROOT + path, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(path + " returned " + r.status);
      return r.json();
    });
  }

  function fail(node, msg) {
    if (!node) return;
    node.innerHTML = "";
    node.appendChild(el("div", "empty", esc(msg)));
  }

  /* ------------------------------------------------------------ mobile nav */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ------------------------------------------------------------- year stamp */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------- publications */
  var pubMount = document.getElementById("publications");
  if (pubMount) {
    getJSON("data/publications.json").then(function (data) {
      var items = data.items || [];
      if (!items.length) {
        fail(pubMount, "No publications listed yet.");
        return;
      }
      // undated work ("In preparation") first, then newest year first
      items.sort(function (a, b) {
        var ay = a.year ? Number(a.year) : Infinity;
        var by = b.year ? Number(b.year) : Infinity;
        return by - ay;
      });
      var groups = {};
      var order = [];
      items.forEach(function (p) {
        var y = p.year || "In preparation";
        if (!groups[y]) { groups[y] = []; order.push(y); }
        groups[y].push(p);
      });

      pubMount.innerHTML = "";
      order.forEach(function (y) {
        pubMount.appendChild(el("h3", "year-heading", esc(y)));
        groups[y].forEach(function (p) {
          var wrap = el("article", "entry");

          var title = p.url
            ? '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.title) + "</a>"
            : esc(p.title);
          wrap.appendChild(el("h4", "entry__title", title));

          var meta = [];
          if (p.authors) meta.push(esc(p.authors));
          if (p.venue) meta.push('<span class="entry__venue">' + esc(p.venue) + "</span>");
          if (meta.length) wrap.appendChild(el("p", "entry__meta", meta.join(" &middot; ")));

          if (p.summary) wrap.appendChild(el("p", "entry__desc", esc(p.summary)));

          var links = el("div", "entry__links");
          if (p.status) {
            var cls = /prep|review|submit/i.test(p.status) ? "tag tag--prep" : "tag tag--live";
            links.appendChild(el("span", cls, esc(p.status)));
          }
          (p.links || []).forEach(function (l) {
            var a = el("a", "pill", esc(l.label));
            a.href = l.url; a.target = "_blank"; a.rel = "noopener";
            links.appendChild(a);
          });
          if (links.children.length) wrap.appendChild(links);

          pubMount.appendChild(wrap);
        });
      });
    }).catch(function (e) {
      fail(pubMount, "Could not load data/publications.json — " + e.message);
    });
  }

  /* ---------------------------------------------------------------- gallery */
  var galMount = document.getElementById("gallery");
  if (galMount) {
    getJSON("data/gallery.json").then(function (data) {
      var albums = data.albums || [];
      if (!albums.length) { fail(galMount, "No albums yet."); return; }

      galMount.innerHTML = "";
      albums.forEach(function (album) {
        var sec = el("section", "album");
        var head = el("div", "album__head");
        head.appendChild(el("h2", null, esc(album.title)));
        sec.appendChild(head);
        if (album.note) sec.appendChild(el("p", "album__note", esc(album.note)));

        (album.groups || []).forEach(function (g) {
          if (g.label) sec.appendChild(el("h3", "year-heading", esc(g.label)));
          var grid = el("div", "grid-photos");
          (g.photos || []).forEach(function (ph) {
            var src = ROOT + "assets/img/" + ph.file;
            var btn = el("button", "photo");
            btn.type = "button";
            btn.setAttribute("data-full", src);
            btn.setAttribute("data-cap", ph.caption || "");
            btn.innerHTML =
              '<img src="' + esc(src) + '" alt="' + esc(ph.caption || album.title) + '" loading="lazy">';
            grid.appendChild(btn);
          });
          sec.appendChild(grid);
        });
        galMount.appendChild(sec);
      });

      buildLightbox();
    }).catch(function (e) {
      fail(galMount, "Could not load data/gallery.json — " + e.message);
    });
  }

  function buildLightbox() {
    var box = el("div", "lightbox");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML =
      '<button class="lightbox__close" aria-label="Close">&times;</button>' +
      '<img alt=""><p class="lightbox__cap"></p>';
    document.body.appendChild(box);

    var img = box.querySelector("img");
    var cap = box.querySelector(".lightbox__cap");
    var lastFocus = null;

    function open(src, caption, trigger) {
      lastFocus = trigger;
      img.src = src;
      img.alt = caption || "";
      cap.textContent = caption || "";
      box.classList.add("is-open");
      box.querySelector(".lightbox__close").focus();
    }
    function close() {
      box.classList.remove("is-open");
      img.src = "";
      if (lastFocus) lastFocus.focus();
    }

    document.addEventListener("click", function (e) {
      if (!e.target || typeof e.target.closest !== "function") return;
      var t = e.target.closest(".photo");
      if (t) { open(t.getAttribute("data-full"), t.getAttribute("data-cap"), t); return; }
      if (e.target.closest(".lightbox__close") || e.target === box) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && box.classList.contains("is-open")) close();
    });
  }

  /* ----------------------------------------------------------------- github */
  var repoMount = document.getElementById("repos");
  if (repoMount) {
    var user = repoMount.getAttribute("data-user") || "raowusu15";
    var api = "https://api.github.com/users/" + user + "/repos?sort=updated&per_page=100";

    fetch(api)
      .then(function (r) { if (!r.ok) throw new Error("GitHub API " + r.status); return r.json(); })
      .then(function (repos) {
        var live = repos
          .filter(function (r) { return !r.fork && !r.archived; })
          .map(function (r) {
            return {
              name: r.name,
              url: r.html_url,
              description: r.description,
              language: r.language,
              stars: r.stargazers_count,
              updated: r.pushed_at ? r.pushed_at.slice(0, 10) : ""
            };
          });
        if (!live.length) throw new Error("no public repositories returned");
        renderRepos(live, "Live from the GitHub API");
      })
      .catch(function () {
        // Fall back to the curated list so the page is never empty.
        getJSON("data/repos.json")
          .then(function (d) { renderRepos(d.items || [], "Curated list (GitHub API unavailable)"); })
          .catch(function (e) { fail(repoMount, "Could not load repositories — " + e.message); });
      });

    function renderRepos(items, source) {
      repoMount.innerHTML = "";
      var note = document.getElementById("repos-source");
      if (note) note.textContent = source;
      items.forEach(function (r) {
        var wrap = el("article", "entry");
        wrap.appendChild(el("h3", "entry__title",
          '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.name) + "</a>"));
        var bits = [];
        if (r.language) bits.push(esc(r.language));
        if (r.stars) bits.push(esc(r.stars) + " stars");
        if (r.updated) bits.push("updated " + esc(r.updated));
        if (bits.length) wrap.appendChild(el("p", "entry__meta", bits.join(" &middot; ")));
        if (r.description) wrap.appendChild(el("p", "entry__desc", esc(r.description)));
        repoMount.appendChild(wrap);
      });
    }
  }

  /* ------------------------------------------------------------------ posts */
  var postMount = document.getElementById("posts");
  if (postMount) {
    getJSON("data/posts.json").then(function (data) {
      var items = data.items || [];
      if (!items.length) {
        postMount.innerHTML = "";
        postMount.appendChild(el("div", "empty",
          "No posts yet. Add entries to <code>data/posts.json</code> and they appear here."));
        return;
      }
      items.sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
      postMount.innerHTML = "";
      items.forEach(function (p) {
        var wrap = el("article", "entry");
        wrap.appendChild(el("h3", "entry__title",
          p.url ? '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.title) + "</a>"
                : esc(p.title)));
        if (p.date) wrap.appendChild(el("p", "entry__meta", esc(p.date)));
        if (p.summary) wrap.appendChild(el("p", "entry__desc", esc(p.summary)));
        postMount.appendChild(wrap);
      });
    }).catch(function (e) {
      fail(postMount, "Could not load data/posts.json — " + e.message);
    });
  }
})();
