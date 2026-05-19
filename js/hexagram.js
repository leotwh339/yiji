(function () {
  function drawLine(svg, y, isYang, width, lineHeight) {
    const stroke = '#1a1a2e';
    const thick = lineHeight;
    if (isYang) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', '4');
      rect.setAttribute('y', String(y));
      rect.setAttribute('width', String(width - 8));
      rect.setAttribute('height', String(thick));
      rect.setAttribute('rx', '2');
      rect.setAttribute('fill', stroke);
      svg.appendChild(rect);
    } else {
      const left = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      left.setAttribute('x', '4');
      left.setAttribute('y', String(y));
      left.setAttribute('width', String((width - 20) / 2));
      left.setAttribute('height', String(thick));
      left.setAttribute('rx', '2');
      left.setAttribute('fill', stroke);
      svg.appendChild(left);

      const right = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      right.setAttribute('x', String((width + 20) / 2));
      right.setAttribute('y', String(y));
      right.setAttribute('width', String((width - 20) / 2 - 4));
      right.setAttribute('height', String(thick));
      right.setAttribute('rx', '2');
      right.setAttribute('fill', stroke);
      svg.appendChild(right);
    }
  }

  function drawByBinary(binary, containerId, size, lineCount, animated) {
    const host = document.getElementById(containerId);
    if (!host) return;
    host.innerHTML = '';
    const width = size;
    const height = size * (lineCount === 6 ? 1.3 : 1.05);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));

    const gap = height / (lineCount + 1);
    const lineHeight = Math.max(6, size / 18);
    const bits = binary.slice(0, lineCount).split('');

    bits.forEach((bit, i) => {
      const y = height - gap * (i + 1);
      drawLine(svg, y, bit === '1', width, lineHeight);
    });

    if (animated) {
      svg.style.opacity = '0';
      svg.style.transform = 'translateY(8px)';
      svg.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
      requestAnimationFrame(() => {
        svg.style.opacity = '1';
        svg.style.transform = 'translateY(0)';
      });
    }

    host.appendChild(svg);
  }

  window.drawHexagram = function drawHexagram(binary, containerId, size = 120, animated = false) {
    drawByBinary(binary, containerId, size, 6, animated);
  };

  window.drawTrigram = function drawTrigram(binary, containerId, size = 80) {
    drawByBinary(binary, containerId, size, 3, false);
  };
})();
