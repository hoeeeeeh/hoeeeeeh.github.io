---
layout: post
title:  "[Ansible] 앤서블 Managed Node ssh 설정"
author: hoeh
categories: [ ansible ]
image: assets/images/ansible.png
toc: true
---

# [Ansible] Managed Node 에서의 ssh 설정

## SSH
[Ansible 공식 문서](https://docs.ansible.com/ansible/latest/index.html)  
[Building Ansible Inventories](https://docs.ansible.com/ansible/latest/inventory_guide/index.html)  

1. 우선 테스트로 진행할 Worker Node 1 에, ansible 이 ssh로 접근해서 사용할 사용자 계정을 하나 만들어주었다.
``` zsh
$ sudo adduser ansible
$ sudo passwd ansible
```

2. 이후 ansible 계정이 sudo 권한을 비밀번호 없이 사용할 수 있도록 설정했다.


``` zsh
$ sudo visudo

...
# User privilege specification
root    ALL=(ALL:ALL) ALL
ansible ALL=(ALL:ALL) NOPASSWD:ALL
...
```

3. Control Node 에 sshpass 를 설치한다.
```
$ sudo apt-get install sshpass
```

4. Control Node 에서 공개키/개인키 를 생성한다.  
공개키/ 개인키는 `/home/{user}/.ssh` 에 성생된다.
```
$ sudo ssh-keygen
```

5. 공개키/개인키를 Managed Node 에 보내기
```
$ ssh-copy-id -p {port} ansible@{ip_address}
```
Managed Node 에서 ssh 포트를 바꾸었기 때문에 -p 옵션을 사용했다.

