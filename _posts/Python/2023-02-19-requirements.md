---
layout: post
title:  "[Python] Requirements"
author: hoeh
categories: [ python ]
image: assets/images/python.png
---

# Requirements

dockerfile 을 작성하다가 

```zsh
[receipt-backend 7/7] RUN pip install -r requirements.txt:                                                                                                                                                                                                                   
#0 0.376 Processing /private/var/folders/nz/j6p8yfhx1mv_0grj5xl4650h0000gp/T/croot-t_zs64wy/anyio_1644482593257/work/dist                                                                                                                                                       
#0 0.378 ERROR: Could not install packages due to an OSError: [Errno 2] No such file or directory: '/private/var/folders/nz/j6p8yfhx1mv_0grj5xl4650h0000gp/T/croot-t_zs64wy/anyio_1644482593257/work/dist'                                                                      
#0 0.378 
```

와 같은 에러 났다.

확인해보니 requirements 가 버전이 아니라, 

```zsh
pkg1 @ file:///tmp/tmp44ir_jik
pkg2 @ file:///tmp/tmp5pijtzbq
```

이런식으로 작성이 되어 있었다. 


```zsh
pip list --format=freeze > requirements.txt
```

처럼 version 이 나오는 포맷을 지정해주어야한다.



