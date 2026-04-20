/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Legal from './pages/Legal';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-white">
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route path="/legal" element={<Legal />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}


