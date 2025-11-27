import { useSelector } from 'react-redux';
import './App.css';
import BillSplitPage from './Pages/BillSplitPage/BillSplitPage';
import Loading from './Components/Loading/Loading';
import { ToastContainer } from 'react-toastify';

function App() {

  const loading = useSelector((state) => state.app.loading)

  return (
    <div className="App">
      <BillSplitPage />
      <ToastContainer />
      {loading ? (<Loading />) : (null)}
    </div>
  );
}

export default App;
