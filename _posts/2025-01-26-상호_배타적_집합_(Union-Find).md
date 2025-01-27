---
layout: post
current: post
cover: "assets/images/cover/algorithm.png"
navigation: True
title: "상호 배타적 집합 (Union-Find)"
date: 2025-01-26 07:18:00
tags:
    - [Algorithm, ]
class: post-template
subclass: 'post'
author: 
  - "hoeeeeeh"
categories:
    - [CS, ]
---

상호 배타적이라는 것은, 공통 원소가 없는 것이다.


그렇다면 상호 배타적 집합이라는 것은 공통 원소가 없은 부분 집합으로 이루어진 집합이다.


상호 배타적 집합을 Union-FInd 라고도 부르는 이유는, 이러한 집합을 만드는데 아래와 같은 Union, Find 과정을 수행하기 때문이다.

1. 처음 상태는 각각 자기 자신만을 포함한 집합을 생성한다. (초기화 단계)
2. 이제 두 원소 a, b 가 주어질 때 이들이 속한 두 집합을 하나로 합친다. (Union 연산)
3. 어떤 원소 a 가 주어질 때, 이 원소가 속한 집합을 찾는다. (Find 연산)

예를 들어 1부터 n 까지의 숫자 중에서 2로 나눈 나머지에 대해 상호 배타적 집합을 만든다고 해보자.


![0](/upload/2025-01-26-상호_배타적_집합_(Union-Find).md/0.png)_2로 나눈 나머지에 따른 집합_


위의 그림과 같이 트리 구조로 원소들을 묶으면서 하나의 부분 집합을 표현할 수 있다.


## Union


Union 과정은 이처럼 두 개의 트리 구조를 하나로 합치는 과정을 의미한다.


예를 들어, 왼쪽의 2로 나눈 나머지가 0인 트리가 합쳐지기 전을 한 번 생각해보자.


![1](/upload/2025-01-26-상호_배타적_집합_(Union-Find).md/1.png)_2로 나눈 나머지가 0인 집합 2, 6 이 아직 합쳐지지않은 상태_


아직 2 와 6 이 같은 트리로 합쳐지지 않은 상황이다.


여기서 우리는 2와 6은 짝수이기 때문에 같은 집합에 속한다는 것을 알고있다.


따라서 Union 과정을 거쳐야하고 6의 부모 노드를 2로 지정함으로써 맨 처음의 그래프와 같이 하나의 트리 구조로 만들 수 있는 것이다.


## Find


기본적으로 Find 과정은 부모노드를 타고 올라가면서, 최종적으로는 해당 집합의 루트 노드를 찾으면 된다.


루트 노드가 집합을 대표하는 격이 된다.


![2](/upload/2025-01-26-상호_배타적_집합_(Union-Find).md/2.png)_2로 나눈 나머지가 0인 집합_


예를 들어, 위의 트리에서 4와 12가 같은 집합에 속해있는지 어떻게 알 수 있을까?


4와 12 각각 루트노드가 나올때까지 부모노드를 타고 올라가보면 된다.


그렇게 더이상 올라갈 수 있는 노드가 없을 때, 즉 루트 노드까지 왔을 때 4의 루트노드와 12의 루트노드를 비교해보면 된다.


여기서는 둘 다 루트노드가 2로 같기 때문에 같은 집합에 속하는 것이다.


## 최적화를 하지 않은 구현


우선 Find 연산에서 봤듯이, 부모 노드에 대한 정보가 반드시 필요하다.


반대로 부모 노드에서 자식 노드로 내려갈 일은 없다.


따라서 Union-FInd 자료구조를 구현하기 위해서는 부모 노드에 대한 정보를 저장할 수 있는 자료구조를 선택하면 된다.


그래서 최적화를 고려하지 않은, 굉장히 간단한 UnionFind 를 한 번 구현해보자.



```
javascript
class UnionFind {
    constructor(size){
        this.parent = Array.from({ length: size }, (_, idx) => idx);
    }
    
    union(a, b){
        const root_a = this.find(a);
        const root_b = this.find(b);
        
        // 같은 집합에 속해있지 않을 경우
        // 최적화 없는 버전!
        if(root_a !== root_b) this.parent[root_b] = root_a;
    }
    
    find(node){
        // 경로 압축 최적화가 없는 버전!
        if(this.parent[node] !== node) return this.find(this.parent[node]);
        return node
    }
}

```



우선 find 메서드부터 개선점을 찾아보자.


### Find 개선하기 (경로 압축)


![3](/upload/2025-01-26-상호_배타적_집합_(Union-Find).md/3.png)_초기화 단계_


우선 2,4,6,8,10,12,14 가 초기화 단계로, 각자 자기 자신을 가지고 있는 집합인 상황에서부터 시작해보자.


여기서 별 생각 없이 2와 4를 Union 하면 어떻게 될까?


![4](/upload/2025-01-26-상호_배타적_집합_(Union-Find).md/4.png)_2와 4를 Union_


그렇다면 이번에 4와 6을 union 해보자.


![5](/upload/2025-01-26-상호_배타적_집합_(Union-Find).md/5.png)_4 와 6을 Union_


이렇게 보아하니 아마도 최종적으로 이런 트리가 생성될 것 같다.


![6](/upload/2025-01-26-상호_배타적_집합_(Union-Find).md/6.png)_일자로 쭉~_


이렇게 되면 루트 노드를 찾아야하는 find 연산의 특성 상, 트리의 레벨에 직접적으로 영향을 받을 수 밖에 없다. 


그렇다면 find 를 최적화하기 위해서 트리의 레벨을 줄여야하니까, 이런 그래프가 가장 좋은게 아닐까?


![7](/upload/2025-01-26-상호_배타적_집합_(Union-Find).md/7.png)_레벨을 1로 최적화한 트리_


이제 어느 노드에서 find 메서드를 실행해도 바로 루트 노드가 나오게 된다.


그렇다면 어떻게 이런 식으로 최적화할 수 있을까?



```
javascript
   	// 경로 압축 최적화가 없는 버전!
    find(node){
        if(this.parent[node] !== node) return this.find(this.parent[node]);
        return node
    }

    // 경로 압축 최적화
    find(node){
        if(this.parent[node] !== node) {
            this.parent[node] = this.find(this.parent[node]);
            return this.parent[node];
        }
        return node
    }

```



맨 처음부터 완벽하게 최적화된 트리를 얻을 수는 없다. 다만 find 를 한 번 하고나면 최적화되도록 구현할 수는 있다.


경로 압축을 하지 않는 경우는 루트 노드를 찾으면 그대로 루트 노드를 반환했다.


반면 경로 압축을 하는 경우에는 루트 노드를 찾았을 때, 루트 노드를 찾기 전까지 거쳐온 노드들의 부모 노드를 루트 노드로 갱신하는 과정이 있다.


### Union 개선하기 (union by rank)


![8](/upload/2025-01-26-상호_배타적_집합_(Union-Find).md/8.png)_레벨이 1, 2 인 트리_


위의 두 트리를 union 시킨다고 해보자.


먼저 왼쪽의 레벨2 트리에, 오른쪽 트리의 레벨 1을 합치면 아래와 같은 트리가 된다.


![9](/upload/2025-01-26-상호_배타적_집합_(Union-Find).md/9.png)_레벨이 1인 트리를, 레벨이 2인 트리의 자식으로 합치기_


이 경우에는 기존의 레벨이 2인 트리와 동일하게 레벨이 2로 유지됨을 볼 수 있다.


이번에는 방향을 거꾸로 해서 합쳐보자.


![10](/upload/2025-01-26-상호_배타적_집합_(Union-Find).md/10.png)_레벨이 2인 트리를, 레벨이 1인 트리의 자식으로 합치기_


기존의 레벨이 1인 트리의 레벨이 2로 늘어나는 모습을 볼 수 있다.


따라서 트리의 레벨이 늘어나는것을 최소화하기 위해서는 레벨이 높은 트리에, 레벨이 낮은 트리를 합치는 것이 좋다.


이런 방식을 랭크에 의한 합치기(union by rank) 라고 한다.


그래서 최적화를 해보면,



```
javascript
    union(a, b) {
        const root_a = this.find(a);
        const root_b = this.find(b);

        if (root_a !== root_b) {
            // 랭크를 비교하여 더 낮은 랭크를 높은 랭크의 자식으로 연결
            if (this.rank[root_a] > this.rank[root_b]) {
                this.parent[root_b] = root_a;
            } else if (this.rank[root_a] < this.rank[root_b]) {
                this.parent[root_a] = root_b;
            } else {
                // 랭크가 같다면 root_b를 root_a의 자식으로 연결하고 root_a의 랭크를 증가
                this.parent[root_b] = root_a;
                this.rank[root_a]++;
            }
        }
    }

```



## 최적화를 한 구현(union by rank, 경로 압축)



```
javascript
class UnionFind {
    constructor(size) {
        this.parent = Array.from({ length: size }, (_, idx) => idx);
        this.rank = Array(size).fill(0); // 초기 랭크는 모두 0
    }

    union(a, b) {
        const root_a = this.find(a);
        const root_b = this.find(b);

        if (root_a !== root_b) {
            // 랭크를 비교하여 더 낮은 랭크를 높은 랭크의 자식으로 연결
            if (this.rank[root_a] > this.rank[root_b]) {
                this.parent[root_b] = root_a;
            } else if (this.rank[root_a] < this.rank[root_b]) {
                this.parent[root_a] = root_b;
            } else {
                // 랭크가 같다면 root_b를 root_a의 자식으로 연결하고 root_a의 랭크를 증가
                this.parent[root_b] = root_a;
                this.rank[root_a]++;
            }
        }
    }

    find(node) {
        if (this.parent[node] !== node) {
            this.parent[node] = this.find(this.parent[node]);
        }
        return this.parent[node];
    }
}


```


