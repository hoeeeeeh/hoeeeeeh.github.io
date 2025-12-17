---
layout: post
current: post
cover: "assets/images/cover/javascript.png"
navigation: True
title: "JS Closure"
date: 2025-12-14 05:58:00
tags:
    - [JavaScript, ]
class: post-template
subclass: 'post'
author: 
  - "hoeeeeeh"
categories:
    - [CS, Programming, ]
---

[https://mrale.ph/blog/2012/09/23/grokking-v8-closures-for-fun.html](https://mrale.ph/blog/2012/09/23/grokking-v8-closures-for-fun.html)


# Closure


## Lexical Environment


자바스크립트를 사용한다면, 모든 함수가 변수를 값으로 해석하기 위해 **렉시컬 환경(lexical environment)** 을 가지고 있다는 사실을 알고 있을 것이다. 말은 추상적으로 들리지만 실제로는 매우 단순하다.



```
javascript
function makeF() { 
	var x = 11; 
	var y = 22; 
	return function (what) { 
		switch (what) { 
			case "x": 
				return x; 
				
			case "y": 
				return y; 
		} 
	} 
} 

var f = makeF(); 
f("x");

```



함수 `f`는 `x`, `y`를 보관할 저장소가 필요하다. `makeF`의 실행 컨텍스트는 이미 사라졌기 때문이다.


![0](/upload/2025-12-14-JS_Closure.md/0.png)_73900.png_


V8은 정확히 이렇게 수행한다 : 

`Context`라고 불리는 객체를 하나 생성하고, 이것을 클로저에 붙인다(이 클로저는 내부적으로 `JSFunction` 클래스의 인스턴스로 표현된다).


> 너무 추상적인 것 같아서 이해를 바탕으로 다시 써보면, Context 라는 객체를 하나 생성하고 JSFunction 이 Context 를 참조할 수 있도록 연결한다. 라고 이해할 수 있을 것 같다.  
>   
> 다시 말해서, 함수(JSFunction) 가 Context 를 들고 있는 상태를 클로저(JSFunction + Context) 라고 부른다.  
> JSFunction 내부에 Context 를 가리키는 포인터가 존재하는 상태가 클로저이다.


이후에 이 캡쳐된 변수들(여기서는 x, y) 를 앞으로 컨텍스트 변수라고 지칭하겠다.


여기서 이제 중요한 점이 몇 가지 있다.


## Context 생성 시점


첫째로, V8은 클로저가 만들어질 때가 아니라 **스코프에 진입할 때** Context를 생성한다. 이 사실은 핫 루프 안에서 클로저가 참조하는 변수를 다룰 때 매우 중요하다. 최적화 컴파일러는 이런 변수를 레지스터에 둘 수 없고, 매번 메모리 load/store가 발생한다.


> ‘핫 루프’는 직관적으로 설명하면 ‘짧은 시간안에 매우 많이 실행되는 루프’ 정도로 생각할 수 있다. 여기서 왜 핫 루프가 중요하냐면, 핫 루프처럼 매우 자주 사용되는 경우, 인터프리터인 Ignition 이 ‘이 루프는 굉장히 많이 사용되는구나. 이걸 매번 실행하기보다는 최적화해야겠다’ 라고 생각하고 TurboFan 에게 최적화 컴파일을 하도록 한다.  
> 이렇게 최적화를 하게 되면 변수를 참조할 때, 매번 메모리에서 load 하지 않고 레지스터에서 빠르게 가져올 수 있다. 하지만 Context 는 클로저가 만들어질때가 아니라 스코프에 진입할 때 만들어진다.   
>   
> V8은 스코프에 진입할 때 Context를 만들고, 클로저가 참조하는 변수는 Context 슬롯에 들어간다. 그러면 핫 루프 안에서 그 변수를 사용할 때, TurboFan은 그 변수를 단순한 로컬 변수처럼 레지스터에 올려둘 수가 없다. 매 반복마다 “Context → 슬롯 → 값”을 따라가서 메모리에서 load 해야 하고, 값이 바뀌면 다시 store 해야 한다.

<details markdown="1">
<summary>간단한 테스트</summary>


```
javascript
let cnt = 0;

function count(c) {
	return c + 1;
}

while(cnt < 1e5) {
	cnt = count(cnt);
	// do something
}

// --------------------

function c() {
	let cnt = 0;
	function count() {
		cnt += 1;
		
		return cnt;
	}
	
	return count;
}

let f = c();

while(f() < 1e5) {
	// do something
}

```



정말 간단하게 위의 두 코드에 대한 실행시간 차이를 재봤더니 차이가 없거나 오히려 클로저가 더 빠른 경우가 있다. V8 엔진의 최적화가 잘 되어서 이정도로는 차이를 크게 벌릴 수 없나보다.


</details>

<details markdown="1">
<summary>복잡한 테스트</summary>


```
javascript
'use strict';
const { performance } = require('perf_hooks');

const WARMUP = 5_000_000;
const ITER = 50_000_000;

let sink = 0; // 루프에서 생성되는 값이 사라지지 않게끔 잡아두는 변수. 

function bench(name, fn) {
  fn(WARMUP); // warmup
  let best = Infinity;
  for (let r = 0; r < 7; r++) {
    const t0 = performance.now();
    fn(ITER);
    const t1 = performance.now();
    best = Math.min(best, t1 - t0);
  }
  console.log(`${name}: ${best.toFixed(2)} ms`);
}

/**
 * 1) local: 루프 안 변수들이 "로컬" (V8이 레지스터로 잡기 쉬움)
 */
function localRunner(n) {
  let a = 1, b = 2, c = 3, d = 4, e = 5, f = 6, g = 7, h = 8;

  for (let i = 0; i < n; i++) {
    a = (a + b) | 0;
    b = (b + c) | 0;
    c = (c + d) | 0;
    d = (d + e) | 0;
    e = (e + f) | 0;
    f = (f + g) | 0;
    g = (g + h) | 0;
    h = (h + a) | 0;

    sink = (sink + (a ^ h)) | 0;
  }
}

/**
 * 2) closure: a~h가 "외부 스코프 변수"라서 Context 슬롯에 들어갈 가능성이 높음
 */
function makeClosureRunner() {
  let a = 1, b = 2, c = 3, d = 4, e = 5, f = 6, g = 7, h = 8;

  return function closureRunner(n) {
    for (let i = 0; i < n; i++) {
      a = (a + b) | 0;
      b = (b + c) | 0;
      c = (c + d) | 0;
      d = (d + e) | 0;
      e = (e + f) | 0;
      f = (f + g) | 0;
      g = (g + h) | 0;
      h = (h + a) | 0;

      sink = (sink + (a ^ h)) | 0;
    }
  };
}

const closureRunner = makeClosureRunner();

bench('local', localRunner);
bench('closure(context)', closureRunner);


// local: 573.22 ms
// closure(context): 692.98 ms

```



루프를 돌고 sink 에 값을 저장해둠으로써 ‘이 루프는 쓸모없는 루프가 아니라 sink 를 위한 루프구나’ 라고 TurboFan 이 생각하도록 만든다. 


</details>


## 스코프


둘째로, Context는 스코프에 진입하는 순간 **즉시 생성**되고, 그 스코프에서 만들어진 모든 클로저가 **공유**한다. 그리고 이 스코프가 또 다른 클로저 안에 있다면, Context는 부모 Context를 가리키는 포인터를 가진다. 


> 이 구조는 메모리 누수를 유발할 수 있다.



```
javascript
function outer() {
  var x = HUGE;  // huge object
  function inner() {
    var y = GIANT;  // giant object :-)

    use(x);  // usage of x cause it to be allocated to the context

    function innerF() {
      use(y);  // usage of y causes it to be allocated to the context
    }

    function innerG() {
      /* use nothing */
    }

    return innerG;
  }

  return inner();
}

var o = outer();  // o will retain HUGE and GIANT.

```



outer → inner → innerF, innerG


이 코드에서 innerG 가 실제로 사용하는건 없다. HUGE 도 GIANT 도 innerG 가 사용하지 않는다. 하지만 o 는 HUGE 와 GIANT 를 유지시킨다.

- innerG 와 innerF 는 Context 를 공유하기 때문에 GIANT 를 유지한다.
- innerG 의 부모, inner 의 Context 를 통해 HUGE 가 유지된다.

![1](/upload/2025-12-14-JS_Closure.md/1.png)_85101.png_

