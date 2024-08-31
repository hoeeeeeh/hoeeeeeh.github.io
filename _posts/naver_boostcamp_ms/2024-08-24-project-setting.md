---
layout: post
title: "[네이버 부스트캠프 멤버쉽] 프로젝트 셋팅"
author: hoeh
categories: [javascript]
image: assets/images/nbc_membership.png
toc: true
---

# Project Setting

## Global

global 옵션은

## devDependencies

devDependencies 는 개발할 때만 필요하고 실제 런타임에서는 필요 없는 dependency 를 의미한다.
(`개발용`)

### TS, ESLint, Prettier

코드 품질과 괸련된 것들을 확인하는 도구를 `린터(Linter)` 라고 부르는데, 자바스크립트에서 사용하는 대표적인 린터가 ESLint 이다.  
문법 오류를 감지하거나, 코드 품질 향상, 일관성 유지 등을 위해 적용하는데 나만의 컨벤션을 정립하기 전까지는 airbnb 스타일을 따라가보려고 한다.

```bash
npm install -D eslint typescript

# airbnb 종속 패키지 설치하기
# 이렇게 종속 패키지를 한 번에 설치하면 react 관련 eslint 패키지도 설치가 되는데,
# react 를 안쓴다면 아래의 명령어로 설치하자.
npx install-peerdeps --dev eslint-config-airbnb


# React 관련 패키지 없음
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-airbnb-base eslint-plugin-import eslint-plugin-node

```

이후에 `.eslintrc.json` 파일로 셋팅을 하자.

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": ["airbnb-base", "plugin:@typescript-eslint/recommended", "plugin:node/recommended"],
  "plugins": ["@typescript-eslint", "node"],
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module"
  },
  "rules": {
    "node/no-unsupported-features/es-syntax": ["error", { "ignores": ["modules"] }],
    "node/no-missing-import": "off",
    "node/no-unpublished-import": "off",
    "import/no-unresolved": "off",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      }
    ]
  },
  "settings": {
    "import/resolver": {
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx"]
      }
    }
  }
}
```

```bash
npm install -D @types/express
```

### Prettier

Prettier 는 코드 형식을 자동으로 정리해주는 Formatter 의 역할을 한다.
prettier 셋팅에 맞게 자동으로 정리해주기 때문에 코드의 가독성과 일관성을 챙길 수 있다.

```

```

### ts-node

```bash
npm install -D ts-node
```
