[![solution](https://flat.badgen.net/badge/solution/available/green?icon=github)](webapp)
[![demo](https://flat.badgen.net/badge/demo/deployed/blue?icon=github)](https://sap-samples.github.io/ui5-mdc-json-tutorial/ex5/dist)
# Exercise 9: Use the view cache
Yay, make it fast

## Step 1: Add a cache key
* add the cache configuration in the typed view
```typescript
            cache: {
                keys: [this.calculateCacheKey()]
            }
````

and also a mock function for the cache invalidation
```typescript
    // simple cache key calculation as an example
    private calculateCacheKey(): string {
        const month = new Date().getMonth();
        return `cacheKeyMonth${month}`;
    }
```

## Step 2: Check it
* see the application tab in the debugger
* go to indexeddb
* find the things there

## Conclusion
Bravo! 🎉