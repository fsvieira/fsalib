const IdenticObjects = require("identicobjects");

class FSA {
    constructor () {
        this.finals = new Set();
        this.transitions = new Map();
        this.start = this.ids = 1;
        this.states = new Set([this.start]);
        this.symbols = new Set();
    }

    getStart () {
        return this.start;
    }

    newState () {
        return ++this.ids;
    }

    setFinal (state) {
        this.finals.add(state);
        return this;
    }

    transition (from, symbol, to) {
        this.states.add(from);
        this.states.add(to);
        this.symbols.add(symbol);
        
        let t = this.transitions.get(from);
        if (!t) {
            t = new Map();
            this.transitions.set(from, t);
        }

        let s = t.get(symbol);

        if (!s) {
            s = new Set();
            t.set(symbol, s);
        }

        s.add(to);

        return this;
	}

    deterministic () {
        const fa = new FSA();
        const io = new IdenticObjects();

        const start = io.get([this.start]);
        const states = [start];
        
        const mapStates = new Map(
            [[start, fa.getStart()]]
        );

        if (this.finals.has(this.start)) {
            fa.setFinal(fa.getStart());
        }

        while (states.length) {
            const state = states.pop();
            const faFrom = mapStates.get(state);

            const mapSymbols = new Map();

            // get all source states symbols and their destination states,
            for (let i=0; i<state.length; i++) {
                const from = state[i];

                const symbolTos = this.transitions.get(from);

                if (symbolTos) {
                    for (let [symbol, tos] of symbolTos) {                    
                        mapSymbols.set(
                            symbol, 
                            new Set([
                                ...(mapSymbols.get(symbol) || []),
                                ...tos
                            ])
                        );
                    }
                }
            }

            for (let [symbol, tos] of mapSymbols) {
                const s = [...tos].sort();
                const is = io.get(s);
                let ns = mapStates.get(is);

                if (!ns) {
                    // add state to be processed!
                    states.push(is);

                    // map new state to fa state,
                    const faTo = fa.newState();

                    // check if state is final.
                    for (let t of tos) {
                        if (this.finals.has(t)) {
                            fa.setFinal(faTo);
                            break;
                        }
                    }

                    mapStates.set(is, faTo);
                    ns = faTo;
                }
                // create transition,
                // we need this outside because of cycle cases. 
                fa.transition(faFrom, symbol, ns);                
            }
        }

        // cleanup states,
        fa.clean();
        return fa;
    }

    clean () {
        const validStates = new Set();
        const removedStates = new Set();
        const removeStates = new Set([...this.states]);

        const transitionsClean = from => {
            if (validStates.has(from)) {
                return false;
            }
            else if (removedStates.has(from)) {
                return true;
            }
            else if (!removeStates.has(from)) {
                return false;
            }

            removeStates.delete(from);

            const symbolTos = this.transitions.get(from);

            let keep = this.finals.has(from) || from === this.start;

            if (symbolTos) {
                for (let [symbol, tos] of symbolTos) {
                    let remove = false;
                    for (let to of tos) {
                        const r = transitionsClean(to);
                        remove = r || remove;

                        // delete to from transition,
                        if (remove) {
                            tos.delete(to);
                        }
                    }

                    if (remove) {
                        // remove transition,
                        symbolTos.delete(symbol);
                    }

                    keep = keep || !remove;
                }
            }

            if (keep) {
                validStates.add(from);
            }
            else {
                this.states.delete(from);
                this.transitions.delete(from);
                removedStates.add(from);
            }

            return !keep;
        }

        transitionsClean(this.start);

        for (let state of removeStates) {
            // if state is not valid delete it!!
            this.transitions.delete(state);
            this.states.delete(state);
            this.finals.delete(state);
        }

        return this;
    }

    minimize () {
        const fa = this.deterministic();

        // https://en.wikipedia.org/wiki/DFA_minimization
        
        // init,
        const states = [];
        const finals = [];

        const originalStates = [...fa.states];


        for (let state of fa.states) {
            (fa.finals.has(state)?finals:states).push(state);
        }

        states.sort();
        const io = new IdenticObjects();
        const f = io.get(finals.sort());
        const p = states.length?[io.get(states), f]:[f];
        const w = [f];

        while (w.length) {
            const a = w.pop();

            for (let c of fa.symbols) {
                // let X be the set of states for which a transition on c leads to a state in A
                const x = io.get(originalStates.filter(s => {
                    const symbols = fa.transitions.get(s);
                    if (symbols) {
                        const tos = symbols.get(c);

                        if (tos) {
                            return a.includes(tos.values().next().value);
                        }
                    }

                    return false;
                }).sort());

                // for each set Y in P for which X ∩ Y is nonempty and Y \ X is nonempty do
                for (let pi=0; pi<p.length; pi++) {
                    // replace Y in P by the two sets X ∩ Y and Y \ X
                    const y = p[pi];
                    const xny = io.get(y.filter(s => x.includes(s)));
                    const yex = io.get(y.filter(s => !x.includes(s)));
                
                    if (xny.length > 0 && yex.length > 0) {
                        p.splice(pi, 1, xny, yex);

                        // if Y is in W
                        const index = w.indexOf(y);

                        if (index !== -1) {
                            // replace Y in W by the same two sets
                            w.splice(index, 1, xny, yex);
                        }
                        else {
                            // if |X ∩ Y| <= |Y \ X|
                            if (xny.length <= yex.length) {
                                // add X ∩ Y to W
                                w.push(xny);
                            }
                            else {
                                // add Y \ X to W 
                                w.push(yex);
                            }
                        }
                    }
                }
            }
        }

        const statesTable = {};
        const transitions = new Map();

        for (let i=0; i<p.length; i++) {
            const states = p[i];
            let newState;

            if (states.includes(fa.getStart())) {
                newState = fa.getStart();
            }
            else if (states.length > 1) {
                newState = fa.newState();
            }
            else {
                newState = states[0];
            }

            fa.states.add(newState);

            let isFinal = false;
            for (let j=0; j<states.length; j++) {
                const s = states[j];

                isFinal = isFinal || fa.finals.has(s);
                statesTable[s] = newState;
            }

            if (isFinal) {
                fa.finals.add(newState);
            }
        }

        for (let i=0; i<originalStates.length; i++) {
            const state = originalStates[i];
            const ts = fa.transitions.get(state);
            const from = statesTable[state];

            if (ts) {
                for (let [c, tos] of ts) {
                    if (tos && tos.size) {
                        const to = statesTable[tos.values().next().value];

                        let fs = transitions.get(from);

                        if (!fs) {
                            fs = new Map();
                            transitions.set(from, fs);
                        }

                        fs.set(c, new Set([to]));
                    }
                }
            }
        }

        fa.transitions = transitions;
        fa.clean();

        return fa;
    }

    union (fa) {
        const u = this.minimize();
        fa = fa.minimize();

        // we need the full symbols set,
        u.symbols = new Set(...this.symbols, ...fa.symbols);

        const translationTable = new Map([[u.getStart(), fa.getStart()]]);
        const tt = state => {
            let s = translationTable.get(state);

            if (!s) {
                s = u.newState();
                translationTable.set(state, s);
            }

            u.states.add(s);

            if (fa.finals.has(state)) {
                u.finals.add(s);
            }

            return s;
        };

        for (let [from, symbols] of fa.transitions) {
            const f = tt(from);

            for (let [symbol, tos] of symbols) {
                for (let to of tos) {
                    const t = tt(to);
                    
                    u.transition(f, symbol, t);
                }
            }
        }

        return u.minimize();
    }

    intersect (fa) {
        // get all states combinations,
        const m = this.minimize();
        const r = new FSA();

        r.symbols = new Set([...this.symbols, ...fa.symbols]);
        fa = fa.minimize();

        const io = new IdenticObjects();
        const start = io.get([m.getStart(), fa.getStart()]);
        const states = [start];
        
        // mapState to start,
        const mapStates = new Map([
            [start, r.getStart()]
        ]);

        while (states.length) {
            const sFrom = states.pop();
            const [a, b] = sFrom;
            const from = mapStates.get(sFrom);

            const aSymbols = m.transitions.get(a);
            const bSymbols = fa.transitions.get(b);
            
            if (aSymbols && bSymbols) {
                for (let [aSymbol, aTos] of aSymbols) {
                    const bTos = bSymbols.get(aSymbol);
                    const aTo = aTos.values().next().value;
                    if (bTos) {
                        const bTo = bTos.values().next().value;
                        
                        const s = io.get([aTo, bTo]);

                        let to = mapStates.get(s);
                        if (!to) {
                            to = r.newState();
                            mapStates.set(s, to);
                            
                            // set transitions
                            r.transition(from, aSymbol, to);

                            // check and set final,
                            if (m.finals.has(aTo) && fa.finals.has(bTo)) {
                                r.finals.add(to);
                            }

                            // push states to be processed,
                            states.push(s);
                        }
                        // nothing to do.
                    }
                    // fa doesnt have same symbols, so nothing to do.
                }
            }
        }

        return r.minimize();
    }

    subtract (fa) {
        // get all states combinations,
        const m = this.minimize();
        const r = new FSA();

        r.symbols = new Set([...this.symbols, ...fa.symbols]);
        fa = fa.minimize();

        const io = new IdenticObjects();
        const start = io.get([m.getStart(), fa.getStart()]);
        const states = [start];
        
        // mapState to start,
        const mapStates = new Map([
            [start, r.getStart()]
        ]);

        while (states.length) {
            const sFrom = states.pop();
            const [a, b] = sFrom;
            const from = mapStates.get(sFrom);

            const aSymbols = m.transitions.get(a);
            const bSymbols = fa.transitions.get(b);
            
            if (aSymbols) {
                for (let [aSymbol, aTos] of aSymbols) {
                    const bTos = bSymbols?bSymbols.get(aSymbol):undefined;
                    const aTo = aTos.values().next().value;

                    let s;
                    let bTo;

                    if (bTos) {
                        bTo = bTos.values().next().value;
                        s = io.get([aTo, bTo]);
                    }
                    else {
                        s = io.get([aTo]);
                    }

                    let to = mapStates.get(s);

                    if (!to) {
                        to = r.newState();
                        mapStates.set(s, to);
                        
                        // check and set final,
                        if (
                            m.finals.has(aTo) && 
                            (!bTo || !fa.finals.has(bTo))
                        ) {
                            r.finals.add(to);
                        }

                        // push states to be processed,
                        states.push(s);
                    }

                    // add transition,
                    r.transition(from, aSymbol, to);
                }
            }
        }

        return r.minimize();
    }

    negation () {
        // 1. create universe automata,
        const universe = new FSA();
        const s = universe.getStart();
        universe.setFinal(s);

        for (let symbol of this.symbols) {
            universe.transition(s, symbol, s);
        }

        // 2. subtract this automata.
        return universe.subtract(this);
    }

    toJSON () {
        const transitions = [];

        for (let [from, symbols] of this.transitions) {
            const ss = [];
            for (let [symbol, tos] of symbols) {
                ss.push([symbol, [...tos]]);
            }

            transitions.push([from, ss]);
        }

        return {
            finals: [...this.finals],
            states: [...this.states],
            start: this.start,
            symbols: [...this.symbols],
            transitions,
            ids: this.ids
        };
    }

    static fromJSON (json) {
        const fa = new FSA();

        fa.finals = new Set(json.finals);
        fa.states = new Set(json.states);
        fa.symbols = new Set(json.symbols);
        fa.ids = json.ids;

        fa.transitions = new Map();
        for (let i=0; i<json.transitions.length; i++) {
            const [from, symbolTos] = json.transitions[i];
            const s = new Map();

            for (let j=0; j<symbolTos.length; j++) {
                const [symbol, tos] = symbolTos[j];
                s.set(symbol, new Set(tos));
            }

            fa.transitions.set(from, s);
        }

        return fa;
    }

    delta (froms, symbol) {
        froms = froms || new Set([this.start]);

        const r = new Set();
        for (let from of froms) {
            const t = this.transitions.get(from);

            if (t) {
                const tos = t.get(symbol);

                if (tos) {
                    tos.forEach(t => r.add(t));
                }
            }
        }

        return r;
    }

    filterFinals (froms) {
        const r = new Set();

        for (let f of froms) {
            if (this.finals.has(f)) {
                r.add(f);
            }
        }

        return r;
    }

    hasFinal(froms) {
        return this.filterFinals(froms).size > 0;
    }

    walk (...args) {
        let froms = new Set([this.start]);
        let word = [];
        const self = this;

        const w = (symbol, ...args) => {
            if (symbol && froms) {
                word.push(symbol);

                froms = this.delta(froms, symbol);

                if (froms && froms.size) {
                    if (args && args.length) {
                        return w(...args);
                    }    
                }
                else {
                    froms = undefined;
                }

            }
            else {
                froms = undefined;
            }

            return w;
        };

        Object.defineProperty(w, 'finals', {
            get() {
                return froms?self.filterFinals(froms):new Set();
            }
        });

        Object.defineProperty(w, 'states', {
            get() {
                return new Set([...(froms || [])]);
            }
        });

        Object.defineProperty(w, 'word', {
            get() {
                return word.slice();
            }
        });

        if (args && args.length) {
            return w(...args);
        }

        return w;
    }

    positionStates (position) {
        let states = [this.start];
        
        for (let p=0; p<position; p++) {
            const s = new Set();

            while (states.length) {
                const state = states.pop();

                const symbolTos = this.transitions.get(state);

                if (symbolTos) {
                    for (let tos of symbolTos.values()) {
                        for (let to of tos) {
                            s.add(to);
                        }
                    }
                }
            }

            states = [...s];
        }

        return new Set(states);
    }

    toDot () {
        let table = "";
        for (let [from, symbols] of this.transitions) {
            const f = from === this.start?"s":from;

            for (let [symbol, tos] of symbols) {
                for (let to of tos) {
                    const t = to === this.start?"s":to;

                    table += `\t${f} -> ${t} [label = "${symbol}"]\n`;
                }
            }
        }

        let finals = "";
        for (let final of this.finals) {
            finals += " " + (final===this.start?"s":final);
        }

        const g = 'digraph G {\n' +
        '\trankdir=LR;\n' +
        '\tsize="8,5"\n' +
        '\tnode [shape = doublecircle];' + finals +';\n' +
        '\tnode [shape = circle];\n' +
            table +
        "}";

        return g;
    }
}

module.exports = FSA;
