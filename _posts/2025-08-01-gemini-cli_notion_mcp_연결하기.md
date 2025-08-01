---
layout: post
current: post
cover: "assets/images/cover/notion.png"
navigation: True
title: "gemini-cli notion mcp 연결하기"
date: 2025-08-01 10:25:00
tags:
    - [mcp, ]
class: post-template
subclass: 'post'
author: 
  - "hoeeeeeh"
categories:
    - [Blog, ]
---

프로젝트의 루트에 간단하게 .gemini/settings.json 에 아래와 같이 코드를 작성하면 notion mcp 가 추가되어야 한다.



```
typescript
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer ntn_<key>\", \"Notion-Version\": \"2022-06-28\" }"
      }
    }
  }

```



근데 내 경우에는 계속 gemini-cli 가 notion mcp 에 disconnected 가 되어 있어서 로그를 봤더니, `TypeError: fieldValue.toUpperCase is not a function`  라는 에러가 발생하고 있었다.


구글링을 해보니까 같은 이슈가 이미 올라와있어서 확인해봤다.


> 원인은 genai v1.8.0 쪽의 버그인데, 1.9.0 버전을 사용하면 해결할 수 있습니다.


	관련된 MR은 있지만, mcp를 사용할 수 없게 만드는 문제는 버전 업그레이드만으로 해결될 것으로 보입니다.


[https://github.com/google-gemini/gemini-cli/issues/1481](https://github.com/google-gemini/gemini-cli/issues/1481)


genai 의 버전을 1.9.0 으로 올리면 해결된다..!


> npx [https://github.com/google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)


로 버전을 업그레이드 해주자.

