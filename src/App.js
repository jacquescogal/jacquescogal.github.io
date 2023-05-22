import logo from './logo.svg';
import './App.css';
import Homepage from './pages/Homepage';
import { Route,Routes } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import {React,useEffect} from 'react';

function App() {
  useEffect(() => {
    window.history.scrollRestoration = 'manual'
  }, []);
  return (
    <div className="App">
      <ToastContainer/>
      <Routes>
            <Route path='/' element={<Homepage/>}>
              {/* <Route path="Login" element={<Login setPageTitle={setPageTitle}/>}/>
              <Route path="Register" element={<Register setPageTitle={setPageTitle}/>}/>
              <Route path="Home" element={<HomePage setPageTitle={setPageTitle}/>}/>
              <Route path="Menu" element={<Order setPageTitle={setPageTitle}/>}/>
              <Route path="History" element={<History setPageTitle={setPageTitle}/>}/> 
              <Route path="HelpDesk" element={<Feedback setPageTitle={setPageTitle}/>}/>
              <Route path="Settings" element={<Settings setPageTitle={setPageTitle}/>}/>
              <Route path="OurStory" element={<OurStory setPageTitle={setPageTitle}/>}/>
              <Route path="SubscriptionPlans" element={<OurPeople setPageTitle={setPageTitle}/>}/>
              <Route path="OurPartners" element={<OurPartners setPageTitle={setPageTitle}/>}/> */}
            </Route>
            <Route path="*" element={<p>There's nothing here: 404!</p>} />
        </Routes>
    </div>
  );
}

export default App;
