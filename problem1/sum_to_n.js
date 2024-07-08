// *For n is a small number
// ->  The loop may take longer if n is a large number.
//     Recursion can have stack overflow problems due to too many recursive function calls.

//Method 1: Use `for` loop - O(n)
var sum_to_n_a = function (n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// Method 2: Use mathematical formulas - O(1)
var sum_to_n_b = function (n) {
  return (n * (n + 1)) / 2;
};

//Method 3: Use recursion O(n)
var sum_to_n_c = function (n) {
  if (n === 0) {
    return 0;
  } else {
    return n + sum_to_n_c(n - 1);
  }
};

// In addition to mathematical methods, we can use BigInt to calculate sums where n is an extremely large number

// Method 4: Use BigInt O(n)
var sum_to_n_bigint = function(n) {
    const bigN = BigInt(n);
    return (bigN * (bigN + BigInt(1))) / BigInt(2);
};

// Summary: The most optimal way is still based on the conditions under which the problem is implemented