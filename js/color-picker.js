/* Color Picker — Amazing-Tools */
(function () {
  'use strict';

  const colorPreview = document.getElementById('colorPreview');
  const colorInput = document.getElementById('colorInput');
  const hexInput = document.getElementById('hexInput');
  const rgbInput = document.getElementById('rgbInput');
  const hslInput = document.getElementById('hslInput');
  const copyBtns = document.querySelectorAll('.copy-btn');
  const copiedToast = document.getElementById('copiedToast');

  // Palette containers
  const palComp = document.getElementById('paletteComp');
  const palAnalog = document.getElementById('paletteAnalog');
  const palTriad = document.getElementById('paletteTriad');
  const palMono = document.getElementById('paletteMono');

  function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  function updateAllFromHex(hex) {
    if (!/^#[0-9A-F]{6}$/i.test(hex)) return;
    
    colorPreview.style.backgroundColor = hex;
    colorInput.value = hex;
    
    const rgb = hexToRgb(hex);
    rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    
    generatePalettes(hsl);
  }

  colorInput.addEventListener('input', function() {
    hexInput.value = this.value.toUpperCase();
    updateAllFromHex(this.value);
  });

  hexInput.addEventListener('input', function() {
    let val = this.value;
    if (val.charAt(0) !== '#') val = '#' + val;
    if (val.length === 7) {
      updateAllFromHex(val);
    }
  });

  // Palettes
  function createSwatch(hex) {
    const div = document.createElement('div');
    div.className = 'swatch';
    div.style.backgroundColor = hex;
    
    const span = document.createElement('span');
    span.className = 'swatch-hex';
    span.textContent = hex;
    div.appendChild(span);
    
    div.addEventListener('click', () => {
      navigator.clipboard.writeText(hex);
      showToast();
    });
    
    return div;
  }

  function generatePalettes(hsl) {
    // Clear old
    palComp.innerHTML = '';
    palAnalog.innerHTML = '';
    palTriad.innerHTML = '';
    palMono.innerHTML = '';

    const { h, s, l } = hsl;

    // Complementary (2 colors + variants)
    const compH = (h + 180) % 360;
    const compColors = [
      hslToRgb(h, s, Math.max(10, l - 20)),
      hslToRgb(h, s, l),
      hslToRgb(compH, s, Math.min(90, l + 20)),
      hslToRgb(compH, s, l),
      hslToRgb(compH, s, Math.max(10, l - 20))
    ];
    compColors.forEach(c => palComp.appendChild(createSwatch(rgbToHex(c.r, c.g, c.b))));

    // Analogous
    const analogColors = [
      hslToRgb((h - 60 + 360) % 360, s, l),
      hslToRgb((h - 30 + 360) % 360, s, l),
      hslToRgb(h, s, l),
      hslToRgb((h + 30) % 360, s, l),
      hslToRgb((h + 60) % 360, s, l)
    ];
    analogColors.forEach(c => palAnalog.appendChild(createSwatch(rgbToHex(c.r, c.g, c.b))));

    // Triadic
    const triadColors = [
      hslToRgb(h, s, Math.max(20, l - 15)),
      hslToRgb(h, s, l),
      hslToRgb((h + 120) % 360, s, l),
      hslToRgb((h + 240) % 360, s, l),
      hslToRgb((h + 240) % 360, s, Math.min(80, l + 15))
    ];
    triadColors.forEach(c => palTriad.appendChild(createSwatch(rgbToHex(c.r, c.g, c.b))));

    // Monochromatic
    const monoColors = [
      hslToRgb(h, s, 15),
      hslToRgb(h, s, 30),
      hslToRgb(h, s, 50),
      hslToRgb(h, s, 70),
      hslToRgb(h, s, 85)
    ];
    monoColors.forEach(c => palMono.appendChild(createSwatch(rgbToHex(c.r, c.g, c.b))));
  }

  // Copy buttons
  copyBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      navigator.clipboard.writeText(input.value);
      showToast();
    });
  });

  let toastTimeout;
  function showToast() {
    copiedToast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      copiedToast.classList.remove('show');
    }, 2000);
  }

  // Init
  updateAllFromHex(colorInput.value);

})();
