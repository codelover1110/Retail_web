import React, { lazy, useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CWidgetSimple,
  CImg
} from '@coreui/react'
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

const Home = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  dispatch({type: 'set', darkMode: true})

  const user = useSelector(state => state.user)

  if (!localStorage.getItem('userId') || !user) {
    dispatch({type: 'set', darkMode: true})
    history.push('/signin')
  }

  return (
    <>
      <h2>Home</h2>
    </>
  )
}

export default Home
