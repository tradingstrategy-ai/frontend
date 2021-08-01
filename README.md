# Capitalgram quantative dataset website

This is a source code for [SvelteKit website](https://kit.svelte.dev/docs) based website that shows real-time information on available [Capitalgram datasets](https://mightyeagle.capitalgram.com/datasets).

## Running

```shell
npm run dev
```

## Running on production

Hack solution:

```shell
node_modules/.bin/svelte-kit dev --port 80 --host <your public IP>
```

[Port troubleshooting](https://www.tecmint.com/find-out-which-process-listening-on-a-particular-port/)

```shell
netstat -ltnp | grep -w ':80' 
```

## More information

* https://docs.capitalgram.com/