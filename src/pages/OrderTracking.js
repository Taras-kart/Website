import React from 'react'
import { useParams } from 'react-router-dom'
import TrackOrder from './TrackOrder'
export default function OrderTracking(){const{id}=useParams();return <TrackOrder fixedOrderId={id}/>}
