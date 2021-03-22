import ActionBar from './components/ActionBar';
import GenomeViewer from './components/GenomeViewer';

//Redux
import { Provider } from 'react-redux';
import store from './store';

function App() {
  return (
    <Provider store={store}>
      <ActionBar />
      <GenomeViewer/>
    </Provider>
  );
}

export default App;
