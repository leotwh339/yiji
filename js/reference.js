(function () {
  const searchInput = document.getElementById('searchInput');
  const listEl = document.getElementById('referenceList');
  const detailEl = document.getElementById('referenceDetail');
  const tabs = document.querySelectorAll('.tab[data-filter]');

  let currentId = 1;
  let filterMode = 'all';
  let favorites = new Set(JSON.parse(localStorage.getItem('hex_favorites') || '[]'));

  function saveFavorites() {
    localStorage.setItem('hex_favorites', JSON.stringify([...favorites]));
  }

  function matchKeyword(hex, keyword) {
    if (!keyword) return true;
    return [hex.name, hex.guaci, hex.guaci_modern, ...(hex.tags || [])].join('|').includes(keyword);
  }

  function getFiltered() {
    const keyword = searchInput.value.trim();
    return HEXAGRAMS.filter((hex) => {
      const passFav = filterMode === 'all' ? true : favorites.has(hex.id);
      return passFav && matchKeyword(hex, keyword);
    });
  }

  function renderList() {
    const list = getFiltered();
    listEl.innerHTML = '';
    if (!list.length) {
      listEl.innerHTML = '<li>查無資料</li>';
      return;
    }

    list.forEach((hex) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = currentId === hex.id ? 'active' : '';
      btn.innerHTML = `第${hex.id}卦 ${hex.name} ${favorites.has(hex.id) ? '★' : '☆'}`;
      btn.addEventListener('click', () => {
        currentId = hex.id;
        renderList();
        renderDetail();
      });
      li.appendChild(btn);
      listEl.appendChild(li);
    });
  }

  function relatedHex(binary) {
    const oppositeBinary = binary
      .split('')
      .map((b) => (b === '1' ? '0' : '1'))
      .join('');
    const reversedBinary = binary.split('').reverse().join('');
    return {
      opposite: HEXAGRAMS.find((h) => h.binary === oppositeBinary),
      reversed: HEXAGRAMS.find((h) => h.binary === reversedBinary)
    };
  }

  function renderDetail() {
    const hex = HEXAGRAMS.find((h) => h.id === currentId) || HEXAGRAMS[0];
    const rel = relatedHex(hex.binary);

    detailEl.innerHTML = `
      <h2>第${hex.id}卦 ${hex.name} ${hex.unicode}</h2>
      <p><strong>上卦：</strong>${hex.upperTrigram}　<strong>下卦：</strong>${hex.lowerTrigram}</p>
      <p><strong>象徵：</strong>${(hex.symbols || []).join('、')}　<strong>自然：</strong>${hex.nature}　<strong>五行：</strong>${hex.element}</p>
      <button class="btn" id="favBtn">${favorites.has(hex.id) ? '★ 已收藏' : '☆ 收藏'}</button>
      <div id="refHex" class="hex-svg"></div>
      <p><strong>卦辭：</strong>${hex.guaci}</p>
      <p><strong>白話：</strong>${hex.guaci_modern}</p>
      <p><strong>彖傳：</strong>${hex.tuanzhuan}</p>
      <p><strong>象傳（大象）：</strong>${hex.xiangzhuan}</p>
      <h3>六爻爻辭</h3>
      <ol>${hex.yaoci.map((y) => `<li><strong>${y.yao}</strong> ${y.text}<br/>白話：${y.modern}</li>`).join('')}</ol>
      <div class="related">
        <h3>相關卦象推薦</h3>
        <p>錯卦：${rel.opposite ? `第${rel.opposite.id}卦 ${rel.opposite.name}` : '—'}</p>
        <p>綜卦：${rel.reversed ? `第${rel.reversed.id}卦 ${rel.reversed.name}` : '—'}</p>
      </div>
    `;

    drawHexagram(hex.binary, 'refHex', 140, true);
    document.getElementById('favBtn').addEventListener('click', () => {
      if (favorites.has(hex.id)) favorites.delete(hex.id);
      else favorites.add(hex.id);
      saveFavorites();
      renderList();
      renderDetail();
    });
  }

  tabs.forEach((tab, index) => {
    tab.setAttribute('tabindex', tab.classList.contains('active') ? '0' : '-1');
    tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      filterMode = tab.dataset.filter;
      tabs.forEach((t) => {
        t.setAttribute('aria-selected', t.classList.contains('active') ? 'true' : 'false');
        t.setAttribute('tabindex', t.classList.contains('active') ? '0' : '-1');
      });
      renderList();
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

  searchInput.addEventListener('input', renderList);

  renderList();
  renderDetail();
})();
