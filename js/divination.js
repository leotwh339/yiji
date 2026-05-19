(function () {
  const tabs = document.querySelectorAll('.tab');
  const panels = {
    coin: document.getElementById('coinTab'),
    yarrow: document.getElementById('yarrowTab')
  };

  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('tabindex', tab.classList.contains('active') ? '0' : '-1');
    tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      Object.values(panels).forEach((p) => p.classList.remove('active'));
      panels[tab.dataset.tab].classList.add('active');
      tabs.forEach((t) => {
        t.setAttribute('aria-selected', t.classList.contains('active') ? 'true' : 'false');
        t.setAttribute('tabindex', t.classList.contains('active') ? '0' : '-1');
      });
    });
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + delta + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    });
  });

  const coinArea = document.getElementById('coinArea');
  const coinBtn = document.getElementById('coinThrowBtn');
  const coinLog = document.getElementById('coinLog');
  const coinLines = [];

  function buildCoins() {
    coinArea.innerHTML = '';
    for (let i = 0; i < 3; i += 1) {
      const coin = document.createElement('div');
      coin.className = 'coin';
      coin.innerHTML = `
        <div class="coin-inner">
          <div class="coin-face front">正</div>
          <div class="coin-face back">反</div>
        </div>
      `;
      coinArea.appendChild(coin);
    }
  }

  function tossCoins() {
    const coins = [...coinArea.querySelectorAll('.coin')];
    const values = coins.map((coin) => {
      const isHead = Math.random() >= 0.5;
      coin.classList.toggle('flip', !isHead);
      return isHead ? 3 : 2;
    });
    const sum = values.reduce((a, b) => a + b, 0);
    return sum;
  }

  function lineType(value) {
    return {
      6: '老陰（變爻）',
      7: '少陽',
      8: '少陰',
      9: '老陽（變爻）'
    }[value];
  }

  function toBinary(lines, changed) {
    return lines
      .map((v) => {
        if (changed && (v === 6 || v === 9)) return v === 6 ? '1' : '0';
        return v === 7 || v === 9 ? '1' : '0';
      })
      .join('');
  }

  function getHexByBinary(binary) {
    return HEXAGRAMS.find((h) => h.binary === binary) || HEXAGRAMS[0];
  }

  function adviceByType(type) {
    const map = {
      事業: '此卦提示職場宜審時度勢，先立基礎再求突破。',
      感情: '感情宜重誠信與溝通，以柔和之道化解分歧。',
      學業: '學業需循序漸進，持續累積可見成效。',
      健康: '健康重在作息規律與情志平衡，勿躁進。',
      財運: '財務以穩健配置為上，避免急功近利。',
      其他: '先安定內心，再依時機調整策略，則可轉吉。'
    };
    return map[type] || map.其他;
  }

  function renderResult(lines) {
    const base = toBinary(lines, false);
    const changed = toBinary(lines, true);
    const main = getHexByBinary(base);
    const changeHex = getHexByBinary(changed);
    const moving = lines
      .map((v, i) => (v === 6 || v === 9 ? i : -1))
      .filter((v) => v >= 0);

    document.getElementById('resultPanel').classList.remove('hidden');
    drawHexagram(main.binary, 'mainHex', 140, true);
    drawHexagram(changeHex.binary, 'changedHex', 140, true);
    document.getElementById('mainHexName').textContent = `本卦：第${main.id}卦 ${main.name}`;
    document.getElementById('changedHexName').textContent = `之卦：第${changeHex.id}卦 ${changeHex.name}`;

    const qType = document.getElementById('questionType').value;
    const resultRoot = document.getElementById('resultText');
    resultRoot.innerHTML = '';

    const title = document.createElement('h3');
    title.textContent = `${main.name}卦`;
    resultRoot.appendChild(title);

    function appendParagraph(label, text) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = `${label}：`;
      p.appendChild(strong);
      p.append(text);
      resultRoot.appendChild(p);
    }

    appendParagraph('卦辭', main.guaci);
    appendParagraph('白話', main.guaci_modern);
    appendParagraph('彖傳', main.tuanzhuan);
    appendParagraph('大象', main.xiangzhuan);

    const movingTitle = document.createElement('h4');
    movingTitle.textContent = '動爻解讀';
    resultRoot.appendChild(movingTitle);

    const list = document.createElement('ol');
    if (moving.length) {
      moving.forEach((i) => {
        const y = main.yaoci[i];
        const li = document.createElement('li');
        li.textContent = `${y.yao}：${y.text} 白話：${y.modern}`;
        list.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = '本次無動爻，宜守正待時。';
      list.appendChild(li);
    }
    resultRoot.appendChild(list);

    appendParagraph(`${qType}建議`, adviceByType(qType));
  }

  coinBtn.addEventListener('click', () => {
    if (coinLines.length >= 6) return;
    const result = tossCoins();
    coinLines.push(result);
    const li = document.createElement('li');
    li.textContent = `第 ${coinLines.length} 次：${result}（${lineType(result)}）`;
    coinLog.appendChild(li);

    if (coinLines.length === 6) {
      coinBtn.disabled = true;
      coinBtn.textContent = '銅錢法完成';
      renderResult(coinLines);
    } else {
      coinBtn.textContent = `搖卦（第 ${coinLines.length + 1} 次）`;
    }
  });

  const yarrowSteps = [
    '第一步：取 49 根蓍草，象徵太極未判。',
    '第二步：任意分為左右兩組。',
    '第三步：右手取一根置於指間，象徵三才。',
    '第四步：左右兩組各以四為數，餘數留存。',
    '第五步：合計本變去除之數，餘草再合。',
    '第六步：重複三變，得一爻值（6/7/8/9）。',
    '第七步：記錄一爻，六次完成一卦。'
  ];
  let yarrowStepIndex = 0;
  const yarrowLines = [];
  const yarrowStepEl = document.getElementById('yarrowStep');
  const yarrowLog = document.getElementById('yarrowLog');
  const yarrowBtn = document.getElementById('yarrowNextBtn');

  function yarrowChange(stalks) {
    const left = Math.floor(Math.random() * (stalks - 1)) + 1;
    let right = stalks - left;
    right -= 1;
    const leftRem = left % 4 || 4;
    const rightRem = right % 4 || 4;
    const removed = 1 + leftRem + rightRem;
    return stalks - removed;
  }

  function yarrowLine() {
    let stalks = 49;
    stalks = yarrowChange(stalks);
    stalks = yarrowChange(stalks);
    stalks = yarrowChange(stalks);
    return stalks / 4;
  }

  function updateStepText() {
    yarrowStepEl.innerHTML = `<p>${yarrowSteps[yarrowStepIndex]}</p><p>目前已得 ${yarrowLines.length} 爻。</p>`;
  }

  yarrowBtn.addEventListener('click', () => {
    yarrowStepIndex += 1;
    if (yarrowStepIndex >= yarrowSteps.length) {
      const value = yarrowLine();
      yarrowLines.push(value);
      const li = document.createElement('li');
      li.textContent = `第 ${yarrowLines.length} 爻：${value}（${lineType(value)}）`;
      yarrowLog.appendChild(li);
      yarrowStepIndex = 0;

      if (yarrowLines.length === 6) {
        yarrowBtn.disabled = true;
        yarrowBtn.textContent = '蓍草法完成';
        renderResult(yarrowLines);
      }
    }
    updateStepText();
  });

  buildCoins();
  updateStepText();
})();
