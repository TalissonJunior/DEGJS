## DEGJS

An library to export all the data from your database

### INSTALL

```
npm install DEGJS --save
```

### USAGE
``` js
document.addEventListener("DOMContentLoaded", async function(){
    // Handler when the DOM is fully loaded

    var deg = DEG.init({
        serverDomain: "https://localhost:5001"
    });

    // Extract collection from data object;
    const { collection }  = deg.data();

    // List all collections availables
    const collections = await deg.collections();
    console.log(collections);
    
    deg.process(
        collection("COLLECTION1", ["PROPERTY1", "PROPERTY2"]),
        collection("COLLECTION2", ["PROPERTY1"])
    );

    deg.export();

});