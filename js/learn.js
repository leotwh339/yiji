(function () {
  const unitList = [
    { id: 'b1', stage: '初階', title: '什麼是易經', minutes: 2, desc: '《易經》是中國經典之一，兼具哲學、占筮與人生智慧。', hexId: 1 },
    { id: 'b2', stage: '初階', title: '陰陽之道', minutes: 3, desc: '陰陽互補、消長不息，是理解易理的根本。', hexId: 2 },
    { id: 'b3', stage: '初階', title: '太極與兩儀', minutes: 2, desc: '太極生兩儀，兩儀化四象，揭示宇宙生成次第。', hexId: 11 },
    { id: 'b4', stage: '初階', title: '四象與八卦', minutes: 4, desc: '四象再分而成八卦，對應自然萬象與人事。', hexId: 20 },
    { id: 'b5', stage: '初階', title: '乾卦詳解', minutes: 3, desc: '乾為天，象徵剛健、創造與自強不息。', hexId: 1 },
    { id: 'b6', stage: '初階', title: '坤卦詳解', minutes: 3, desc: '坤為地，象徵柔順、承載與厚德。', hexId: 2 },
    { id: 'b7', stage: '初階', title: '坎卦詳解', minutes: 3, desc: '坎為水，提醒在險中求通、持中守正。', hexId: 29 },
    { id: 'b8', stage: '初階', title: '離卦詳解', minutes: 3, desc: '離為火，象徵光明、文明與依附之道。', hexId: 30 },
    { id: 'b9', stage: '初階', title: '震卦詳解', minutes: 3, desc: '震為雷，主動而驚，啟動改變與行動。', hexId: 51 },
    { id: 'b10', stage: '初階', title: '巽卦詳解', minutes: 3, desc: '巽為風，重在入理、柔順與漸進滲透。', hexId: 57 },
    { id: 'b11', stage: '初階', title: '艮卦詳解', minutes: 3, desc: '艮為山，示止與定，知所進退。', hexId: 52 },
    { id: 'b12', stage: '初階', title: '兌卦詳解', minutes: 3, desc: '兌為澤，主悅與和，重誠信溝通。', hexId: 58 },
    { id: 'i1', stage: '中階', title: '六十四卦結構', minutes: 5, desc: '認識上下卦組合與序卦脈絡，建立整體觀。', hexId: 63 },
    { id: 'a1', stage: '進階', title: '易學應用', minutes: 5, desc: '將卦象思維應用於決策、修身與人際互動。', hexId: 64 }
  ];

  const menuEl = document.getElementById('learnMenu');
  const contentEl = document.getElementById('learnContent');
  const progressText = document.getElementById('progressText');
  const progressFill = document.getElementById('progressFill');

  const doneUnits = new Set(JSON.parse(localStorage.getItem('learn_done_units') || '[]'));
  const doneHex = new Set(JSON.parse(localStorage.getItem('learn_done_hex') || '[]'));
  let currentIndex = 0;

  function saveProgress() {
    localStorage.setItem('learn_done_units', JSON.stringify([...doneUnits]));
    localStorage.setItem('learn_done_hex', JSON.stringify([...doneHex]));
  }

  function updateProgress() {
    const count = doneHex.size;
    progressText.textContent = `${count} / 64`;
    progressFill.style.width = `${(count / 64) * 100}%`;
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
    const hex = HEXAGRAMS.find((h) => h.id === unit.hexId) || HEXAGRAMS[0];

    contentEl.innerHTML = `
      <h2>${unit.title}</h2>
      <p><strong>學習階段：</strong>${unit.stage}　<strong>預計時間：</strong>${unit.minutes} 分鐘</p>
      <p>${unit.desc}</p>
      <div id="learnHex" class="hex-svg"></div>
      <p><strong>參照卦：</strong>第${hex.id}卦 ${hex.name}　${hex.guaci}</p>
      <div class="field-row">
        <button class="btn" id="markDoneBtn">標記為已完成</button>
        <button class="btn secondary" id="nextUnitBtn">下一單元</button>
      </div>
    `;

    drawHexagram(hex.binary, 'learnHex', 120, true);

    document.getElementById('markDoneBtn').addEventListener('click', () => {
      doneUnits.add(unit.id);
      doneHex.add(unit.hexId);
      saveProgress();
      updateProgress();
      renderMenu();
    });

    document.getElementById('nextUnitBtn').addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % unitList.length;
      renderMenu();
      renderContent();
    });
  }

  updateProgress();
  renderMenu();
  renderContent();
})();
