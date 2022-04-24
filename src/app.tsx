import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import loadable from '@loadable/component';
import '@css/fonts.scss';

const Main = loadable(() => import('@main/index'));
const Auth = loadable(() => import('@auth/index'));

const App = () => {
  return (
    <RecoilRoot>
      <Router basename={process.env.NODE_ENV === 'production' ? 'Together42' : ''}>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </Router>
    </RecoilRoot>
  );
};

export default App;
