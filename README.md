## How to use

Genome Browser with allele frequency and anotated transcript.

Require react 16.8 and above.

```js
import { GenomeBrowserApp } from 'genome-browser';

ReactDOM.render(
  <React.StrictMode>
    <GenomeBrowserApp />
  </React.StrictMode>,
  document.getElementById('root')
);
```

## Available props

### chrNum

```js
import { GenomeBrowserApp } from 'genome-browser';

ReactDOM.render(
  <React.StrictMode>
    <GenomeBrowserApp chrNum='chr1' />
  </React.StrictMode>,
  document.getElementById('root')
);
```

### id

```js
import { GenomeBrowserApp } from 'genome-browser';

ReactDOM.render(
  <React.StrictMode>
    <GenomeBrowserApp id='hg38' />
  </React.StrictMode>,
  document.getElementById('root')
);
```

### serverUrl

```js
import { GenomeBrowserApp } from 'genome-browser';

ReactDOM.render(
  <React.StrictMode>
    <GenomeBrowserApp serverUrl='http://3.143.149.107:8000' />
  </React.StrictMode>,
  document.getElementById('root')
);
```

### pos1 & pos2

```js
import { GenomeBrowserApp } from 'genome-browser';

ReactDOM.render(
  <React.StrictMode>
    <GenomeBrowserApp pos1='1287123' pos2='1287193' />
  </React.StrictMode>,
  document.getElementById('root')
);
```
