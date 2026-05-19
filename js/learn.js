(function () {
  const STAGE_RULES = [
    { label: '初階', maxId: 16, minutes: 3 },
    { label: '中階', maxId: 40, minutes: 4 },
    { label: '進階', maxId: 64, minutes: 5 }
  ];

  const menuEl = document.getElementById('learnMenu');
  const contentEl = document.getElementById('learnContent');
  const progressText = document.getElementById('progressText');
  const progressFill = document.getElementById('progressFill');

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;'
    }[char]));
  }

  function removeTrailingChinesePeriod(text) {
    return text.replace(/。$/, '');
  }

  const unitList = HEXAGRAMS.map((hex) => {
    const stageRule = STAGE_RULES.find((rule) => hex.id <= rule.maxId) || STAGE_RULES[STAGE_RULES.length - 1];
    return {
      id: `hex-${hex.id}`,
      stage: stageRule.label,
      title: `第${hex.id}卦 ${hex.name}`,
      minutes: stageRule.minutes,
      desc: hex.guaci_modern,
      hexId: hex.id
    };
  });

  const doneUnits = new Set(JSON.parse(localStorage.getItem('learn_done_units') || '[]'));
  const doneHex = new Set(JSON.parse(localStorage.getItem('learn_done_hex') || '[]'));
  let currentIndex = 0;

  menuEl.classList.add('scroll');

  function saveProgress() {
    localStorage.setItem('learn_done_units', JSON.stringify([...doneUnits]));
    localStorage.setItem('learn_done_hex', JSON.stringify([...doneHex]));
  }

  function updateProgress() {
    const count = doneHex.size;
    progressText.textContent = `${count} / 64`;
    progressFill.style.width = `${(count / 64) * 100}%`;
  }

  function getRelatedHexagrams(binary) {
    const oppositeBinary = binary
      .split('')
      .map((bit) => (bit === '1' ? '0' : '1'))
      .join('');
    const reversedBinary = binary.split('').reverse().join('');
    return {
      opposite: HEXAGRAMS.find((hex) => hex.binary === oppositeBinary),
      reversed: HEXAGRAMS.find((hex) => hex.binary === reversedBinary)
    };
  }

  function buildKeyPoints(hex) {
    const name = escapeHtml(hex.name);
    const upperTrigram = escapeHtml(hex.upperTrigram);
    const lowerTrigram = escapeHtml(hex.lowerTrigram);
    const nature = escapeHtml(hex.nature);
    const guaci = escapeHtml(removeTrailingChinesePeriod(hex.guaci));
    const xiangzhuan = escapeHtml(hex.xiangzhuan);
    const tags = escapeHtml(hex.tags.join('、'));
    const symbols = escapeHtml(hex.symbols.join('、'));
    return [
      `${name}卦由上卦${upperTrigram}、下卦${lowerTrigram}組成，對應${nature}之象。`,
      `卦辭指出「${guaci}」，學習時先掌握整體處境與行動原則。`,
      `${xiangzhuan} 可作為日常修身與判斷情勢的提醒。`,
      `可結合標籤 ${tags} 與象徵 ${symbols} 來加深記憶。`
    ];
  }

  function buildRelatedButton(label, hex) {
    const escapedId = escapeHtml(hex.id);
    return `<button class="btn secondary related-btn" data-hex-id="${escapedId}">${escapeHtml(label)}：第${escapedId}卦 ${escapeHtml(hex.name)}</button>`;
  }

  function buildYaociListItem(item) {
    return `<li><p><strong>${escapeHtml(item.yao)}</strong> ${escapeHtml(item.text)}</p><p>白話：${escapeHtml(item.modern)}</p></li>`;
  }

  function renderMenu() {
    menuEl.innerHTML = '';
    unitList.forEach((unit, index) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = index === currentIndex ? 'active' : '';
      const doneMark = doneUnits.has(unit.id) ? '✓ ' : '';
      btn.textContent = `${doneMark}${unit.stage}｜${unit.title}`;
      btn.addEventListener('click', () => {
        currentIndex = index;
        renderMenu();
        renderContent();
      });
      li.appendChild(btn);
      menuEl.appendChild(li);
    });
  }

  function renderContent() {
    const unit = unitList[currentIndex];
    const hex = HEXAGRAMS.find((item) => item.id === unit.hexId) || HEXAGRAMS[0];
    const related = getRelatedHexagrams(hex.binary);
    const keyPoints = buildKeyPoints(hex);

    contentEl.innerHTML = `
      <div class="lesson-head">
        <div>
          <p class="eyebrow">${escapeHtml(unit.stage)}課程</p>
          <h2>${escapeHtml(unit.title)} ${escapeHtml(hex.unicode)}</h2>
          <p><strong>預計時間：</strong>${unit.minutes} 分鐘</p>
          <p>${escapeHtml(unit.desc)}</p>
        </div>
        <div id="learnHex" class="hex-svg lesson-hex"></div>
      </div>

      <div class="lesson-grid">
        <article class="lesson-card">
          <h3>卦象速覽</h3>
          <ul class="lesson-list">
            <li><strong>上卦：</strong>${escapeHtml(hex.upperTrigram)}</li>
            <li><strong>下卦：</strong>${escapeHtml(hex.lowerTrigram)}</li>
            <li><strong>自然之象：</strong>${escapeHtml(hex.nature)}</li>
            <li><strong>五行：</strong>${escapeHtml(hex.element)}</li>
            <li><strong>象徵：</strong>${escapeHtml(hex.symbols.join('、'))}</li>
          </ul>
        </article>
        <article class="lesson-card">
          <h3>學習重點</h3>
          <ol class="lesson-list">
            ${keyPoints.map((point) => `<li>${point}</li>`).join('')}
          </ol>
        </article>
      </div>

      <article class="lesson-card">
        <h3>原文與白話</h3>
        <p><strong>卦辭：</strong>${escapeHtml(hex.guaci)}</p>
        <p><strong>白話：</strong>${escapeHtml(hex.guaci_modern)}</p>
        <p><strong>彖傳：</strong>${escapeHtml(hex.tuanzhuan)}</p>
        <p><strong>象傳：</strong>${escapeHtml(hex.xiangzhuan)}</p>
      </article>

      <article class="lesson-card">
        <h3>六爻學習提示</h3>
        <ol class="lesson-list yao-list">
          ${hex.yaoci.map((item) => buildYaociListItem(item)).join('')}
        </ol>
      </article>

      <div class="lesson-grid">
        <article class="lesson-card">
          <h3>延伸記憶</h3>
          <div class="badge-row">
            ${hex.tags.map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join('')}
          </div>
        </article>
        <article class="lesson-card">
          <h3>相關卦象</h3>
          <div class="related-links">
            ${related.opposite ? buildRelatedButton('錯卦', related.opposite) : ''}
            ${related.reversed ? buildRelatedButton('綜卦', related.reversed) : ''}
          </div>
        </article>
      </div>

      <div class="field-row">
        <button class="btn" id="markDoneBtn">${doneUnits.has(unit.id) ? '已標記完成' : '標記為已完成'}</button>
        <button class="btn secondary" id="prevUnitBtn">上一卦</button>
        <button class="btn secondary" id="nextUnitBtn">下一卦</button>
      </div>
    `;

    drawHexagram(hex.binary, 'learnHex', 140, true);

    document.getElementById('markDoneBtn').addEventListener('click', () => {
      doneUnits.add(unit.id);
      doneHex.add(unit.hexId);
      saveProgress();
      updateProgress();
      renderMenu();
      renderContent();
    });

    document.getElementById('prevUnitBtn').addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + unitList.length) % unitList.length;
      renderMenu();
      renderContent();
    });

    document.getElementById('nextUnitBtn').addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % unitList.length;
      renderMenu();
      renderContent();
    });

    contentEl.querySelectorAll('.related-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const nextHexId = Number(button.dataset.hexId);
        const nextIndex = unitList.findIndex((item) => item.hexId === nextHexId);
        if (nextIndex >= 0) {
          currentIndex = nextIndex;
          renderMenu();
          renderContent();
        }
      });
    });
  }

  updateProgress();
  renderMenu();
  renderContent();
})();
