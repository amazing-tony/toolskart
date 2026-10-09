/* =========================================================
   Amazing-Tools — Universal Video & Audio Downloader Controller
   Supports YouTube, Shorts, Instagram Reels, Facebook, TikTok
   ========================================================= */

(function () {
  'use strict';

  // DOM Elements
  const videoUrlInput = document.getElementById('videoUrlInput');
  const btnClearUrl = document.getElementById('btnClearUrl');
  const btnFetchVideo = document.getElementById('btnFetchVideo');
  const btnFetchText = document.getElementById('btnFetchText');
  const btnSpinner = document.getElementById('btnSpinner');
  const fetchErrorMessage = document.getElementById('fetchErrorMessage');

  const downloaderResultArea = document.getElementById('downloaderResultArea');
  const videoThumbnail = document.getElementById('videoThumbnail');
  const videoTitle = document.getElementById('videoTitle');
  const videoAuthor = document.getElementById('videoAuthor');
  const videoDuration = document.getElementById('videoDuration');

  const tabBtnVideo = document.getElementById('tabBtnVideo');
  const tabBtnAudio = document.getElementById('tabBtnAudio');
  const paneVideo = document.getElementById('pane-video');
  const paneAudio = document.getElementById('pane-audio');

  const downloadProgressBar = document.getElementById('downloadProgressBar');
  const progressStatusText = document.getElementById('progressStatusText');
  const progressPercentText = document.getElementById('progressPercentText');
  const progressFill = document.getElementById('progressFill');

  // Currently active video info
  let currentMediaInfo = null;

  // No server-side resolver — browser cannot bypass CORS on YouTube/Instagram/Facebook.

  // Initialize Event Listeners
  initEvents();

  function initEvents() {
    if (btnFetchVideo) {
      btnFetchVideo.addEventListener('click', handleFetchMedia);
    }

    if (videoUrlInput) {
      videoUrlInput.addEventListener('input', function () {
        if (this.value.trim().length > 0) {
          btnClearUrl.style.display = 'block';
        } else {
          btnClearUrl.style.display = 'none';
        }
      });

      videoUrlInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') handleFetchMedia();
      });
    }

    if (btnClearUrl) {
      btnClearUrl.addEventListener('click', function () {
        videoUrlInput.value = '';
        btnClearUrl.style.display = 'none';
        downloaderResultArea.style.display = 'none';
        fetchErrorMessage.style.display = 'none';
        videoUrlInput.focus();
      });
    }

    // Tab Switching: Video vs Audio
    if (tabBtnVideo && tabBtnAudio) {
      tabBtnVideo.addEventListener('click', () => switchTab('video'));
      tabBtnAudio.addEventListener('click', () => switchTab('audio'));
    }

    // Attach click listeners to download buttons
    document.querySelectorAll('.btn-format-download').forEach(btn => {
      btn.addEventListener('click', handleFormatDownload);
    });
  }

  function switchTab(type) {
    if (type === 'video') {
      tabBtnVideo.classList.add('active');
      tabBtnAudio.classList.remove('active');
      paneVideo.style.display = 'block';
      paneAudio.style.display = 'none';
    } else {
      tabBtnVideo.classList.remove('active');
      tabBtnAudio.classList.add('active');
      paneVideo.style.display = 'none';
      paneAudio.style.display = 'block';
    }
  }

  // --- 1. Fetch Media Metadata & Stream ---
  async function handleFetchMedia() {
    const rawUrl = videoUrlInput.value.trim();
    hideError();

    if (!rawUrl) {
      showError('Please paste a valid video link from YouTube, Instagram, Facebook, or TikTok.');
      videoUrlInput.focus();
      return;
    }

    // Validate URL format
    if (!isValidMediaUrl(rawUrl)) {
      showError('Unsupported link format. Please provide a YouTube (or Shorts), Instagram Reel, Facebook video, or TikTok URL.');
      return;
    }

    setLoadingState(true);

    try {
      // 1. Fetch oEmbed metadata (Title, Author, Thumbnail) via public CORS-friendly oEmbed
      const oembedData = await fetchOembedInfo(rawUrl);

      currentMediaInfo = {
        url: rawUrl,
        title: oembedData.title || extractFallbackTitle(rawUrl),
        author: oembedData.author_name || 'Online Creator',
        thumbnail: oembedData.thumbnail_url || generateThumbnail(rawUrl),
        platform: detectPlatform(rawUrl)
      };

      // Populate preview UI
      videoTitle.textContent = currentMediaInfo.title;
      videoAuthor.textContent = `${currentMediaInfo.platform} • ${currentMediaInfo.author}`;
      videoThumbnail.src = currentMediaInfo.thumbnail;
      videoThumbnail.onerror = function () {
        this.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
      };
      videoDuration.textContent = 'HD Ready';

      // Show result card
      downloaderResultArea.style.display = 'block';
      downloaderResultArea.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      console.warn('Metadata fetch fallback:', err);
      // Fallback display
      currentMediaInfo = {
        url: rawUrl,
        title: extractFallbackTitle(rawUrl),
        author: detectPlatform(rawUrl),
        thumbnail: generateThumbnail(rawUrl),
        platform: detectPlatform(rawUrl)
      };

      videoTitle.textContent = currentMediaInfo.title;
      videoAuthor.textContent = `${currentMediaInfo.platform} Video`;
      videoThumbnail.src = currentMediaInfo.thumbnail;
      videoDuration.textContent = 'HD Ready';

      downloaderResultArea.style.display = 'block';
      downloaderResultArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      setLoadingState(false);
    }
  }

  // --- 2. Format Download Handler (Honest: browser cannot bypass CORS) ---
  async function handleFormatDownload(e) {
    const btn = e.currentTarget;
    const quality = btn.getAttribute('data-quality');
    const type = btn.getAttribute('data-type'); // 'video' or 'audio'

    if (!currentMediaInfo || !currentMediaInfo.url) {
      showError('Please enter a video URL first.');
      return;
    }

    const rawUrl = currentMediaInfo.url;
    const platform = currentMediaInfo.platform;

    // Hide any existing progress bar — we don't fake progress
    if (downloadProgressBar) downloadProgressBar.style.display = 'none';

    // Show the honest helper panel with verified working options
    showDownloadHelperPanel(rawUrl, quality, type, platform);
  }

  // --- 3. Download Helper Panel (Verified Working External Services) ---
  function showDownloadHelperPanel(rawUrl, quality, type, platform) {
    const encodedUrl = encodeURIComponent(rawUrl);
    const isYouTube = rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be');
    const isAudio = type === 'audio';

    // Build yt-dlp command snippet for power users
    const ytdlpFormat = isAudio
      ? `-x --audio-format mp3`
      : `-f "bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]"`;
    const ytdlpCmd = `yt-dlp ${ytdlpFormat} "${rawUrl}"`;

    // Build service buttons HTML
    const serviceButtons = `
      <a href="https://cobalt.tools/#${encodedUrl}" target="_blank" rel="noopener noreferrer"
         class="btn-helper-service cobalt">
        🔵 cobalt.tools
        <span class="helper-badge">Open Source · No Ads</span>
      </a>
      <a href="https://savefrom.net/#url=${encodedUrl}" target="_blank" rel="noopener noreferrer"
         class="btn-helper-service savefrom">
        🟢 savefrom.net
        <span class="helper-badge">Fast &amp; Free</span>
      </a>
      <a href="https://y2mate.guru/?url=${encodedUrl}" target="_blank" rel="noopener noreferrer"
         class="btn-helper-service y2mate">
        🟠 y2mate.guru
        <span class="helper-badge">MP4 &amp; MP3</span>
      </a>
      ${isYouTube ? `<a href="https://ssyoutube.com/watch?v=${encodedUrl}" target="_blank" rel="noopener noreferrer"
         class="btn-helper-service ssyt">
        🔴 ssyoutube.com
        <span class="helper-badge">Quality Select</span>
      </a>` : ''}
    `;

    // Build yt-dlp snippet (shown for all platforms)
    const ytdlpSection = `
      <div class="helper-cli-box">
        <div class="helper-cli-label">⚡ Download locally with yt-dlp (fastest, no limits):</div>
        <code class="helper-cli-code" id="ytdlpCmd">${escapeHtml(ytdlpCmd)}</code>
        <button class="btn-copy-cmd" onclick="navigator.clipboard.writeText(${JSON.stringify(ytdlpCmd)}).then(()=>{this.textContent='✓ Copied!';setTimeout(()=>{this.textContent='Copy'},2000)})">Copy</button>
        <a href="https://github.com/yt-dlp/yt-dlp#installation" target="_blank" rel="noopener noreferrer"
           class="helper-install-link">Install yt-dlp ↗</a>
      </div>
    `;

    const panelHtml = `
      <div class="download-helper-panel" id="downloadHelperPanel">
        <div class="helper-header">
          <span class="helper-icon">🚀</span>
          <div>
            <div class="helper-title">Your Download Options</div>
            <div class="helper-subtitle">
              Browser security prevents direct ${isAudio ? 'audio' : `${quality}p video`} downloads from
              <strong>${platform}</strong>. Use one of these free, verified services:
            </div>
          </div>
        </div>

        <div class="helper-services">
          ${serviceButtons}
        </div>

        ${ytdlpSection}

        <div class="helper-footer">
          <span>ℹ️</span>
          <span>Each service opens a new tab pre-filled with your link. No signup needed.</span>
        </div>
      </div>
    `;

    // Inject or replace the helper panel below the result area
    let existing = document.getElementById('downloadHelperPanel');
    if (existing) {
      existing.outerHTML = panelHtml;
    } else {
      downloaderResultArea.insertAdjacentHTML('afterend', panelHtml);
    }

    // Scroll panel into view
    const panel = document.getElementById('downloadHelperPanel');
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }



  // --- 4. oEmbed Metadata Helper ---
  async function fetchOembedInfo(url) {
    // Check if YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      if (res.ok) return await res.json();
    }
    // TikTok oEmbed
    if (url.includes('tiktok.com')) {
      const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
      if (res.ok) return await res.json();
    }
    return {};
  }

  // --- 5. Helper Functions ---
  function isValidMediaUrl(url) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|instagram\.com|facebook\.com|fb\.watch|tiktok\.com|twitter\.com|x\.com)\/.+$/i.test(url);
  }

  function detectPlatform(url) {
    if (url.includes('youtube.com/shorts')) return 'YouTube Shorts';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('instagram.com')) return 'Instagram Reel';
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'Facebook Video';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'X / Twitter';
    return 'Web Video';
  }

  function extractYouTubeId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : '';
  }

  function generateThumbnail(url) {
    const ytId = extractYouTubeId(url);
    if (ytId) {
      return `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
    }
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
  }

  function extractFallbackTitle(url) {
    const platform = detectPlatform(url);
    const ytId = extractYouTubeId(url);
    if (ytId) return `${platform} Video [${ytId}]`;
    return `${platform} Media Clip`;
  }

  function showProgressBar(text, percent) {
    downloadProgressBar.style.display = 'block';
    progressStatusText.textContent = text;
    progressPercentText.textContent = `${percent}%`;
    progressFill.style.width = `${percent}%`;
  }

  function setLoadingState(isLoading) {
    if (isLoading) {
      btnFetchVideo.disabled = true;
      btnFetchText.textContent = 'Analyzing Link...';
      btnSpinner.style.display = 'inline-block';
    } else {
      btnFetchVideo.disabled = false;
      btnFetchText.textContent = 'Download Now';
      btnSpinner.style.display = 'none';
    }
  }

  function showError(msg) {
    fetchErrorMessage.textContent = msg;
    fetchErrorMessage.style.display = 'block';
  }

  function hideError() {
    fetchErrorMessage.textContent = '';
    fetchErrorMessage.style.display = 'none';
  }

})();
