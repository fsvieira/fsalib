# Finite State Automaton Library

Its a very simple fSA lib, with some advanced operations like:

 * Clean dead and unreachable states,
 * Determinism,
 * Minimization,
 * Union,
 * Intersection,
 * Subtraction,
 * Negation,
 * walk methods (delta, hasfinals, filterFinals, walk, ...),
 * toDot,
 * fromJSON,
 * toJSON

All operations except clean and fromJSON are non-destructive, this means that the 
result is a new FSA and origin FSA is unchanged.

# Install  

`npm install fsalib --save`

# Use

```javascript
    const FSA = require("fsalib");

    const abc = new FSA();
    const def = new FSA();

    {
        const s = abc.getStart();
        const s1 = abc.newState();
        const s2 = abc.newState();
        const s3 = abc.newState();

        abc.setFinal(s3);

        abc.transition(s, 'a', s1);
        abc.transition(s1, 'b', s2);
        abc.transition(s2, 'c', s3);
    }

    {
        const s = def.getStart();
        const s1 = def.newState();
        const s2 = def.newState();
        const s3 = def.newState();

        def.setFinal(s3);

        def.transition(s, 'd', s1);
        def.transition(s1, 'e', s2);
        def.transition(s2, 'f', s3);
    }

    // clean a,
    abc.clean();

    // create a deterministic FSA from abc,
    const det = abc.deterministic();

    // create new minimized FSA from abc.
    const min = fa.minimize();

    // union of both FSA,
    // result (un) will acept all words that are acepted by abc or def.
    const un = abc.union(def);

    // intersect both FSA,
    // result (inter) will acept all words acepted by both FSA (abc and def).
    const inter = abc.intersect(def);
    
    // subtract abc - def,
    // result (sub) FSA will acept all words acepted by abc but not the ones acepted by def.
    const sub = abc.subtract(def);

    // negation,
    // will acepted all words  
    // it will create a FSA aceptiong all possible words
    // generated by abc alphabet except the words acepted by abc.
    const neg = abc.negation();

    // print dot (graphviz graph version)
    // handy for debug.
    console.log(abc.toDot());

    // serialize to json,
    // return a json description of the abc FSA.
    console.log(JSON.stringify(abc.toJSON()))

    // deserialize from json,
    // create a copy of abc.
    const f = FSA.fromJSON(abc.toJSON());
```
# Walk Methods

## delta(froms, symbol)

 * froms, a set of states,
 * symbol, the transition symbol.

Example:
```javascript
    const FSA = require("fsalib");
    
    // create a abc FSA
    const abc = new FSA();

    const s = abc.getStart();
    const s1 = abc.newState();
    const s2 = abc.newState();
    const s3 = abc.newState();

    abc.setFinal(s3);

    abc.transition(s, 'a', s1);
    abc.transition(s1, 'b', s2);
    abc.transition(s2, 'c', s3);

    // make first transtion with delta,
    // start from abc start state.
    const start = abc.delta(new Set([abc.getStart()]), 'a'),
    
    // we can also encapsulate calls
    const froms = abc.delta(
        abc.delta(
            start,
            'b'
        ),
        'c'
    );

    // after getting the froms results, we can get 
    // the finals using filterFinals.
    const finals = abc.filterFinals(froms);
    
    // or if only want to know that word is accepted we can do this:
    const accepted = abc.hasFinal(froms);

    // print all abc path resulting states, in this case its the final state s3
    console.log([...froms].join(", "));
    
    // print all abc path final states, in this case s3
    console.log([...finals].join(", "));
    
    // print if word abc was accepted, in this case yes (true).
    console.log(accepted);
```

## walk(symbol, ...symbol)

 The walk method is a curry function, so it can receive an arbitrary number of symbols, it can 
 also be called by steps.
 
 Return: the walk function return another function, with associeted attributes finals (Set) and states (Set).
 Words are accepted if at the end of word, states and finals are not empty.
 
 
 Examples (consider abc as FSA accepting word abc):
 ```javascript 
    
    const s = abc.walk('a', 'b', 'c');
    console.log([...s.finals]);
    console.log([...s.states]);
  ```     
  
```javascript 
    
    const s = abc.walk('a')('b', 'c');
    console.log([...s.finals]);
    console.log([...s.states]);
```     
  
  ```javascript 
    
    const step1 = abc.walk('a');
    console.log([...step1.finals]); // finals is empty
    console.log([...step1.states]); // but states is not, 
    
    const s = step1('a', 'b');
    console.log([...s.finals]); // finals is not empty
    console.log([...s.states]); // states is not empty
```
  
```javascript 
    const steps = abc.walk(); // walk can be called with no symbols,
    // but returning function must always be called with at least one symbol.
    const s = steps('a')('b')('c');
    console.log([...s.finals]); // finals is not empty
    console.log([...s.states]); // states is not empty
```
  
```javascript 
    const accepted = abc.walk(..."abc".split("")).finals.size > 0;
    const rejected = abc.walk(..."abcd".split("")).finals.size === 0;
    
    console.log("abc is accepted: " + accepted?"yes":"no");
    console.log("abcd is accepted: " + !rejected?"yes":"no");
```

## positionStates (position)

    It will get the states on given position, where position is the walking depth 
    of the FA, starting from start.

    Returns a Set of states, if there is no states at the given position a empty Set 
    is returned.

    Example:
```javascript
    const FSA = require("fsalib");

    const abc = new FSA();

    const s = abc.getStart();
    const s1 = abc.newState();
    const s2 = abc.newState();
    const s3 = abc.newState();

    abc.setFinal(s3);

    abc.transition(s, 'a', s1);
    abc.transition(s1, 'b', s2);
    abc.transition(s1, 'c', s3);
    
    const start = abc.positionStates(0);
    /**
     * the states at position 0 is the start state,
     * we walk 0 symbols from start.
     */
    console.log([...start].join(", ")); // output: s

    const depthOne = abc.positionStates(1);
    /**
     * the states at position 1, in this case are the same as
     * walk("a"), it will return s1 state.
     */
    console.log([...depthOne].join(", ")); // output: s1

    /**
     * the states at position 2, in this case are the same as
     * walk("a")("b") UNION walk("a")("c"), it will return s2 and s3 state.
     */
    const depthTwo = abc.positionStates(2);
    console.log([...depthTwo].join(", ")); // output: s2, s3
```




# FA Fields

If walk mehods are not engough you can access the FA fields directly.
Here is a example taken from the toJSON function:

```javascript
    const FSA = require("fsalib");

    const fa = new FSA();
    const transitions = [];

    // this.transitions is a Map where key is a from state
    // and value is another Map with key as symbol and values 
    // a Set of destination states (tos).
    for (let [from, symbols] of fa.transitions) {
        const ss = [];
        // symbols is a Map with key symbols and value a Set of to states.
        for (let [symbol, tos] of symbols) {
            // In case FA is deterministic the tos is Set with only one element.
            ss.push([symbol, [...tos]]);
        }

        transitions.push([from, ss]);
    }

    return {
        // Final states,
        finals: [...fa.finals],
        
        // all states, including final states,
        states: [...fa.states],

        // the start state,
        start: this.start,

        // Symbols the FA alphabet,
        symbols: [...fa.symbols],

        // FA transitions,
        transitions,

        // its the state id counter,
        // everytime a state is created we return the current ids value and 
        // increment it, for next round, messing up the ids is not a good ideia. 
        ids: fa.ids
    };
```

# More Examples

There are lot more examples/test here: https://github.com/fsvieira/fsalib/blob/master/src/fsa.test.js

# Use Cases 

    The use cases of Finite State Automata are very large well known and document
    on many sources. 

    Some examples can be, regular expressions, pattern analyses/recognition, 
    application/game state machines ...

    With a little creativity we can found some use for a FSA, on almost any application.



    
