export function maxScoreCoprime(nums, maxVal) {
  const n = nums.length;
  const maxN = Math.max(maxVal, ...nums);

  const count = new Array(maxVal + 1).fill(0);
  for (const v of nums) {
    if (v <= maxVal) count[v] += 1;
  }

  const freqMultiple = new Array(maxVal + 1).fill(0);
  for (let d = 1; d <= maxVal; d += 1) {
    for (let multiple = d; multiple <= maxVal; multiple += d) {
      freqMultiple[d] += count[multiple];
    }
  }

  const spf = new Array(maxVal + 1).fill(0);
  for (let i = 2; i <= maxVal; i += 1) {
    if (spf[i] === 0) {
      for (let j = i; j <= maxVal; j += i) {
        if (spf[j] === 0) spf[j] = i;
      }
    }
  }

  const getDistinctPrimes = (x) => {
    const primes = [];
    while (x > 1) {
      const p = spf[x];
      primes.push(p);
      while (x % p === 0) x /= p;
    }
    return primes;
  };

  let bestScore = 0;
  if (count[1] > 0) {
    bestScore = 1;
  }

  for (let x = 2; x <= maxVal; x += 1) {
    const primes = getDistinctPrimes(x);
    let totalBad = 0;
    const k = primes.length;
    const subsets = 1 << k;
    for (let mask = 1; mask < subsets; mask += 1) {
      let prod = 1;
      let bits = 0;
      for (let j = 0; j < k; j += 1) {
        if ((mask >> j) & 1) {
          prod *= primes[j];
          bits += 1;
        }
      }
      const term = freqMultiple[prod];
      totalBad += bits % 2 === 1 ? term : -term;
    }

    let candidate;
    if (count[x] > 0) {
      candidate = x - totalBad + 1;
    } else if (totalBad > 0) {
      candidate = x - totalBad;
    } else {
      candidate = x - 1;
    }
    bestScore = Math.max(bestScore, candidate);
  }

  return bestScore;
}
