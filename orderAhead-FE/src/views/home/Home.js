import React from 'react'
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
  else if (user.is_superuser === 1) history.push('/users')

  return (
    <>
      <h2>Home</h2>
    </>
  )
}

export default Home
