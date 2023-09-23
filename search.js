const { fromEvent, from, debounceTime, map, filter, switchMap } = rxjs

const createKeyup$ = () => {
  return fromEvent(document.querySelector('#search-input'), 'keyup');
}

const searchRepo$ = (key$) => {
  return key$.pipe(
    debounceTime(150),
    map(e => e.target.value.trim()),
    filter(query => query.length !== 0),
    switchMap(query => {
      const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc`;
      return from(fetchAPI(url));
    })
  );
};

const fetchAPI = (url) => {
  return fetch(url).then(response => {
    if (response.status !== 200) {
      throw new Error(`Invalid status for ${url}`);
    }
    return response.json();
  }).then(json => {
    console.log('json', json);
    return {
      items: json.items.map(x => ({
        name: x.name,
        full_name: x.full_name,
      }))
    };
  });
}

const observer = {
  next: (value) => {
    console.log('#update ', value);
    document.querySelector('#results').innerHTML = value.items.map(repo => `<li>${repo.full_name}</li>`).join('');
  }
};

searchRepo$(createKeyup$()).subscribe(observer);
