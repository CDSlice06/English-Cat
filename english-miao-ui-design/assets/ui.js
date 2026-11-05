(function () {
  "use strict";

  var mainButton = document.getElementById("demo-main-button");
  if (mainButton) {
    mainButton.addEventListener("click", function () {
      if (mainButton.disabled) return;
      mainButton.disabled = true;
      mainButton.textContent = "正在识别…";
      window.setTimeout(function () {
        mainButton.disabled = false;
        mainButton.textContent = "识别完成";
      }, 750);
    });
  }

  var vocabButtons = Array.prototype.slice.call(document.querySelectorAll("[data-ui-vocab]"));
  var wordCards = Array.prototype.slice.call(document.querySelectorAll("[data-ui-word]"));
  vocabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-ui-vocab");
      vocabButtons.forEach(function (item) {
        item.setAttribute("aria-pressed", String(item === button));
      });
      wordCards.forEach(function (card) {
        var tags = card.getAttribute("data-ui-word").split(" ");
        card.hidden = filter !== "all" && tags.indexOf(filter) === -1;
      });
    });
  });

  var regionButtons = Array.prototype.slice.call(document.querySelectorAll("[data-region-choice]"));
  var regionBox = document.getElementById("demo-region-box");
  var regionCopy = document.getElementById("region-choice-copy");
  regionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var choice = button.getAttribute("data-region-choice");
      regionButtons.forEach(function (item) {
        item.setAttribute("aria-pressed", String(item === button));
      });
      regionBox.classList.toggle("black-choice", choice === "black");
      regionCopy.textContent = choice === "black"
        ? "已选黑笔候选：第 1 段，请确认它不是印刷线。"
        : "已选红笔候选：第 2 段，可调整边界或排除。";
    });
  });

  var practiceButtons = Array.prototype.slice.call(document.querySelectorAll("[data-practice-state]"));
  var practiceFeedback = document.getElementById("ui-practice-feedback");
  var feedbackContent = {
    near: { className: "mini-alert success", html: "<b>近似正确 · 通过</b><br>关键语义与目标结构正确；可优化表达，但不阻塞通关。" },
    wrong: { className: "mini-alert error", html: "<b>需要修改 · 不通过</b><br>请复查条件关系与目标句式；答案保留，可修改后重试。" },
    offline: { className: "mini-alert", html: "<b>暂未判定</b><br>服务暂时不可用，答案已保留；重新提交不会自动判过。" }
  };
  practiceButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var state = button.getAttribute("data-practice-state");
      practiceButtons.forEach(function (item) {
        item.setAttribute("aria-pressed", String(item === button));
      });
      practiceFeedback.className = feedbackContent[state].className;
      practiceFeedback.innerHTML = feedbackContent[state].html;
    });
  });

  var asyncButtons = Array.prototype.slice.call(document.querySelectorAll("[data-async-state]"));
  var asyncBox = document.getElementById("async-state-box");
  var asyncContent = {
    loading: { className: "state-box loading", html: "<b>正在解析长难句</b><div class=\"skeleton\"></div><div class=\"skeleton\"></div><p class=\"small\">其他已完成模块可继续学习。</p>" },
    success: { className: "state-box success", html: "<b>解析已完成</b><p>5 个结构步骤与双向练习已就绪。</p><p class=\"small\">完成标记持续显示，不用短 Toast 替代。</p>" },
    error: { className: "state-box error", html: "<b>这部分还没解析成功</b><p>其他内容可以继续学习，原文章与已确认文本均已保留。</p><p class=\"small\">操作：重试本部分</p>" }
  };
  asyncButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var state = button.getAttribute("data-async-state");
      asyncButtons.forEach(function (item) {
        item.setAttribute("aria-pressed", String(item === button));
      });
      asyncBox.className = asyncContent[state].className;
      asyncBox.innerHTML = asyncContent[state].html;
    });
  });

  var motionButton = document.getElementById("motion-play");
  var motionObject = document.getElementById("motion-object");
  var motionNote = document.getElementById("motion-note");
  if (motionButton) {
    motionButton.addEventListener("click", function () {
      motionObject.classList.remove("play");
      void motionObject.offsetWidth;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        motionNote.textContent = "已遵循减少动态设置：直接展示最终状态。";
        return;
      }
      motionObject.classList.add("play");
      motionNote.textContent = "播放一次；不会循环，也不阻塞操作。";
    });
  }
})();
