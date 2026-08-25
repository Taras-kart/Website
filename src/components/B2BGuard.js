import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { b2bUser } from '../services/b2bApi'
export default function B2BGuard(){const location=useLocation();return b2bUser().type==='B2B'?<Outlet/>:<Navigate to="/profile" replace state={{from:location.pathname}}/>}
