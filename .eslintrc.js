module.exports = {
    "extends": "angular",
    "plugins": [
        "promise",
        "standard"
    ],
    rules: {
        "no-magic-numbers": [1, { ignoreArrayIndexes: true , ignore : [-1,0,1,2]}],
        "angular/di" : [2, "array"],
        "angular/controller-as" : 0,
        "angular/controller-as-route" : 0
    }
   
};