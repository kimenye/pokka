/**
 * Return all possible item permutations for an array, with a minimum
 * number of items in the array as passed in by min length.
 *
 * E.g. source = [1,2,3,4];
 *
 * return {
 *  [1,2],[2,1],[1,2,3],[1,2,3,4]...
 * }
 * @param source
 * @param min_length
 *
 * @return {*}
 */
function possible_combinations(source, min_length) {

    var _result = [];

    if(source.length == min_length) {
        return permute(source);
    }

    var decomposed = decompose(source,min_length);
    _.each(decomposed, function(a) {
        _result.push(permute(a));
    });

    _result = _.flatten(_result, true);
    return _result;
}

/**
 * Return an array without the element
 *
 * @param source
 * @param idx
 */
function exclude_from(source,idx) {
    if(idx == 0) {
        return _.rest(source);
    }
    else if (idx == source.length -1) {
        return _.initial(source);
    }
    else {
        var _b = _.first(source,idx);
        var _a = _.last(source, source.length-(idx+1));
        return _.union(_b,_a);
    }
}

/**
 * Break down an array into elems
 * [1,2,3,4]
 * ---------
 * 1,2
 * 1,3
 * 1,4
 * 2,3
 * 2,4
 * 3,4
 * 1,2,3
 * 1,2,4
 * 1,3,4
 * 2,3,4
 * 1,2,3,4
 *
 *
 * @param source
 * @param size
 */
function break_down(source,size) {
    var _result = [];

    _.each(source, function(start, idx) {
        var _next = idx + 1;
        for(var _idx=_next;_idx < source.length; _idx++) {
            var arr = [start, source[_idx]];
            _result.push(arr);
        }
    });

    var _stepped = step(source, size);
    _.each(_stepped, function(s) {
        _result.push(s);
    });

    return _result;
}

function skip(source,size) {
    var _result = [];

    return _result;
}

function step(arr, size) {
    var _result = [];

    for(var i=0;i<=size;i++) {
        _a = _.rest(arr, i);
        if (_a.length >= size) {
            _result.push(_a);
        }
    }

    return _result;
}

function decompose(source,min_length) {
    var _result = [];
    for(var _ex=min_length;_ex>=0;_ex--) {
        var to_add = _.initial(source,_ex);
        if (to_add.length >= min_length)
            _result.push(to_add);
    }
    return _result;
}


function permute(v, m) {
    for (var p = -1, j, k, f, r, l = v.length, q = 1, i = l + 1; --i; q *= i);
    for (x = [new Array(l), new Array(l), new Array(l), new Array(l)], j = q, k = l + 1, i = -1; ++i < l; x[2][i] = i, x[1][i] = x[0][i] = j /= --k);
    for (r = new Array(q); ++p < q;)
        for (r[p] = new Array(l), i = -1; ++i < l; !--x[1][i] && (x[1][i] = x[0][i], x[2][i] = (x[2][i] + 1) % l), r[p][i] = m ? x[3][i] : v[x[3][i]])
            for (x[3][i] = x[2][i], f = 0; !f; f = !f)
                for (j = i; j; x[3][--j] == x[2][i] && (x[3][i] = x[2][i] = (x[2][i] + 1) % l, f = 1));
    return r;
};