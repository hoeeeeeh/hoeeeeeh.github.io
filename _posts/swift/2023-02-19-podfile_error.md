---
layout: post
title:  "[Swift] Pod Install Error"
author: hoeh
categories: [ swift ]
image: assets/images/swift.png
toc: true
---

# Cocoa Pod install Error

## 에러 내용
~~~
You may have encountered a bug in the Ruby interpreter or extension libraries.
Bug reports are welcome.
For details: https://www.ruby-lang.org/bugreport.html
~~~

### 원인
M1 맥북에서 일어나는 버그라고 하는데,, M1이 출시한지 이렇게나 오래 되었는데 아직도 ㅠ


## 해결 방법
~~~
$ sudo arch -x86_64 gem install ffi
$ arch -x86_64 pod install
~~~

이렇게 해서 해결할 수 있다고 한다.



