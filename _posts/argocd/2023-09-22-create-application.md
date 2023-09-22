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

