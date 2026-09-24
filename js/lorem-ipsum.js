/* Lorem Ipsum Generator — Amazing-Tools */
(function () {
  'use strict';

  const countInput = document.getElementById('count');
  const typeSelect = document.getElementById('type');
  const includeHtmlCheckbox = document.getElementById('includeHtml');
  const generateBtn = document.getElementById('generateBtn');
  const copyBtn = document.getElementById('copyBtn');
  const outputArea = document.getElementById('outputArea');

  const loremParagraphs = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi.",
    "Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam consequat. Curabitur augue lorem, dapibus quis, laoreet et, pretium ac, nisi. Aenean magna nisl, mollis quis, molestie eu, feugiat in, orci. In hac habitasse platea dictumst.",
    "Fusce convallis, mauris imperdiet gravida bibendum, nisl turpis suscipit mauris, sed placerat ipsum urna sed risus. In convallis tellus a mauris. Curabitur non elit ut libero tristique sodales. Mauris a lacus. Donec mattis semper leo. In hac habitasse platea dictumst. Vivamus facilisis diam velit gravida urna. Vestibulum congue scelerisque tellus. Quisque tortor. Phasellus varius erat eu sem.",
    "Praesent congue erat at massa. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec non mi. Nam elementum. Vestibulum suscipit nulla quis orci. Donec congue. Aliquam vel nisl. Mauris id tellus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit. Donec tempor, est quis pulvinar hendrerit, neque velit vulputate lacus, dignissim lobortis massa nulla at massa. Suspendisse sagittis hendrerit nulla.",
    "Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt.",
    "Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia.",
    "Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede.",
    "Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Donec posuere vulputate arcu.",
    "Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed aliquam, nisi quis porttitor congue, elit erat euismod orci, ac placerat dolor lectus quis orci. Phasellus consectetuer vestibulum elit. Aenean tellus metus, bibendum sed, posuere ac, mattis non, nunc. Vestibulum fringilla pede sit amet augue. In turpis. Pellentesque posuere. Praesent turpis."
  ];

  function getRandomParagraph() {
    return loremParagraphs[Math.floor(Math.random() * loremParagraphs.length)];
  }

  function getSentences(count) {
    let result = [];
    while (result.length < count) {
      let p = getRandomParagraph();
      let sentences = p.match(/[^\.!\?]+[\.!\?]+/g) || [];
      for (let i = 0; i < sentences.length && result.length < count; i++) {
        result.push(sentences[i].trim());
      }
    }
    return result.join(' ');
  }

  function getWords(count) {
    let words = [];
    while (words.length < count) {
      let p = getRandomParagraph();
      let w = p.split(/\s+/);
      words = words.concat(w);
    }
    return words.slice(0, count).join(' ').replace(/[.,!?]$/, '') + '.';
  }

  generateBtn.addEventListener('click', function () {
    const count = parseInt(countInput.value) || 1;
    const type = typeSelect.value;
    const includeHtml = includeHtmlCheckbox.checked;

    let output = [];

    if (type === 'paragraphs') {
      for (let i = 0; i < count; i++) {
        let p = (i === 0 && count > 1) ? loremParagraphs[0] : getRandomParagraph();
        output.push(includeHtml ? `<p>${p}</p>` : p);
      }
    } else if (type === 'sentences') {
      let text = getSentences(count);
      output.push(includeHtml ? `<p>${text}</p>` : text);
    } else if (type === 'words') {
      let text = getWords(count);
      output.push(includeHtml ? `<p>${text}</p>` : text);
    }

    outputArea.value = output.join(includeHtml ? '\n' : '\n\n');
  });

  copyBtn.addEventListener('click', function () {
    if (outputArea.value.trim() !== '') {
      const TK = window.Amazing-Tools;
      if (TK && TK.copyToClipboard) {
        TK.copyToClipboard(outputArea.value, this);
      } else {
        navigator.clipboard.writeText(outputArea.value);
        const originalText = this.textContent;
        this.textContent = 'Copied!';
        setTimeout(() => this.textContent = originalText, 2000);
      }
    }
  });

  // Generate some default text on load
  generateBtn.click();

})();
