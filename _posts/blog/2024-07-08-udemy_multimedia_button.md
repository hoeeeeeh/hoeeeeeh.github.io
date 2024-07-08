---
layout: post
title: "Udemy Play/Pause 버튼이 안먹힐 때"
author: hoeh
categories: [blog]
image: assets/images/blog.png
toc: true
---

# Udemy Play/Pause 버튼이 안먹힐 때!

Udemy에서 열심히 강의 들으면서 노트북의 ⏯ (맥북 F8) 을 눌렀는데 이게 웬걸 동영상이 멈추질 않는다..  
F8을 연타를 해보니까 매~우 짧은 시간, 거의 0.01초 멈추더니 다시 자동으로 재생된다. 유데미 자체의 문제인 것 같아서 좀 찾아봤는데  
완전히 고치기는 좀 힘들고 매번 크롬 콘솔창을 열어서 멀티미디어 버튼에 이벤트를 거는 방식 밖에 없는 것 같다.  
아래 코드를 콘솔 창에 복붙하자..

```javascript
javascript: function playOrPause() {
  const el = document.querySelector(
    '[data-purpose="pause-button"], [data-purpose="play-button"]'
  );
  el.click();s
}
navigator.mediaSession.setActionHandler("play", playOrPause);
navigator.mediaSession.setActionHandler("pause", playOrPause);
```

[출처](https://www.reddit.com/r/Udemy/comments/17utgsh/keyboard_buttons_do_not_play_pause_and_forward_5s/)
