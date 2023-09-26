---
layout: post
title:  "[Argocd] create application"
author: hoeh
categories: [ Argocd ]
image: assets/images/argocd.png
toc: true
---

# [Argocd] Create Application

## Create Application Error
어플리케이션 등록하면서 겪었던 에러들 위주로 작성해보려고 한다. 추후 option 들에 대해서도 공부하고 작성해야겠다.

### PATH absolute error
Path 에 / 를 입력하면 발생하는 에러이다. 절대경로로 설정하면 안되는 것 같다.

### Permission Denied
현재 사용중인 account 에 권한이 없을 때 나타나는 에러이다.  
[argocd RBAC 권한]("ArgocdRBAC.html") 을 참조해서 권한 설정을 하자

### Repo URL error
없는 레포나, private 레포일 경우 발생한다.  
private 레포의 경우 따로 credential 이 필요하다.

### Failed to unmarshal jsconfig.json:
k8s 와 관련 없는 manifest 들을 읽으려고 할 때 발생하는 문제이다.
SOURCE 의 repo 와 path 를 잘 지정해서, k8s 에 필요한 yaml 파일들만 읽도록 하면 된다.
즉, k8s 에서 필요한 pod, deploy, svc.. 등등의 yaml 을 한 폴더에 넣어두고, 해당 폴더의 경로를 Path 에 지정해주면 된다.

