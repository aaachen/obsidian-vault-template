---
up:
  - "[[Themed Logs]]"
created: 2023-12-13
modified: 2025-03-13
tags:
  - log/pinned
---

`BUTTON[append-log]`
# Logs

## [[2025-02-21 - Fri Feb 21]]

[[NodeJS]] [event loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop
	- https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking
- mainly, it offloads concurrency IO to OS
- there's the different phases for each type of async requests
- synchronous code in the main thread finishes synchronously
- synchronous code in async code will execute in the corresponding phase of event loop, depending on the async code nature (ie timer, a network request IO, etc)
- There's also apparently something called micro task/macro task. Promise is micro and other IO in event loop is macro?

## [[2024-03-12 - Tue Mar 12]]

- [[Amazon Lambda]] concurrency
	- One lambda execution environment handles one request - [illustration](https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html#understanding-concurrency)
	- Concurrency is the number of in-flight requests simultaneously being processed
		- > In Lambda, concurrency is the number of in-flight requests that your function is handling at the same time. - [source](https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html#calculating-concurrency)
- [[Amazon Lambda Execution Environment]] 
	- [life cycle phase doc](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html) - init, invoke, shutdown
	- `Init`: cold start + init code to setup the `execution environment`
		- > In this phase, Lambda creates or unfreezes an execution environment with the configured resources, downloads the code for the function and all layers, initializes any extensions, initializes the runtime, and then runs the function’s initialization code (the code outside the main handler).
		- [cold start](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html#cold-start-latency) - download code, starts the environment
			- [starts the environment](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html#runtimes-lifecycle-ib) -start all extension, bootstrap runtime
		- init code - any code outside of main handler
			- i.e. global variables stored in heap
			- In general, avoid global variable that's context specific
	- `Invoke` - invokes the function handler
		- > After invocation completes, the execution environment is frozen (i.e. it is retained for a period of time). If another request arrives during this time, lambda can reuse the environment. This second request typically finishes more quickly, since the execution environment is already fully set up. This is called a “warm start”.
			- If the function crashes, then lambda basically does the shutdown, which next invocation needs to re-init
		- The same global variable is used here!
	- `Shutdown` - Triggered if the lambda function does not receive any invocations for a period of time
		- Lambda shuts down the runtime, alerts the extensions to let them stop cleanly, and then removes the environment
	- ! It is best to *not* have context specific things or persistent connections stored in global variable
		- you cannot attach any life cycle hooks like SIGTERM in the function code for global variable, that's just anti-pattern - [perplexity](https://www.perplexity.ai/search/with-node-js-and-aws-lambda-i-M1xYAxY3QV6yNd4pq.djrg), [stack overflow](https://stackoverflow.com/a/56564926)
		- if there's any lifecycle event hooks you want to act on, you could do it in [lambda extension](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-extensions-api.html) - there're separate processes

