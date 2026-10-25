(function () {
  var data = window.DREAMERS;
  if (!data || !data.verses || !data.activities) return;

  var AGES = ["all", "little", "big", "teen"];
  var SLOTS = [
    { key: "reading", salt: 0 },
    { key: "math", salt: 5 },
    { key: "fun", salt: 11 }
  ];

  function dayNumber(date) {
    var d = date || new Date();
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }

  function iso(date) {
    var d = date || new Date();
    var month = String(d.getMonth() + 1);
    var day = String(d.getDate());
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return d.getFullYear() + "-" + month + "-" + day;
  }

  function storageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function readStars() {
    try {
      var parsed = JSON.parse(storageGet("12dreamers.stars") || "{}");
      if (!parsed || typeof parsed !== "object") return {};
      return parsed;
    } catch (error) {
      return {};
    }
  }

  function currentAge() {
    var checked = document.querySelector('input[name="age"]:checked');
    if (!checked || AGES.indexOf(checked.value) === -1) return "all";
    return checked.value;
  }

  function paintAges() {
    var labels = document.querySelectorAll(".ages label");
    labels.forEach(function (label) {
      var input = label.querySelector("input");
      label.classList.toggle("is-selected", !!(input && input.checked));
    });
  }

  function pick(list, age, salt) {
    var filtered = list.filter(function (item) {
      return age === "all" || item.ages.indexOf(age) !== -1;
    });
    var pool = filtered.length ? filtered : list;
    var index = Math.abs(dayNumber() + salt) % pool.length;
    return pool[index];
  }

  function renderVerse() {
    var verse = data.verses[Math.abs(dayNumber()) % data.verses.length];
    var text = document.getElementById("verse-text");
    var ref = document.getElementById("verse-ref");
    var note = document.getElementById("verse-note");
    var when = document.getElementById("verse-when");
    if (text) text.textContent = verse.text;
    if (ref) ref.textContent = verse.ref;
    if (note) note.textContent = verse.note;
    if (when) {
      var today = new Date();
      when.textContent = today.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric"
      });
    }
  }

  function renderToday(age) {
    var stars = readStars();
    var today = iso();
    var done = Array.isArray(stars[today]) ? stars[today] : [];
    var count = 0;

    SLOTS.forEach(function (slot) {
      var item = pick(data.activities[slot.key], age, slot.salt);
      var title = document.querySelector("#day-" + slot.key + " .day-title");
      var link = document.getElementById("day-" + slot.key + "-link");
      var blurb = document.getElementById("day-" + slot.key + "-text");
      var button = document.querySelector('.did-it[data-slot="' + slot.key + '"]');
      if (title) title.textContent = item.title;
      if (link) link.href = item.href;
      if (blurb) blurb.textContent = item.text;
      if (!button) return;
      button.hidden = false;
      button.dataset.id = item.id;
      var name = button.querySelector(".did-name");
      if (name) name.textContent = " " + item.title + ".";
      var pressed = done.indexOf(item.id) !== -1;
      button.setAttribute("aria-pressed", pressed ? "true" : "false");
      var label = button.querySelector(".did-label");
      var star = button.querySelector(".starlet");
      if (label) label.textContent = pressed ? "Done today" : "I did it!";
      if (star) star.textContent = pressed ? "★" : "☆";
      if (pressed) count += 1;
    });

    var summary = document.getElementById("star-summary");
    var icons = document.getElementById("star-icons");
    var countText = document.getElementById("star-count");
    if (summary) summary.hidden = false;
    if (icons) {
      var marks = "";
      var i;
      for (i = 0; i < 3; i += 1) marks += i < count ? "★" : "☆";
      icons.textContent = marks;
    }
    if (countText) countText.textContent = count + " of 3 stars today. Saved only on this device.";
  }

  function applyAge(age) {
    document.querySelectorAll("[data-ages]").forEach(function (card) {
      var ages = (card.getAttribute("data-ages") || "").split(/\s+/);
      card.hidden = !(age === "all" || ages.indexOf(age) !== -1);
    });
    document.querySelectorAll("[data-section]").forEach(function (section) {
      var visible = 0;
      section.querySelectorAll("[data-ages]").forEach(function (card) {
        if (!card.hidden) visible += 1;
      });
      var empty = section.querySelector("[data-empty]");
      if (empty) empty.hidden = visible !== 0;
    });
    renderToday(age);
  }

  var savedAge = storageGet("12dreamers.age");
  if (AGES.indexOf(savedAge) !== -1) {
    var savedInput = document.querySelector('input[name="age"][value="' + savedAge + '"]');
    if (savedInput) savedInput.checked = true;
  }

  document.querySelectorAll('input[name="age"]').forEach(function (input) {
    input.addEventListener("change", function () {
      if (!input.checked) return;
      storageSet("12dreamers.age", input.value);
      paintAges();
      applyAge(input.value);
    });
  });

  document.querySelectorAll(".did-it").forEach(function (button) {
    button.addEventListener("click", function () {
      var id = button.dataset.id;
      if (!id) return;
      var stars = readStars();
      var today = iso();
      var done = Array.isArray(stars[today]) ? stars[today].slice() : [];
      var index = done.indexOf(id);
      var nowOn = index === -1;
      if (nowOn) done.push(id);
      else done.splice(index, 1);
      stars[today] = done;
      var keys = Object.keys(stars).sort();
      if (keys.length > 60) {
        keys.slice(0, keys.length - 45).forEach(function (key) {
          delete stars[key];
        });
      }
      var saved = storageSet("12dreamers.stars", JSON.stringify(stars));
      renderToday(currentAge());
      var status = document.getElementById("status");
      if (status) {
        status.textContent = saved
          ? nowOn
            ? "Star saved on this device."
            : "Star removed on this device."
          : "This browser could not save the star.";
      }
    });
  });

  var navLinks = document.querySelectorAll(".section-nav a");
  function markCurrent(hash) {
    navLinks.forEach(function (link) {
      if (link.getAttribute("href") === hash) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      markCurrent(link.getAttribute("href"));
    });
  });
  window.addEventListener("hashchange", function () {
    markCurrent(location.hash);
  });

  paintAges();
  renderVerse();
  applyAge(currentAge());
})();
