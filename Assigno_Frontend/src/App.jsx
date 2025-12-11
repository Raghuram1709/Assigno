import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { login } from './redux/authslice';
import NavBar from './Components/NavBar';
import { Route, Routes } from 'react-router-dom';
import HomePage from './Pages/Home';
import LoginPage from './Pages/LoginPage';
import SignUpPage from './Pages/SignUpPage';
import ProjectReg from './Pages/ProjectReg';
import ProfilePage from './Pages/ProfilePage';
import ProjectsPage from './Pages/ProjectsPage';
import AboutUs from './Pages/AboutUs';
import DashBoard from './Pages/DashBoard';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import Message from './Components/Message';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (user && token) {
      dispatch(login({ user, token }));
    }
  }, [dispatch]);

  return (
    <Provider store={store}>
      <NavBar />
      <Message />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/pro_registeration' element={<ProjectReg />} />
        <Route path='/profilepage' element={<ProfilePage />} />
        <Route path='/projectspage' element={<ProjectsPage />} />
        <Route path='/aboutus' element={<AboutUs />} />
        <Route path='/dashboard/:id' element={<DashBoard />} />
      </Routes>
    </Provider>
  );
}

export default App;