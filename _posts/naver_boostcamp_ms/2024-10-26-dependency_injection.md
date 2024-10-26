---
layout: post
title: "[네이버 부스트캠프 멤버쉽] DI(Dependency Injection)"
author: hoeh
categories: [javascript]
image: assets/images/nbc_membership.png
toc: true
---
Dependency Injection ( Angular 공식 문서 )  

[nest.js 공식문서](https://docs.nestjs.com/providers)를 읽어보는 도중 DI 관련한 문서에 대한 링크로 [Angular 의 공식 문서](https://www.angular.kr/guide/dependency-injection)를 걸려있었다.  
자세하게, 한국어로도 적혀있는 것 같아서 nestjs 를 쓰기 전에 꼼꼼히 읽어보려고 한다.  

# 의존성 주입은 왜 사용할까?
> Dependency Injection, or DI, is a design pattern and mechanism for creating and delivering some parts of an application to other parts of an application that require them.  

의존성 주입은 `애플리케이션의 일부(A)`를 `또 다른 곳(B)`에서 필요로 할 때, A 를 만들고 전달하는 역할을 한다.  
즉 다른 클래스에 있는 기능을 사용하고 싶을 때 의존성을 주입해주는 것이라고 생각하면 된다.  

# 의존성을 사용하는 쪽, 제공하는 쪽
단순하게 의존성을 주입 하는 것은 어떤 방식으로든 하나의 객체에 다른 클래스의 객체를 넘기기만 해도 의존성 주입이라고 부를 수 있다.
``` typescript
class Foo {
    constructor(){
        // ...
    }
}

class UsingDI {
    constructor(private injectClass)
}

class DoNotUseDI {
    constructor(){
        this.injectClass = new Foo();
    }
}

```

위의 예시대로라면 `DoNotUseDI` 객체는 직접 Foo 객체를 생성해서 사용한다.  

따라서 아주 강한 결합을 가지게 되는데, 만약 나중에 Foo 가 아니라 Bar 라는 클래스로 바꾸고 싶다고 하면
`DoNotUseDI` 클래스의 코드도 수정해야하고 테스트할 때도 꼭 Foo 객체를 넣어줘야 하기 때문에 복잡해지게 될 것이다.  

반면 `UsingDI` 클래스는 생성자로 어떤 객체를 넘기느냐에 따라, 그 객체에 결합이 생긴다. 위의 예시에 비해 더 동적으로 의존성이 생긴다고 볼 수 있다.  
따라서 Foo 의존성을 주입했다가, 나중에는 Bar 객체를 주입할 수도 있고, 또 나중에는 어떤 객체라도 덕타이핑에 문제가 없다면 (일단은) 주입할 수 있을 것이다.

또한 테스트할 때도 굳이 실제 객체를 넣어줄 필요 없이 간단한 모킹 객체를 넣어줄 수도 있을 것이다.

다만 여기서 알아두어야 할 점은 의존성은 사용하는 쪽(주입 당하는 쪽) 과 제공하는 쪽(주입하는 쪽) 이 있다는 것을 알아두어야 한다.  

이때 `injector` 객체는, 미리 생성된 프로바이더(의존성을 제공당할 수 있는 클래스) 대로 의존성 객체를 생성하고 캐싱해둔다.  
또한 인젝터는 의존성 객체들을 싱글톤 인스턴스로 관리한다.  

인젝터는 컴포넌트의 계층에 따라 다른 인젝터가 생성되기 때문에 인젝터 별로 다른 의존성 객체를 가지고 있다. 
따라서 컴포넌트 계층이 달라진다면 의존성 객체가 싱글톤 객체라고 해도 같은 인스턴스를 참조하고 있다고 할 수 없다.  

## 컴포넌트 계층이 무슨 말일까? 
NestJS 의 컴포넌트는 크게 `모듈`, `프로바이더`, `컨트롤러`, `서비스` 등으로 계층을 나눌 수 있다.  

``` typescript
@Module({
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}

@Module({
  imports: [CatsModule],
  controllers: [DogsController],
})
export class DogsModule {}

```
위의 예시처럼 모듈 계층에는 프로바이더와 서비스 계층 등이 존재할 수 있다.  
이처럼 모듈 계층에서 인젝터가 존재하고, 그 하위의 프로바이더와 서비스 계층에도 각각 인젝터가 존재한다.  

만약 프로바이더 계층에서 의존성 주입을 하려고 한다면, 프로바이더 계층의 인젝터가 해당 의존성 객체를 가지고 있어야 한다.  

그런데 만약 프로바이더 계층의 인젝터에 의존성 객체가 없다면 부모 계층(예시에서는 모듈 계층)의 인젝터를 사용할 수 있다.
이렇게 `계층적 인젝터 구조` 를 통해 NestJS 는 의존성 주입을 하고 있다.

