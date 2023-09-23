const { TestScheduler } = require("rxjs/testing");
const { of, debounceTime, map, filter, switchMap } = require("rxjs");

const searchRepo$ = (key$, fetch$, dueTime) => {
  return key$.pipe(
    debounceTime(dueTime),
    map((e) => e.target.value.trim()),
    filter((query) => query.length !== 0),
    switchMap(fetch$)
  );
};

const testScheduler = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected);
});

it("should debounce search action", () => {
  testScheduler.run((helpers) => {
    const { hot, expectObservable } = helpers;

    const keyup = "   ^-a--b----c--------|";
    const expected = "--------x----y-----|";
    const subs1 = "   ----------^--------!";
    const subs1Expected = "   13ms y------";

    const mockAPI = {
      r: "react",
      rx: "rx",
      rxj: "rxjs",
    };
    const fetch$ = (query) => {
      return of(mockAPI[query]);
    };

    const keyup$ = hot(keyup, {
      a: { target: { value: "r" } },
      b: { target: { value: "rx" } },
      c: { target: { value: "rxj" } },
    });
    const result$ = searchRepo$(keyup$, fetch$, 3);

    expectObservable(result$).toBe(expected, {
      x: mockAPI["rx"],
      y: mockAPI["rxj"],
    });
    expectObservable(result$, subs1).toBe(subs1Expected, {
      y: mockAPI["rxj"],
    })
  });
});
