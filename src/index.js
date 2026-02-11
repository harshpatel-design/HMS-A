import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import store from './store';
import 'antd/dist/reset.css';
import './index.css';
import './hcss.css';
import { message, ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import GlobalMessageProvider from '../src/feature/comman/GlobalMessage'; //  ⬅ NEW

message.config({
  top: 27,
  duration: 4,
  maxCount: 10,
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <Provider store={store}>
      <ConfigProvider>
        <GlobalMessageProvider>
          {' '}
          {/* ⬅ Toast now GLOBAL */}
          <App />
        </GlobalMessageProvider>
      </ConfigProvider>
    </Provider>
  </BrowserRouter>
);
