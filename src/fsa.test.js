const FA = require("./fsa");

test('converting FA with cycle paths', () => {
    const a = new FA();

    const s = a.getStart();
    const s1 = a.newState();

    a.setFinal(s1);

    a.transition(s, 'a', s1);
    a.transition(s1, 'a', s1);

    const d = a.deterministic();
    expect(d.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 2;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 2 [label = "a"]\n' +
            '\t2 -> 2 [label = "a"]\n' +
        '}'
    );
});

test('creation of FA acepting letter a', () => {
    const a = new FA();

    const s = a.getStart();
    const f = a.newState();
    a.setFinal(f);
    a.transition(s, 'a', f);

    expect(a.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 2;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 2 [label = "a"]\n' +
        '}'
    );
});

test('Clean shared dead states', () => {
    const fa = new FA();

    const s = fa.getStart();
    const s1 = fa.newState();
    const s2 = fa.newState();
    const s3 = fa.newState();
    const s4 = fa.newState();

    fa.setFinal(s4);

    fa.transition(s, 'a', s1);
    fa.transition(s, 'd', s1);
    fa.transition(s, 'e', s4);
    fa.transition(s1, 'b', s2);
    fa.transition(s2, 'c', s3);

    expect(fa.clean().toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 5;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 5 [label = "e"]\n' +
        '}'
    );
});

test('converting FA with two distinct paths to word ab to deterministic', () => {
    const a = new FA();

    const s = a.getStart();
    const s1 = a.newState();
    const s2 = a.newState();
    const s3 = a.newState();
    const s4 = a.newState();

    a.setFinal(s2);
    a.setFinal(s4);

    a.transition(s, 'a', s1);
    a.transition(s1, 'b', s2);

    a.transition(s, 'a', s3);
    a.transition(s3, 'b', s4);

    const ad = a.deterministic();
    expect(a.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 3 5;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 2 [label = "a"]\n' +
            '\ts -> 4 [label = "a"]\n' +
            '\t2 -> 3 [label = "b"]\n' +
            '\t4 -> 5 [label = "b"]\n' +
        '}'
    );

    expect(ad.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 3;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 2 [label = "a"]\n' +
            '\t2 -> 3 [label = "b"]\n' +
        '}'
    );
});

test('converting FA with distinct paths to words ab and ac to deterministic', () => {
    const a = new FA();

    const s = a.getStart();
    const s1 = a.newState();
    const s2 = a.newState();
    const s3 = a.newState();
    const s4 = a.newState();

    a.setFinal(s2);
    a.setFinal(s4);

    a.transition(s, 'a', s1);
    a.transition(s1, 'b', s2);

    a.transition(s, 'a', s3);
    a.transition(s3, 'c', s4);

    const ad = a.deterministic();
    expect(a.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 3 5;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 2 [label = "a"]\n' +
            '\ts -> 4 [label = "a"]\n' +
            '\t2 -> 3 [label = "b"]\n' +
            '\t4 -> 5 [label = "c"]\n' +
        '}'
    );

    expect(ad.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 3 4;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 2 [label = "a"]\n' +
            '\t2 -> 3 [label = "b"]\n' +
            '\t2 -> 4 [label = "c"]\n' +
        '}'
    );
});

test('converting FA with words sets to deterministic', () => {
    const s = new FA();

    const word = w => {
        s0 = s.getStart();
        t = s.newState();
        s.setFinal(t);

        for (let i=0; i<w.length; i++) {
            const c = w[i];
            s.transition(s0, c, t);
            s.transition(t, c, t);
        }
    }

    word([1, 2, 3]);
    word([1, 3, 4]);

    const d = s.deterministic();

    expect(d.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 2 3 4;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 2 [label = "1"]\n' +
            '\ts -> 3 [label = "2"]\n' +
            '\ts -> 2 [label = "3"]\n' +
            '\ts -> 4 [label = "4"]\n' +
            '\t4 -> 4 [label = "1"]\n' +
            '\t4 -> 4 [label = "3"]\n' +
            '\t4 -> 4 [label = "4"]\n' +
            '\t3 -> 3 [label = "1"]\n' +
            '\t3 -> 3 [label = "2"]\n' +
            '\t3 -> 3 [label = "3"]\n' +
            '\t2 -> 2 [label = "1"]\n' +
            '\t2 -> 3 [label = "2"]\n' +
            '\t2 -> 2 [label = "3"]\n' +
            '\t2 -> 4 [label = "4"]\n' +
        '}'
    );

});

test('Minimization of FA with distinct paths to words ab and ac', () => {
    const a = new FA();

    const s = a.getStart();
    const s1 = a.newState();
    const s2 = a.newState();
    const s3 = a.newState();
    const s4 = a.newState();

    a.setFinal(s2);
    a.setFinal(s4);

    a.transition(s, 'a', s1);
    a.transition(s1, 'b', s2);

    a.transition(s, 'a', s3);
    a.transition(s3, 'c', s4);

    const ad = a.minimize();

    expect(a.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 3 5;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 2 [label = "a"]\n' +
            '\ts -> 4 [label = "a"]\n' +
            '\t2 -> 3 [label = "b"]\n' +
            '\t4 -> 5 [label = "c"]\n' +
        '}'
    );

    expect(ad.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 5;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 2 [label = \"a\"]\n' +
            '\t2 -> 5 [label = \"b\"]\n' +
            '\t2 -> 5 [label = \"c\"]\n' +
        '}'
    );
});

test('Minimization of FA with same prefix and diferent suffix.', () => {
    const a = new FA();

    const s = a.getStart();
    const s1 = a.newState();
    const s2 = a.newState();
    const s3 = a.newState();
    const s4 = a.newState();
    const s5 = a.newState();
    const s6 = a.newState();

    a.setFinal(s3);
    a.setFinal(s6);

    // abc
    a.transition(s, 'a', s1);
    a.transition(s1, 'b', s2);
    a.transition(s2, 'c', s3);

    // abd
    a.transition(s, 'a', s4);
    a.transition(s4, 'b', s5);
    a.transition(s5, 'd', s6);

    const ad = a.minimize();

    expect(ad.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 6;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 2 [label = "a"]\n' +
            '\t2 -> 3 [label = "b"]\n' +
            '\t3 -> 6 [label = "c"]\n' +
            '\t3 -> 6 [label = "d"]\n' +
        '}'
    );
});

test('Minimization of FA (1)', () => {
    const a = new FA();

    const s = a.getStart();
    const s1 = a.newState();
    const s2 = a.newState();
    const s3 = a.newState();

    a.setFinal(s3);

    a.transition(s, 'a', s1);
    a.transition(s, 'b', s2);

    a.transition(s1, 'a', s1);
    a.transition(s2, 'a', s2);

    a.transition(s1, 'b', s3);
    a.transition(s2, 'b', s3);

    a.transition(s3, 'a', s3);
    a.transition(s3, 'b', s3);

    const r = a.minimize();

    expect(r.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 4;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 5 [label = "a"]\n' +
            '\ts -> 5 [label = "b"]\n' +
            '\t5 -> 5 [label = "a"]\n' +
            '\t5 -> 4 [label = "b"]\n' +
            '\t4 -> 4 [label = "a"]\n' +
            '\t4 -> 4 [label = "b"]\n' +
        '}'
    );
});

test('Minimization of FA (2)', () => {
    const a = new FA();

    const s1 = a.getStart();
    const s2 = a.newState();
    const s3 = a.newState();
    const s4 = a.newState();
    const s5 = a.newState();
    const s6 = a.newState();
    const s7 = a.newState();
    const s8 = a.newState();
    const s9 = a.newState();
    const s10 = a.newState();

    a.setFinal(s2);
    a.setFinal(s3);
    a.setFinal(s4);
    a.setFinal(s6);
    a.setFinal(s7);

    a.transition(s1, 'a', s2);
    a.transition(s1, 'b', s3);

    a.transition(s2, 'a', s4);
    a.transition(s2, 'b', s5);

    a.transition(s3, 'a', s6);
    a.transition(s3, 'b', s5);

    a.transition(s4, 'b', s2);
    a.transition(s4, 'a', s4);

    a.transition(s5, 'a', s7);
    a.transition(s5, 'b', s3);

    a.transition(s6, 'b', s3);
    a.transition(s6, 'a', s8);

    a.transition(s7, 'a', s4);
    a.transition(s7, 'b', s9);

    a.transition(s8, 'a', s8);
    a.transition(s8, 'b', s8);

    a.transition(s9, 'a', s7);
    a.transition(s9, 'b', s10);

    a.transition(s10, 'a', s8);
    a.transition(s10, 'b', s10);

    const r = a.minimize();

    expect(r.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 2 3 4 6 7;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 2 [label = "a"]\n' +
            '\ts -> 3 [label = "b"]\n' +
            '\t2 -> 7 [label = "a"]\n' +
            '\t2 -> 5 [label = "b"]\n' +
            '\t3 -> 4 [label = "a"]\n' +
            '\t3 -> 5 [label = "b"]\n' +
            '\t4 -> 3 [label = "b"]\n' +
            '\t4 -> 11 [label = "a"]\n' +
            '\t5 -> 6 [label = "a"]\n' +
            '\t5 -> 3 [label = "b"]\n' +
            '\t6 -> 7 [label = "a"]\n' +
            '\t6 -> 8 [label = "b"]\n' +
            '\t7 -> 2 [label = "b"]\n' +
            '\t7 -> 7 [label = "a"]\n' +
            '\t8 -> 6 [label = "a"]\n' +
            '\t8 -> 11 [label = "b"]\n' +
            '\t11 -> 11 [label = "a"]\n' +
            '\t11 -> 11 [label = "b"]\n' +
        '}'
    );
});

test('Union of two FA, with distinct acepted words', () => {
    const abc = new FA();
    const def = new FA();

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

    const ab = abc.union(def);

    expect(ab.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 8;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 2 [label = "a"]\n' +
            '\ts -> 3 [label = "d"]\n' +
            '\t2 -> 6 [label = "b"]\n' +
            '\t3 -> 4 [label = "e"]\n' +
            '\t4 -> 8 [label = "f"]\n' +
            '\t6 -> 8 [label = "c"]\n' +
        '}'
    );
});

test('Union of two FA, with same prefix acepted words', () => {
    const abc = new FA();
    const abd = new FA();

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
        const s = abd.getStart();
        const s1 = abd.newState();
        const s2 = abd.newState();
        const s3 = abd.newState();

        abd.setFinal(s3);

        abd.transition(s, 'a', s1);
        abd.transition(s1, 'b', s2);
        abd.transition(s2, 'd', s3);
    }

    const ab = abc.union(abd);

    expect(ab.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 6;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 2 [label = "a"]\n' +
            '\t2 -> 3 [label = "b"]\n' +
            '\t3 -> 6 [label = "c"]\n' +
            '\t3 -> 6 [label = "d"]\n' +
        '}'
    );
});

test('Intersection of two FA, with same prefix acepted words', () => {
    const abc = new FA();
    const abd = new FA();

    {
        const s = abc.getStart();
        const s1 = abc.newState();
        const s2 = abc.newState();
        const s3 = abc.newState();

        abc.setFinal(s2);
        abc.setFinal(s3);

        abc.transition(s, 'a', s1);
        abc.transition(s1, 'b', s2);
        abc.transition(s2, 'c', s3);
    }

    {
        const s = abd.getStart();
        const s1 = abd.newState();
        const s2 = abd.newState();
        const s3 = abd.newState();

        abd.setFinal(s2);
        abd.setFinal(s3);

        abd.transition(s, 'a', s1);
        abd.transition(s1, 'b', s2);
        abd.transition(s2, 'd', s3);
    }

    const ab = abc.intersect(abd);

    expect(ab.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 3;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 2 [label = "a"]\n' +
            '\t2 -> 3 [label = "b"]\n' +
        '}'
    );
});

test('Subtract: a - b = r, where a, b and r are FA.', () => {
    const a = new FA();
    const b = new FA();

    {
        const s = a.getStart();
        const s1 = a.newState();

        a.setFinal(s1);

        a.transition(s, 'a', s1);
        a.transition(s, 'b', s1);
    }

    {
        const s = b.getStart();
        const s1 = b.newState();

        b.setFinal(s1);

        b.transition(s, 'b', s1);
        b.transition(s, 'c', s1);
    }

    const r = a.subtract(b);

    expect(r.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 2;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 2 [label = "a"]\n' +
        '}'
    );
});

test('Cycle on start state minimization', () => {
    const abc = new FA();

    const s = abc.getStart();
    abc.setFinal(s);

    abc.transition(s, 'a', s);
    abc.transition(s, 'b', s);
    abc.transition(s, 'c', s);

    const r = abc.minimize();

    expect(r.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; s;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> s [label = "a"]\n' +
            '\ts -> s [label = "b"]\n' +
            '\ts -> s [label = "c"]\n' +
        '}'
    );
});

test('Cycles sets minimization', () => {
    const fa = new FA();

    const add = sets => {
        const start = fa.getStart();
        const s = fa.newState();

        fa.setFinal(s);

        for (let i=0; i<sets.length; i++) {
            const symbol = sets[i];

            fa.transition(start, symbol, s);
            fa.transition(s, symbol, s);
        }
    };

    add([1, 2, 3, 4]);
    add([2, 3]);
    add([1, 4]);

    const r = fa.minimize();
    expect(r.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 5;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 5 [label = "1"]\n' +
            '\ts -> 5 [label = "2"]\n' +
            '\ts -> 5 [label = "3"]\n' +
            '\ts -> 5 [label = "4"]\n' +
            '\t5 -> 5 [label = "1"]\n' +
            '\t5 -> 5 [label = "2"]\n' +
            '\t5 -> 5 [label = "3"]\n' +
            '\t5 -> 5 [label = "4"]\n' +
        '}'
    );
});

test('Cycles sets minimization, with start as final', () => {
    const fa = new FA();

    fa.setFinal(fa.getStart());

    const add = sets => {
        const start = fa.getStart();
        const s = fa.newState();

        fa.setFinal(s);

        for (let i=0; i<sets.length; i++) {
            const symbol = sets[i];

            fa.transition(start, symbol, s);
            fa.transition(s, symbol, s);
        }
    };

    add([1, 2, 3, 4]);
    add([2, 3]);
    add([1, 4]);

    const r = fa.minimize();
    expect(r.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; s;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> s [label = "1"]\n' +
            '\ts -> s [label = "2"]\n' +
            '\ts -> s [label = "3"]\n' +
            '\ts -> s [label = "4"]\n' +
        '}'
    );
});

test('Negation of FA abc', () => {
    const abc = new FA();

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

    const r = abc.negation();

    expect(r.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 2 3 4;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 2 [label = "a"]\n' +
            '\ts -> 3 [label = "b"]\n' +
            '\ts -> 3 [label = "c"]\n' +
            '\t2 -> 3 [label = "a"]\n' +
            '\t2 -> 4 [label = "b"]\n' +
            '\t2 -> 3 [label = "c"]\n' +
            '\t3 -> 3 [label = "a"]\n' +
            '\t3 -> 3 [label = "b"]\n' +
            '\t3 -> 3 [label = "c"]\n' +
            '\t4 -> 3 [label = "a"]\n' +
            '\t4 -> 3 [label = "b"]\n' +
            '\t4 -> 5 [label = "c"]\n' +
            '\t5 -> 3 [label = "a"]\n' +
            '\t5 -> 3 [label = "b"]\n' +
            '\t5 -> 3 [label = "c"]\n' +
        '}'
    );
});

test('toJSON/fromJSON of FA abc', () => {
    const abc = new FA();

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

    const s = abc.toJSON();

    expect(s).toEqual({
        "finals": [4],
        "ids": 4,
        "start": 1,
        "states": [1, 2, 3, 4],
        "symbols": ["a", "b", "c"],
        "transitions": [
            [1, [["a", [2]]]],
            [2, [["b", [3]]]], 
            [3, [["c", [4]]]]
        ]
    });

    const u = FA.fromJSON(s);
    expect(u.toDot()).toBe(
        'digraph G {\n' +
            '\trankdir=LR;\n' +
            '\tsize="8,5"\n' +
            '\tnode [shape = doublecircle]; 4;\n' +
            '\tnode [shape = circle];\n' +
            '\ts -> 2 [label = "a"]\n' +
            '\t2 -> 3 [label = "b"]\n' +
            '\t3 -> 4 [label = "c"]\n' +
        '}'
    );

});

test('FA delta function on word abc', () => {
    const abc = new FA();

    const s = abc.getStart();
    const s1 = abc.newState();
    const s2 = abc.newState();
    const s3 = abc.newState();

    abc.setFinal(s3);

    abc.transition(s, 'a', s1);
    abc.transition(s1, 'b', s2);
    abc.transition(s2, 'c', s3);

    const froms = abc.delta(
        abc.delta(
            abc.delta(new Set([abc.getStart()]), 'a'),
            'b'
        ),
        'c'
    );

    const finals = abc.filterFinals(froms);
    const accepted = abc.hasFinal(froms);

    expect([...froms]).toEqual([s3]);
    expect([...finals]).toEqual([s3]);
    expect(accepted).toBe(true);

});

test('FA walk of abc...', () => {
    const abc = new FA();

    const s = abc.getStart();
    const s1 = abc.newState();
    const s2 = abc.newState();
    const s3 = abc.newState();
    const s4 = abc.newState();
    const s5 = abc.newState();
    const s6 = abc.newState();

    abc.setFinal(s3);
    abc.setFinal(s5);
    abc.setFinal(s6);

    abc.transition(s, 'a', s1);
    abc.transition(s1, 'b', s2);
    abc.transition(s2, 'c', s3);
    abc.transition(s2, 'c', s4);
    abc.transition(s3, 'd', s4);
    abc.transition(s4, 'e', s6);

    const step1 = abc.walk('a');
    expect(step1.word).toEqual(['a']);
    expect([...step1.finals]).toEqual([]);
    expect([...step1.states]).toEqual([s1]);

    const step2 = step1('b', 'c');
    expect(step2.word).toEqual(['a', 'b', 'c']);
    expect([...step2.finals]).toEqual([s3]);
    expect([...step2.states]).toEqual([s3, s4]);

    const step3 = step2('d')('e');
    expect(step3.word).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect([...step3.finals]).toEqual([s6]);
    expect([...step3.states]).toEqual([s6]);

    const step4 = step3('f')('g', 'h');
    // the last symbol on word is the one that makes it fail.
    expect(step4.word).toEqual(["a", "b", "c", "d", "e", "f"]);

    // we know it fails because there is no final states, and there is no
    // more states to keep going.
    expect([...step4.finals]).toEqual([]);
    expect([...step4.states]).toEqual([]);

    const w = abc.walk();
    const accept = w('a')('b')('c');

    expect(accept.finals.size).toBe(1);

});

test('Get positions', () => {
    const abc = new FA();

    const s = abc.getStart();
    const s1 = abc.newState();
    const s2 = abc.newState();
    const s3 = abc.newState();

    abc.setFinal(s3);

    abc.transition(s, 'a', s1);
    abc.transition(s1, 'b', s2);
    abc.transition(s1, 'c', s3);

    const start = abc.positionStates(0);
    const depthOne = abc.positionStates(1);
    const depthTwo = abc.positionStates(2);

    expect([...start]).toEqual([s]);
    expect([...depthOne]).toEqual([s1]);
    expect([...depthTwo]).toEqual([s2, s3]);

});
