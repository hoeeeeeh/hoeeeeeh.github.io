---
layout: post
title:  "[Kubernetes] metric-server-setting "
author: hoeh
categories: [ kubernetes ]
image: assets/images/kubernetes.png
toc: true
---

# [Kubernetes] metric-server-setting
`High A metric server`  
```
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/high-availability-1.21+.yaml
```  

`kubectl edit deployments.apps -n kube-system metrics-server`
```
- --kubelet-insecure-tls=true                
- --kubelet-preferred-address-types=InternalIP   

....

      dnsPolicy: ClusterFirst
      hostNetwork: true # << 추가
      nodeSelector:
        kubernetes.io/os: linux
```

`sudo vim /etc/kubernetes/manifests/kube-apiserver.yaml`
```
--enable-aggregator-routing=true
```