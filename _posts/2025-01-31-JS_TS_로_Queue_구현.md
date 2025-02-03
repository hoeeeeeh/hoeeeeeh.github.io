---
layout: post
current: post
cover: "assets/images/cover/linux.png"
navigation: True
title: "JS TS 로 Queue 구현"
date: 2025-01-31 07:42:00
tags:
    - [Algorithm, JavaScript, TypeScript, ]
class: post-template
subclass: 'post'
author: 
  - "hoeeeeeh"
categories:
    - [CS, ]
---

# Object(or Map) 을 활용한 Queue 



```
javascript
class ObjectQueue {
    item = {};
    start = 0;
    end = 0;

    constructor() {}

    enqueue(value){
        this.item[this.end] = value;
        this.end += 1;
        return this.end - 1;
    }
    
     // 큐가 비어 있을 때는 undefined, 그렇지 않은 경우 0 번째 원소를 반환
    dequeue(){
        if(this.isEmpty()) return undefined;
        const value = this.item[this.start];
        delete this.item[this.start];
        this.start += 1;
        return value;
    }

    isEmpty(){
        if(this.start === this.end) {
            this.start = 0;
            this.end = 0;
            return true;
        }
        return false;
    }
}

```



Object 나 Map 을 활용해서 key-value 형식으로 저장한다.


다만 Object, Map 이 사용하는 메모리가 다른 방법에 비해 많아, 메모리 효율은 다소 떨어질 수 있다.


# LinkedList 를 활용한 Queue



```
javascript
class Node {
    value = null;
    next = null
    constructor(value) {
        this.value = value;
    }
}

class LinkedListQueue {
    front = null;
    rear = null;
    length = 0;

    enqueue(value){
        const newNode = new Node(value);
        // rear 가 null 인, 초기 상황일 때
        if(!this.rear) {
            this.front = this.rear = newNode;
        } else {
            // 현재 맨 마지막 노드의 다음 노드를 newNode 로 지정하고, newNode 를 마지막 노드로 지정
            this.rear.next = newNode;
            this.rear = newNode;
        }
        this.length += 1;
    }

    dequeue() {
        if(!this.front) {
            return undefined;
        }
        const value = this.front.value;
        this.front = this.front.next;

        // 하나를 dequeue 하고 Queue 에 아무것도 없을 때
        if(!this.front) {
            this.rear = null;
        }
        this.length -= 1;

        return value;
    }
}

```



# 원형 큐



```
typescript
class CircularQueue<T> {
    private readonly items: (T | null)[];
    private readonly capacity: number;
    private front: number;
    private rear: number;
    private size: number;

    constructor(capacity: number = 8) {
        this.capacity = capacity;
        this.items = new Array(capacity).fill(null);
        this.front = 0;
        this.rear = 0;
        this.size = 0;
    }

    enqueue(value: T) {
        if (this.isFull()) return false;
        this.items[this.rear] = value;

        // 여기서 만약 capacity 를 넘어가면, 0부터 시작해서 front 까지 다시 사용
        this.rear = (this.rear + 1) % this.capacity;
        this.size++;
        return true;
    }

    dequeue() {
        if (this.isEmpty()) return undefined;
        const value = this.items[this.front];
        this.items[this.front] = null;
        
         // 여기서 만약 capacity 를 넘어가면, 0부터 시작해서 rear 까지 다시 사용
        this.front = (this.front + 1) % this.capacity; 
        this.size--;
        return value;
    }

    isEmpty() {
        return this.size === 0;
    }

    isFull() {
        return this.size === this.capacity;
    }
}


```



원형 큐는 고정 사이즈를 정하고, 고정 사이즈만큼의 배열을 순환하면서 사용할 수 있다.


여기서 만약 배열이 꽉 찼는데도 enqueue 가 일어나면 문제가 된다. 배열에 이미 값이 존재하는데 그 위에 덮어쓰게 되기 때문이다.


따라서 원형큐가 가득 찼으면 배열을 그 순간에 늘리거나 해야한다.


이 과정에서 기존 배열을 복사해야해서 시간이 많이 소요된다.


이렇게 보면 원형큐는 dequeue 보다 enqueue 가 월등히 많은 경우, 썩 좋지 못할 것 같다.


# 원형 덱(deque, Double Ended Queue)



```
typescript
class CircularDeque<T> {
    private items: (T | null)[];
    private capacity: number;
    private front: number;
    private rear: number;
    private size: number;

    constructor(capacity: number = 8) {
        this.capacity = capacity;
        this.items = new Array(capacity).fill(null);
        this.front = 0;
        this.rear = 0;
        this.size = 0;
    }

    enqueueFront(value: T) {
        if (this.isFull()) this.resize();
        this.front = (this.front - 1 + this.capacity) % this.capacity;
        this.items[this.front] = value;
        this.size++;
    }

    enqueueBack(value: T) {
        if (this.isFull()) this.resize();
        this.items[this.rear] = value;
        this.rear = (this.rear + 1) % this.capacity;
        this.size++;
    }

    dequeueFront() {
        if (this.isEmpty()) return undefined;
        const value = this.items[this.front];
        this.items[this.front] = null;
        this.front = (this.front + 1) % this.capacity;
        this.size--;
        return value as T;
    }

    dequeueBack() {
        if (this.isEmpty()) return undefined;
        this.rear = (this.rear - 1 + this.capacity) % this.capacity;
        const value = this.items[this.rear];
        this.items[this.rear] = null;
        this.size--;
        return value as T;
    }

    peekFront() {
        return this.isEmpty() ? undefined : (this.items[this.front]);
    }


    peekBack() {
        return this.isEmpty() ? undefined : (this.items[(this.rear - 1 + this.capacity) % this.capacity]);
    }

    isEmpty() {
        return this.size === 0;
    }

    isFull() {
        return this.size === this.capacity;
    }

    getSize() {
        return this.size;
    }

    private resize() {
        const newCapacity = this.capacity * 2;
        const newItems = new Array(newCapacity).fill(null);

        for (let i = 0; i < this.size; i++) {
            newItems[i] = this.items[(this.front + i) % this.capacity];
        }

        this.items = newItems;
        this.capacity = newCapacity;
        this.front = 0;
        this.rear = this.size;
    }
}


```



원형 큐와 큰 차이는 없다.


여기서 원형 큐나, 원형 데크나 resize 부분을 알아둬야한다.


## Resize



```
typescript
    private resize() {
        const newCapacity = this.capacity * 2;
        const newItems = new Array(newCapacity).fill(null);

        for (let i = 0; i < this.size; i++) {
            newItems[i] = this.items[(this.front + i) % this.capacity];
        }

        this.items = newItems;
        this.capacity = newCapacity;
        this.front = 0;
        this.rear = this.size;
    }

```



resize 부분을 보면 capacity 를 2배(혹은 원하는 만큼) 늘리고나서


for 문 내부에서 아이템을 복제 및 정렬을 한다.


언뜻 생각해보면 capacity 만 2배로 복제해도 되지 않을까 싶지만 기존 배열의 순서를 정렬해서 새로운 배열에 적용해야만 한다.


예시를 들어서 살펴보면,


### 기존 상태 (1,2,3,4 덱에 삽입)



```
typescript
Index:      0      1      2      3
Items:    [ 1  ] [ 2  ] [ 3  ] [ 4  ]  
Front → index 0
Rear  → index 0 (다음 삽입 위치)

```



### 1, 2 dequeue



```
typescript
Index:      0      1      2      3
Items:    [ X  ] [ X  ] [ 3  ] [ 4  ]  
Front → index 2
Rear  → index 0 (다음 삽입 위치)

```



### 5, 6 enqueue



```
typescript
Index:      0      1      2      3
Items:    [ 5  ] [ 6  ] [ 3  ] [ 4  ]  
Front → index 2
Rear  → index 2 (가득 참)

```



### 7 enqueue (Resize 실행)


단순히 Capacity 만 늘리는 경우(잘못된 경우)


	
```
typescript
	Index:      0      1      2      3      4      5      6      7
	Items:    [ 5  ] [ 6  ] [ 3  ] [ 4  ] [ X  ] [ X  ] [ X  ] [ X  ]
	Front → index 2
	Rear  → index 4
	
```



3 → 4→ 5→ 6 순서가 아니라, 5 → 6 → 3→ 4 가 되어버린다.


따라서 3,4,5,6 순서로 정렬시켜주는 과정이 필요


resize 및 정렬 과정(올바른 경우)



```
typescript
Index:      0      1      2      3      4      5      6      7
Items:    [ 3  ] [ 4  ] [ 5  ] [ 6  ] [ X  ] [ X  ] [ X  ] [ X  ]
Front → index 0
Rear  → index 4

```


