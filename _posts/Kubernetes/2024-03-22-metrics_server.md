---
layout: post
title:  "[Kubernetes] Kubernetes Metrics Server"
author: hoeh
categories: [ kubernetes ]
image: assets/images/kubernetes.png
toc: true
---

# [Kubernetes] Metrics Server  
쿠버네티스에서는 Metric 이라는 것을 활용해서 Pod 들을 오토스케일링 할 수 있다고 한다. 그렇다면 metric 은 무엇일까?  

## Metric 이 뭘까
metric 은 쿠버네티스에서 "어떤 시스템의 성능이나 상태" 정도로 생각하면 될 것 같다. 예를 들어 CPU 사용량, 메모리 사용량, 네트워크/디스크 입출력 등등이 있겠다.  

## HPA(Horizontal Pod Autoscale)
Metric 을 이용해서 오토스케일링 한다는 것은 무엇일까? [공식 문서는 여기!(kubernetes_HPA)]("https://kubernetes.io/ko/docs/tasks/run-application/horizontal-pod-autoscale/")

### 스케일링
스케일링에는 수직 스케일링과 수평 스케일링, 2가지 스케일링이 있다.

#### 수직 스케일링(Vertical Scaling)
수직 스케일링은 어떤 시스템의 성능(CPU, RAM 등)을 조금 더 많이 배치해서 그 시스템의 성능을 끌어 올리는 것이다.  
내가 사용하던 컴퓨터의 램을 16GB 에서 32GB 로 업그레이드하는 것을 수직 스케일링의 예로 들 수 있다.  

#### 수평 스케일링(Horizontal Scaling)
수평 스케일링은 시스템을 복제해서 여러 시스템을 배치하는 것이다. 내가 사용하던 16GB 의 컴퓨터와 동일한 사양으로 하나 더 준비해서, 컴퓨터를 총 2대 가용하는 것을 수평 스케일링의 예로 들 수 있다.



