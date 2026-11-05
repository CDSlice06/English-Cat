(function () {
  "use strict";

  var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-demo-tab]"));
  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-demo-panel]"));

  function activateTab(name) {
    tabs.forEach(function (tab) {
      var active = tab.getAttribute("data-demo-tab") === name;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-demo-panel") !== name;
    });
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      activateTab(tab.getAttribute("data-demo-tab"));
    });
    tab.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      var direction = event.key === "ArrowRight" ? 1 : -1;
      var next = tabs[(index + direction + tabs.length) % tabs.length];
      activateTab(next.getAttribute("data-demo-tab"));
      next.focus();
    });
  });

  var importButton = document.getElementById("import-run");
  var importReset = document.getElementById("import-reset");
  var importStatus = document.getElementById("import-status");
  var importTimer;

  function resetImport() {
    window.clearTimeout(importTimer);
    importButton.disabled = false;
    importButton.textContent = "开始识别";
    importStatus.textContent = "已添加 1 张图片，等待识别。";
  }

  if (importButton) {
    importButton.addEventListener("click", function () {
      importButton.disabled = true;
      importButton.textContent = "正在识别…";
      importStatus.textContent = "真实阶段：识别英文并整理段落。";
      importTimer = window.setTimeout(function () {
        importButton.disabled = false;
        importButton.textContent = "重新演示识别";
        importStatus.textContent = "识别完成：进入 P03 校对，1 处低置信内容待确认。";
      }, 800);
    });
    importReset.addEventListener("click", resetImport);
  }

  var vocabChips = Array.prototype.slice.call(document.querySelectorAll("[data-vocab-filter]"));
  var wordRows = Array.prototype.slice.call(document.querySelectorAll("[data-vocab-tags]"));
  vocabChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-vocab-filter");
      vocabChips.forEach(function (item) {
        item.classList.toggle("is-active", item === chip);
        item.setAttribute("aria-pressed", String(item === chip));
      });
      wordRows.forEach(function (row) {
        var tags = row.getAttribute("data-vocab-tags").split(" ");
        row.hidden = filter !== "all" && tags.indexOf(filter) === -1;
      });
    });
  });

  var answer = document.getElementById("practice-answer");
  var feedback = document.getElementById("practice-feedback");
  var reference = "只有结合语境审视这些数据，这一模式才会变得清晰。";

  function showPracticeFeedback(type, message) {
    feedback.className = "demo-feedback show " + type;
    feedback.textContent = message;
  }

  function evaluateAnswer() {
    var value = answer.value.trim().replace(/\s+/g, "");
    if (!value) {
      showPracticeFeedback("fail", "请先输入译文，再提交。");
      return;
    }
    if (value === reference.replace(/\s+/g, "")) {
      showPracticeFeedback("pass", "完全正确 · 通过。条件关系、主体和结果均表达完整。");
      return;
    }
    var hasOnly = value.indexOf("只有") !== -1;
    var hasData = value.indexOf("数据") !== -1;
    var hasPattern = value.indexOf("模式") !== -1 || value.indexOf("规律") !== -1;
    var hasClear = value.indexOf("清晰") !== -1 || value.indexOf("清楚") !== -1 || value.indexOf("明显") !== -1;
    if (hasOnly && hasData && hasPattern && hasClear) {
      showPracticeFeedback("pass", "近似正确 · 通过。关键语义和条件逻辑正确，措辞可以不同。");
    } else {
      showPracticeFeedback("fail", "需要修改 · 未通过。请复查 Only when 的条件关系，以及数据和模式之间的信息。");
    }
  }

  if (answer) {
    document.getElementById("practice-submit").addEventListener("click", evaluateAnswer);
    document.getElementById("practice-fill-near").addEventListener("click", function () {
      answer.value = "只有在语境中检查这些数据，规律才会清楚。";
      showPracticeFeedback("pass", "已填入一条近似答案，点击“提交翻译”查看判定。");
    });
    document.getElementById("practice-fill-wrong").addEventListener("click", function () {
      answer.value = "数据让模式变得清晰。";
      showPracticeFeedback("fail", "已填入一条缺少条件关系的答案，点击“提交翻译”查看反馈。");
    });
  }

  var regionButtons = Array.prototype.slice.call(document.querySelectorAll("[data-region]"));
  var regionDetail = document.getElementById("region-detail");
  var regionStatus = document.getElementById("region-status");
  var selectedRegion = "r1";
  var regionCopy = {
    r1: { title: "已选：候选 1 · 红笔横线", body: "划线是句子片段时，解析扩展到完整句；原划线范围仍单独展示。" },
    r2: { title: "已选：候选 2 · 黑笔横线", body: "系统已映射到第 1 段；请排除印刷线后确认，再生成结构与翻译思路。" }
  };

  regionButtons.forEach(function (button) {
    button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
    button.addEventListener("click", function () {
      selectedRegion = button.getAttribute("data-region");
      regionButtons.forEach(function (item) {
        var active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      regionDetail.replaceChildren();
      var title = document.createElement("b");
      var body = document.createElement("p");
      title.textContent = regionCopy[selectedRegion].title;
      body.className = "small";
      body.textContent = regionCopy[selectedRegion].body;
      regionDetail.append(title, body);
      regionStatus.textContent = "";
    });
  });

  if (document.getElementById("region-confirm")) {
    document.getElementById("region-confirm").addEventListener("click", function () {
      regionStatus.textContent = "区域已确认：生成 1 个解析单元与英译中 / 中译英各 1 道练习。";
    });
  }
})();
