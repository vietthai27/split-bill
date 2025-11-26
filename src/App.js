import { useSelector } from 'react-redux';
import './App.css';
import BillSplitPage from './Pages/BillSplitPage/BillSplitPage';
import Loading from './Components/Loading/Loading';

function App() {

  const loading = useSelector((state) => state.app.loading)

  return (
    <div className="App">
      <BillSplitPage />
      {loading ? (<Loading />) : (null)}
    </div>
  );
}

export default App;
