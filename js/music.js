(() => {
  'use strict';
  const tracks = [
    { id: 2026565329, title: 'Da Capo', artist: 'HOYO-MiX', duration: 134.594 },
    { id: 2619647262, title: '飞鸟说', artist: 'ChiliChill乐团', duration: 213.321 },
    { id: 1859652717, title: 'Moon Halo', artist: '茶理理 / TetraCalyx / Hanser / HOYO-MiX', duration: 204.054 },
    { id: 1426087898, title: 'Starfall', artist: '袁娅维TIA RAY', duration: 191.052 }
  ];
  const audio = document.getElementById('music-audio');
  const play = document.getElementById('music-play');
  const playIcon = document.getElementById('music-play-icon');
  const progress = document.getElementById('music-progress');
  const message = document.getElementById('music-message');
  const elapsed = document.getElementById('music-elapsed');
  const duration = document.getElementById('music-duration');
  const choices = [...document.querySelectorAll('[data-track]')];
  let current = 0;
  let wantsPlay = false;
  let requestId = 0;
  audio.volume = 0.7;

  const timeText = seconds => {
    const value = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
    return Math.floor(value / 60) + ':' + String(value % 60).padStart(2, '0');
  };
  const spokenTime = seconds => {
    const value = Math.max(0, Math.floor(seconds));
    return Math.floor(value / 60) + ' 分 ' + value % 60 + ' 秒';
  };
  function updatePlayButton() {
    playIcon.textContent = wantsPlay ? 'Ⅱ' : '▷';
    play.setAttribute('aria-pressed', String(wantsPlay));
    play.setAttribute('aria-label', (wantsPlay ? '暂停 ' : '播放 ') + tracks[current].title);
  }
  function updateProgress() {
    const total = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : tracks[current].duration;
    const position = audio.currentTime || 0;
    elapsed.textContent = timeText(position);
    duration.textContent = timeText(total);
    progress.max = total;
    progress.value = Math.min(position, total);
    progress.style.setProperty('--music-progress', Math.min(100, position / total * 100) + '%');
    progress.setAttribute('aria-valuetext', spokenTime(position) + '，共 ' + spokenTime(total));
  }
  function playbackUnavailable(text = '这首歌暂时无法播放，去网易云听听吧。') {
    wantsPlay = false;
    audio.pause();
    updatePlayButton();
    message.textContent = text;
    message.classList.add('music-error');
  }
  async function startPlayback() {
    const attempt = ++requestId;
    message.classList.remove('music-error');
    if (!navigator.onLine && !audio.hasAttribute('src')) {
      playbackUnavailable('无法播放 · 网络未连接');
      return;
    }
    if (!audio.hasAttribute('src')) {
      // A stable public endpoint resolves a fresh stream URL on every new play.
      // No cross-origin processing, downloaded assets, or expiring CDN URL is stored.
      audio.src = 'https://music.163.com/song/media/outer/url?id=' + tracks[current].id + '.mp3';
    }
    wantsPlay = true;
    updatePlayButton();
    message.textContent = '加载中…';
    try {
      await audio.play();
      if (attempt !== requestId) return;
      message.textContent = '正在播放 · ' + tracks[current].title;
    } catch (error) {
      // Choosing another song or pausing intentionally aborts the older play.
      if (attempt !== requestId || error.name === 'AbortError') return;
      playbackUnavailable();
    }
  }
  function pausePlayback() {
    requestId++;
    wantsPlay = false;
    audio.pause();
    updatePlayButton();
    message.textContent = '已暂停';
  }
  function selectTrack(index, continuePlaying = wantsPlay) {
    requestId++;
    wantsPlay = false;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    current = (index + tracks.length) % tracks.length;
    const track = tracks[current];
    document.getElementById('music-title').textContent = '「' + track.title + '」';
    document.getElementById('music-artist').textContent = track.artist;
    document.getElementById('music-open').href = 'https://music.163.com/song?id=' + track.id;
    choices.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    progress.disabled = true;
    message.classList.remove('music-error');
    message.textContent = '未播放';
    updateProgress();
    updatePlayButton();
    if (continuePlaying) startPlayback();
  }
  play.addEventListener('click', () => { if (wantsPlay) pausePlayback(); else startPlayback(); });
  document.getElementById('music-previous').addEventListener('click', () => selectTrack(current - 1));
  document.getElementById('music-next').addEventListener('click', () => selectTrack(current + 1));
  choices.forEach(button => button.addEventListener('click', () => selectTrack(Number(button.dataset.track))));
  progress.addEventListener('input', () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    try { audio.currentTime = Math.min(Number(progress.value), audio.duration); updateProgress(); }
    catch { message.textContent = '进度暂不可调整'; }
  });
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('loadedmetadata', () => { progress.disabled = false; updateProgress(); });
  audio.addEventListener('playing', () => {
    if (!wantsPlay) return;
    message.classList.remove('music-error');
    message.textContent = '正在播放 · ' + tracks[current].title;
  });
  audio.addEventListener('waiting', () => { if (wantsPlay) message.textContent = '加载中…'; });
  audio.addEventListener('error', () => { if (audio.hasAttribute('src')) playbackUnavailable(); });
  audio.addEventListener('ended', () => {
    wantsPlay = false;
    updatePlayButton();
    if (current < tracks.length - 1) selectTrack(current + 1, true);
    else message.textContent = '播放结束';
  });
  window.addEventListener('pagehide', pausePlayback);
  updatePlayButton();
  updateProgress();
})();
