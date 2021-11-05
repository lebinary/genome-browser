import GenomeBrowser from './components/GenomeBrowser';
import React, {useEffect} from 'react';

//Redux
import { Provider} from 'react-redux';
import store from './store';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import {Router, Route, Switch} from 'react-router-dom';
import history from './history';
import {getData} from './actions/index';
import { initialState } from './reducers/genomeViewer';

const theme = createTheme({
  palette: {
    primary: {
      main: "#19416D",
    }
  }
});

const App = ({serverUrl, id, chrNum, pos1, pos2}) => {
  useEffect(() => {
    let url = serverUrl? serverUrl : initialState.serverUrl; 
    let refId = id? id : initialState.refId;
    let title = chrNum? chrNum : initialState.title;
    let min = pos1? pos1 : initialState.min;
    let max = pos2? pos2 : initialState.max;  
    store.dispatch(getData(url, title, {min, max}, refId));
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
          <Router history={history}>
            <Route exact path='/' component={GenomeBrowser} />
            <Switch>
              <Route exact path='/snp/:keyword' component={GenomeBrowser} />
              <Route exact path='/position/:referenceId/:nameRange' component={GenomeBrowser} />
            </Switch>
          </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
