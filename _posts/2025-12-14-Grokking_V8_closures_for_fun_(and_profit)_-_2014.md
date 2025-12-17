---
layout: post
current: post
cover: "assets/images/cover/javascript.png"
navigation: True
title: "Grokking V8 closures for fun (and profit) - 2014"
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


> 이 글은 2014년 정도에 쓰여진 글이라서 이때 당시 동작하던 방식과, 현재 동작 방식과는 차이가 있을 것 같습니다. Closure 와 Classic Object 의 고전적인 동작 방식에 대해서 이해하는 정도로만 읽어보면 좋을 것 같습니다. (v8 의 crankshaft 는 2017년부터 사용되지 않고 있습니다)


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


![0](/upload/2025-12-14-Grokking_V8_closures_for_fun_(and_profit)_-_2014.md/0.png)_73900.png_


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


그래서, 테스트를 해보려고 했는데 간단한 테스트에서는 오히려 Closure 를 사용할때가 성능이 더 좋았다..!


이유는 아래에서 더 자세히 설명되어있다. 

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

![1](/upload/2025-12-14-Grokking_V8_closures_for_fun_(and_profit)_-_2014.md/1.png)_85101.png_


## Context 가 생기는 추가 규칙들

- `eval`을 직접 호출하거나 `with` 문을 사용하는 경우, 이를 포함하는 모든 스코프의 모든 변수는 Context에 할당된다.
- non-strict 함수에서 `arguments` 객체를 참조하면, 파라미터들이 Context에 할당된다.


```
javascript
function f(a) {  // a is context allocated
  var x = 10;  // x is context allocated
  function g(b) {  // b is context allocated
    var y = 10;  // y is context allocated
    function h(c) {  // c is context allocated
      with (obj) {
        z = c;
      }
    }
    h(b);
  }
  g(a);
}

function k(x, y) {  // x and y are context allocated
  return arguments[0] + arguments[1];
}

function sk(x, y) {  // x and y are not context allocated
  "use strict";
  return arguments[0] * arguments[1];
}

```



## ‘Context’ vs ‘Instance Field’



```
javascript
// Classic Object
function ClassicObject() {
  this.x = 10;
}
ClassicObject.prototype.getX = function () {
  return this.x; // (1)
};


// Closure Object
function ClosureObject() {
  var x = 10;
  return {
    getX: function () {
      return x; // (2)
    }
  };
}



var classic_object = new ClassicObject();
var closure_object = new ClosureObject();

// 이제 컴파일과 최적화를 유도하기 위해 루프를 돌린다.
for (var i = 0; i < 1e5; i++) classic_object.getX();
for (var i = 0; i < 1e5; i++) closure_object.getX();

```



ClassicObject 는 우리가 Class 를 쓰는 방식과 동일하다. getX 는 this.x 를 반환하기만 하므로 굉장히 예측 가능한 형태이다. 따라서 [Hidden Class 와 Inline Cache](https://hoeeeeeh.github.io/%EB%82%B4_%ED%81%90%EB%8A%94_%EC%99%9C_%EB%8A%90%EB%A6%B4%EA%B9%8C) 를 활용한 최적화가 이루어질 것이다.


ClosureObject 는 x 를 반환하는 방식에 Closure 를 이용했다.


> 아래에서 등장할 eax, edx, ecx, esi 등은 전부 CPU 레지스터 이름이다.  
> 다만, 그 이름이 특별한 의미를 가지는 건 아니고 어떻게 쓰이는지가 의미가 있다.  
> 예를 들어, ebp는 “현재 함수 스택 프레임의 기준점(프레임 포인터)” 이고 “receiver는 edx”, “property key는 ecx”, “current context는 esi”, “return/result는 eax” 로 쓰이는구나! 정도로만 받아들이면 될 것 같다.


### Classic Object


예상대로, 인스턴스 필드 로드 (1)은 비최적화 컴파일러에 의해 **인라인 캐시 호출**로 컴파일된다.


> 비최적화 컴파일러 → 아직 실행 초기다보니, 최적화되지 못했다는 의미!



```
assembly
mov eax, [ebp+0x8]     ;; 스택에서 this를 로드
mov edx, eax           ;; receiver를 edx에 둠
mov ecx, "x"           ;; 프로퍼티 이름을 ecx에 둠
call LoadIC_Initialize ;; IC 스텁 호출

```



인스턴스 필드 로드를 많이 하게 되면, 다음과 같이 Inline Cache 호출은 아래의 Stub 처럼 패치(최적화)된다.


> Stub : 자주 쓰는 일을 빠르게 처리하려고, 미리 만들어 놓는 아주 작은 머신코드 조각



```
assembly
test_b dl, 0x1              ;; receiver가 smi가 아닌 객체인지 확인
jz miss                     ;; 아니면 miss로 이동
cmp [edx-1], 0x2bb0ece1     ;; 객체의 hidden class 확인
jnz miss                    ;; 아니면 miss로 이동
mov eax, [edx+0xb]          ;; IC 히트, 고정 오프셋으로 필드 로드
ret
miss:
jmp LoadIC_Miss             ;; miss 처리 위해 런타임으로 점프

```



최적화된 코드를 보면, 인스턴스 필드를 load 하는 것은 꽤나 복잡해진다.



```
assembly
;;; @11: gap.
mov eax,[ebp+0x8] ;; this 가져오기
;;; @12: check-non-smi.
test eax,0x1 ;; smi(숫자 같은 원시값) 인지 아닌지 체크
jz 0x3080a00a        ;; deoptimization bailout 1
;;; @14: check-maps.
cmp [eax-1],0x2bb0ece1
jnz 0x3080a014       ;; deoptimization bailout 2
;;; @16: load-named-field.
mov eax,[eax+0xb]
;;; @18: return.
mov esp,ebp
pop ebp
ret 0x4

```



> 여기서 `;;; @N:` 주석은 Crankshaft의 저수준 IR(lithium)에 있는 명령을 가리킨다.


어떤 수행을 하는지 간단하게 다이어그램으로 표현하면



```
assembly
[Start]
  |
  v
this 로드 (eax = this)
  |
  v
check-non-smi: eax가 Smi(원시값)인지 가드 (객체가 아니라 원시값이면 프로퍼티 읽으면 안됨!)
  |Yes ----------------------> [DEOPT] (비최적화 코드로 되돌아감)
  |
  No
  |
  v
check-maps: eax의 hidden class(map)가 예상값인지 가드
(예상했던 hidden class 가 아니라면 고정 오프셋 쓰면 안됨!)
  |No -----------------------> [DEOPT]
  |
  Yes
  |
  v
load-named-field: eax = *(eax + offset_of_x)
  |
  v
return eax

```



> 가드 : check-non-smi, check-maps (최적화된 경로를 써도 되는지 체크하는 것!)


Crankshaft는 특정 객체 타입에 맞게 로드 지점을 특수화하고, 가드가 실패할 경우 디옵트마이즈하여 비최적화 코드로 전환하도록 한다. 본질적으로 Crankshaft는 IC 스텁을 인라인하고, 이를 개별 연산(비-smi 검사, 히든 클래스 검사, 필드 로드)으로 분해한 뒤, 느린 경로(miss)를 디옵트마이즈로 우회시킨다고 볼 수 있다.


프로퍼티가 여러 개 생길 경우, 가드와 함수 실행부를 분리할 수 있다.
예를 들어, 아래와 같이 프로퍼티가 하나 더 생겼다고 하자.



```
javascript
functionClassicObject() {
	this.x =10;
	this.y =20;
}

ClassicObject.prototype.getSum = function () {
	returnthis.x +this.y;
};

```



비최적화된 `getSum`은 IC 세 개(각 프로퍼티 로드용 두 개와 `+` 연산용 하나)를 가지지만, 최적화된 버전은 훨씬 더 간결하다.



```
assembly
;;; @11: gap.
mov eax,[ebp+0x8]
;;; @12: check-non-smi.
test eax,0x1
jz 0x5950a00a
;;; @14: check-maps.
cmp [eax-1],0x24f0ed01
jnz 0x5950a014
;;; @16: load-named-field.
mov ecx,[eax+0xb]
	;;; @18: load-named-field.
mov edx,[eax+0xf]

```



두 개의 `check-non-smi`, 두 개의 `check-maps`를 남기는 대신, 컴파일러는 공통 부분을 제거해 중복 가드를 없앴다.


x 를 로드할 수 있었다면, y 에 굳이 가드를 한 번 더 할 이유가 없다는 의미이다.



```
assembly
[Start]
  |
  v
this 로드 (eax = this)
  |
  v
check-non-smi (this가 객체인가?)
  |Fail ---------------------> [DEOPT]
  |
  Pass
  |
  v
check-maps (this의 map이 예상한 구조인가?)
  |Fail ---------------------> [DEOPT]
  |
  Pass
  |
  v
x 로드 (ecx = *(eax + offset_of_x))
  |
  v
y 로드 (edx = *(eax + offset_of_y))
  |
  v
(+ 연산 수행: ecx + edx)
  |
  v
return

```



### Closure Object


Closure 은 비최적화 컴파일러조차도 Classic Object 에 비해 훨씬 간단한 코드를 생성한다.



```
javascript
mov eax, esi            ;; 컨텍스트를 eax로 이동
mov eax, [eax + 0x17]   ;; 컨텍스트의 고정 오프셋에서 변수 로드

```



여기서 눈여겨볼 점은, 


첫째, V8은 현재 컨텍스트를 가리키기 위해 **전용 레지스터** **`esi`**를 사용한다. 프레임이나 클로저 객체에서 다시 로드할 필요를 피하기 위해서다.


둘째, 컴파일러는 컴파일 시점에 변수를 **고정 인덱스**로 해석할 수 있었기 때문에, 지연 바인딩도 없고, 룩업 오버헤드도 없으며, 인라인 캐시를 개입시킬 필요도 없다.


> 왜 Closure Object 는 고정 인덱스로 해석할 수 있고, Classic Object 는 고정 인덱스로 해석할 수 없는가?  
> → Closure Object 는 렉시컬 스코프 안의 지역 변수에 대한 캡처가 가능하다. 반면, Classic Object 는 런타임에 구조가 계속 바뀔 수 있다. (Object 에 프로퍼티가 변할 수 있기 때문)


Closure Object 의 컨텍스트 슬롯을 읽는 최적화 코드는 사실 비최적화와 크게 차이가 없다. 그냥 고정 오프셋 읽는 코드가 끝이기 때문.


## 그래서 왜? 클로저 기반(Closure Object)이 고전적인(Classic Object) OOP 보다 성능이 느려지는가


> 이 글은 2014년 정도에 쓰여진 글이라서 이때 당시 동작하던 방식과, 현재 동작 방식과는 차이가 있을 것 같습니다. Closure 와 Classic Object 의 고전적인 동작 방식에 대해서 이해하는 정도로만 읽어보면 좋을 것 같습니다.


위처럼 간단한 예제가 아닌, 조금 더 OOP스러운 예제를 살펴보자.



```
javascript
// Classic Object
function ClassicObject() {
  this.x = 10;
  this.y = 20;
}
ClassicObject.prototype.getSum = function () {
  return this.getX() + this.getY();
};
ClassicObject.prototype.getX = function () { return this.x; };
ClassicObject.prototype.getY = function () { return this.y; };


// Closure Object
function ClosureObject() {
  var x = 10;
  var y = 10;
  function getX() { return x; }
  function getY() { return y; }
  return {
    getSum: function () {
      return getX() + getY();
    }
  };
}

var classic_object = new ClassicObject();
var closure_object = new ClosureObject();

for (var i = 0; i < 1e5; i++) classic_object.getSum();
for (var i = 0; i < 1e5; i++) closure_object.getSum();


```



두 Object 모두, x + y 를 수행하는 메서드 getSum , getX, getY 를 가진 간단한 객체이다.


### Classic Object


이제 Classic Object.prototype.getSum 의 최적화된 코드를 살펴 보자.



```
assembly
;;; @11: gap.
mov eax,[ebp+0x8]
;;; @12: check-non-smi.
test eax,0x1
jz 0x2b20a00a
;;; @14: check-maps.
cmp [eax-1],0x5380ed01
jnz 0x2b20a014
;;; @16: check-prototype-maps.
mov ecx,[0x5400a694]
cmp [ecx-1],0x5380ece1
jnz 0x2b20a01e
;;; @18: load-named-field.
mov ecx,[eax+0xb]
;;; @24: load-named-field.
mov edx,[eax+0xf]


```



최적화된 코드를 보면, 위에서 프로퍼티가 한 개였을 때의 최적화 코드와 큰 차이가 없다.


다만 getX, getY 를 하지 않고 `check-prototype-maps` 라는 특이한 가드가 하나 생겼다. Crankshaft 는 getSum 을 최적화하면서, 두 호출(getX, getY) 를 인라인해서 호출 자체를 없애버렸다. 즉, 함수 호출로 점프하는게 아니라 그냥 함수 본문(return x, return y) 를 호출 위치에 써버리자. 라는 최적화이다.


그럴 수 있는 이유는, return x 와 return y 는 굉장히 예측 가능하게, 그냥 x 와 y 를 반환하는 것 밖에 없기 때문이다.( === monomorphic 하다)


또한, check-prototype-maps 도 이를 위해서 존재하는 가드이다.
getX, getY 는 prototype 에 붙어있으니까, 프로토타입의 hidden class 도 검사해서, 예상했던 히든 클래스가 맞는지 체크하는 가드인 것이다.


결론적으로 Classic Object 에서는 최적화가 비교적 공격적으로 가능하다는 것이다.


### Closure Object



```
assembly
;;; @12: load-context-slot.
mov ecx,[eax+0x1f]     ;; getX 로드
;;; @14: global-object.
mov edx,[eax+0x13]
;;; @16: global-receiver.
mov edx,[edx+0x13]
;;; @18: check-function.
cmp ecx,[0x5400a714]
jnz 0x2b20a00a
;;; @20: constant-t.
mov ecx,[0x5400a71c]
;;; @22: load-context-slot.
mov edx,[ecx+0x17]     ;; x 로드
;;; @28: load-context-slot.
mov eax,[eax+0x23]     ;; getY
;;; @30: check-function.
cmp eax,[0x5400a724]
jnz 0x2b20a014
;;; @32: constant-t.
mov ecx,[0x5400a72c]
;;; @34: load-context-slot.
mov eax,[ecx+0x1b]     ;; y 로드


```



최적화 컴파일러는 Classic Object 에 비해 공격적으로 최적화하지 못한다. (Crankshaft 기준)


getSum, getX, getY 는 같은 context 를 공유하지만, 실제로 수행하는 동작은 매번 context 를 load 한다.


또한 Crankshaft 는 정적 정보보다 타입 피드백에 더 의존했는데, 예를 들어 ClosureObject 를 두 개 만든다고 가정해보자.



```
javascript
var classic_objects = [new ClassicObject(), new ClassicObject()];
var closure_objects = [new ClosureObject(), new ClosureObject()];

for (var i = 0; i < 1e5; i++) classic_objects[i % 2].getSum();
for (var i = 0; i < 1e5; i++) closure_objects[i % 2].getSum();

```



ClassicObject 의 최적화 코드는 바뀌지 않는 반면, ClosureObject 의 getSum 최적화 코드는 더욱 품질이 떨어진다.


정적 정보(이미 쓰여진 코드)를 기준으로 getSum 은 변화하지 않는(monomorphic) 다는 것을 알 수 있지만 Crankshaft 는 런타임에 타입 피드백에 더 의존한다.


V8 은 같은 함수 리터럴에서 만들어진 모든 클로저에 대해서 비최적화 코드를 공유한다. 동시에, 인라인 캐시와 타입 피드백 수집 구조도 이 비최적화 코드에 붙어 있다. 그 결과 타입 피드백이 공유되고 섞이게 된다.


두 ClosureObject 는 같은 방식으로 생성되었기 때문에 같은 Hidden Class 를 가질 것이다. 하지만, getX getY 호출 시점에서는 호출 대상의 정체성을 수집한다. 여기서 문제가 발생하는데, 두 개의 Object 가 호출할 수 있다는 점에서 monomorphic 이 깨지고 megamorphic 호출이 된다.


![2](/upload/2025-12-14-Grokking_V8_closures_for_fun_(and_profit)_-_2014.md/2.png)_20622.png_

