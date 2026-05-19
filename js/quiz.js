(function () {
  const difficulties = {
    beginner: { name: '入門', sampleSize: 24 },
    intermediate: { name: '進階', sampleSize: 40 },
    challenge: { name: '挑戰', sampleSize: 64 }
  };

  const state = {
    level: 'beginner',
    questions: [],
    index: 0,
    score: 0,
    weak: { 認卦練習: 0, 卦辭配對: 0, 填充題: 0, 情境應用: 0 }
  };

  const bestScoreEl = document.getElementById('bestScore');
  const badgeEl = document.getElementById('badges');
  const quizPanel = document.getElementById('quizPanel');
  const quizResult = document.getElementById('quizResult');
  const titleEl = document.getElementById('quizTitle');
  const questionEl = document.getElementById('quizQuestion');
  const optionsEl = document.getElementById('quizOptions');
  const feedbackEl = document.getElementById('quizFeedback');
  const nextBtn = document.getElementById('nextQuestionBtn');

  let badges = JSON.parse(localStorage.getItem('quiz_badges') || '[]');
  const best = Number(localStorage.getItem('quiz_best') || 0);
  bestScoreEl.textContent = String(best);

  function saveBadges() {
    localStorage.setItem('quiz_badges', JSON.stringify(badges));
  }

  function renderBadges() {
    badgeEl.innerHTML = badges.length
      ? badges.map((b) => `<span class="badge">${b}</span>`).join('')
      : '<span class="badge">尚未解鎖徽章</span>';
  }

  function randomPick(arr, n) {
    const copy = [...arr];
    const out = [];
    while (copy.length && out.length < n) {
      out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    }
    return out;
  }

  function getPool() {
    return HEXAGRAMS.slice(0, difficulties[state.level].sampleSize);
  }

  function makeOptions(correct, pool, mapFn = (h) => h.name) {
    const others = randomPick(pool.filter((h) => h.id !== correct.id), 3);
    const opts = randomPick([correct, ...others], 4);
    return opts.map((h) => ({ text: mapFn(h), value: h.id }));
  }

  function qRecognize(pool) {
    const correct = randomPick(pool, 1)[0];
    return {
      type: '認卦練習',
      prompt: `<div id="qHex" class="hex-svg"></div><p>請選出此卦卦名：</p>`,
      options: makeOptions(correct, pool),
      answer: correct.id,
      onRender: () => drawHexagram(correct.binary, 'qHex', 100, true),
      explain: `此卦為第${correct.id}卦「${correct.name}」。`
    };
  }

  function qGuaci(pool) {
    const correct = randomPick(pool, 1)[0];
    return {
      type: '卦辭配對',
      prompt: `<p>請判斷下列卦辭對應的卦名：</p><blockquote>${correct.guaci}</blockquote>`,
      options: makeOptions(correct, pool),
      answer: correct.id,
      explain: `${correct.name}卦的核心義理：${correct.guaci_modern}`
    };
  }

  function qFill(pool) {
    const correct = randomPick(pool, 1)[0];
    const keyword = correct.name;
    return {
      type: '填充題',
      prompt: `<p>填空：第____卦的卦辭為「${correct.guaci}」</p><p>請選出空格中的卦名。</p>`,
      options: makeOptions(correct, pool),
      answer: correct.id,
      explain: `空格應填「${keyword}」。`
    };
  }

  function qScenario(pool) {
    const correct = randomPick(pool, 1)[0];
    const tag = (correct.tags && correct.tags[0]) || '調和';
    return {
      type: '情境應用',
      prompt: `<p>情境：你正面臨「${tag}」課題，需穩中求進，宜參考哪一卦？</p>`,
      options: makeOptions(correct, pool),
      answer: correct.id,
      explain: `${correct.name}卦可作為此情境的思考框架。`
    };
  }

  function buildQuiz() {
    const pool = getPool();
    const generators = [qRecognize, qGuaci, qFill, qScenario];
    const questions = [];
    for (let i = 0; i < 10; i += 1) {
      const gen = generators[i % generators.length];
      questions.push(gen(pool));
    }
    return randomPick(questions, 10);
  }

  function renderQuestion() {
    const q = state.questions[state.index];
    titleEl.textContent = `第 ${state.index + 1} / 10 題（${q.type}）`;
    questionEl.innerHTML = q.prompt;
    optionsEl.innerHTML = '';
    feedbackEl.textContent = '';
    nextBtn.classList.add('hidden');

    q.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => handleAnswer(opt.value, btn));
      optionsEl.appendChild(btn);
    });

    if (q.onRender) q.onRender();
  }

  function handleAnswer(value, btn) {
    const q = state.questions[state.index];
    const buttons = [...optionsEl.querySelectorAll('button')];
    buttons.forEach((b) => (b.disabled = true));

    if (value === q.answer) {
      state.score += 10;
      btn.classList.add('correct');
      btn.textContent = `${btn.textContent}（正確）`;
      feedbackEl.textContent = `✅ 答對！${q.explain}`;
    } else {
      state.weak[q.type] += 1;
      btn.classList.add('wrong');
      btn.textContent = `${btn.textContent}（錯誤）`;
      const rightBtn = buttons.find((b) => {
        const id = q.options.find((opt) => opt.text === b.textContent)?.value;
        return id === q.answer;
      });
      if (rightBtn) {
        rightBtn.classList.add('correct');
        rightBtn.textContent = `${rightBtn.textContent}（正確）`;
      }
      feedbackEl.textContent = `❌ 答錯。${q.explain}`;
    }

    nextBtn.classList.remove('hidden');
  }

  function finishQuiz() {
    quizPanel.classList.add('hidden');
    quizResult.classList.remove('hidden');

    const percent = state.score;
    const weak = Object.entries(state.weak)
      .sort((a, b) => b[1] - a[1])[0][0];

    if (!badges.includes('首次完成測驗')) badges.push('首次完成測驗');
    if (percent === 100 && !badges.includes('滿分達人')) badges.push('滿分達人');
    saveBadges();
    renderBadges();

    const currentBest = Number(localStorage.getItem('quiz_best') || 0);
    if (state.score > currentBest) {
      localStorage.setItem('quiz_best', String(state.score));
      bestScoreEl.textContent = String(state.score);
    }

    quizResult.innerHTML = `
      <h2>測驗完成</h2>
      <p><strong>得分：</strong>${state.score} / 100</p>
      <p><strong>正確率：</strong>${percent}%</p>
      <p><strong>薄弱環節建議：</strong>建議加強「${weak}」練習。</p>
      <button class="btn" id="restartQuizBtn">再測一次</button>
    `;
    document.getElementById('restartQuizBtn').addEventListener('click', startQuiz);
  }

  function startQuiz() {
    state.questions = buildQuiz();
    state.index = 0;
    state.score = 0;
    state.weak = { 認卦練習: 0, 卦辭配對: 0, 填充題: 0, 情境應用: 0 };
    quizResult.classList.add('hidden');
    quizPanel.classList.remove('hidden');
    renderQuestion();
  }

  nextBtn.addEventListener('click', () => {
    state.index += 1;
    if (state.index >= state.questions.length) {
      finishQuiz();
    } else {
      renderQuestion();
    }
  });

  document.querySelectorAll('.difficulty').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.difficulty').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.level = btn.dataset.level;
    });
  });

  document.getElementById('startQuizBtn').addEventListener('click', startQuiz);
  renderBadges();
})();
