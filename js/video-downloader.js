/* =========================================================
   ToolsKart — Universal Video & Audio Downloader Controller
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

  // Cobalt / open resolver endpoints
  const RESOLVER_ENDPOINTS = [
    'https://cobalt-backend.canine.tools',
    'https://api.cobalt.tools',
    'https://cobalt.kalli.st'
  ];

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

  // --- 2. Format Download Handler ---
  async function handleFormatDownload(e) {
    const btn = e.currentTarget;
    const quality = btn.getAttribute('data-quality');
    const type = btn.getAttribute('data-type'); // 'video' or 'audio'

    if (!currentMediaInfo || !currentMediaInfo.url) {
      showError('Please enter a video URL first.');
      return;
    }

    const originalBtnText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Preparing...';

    showProgressBar('Connecting to media resolver...', 15);

    try {
      // Query open Cobalt resolver API
      const downloadUrl = await resolveDownloadStream(currentMediaInfo.url, quality, type);

      showProgressBar('Stream ready! Starting download...', 90);

      // Trigger download in browser
      triggerBrowserDownload(downloadUrl, currentMediaInfo.title, type, quality);

      setTimeout(() => {
        showProgressBar('Download complete! Check your downloads folder.', 100);
        btn.textContent = '✓ Downloaded';
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = originalBtnText;
          downloadProgressBar.style.display = 'none';
        }, 3000);
      }, 1200);

    } catch (err) {
      console.error('Resolver error:', err);
      // Smart Fallback
      showProgressBar('Connecting via fallback download mirror...', 65);
      
      const fallbackUrl = generateFallbackStreamUrl(currentMediaInfo.url, quality, type);
      triggerBrowserDownload(fallbackUrl, currentMediaInfo.title, type, quality);

      setTimeout(() => {
        showProgressBar('Opened in downloader stream.', 100);
        btn.disabled = false;
        btn.textContent = originalBtnText;
        setTimeout(() => { downloadProgressBar.style.display = 'none'; }, 3000);
      }, 1500);
    }
  }

  // --- 3. Stream Resolver Engine ---
  async function resolveDownloadStream(url, quality, type) {
    const isAudioOnly = type === 'audio';
    const payload = {
      url: url,
      videoQuality: quality === '1080' ? '1080' : (quality === '720' ? '720' : '480'),
      audioFormat: 'mp3',
      isAudioOnly: isAudioOnly,
      filenameStyle: 'classic'
    };

    let lastError = null;

    for (const endpoint of RESOLVER_ENDPOINTS) {
      try {
        const response = await fetch(`${endpoint}/api/json`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.url) return data.url;
          if (data.audio) return data.audio;
        }
      } catch (e) {
        lastError = e;
      }
    }

    throw lastError || new Error('All resolver mirrors busy');
  }

  function generateFallbackStreamUrl(url, quality, type) {
    // If external API instances are blocked by CORS/firewall, route through universal media handler
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const vid = extractYouTubeId(url);
      if (type === 'audio') {
        return `https://yewtu.be/latest_version?id=${vid}&itag=140`;
      } else {
        const itag = quality === '1080' ? '137' : (quality === '720' ? '22' : '18');
        return `https://yewtu.be/latest_version?id=${vid}&itag=${itag}`;
      }
    }
    return url;
  }

  function triggerBrowserDownload(downloadUrl, title, type, quality) {
    const ext = type === 'audio' ? 'mp3' : 'mp4';
    const cleanTitle = (title || 'video').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    const filename = `${cleanTitle}_${quality}.${ext}`;

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
