---
layout: post
title:  "[Kubernetes] Kubernetes & Docker & Containerd"
author: hoeh
categories: [ kubernetes ]
image: assets/images/kubernetes.png
toc: true
---

# [Kubernetes] Kubernetes 의 버전에 따른 Docker / Containerd
이전에 프로젝트를 하면서 사용했던 쿠버네티스의 버전은 1.22 버전으로 쿠버네티스에서 docker 를 지원하던 버전이였다. 하지만 쿠버네티스가 1.24 버전 이상으로 올라가면서부터는 도커를 지원하지 않게 되었고, 이제는 도커와 작별하고 containerd를 사용해야 한다.  

따라서 이전에 쿠버네티스와 도커를 설치하던 스크립트에서 containerd 를 설치하는 스크립트로 변경해야 한다.

``` bash
# install Extra Packages for Enterpries Linux System, Docker
sudo apt-get install epel-release -y
sudo apt-get install net-tools -y
sudo apt-get update && sudo apt-get -y upgrade

# Install Kubernetes Package
# Add Google Cloud Public GPG Key to apt
sudo curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -

# Add the repository to Apt sources:
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /" | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update

#remove conflicting packages with containerd, runc
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done


# Update APT Package and upgrade all package
# flag -y means all yes
sudo apt-get update && sudo apt-get -y upgrade

# make log dir
sudo mkdir -p logs

# Install containerd 1.6.30
echo "Install containerd 1.6.30"
sudo wget -o logs/containerd.log https://github.com/containerd/containerd/releases/download/v1.6.30/containerd-1.6.30-linux-amd64.tar.gz
sudo tar Cxzvf /usr/local containerd-1.6.30-linux-amd64.tar.gz

echo "containerd systemd"
sudo wget -o logs/containerd-systemd.log -P /usr/local/lib/systemd/system https://raw.githubusercontent.com/containerd/containerd/main/containerd.service
sudo systemctl daemon-reload
sudo systemctl enable --now containerd

# Install Runc
echo "Install Runc"
sudo mkdir -p /usr/local/sbin/runc
sudo wget -o logs/runc.log https://github.com/opencontainers/runc/releases/download/v1.1.12/runc.amd64
sudo install -m 755 runc.amd64 /usr/local/sbin/runc

# Install CNI plugins
echo "Install CNI plugins"
sudo mkdir -p /opt/cni/bin
sudo wget -o logs/cni-plugins.log https://github.com/containernetworking/plugins/releases/download/v1.4.1/cni-plugins-linux-amd64-v1.4.1.tgz
sudo tar Cxzvf /opt/cni/bin cni-plugins-linux-amd64-v1.4.1.tgz

# Install Kubernetes - kubelet, kubectl, kubeadm
# order : let -> ctl -> adm
echo "Install kubelet, kubectl, kubeadm"
sudo apt-get install -y kubelet=1.29.3-1.1 kubectl=1.29.3-1.1 kubeadm=1.29.3-1.1

# hold kubelet, kubectl, kubeadm version
echo "hold kubelet, kubectl, kubeadm"
sudo apt-mark hold kubelet kubectl kubeadm

echo "sleep 3 sec"
sleep 3

sudo apt-get update && sudo apt-get upgrade

sudo systemctl daemon-reload
sudo systemctl restart kubelet

echo "sleep 1 sec"
sleep 1
```

간략히 차이점에 대해 설명하자면, 쿠버네티스의 버전을 1.29.3-1.1 로 업그레이드 했다. 
> 1.22 이하 버전에서는 상관이 없었는지 모르겠는데 반드시 `kubelet` -> `kubectl` -> `kubeadm` 순서로 깔아줘야 한다. kubeadm 이 kubectl 을 필요로 하기 때문이다.  

쿠버네티스 1.29 버전에 상응하는 containerd 버전을 찾아야 하는데, [containerd-version-release](https://containerd.io/releases/) 에서 확인해볼 수 있다.  

![containerd-k8s-version]({{ site.url }}{{ site.baseurl }}/assets/images/containerd-k8s-version.png)

아무래도 버전이 낮은게 더 안정성이 높지 않을까? 라는 생각에 쿠버네티스 1.29 버전에 맞는 containerd 버전 중에서 1.6.30 버전을 선택했다. 설치 방법은 containerd 의 공식 홈페이지를 참조했다. [Getting started with containerd](https://github.com/containerd/containerd/blob/main/docs/getting-started.md)