import React, { useEffect, useState } from "react";
import "./App.css";
import UserComponent from "./components/UserComponent";
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import SupportCompoent from "./components/SupportCompoent";


function App() {



  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<UserComponent/>} />
      <Route path="/support" element={<SupportCompoent/>}/>
    </Routes>

    </BrowserRouter>
  );
}

export default App;
