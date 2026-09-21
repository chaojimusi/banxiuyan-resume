/* ==========================================================================
   班秀岩 · 个人简历 — 交互脚本
   仅三个轻量功能：主题切换、打印 / 导出 PDF、导航高亮。
   不依赖任何第三方库，直接以 file:// 打开亦可正常运行。
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;

  /* ------------------------------------------------------------------
     1. 深浅色主题
     优先级：本地存储 > 系统偏好 > 浅色
     ------------------------------------------------------------------ */
  var THEME_KEY = "resume-theme";

  function readStored() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null; // file:// 或隐私模式下可能不可用
    }
  }

  function prefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  root.setAttribute("data-theme", readStored() || (prefersDark() ? "dark" : "light"));

  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        /* 忽略存储失败，主题在当前会话内仍然生效 */
      }
    });
  }

  /* ------------------------------------------------------------------
     2. 打印 / 导出 PDF
     ------------------------------------------------------------------ */
  var printBtn = document.getElementById("printBtn");
  if (printBtn) {
    printBtn.addEventListener("click", function () {
      window.print();
    });
  }

  /* ------------------------------------------------------------------
     3. 滚动时高亮当前所在区块
     用 IntersectionObserver 观察区块标题，取最靠近视口顶部的那个。
     ------------------------------------------------------------------ */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav a[href^='#']"));
  var targets = links
    .map(function (a) {
      return document.getElementById(a.getAttribute("href").slice(1));
    })
    .filter(Boolean);

  if (!links.length || !("IntersectionObserver" in window)) {
    return; // 无链接或浏览器不支持时静默跳过
  }

  var visible = Object.create(null);

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting;
      });

      var currentId = null;
      // links 与 targets 顺序一致，取第一个仍可见的目标即可
      links.forEach(function (a) {
        var id = a.getAttribute("href").slice(1);
        if (currentId === null && visible[id]) {
          currentId = id;
        }
      });

      links.forEach(function (a) {
        a.classList.toggle("active", currentId !== null && a.getAttribute("href") === "#" + currentId);
      });
    },
    {
      // 顶部留出固定导航的高度后再判定
      rootMargin: "-90px 0px -55% 0px",
      threshold: 0
    }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
})();
