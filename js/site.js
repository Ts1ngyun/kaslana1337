(() => {
  'use strict';
  const greeting = document.getElementById('time-greeting');
  function updateGreeting() {
    const hour = new Date().getHours();
    let message;
    if (hour < 5) message = '舰长，凌晨好。已经很晚啦，早点休息哦～';
    else if (hour < 9) message = '舰长，早上好！起得好早呀，我还没睡醒呢～';
    else if (hour < 11) message = '舰长，上午好！今天也一起打起精神吧～';
    else if (hour < 14) message = '舰长，中午好！记得好好吃饭，补充能量哦～';
    else if (hour < 18) message = '舰长，下午好！累了的话，就陪我休息一会儿吧～';
    else message = '舰长，晚上好。今天辛苦啦，记得早点休息哦～';
    greeting.textContent = message;
  }
  updateGreeting();
  // Use the visitor's local clock, refreshing across time periods and tab resumes.
  setInterval(updateGreeting, 60000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateGreeting();
  });
  window.addEventListener('pageshow', updateGreeting);

  const wishes = [
    '琪亚娜祝你天天开心哦～',
    '累了就休息一下，明天也会有新的星光。',
    '今天也辛苦啦！记得吃饭，记得照顾好自己。',
    '愿你有奔向明天的勇气，也有慢慢来的底气。',
    '把一小束月光送给你，愿今晚有个好梦。',
    '你的每一点努力，都值得被温柔地看见。'
  ];
  let index = 0;
  let timer;
  const toast = document.getElementById('wish-toast');
  const text = document.getElementById('wish-text');
  const close = () => { toast.hidden = true; clearTimeout(timer); };
  document.getElementById('wish-button').addEventListener('click', () => {
    clearTimeout(timer);
    text.textContent = wishes[index++ % wishes.length];
    toast.hidden = false;
    // Leave enough time to read. Hover/focus keeps the message available.
    timer = setTimeout(close, 10000);
  });
  document.getElementById('close-wish').addEventListener('click', () => {
    close();
    document.getElementById('wish-button').focus({ preventScroll: true });
  });
  toast.addEventListener('mouseenter', () => clearTimeout(timer));
  toast.addEventListener('focusin', () => clearTimeout(timer));
  toast.addEventListener('mouseleave', () => { if (!toast.matches(':focus-within')) timer = setTimeout(close, 10000); });
  toast.addEventListener('focusout', () => { timer = setTimeout(close, 10000); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !toast.hidden) close(); });
})();
