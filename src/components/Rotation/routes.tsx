import React from 'react';
import { RotateResult } from './RotationResult';
import { Route, Routes } from 'react-router';
import RotationCalendar from './Calendar';
import { Rotate } from './Rotation';

function Rotation() {
  return (
    <Routes>
      <Route path="/" element={<Rotate />} />
      <Route path="/result" element={<RotateResult />} />
      <Route path="/calendar" element={<RotationCalendar />} />
    </Routes>
  );
}

export default Rotation;
