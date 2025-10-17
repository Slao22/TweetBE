import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const new_user = params.get('new_user');
    console.log(access_token,"1")
    console.log(refresh_token,"2")
    console.log(new_user,"3")
    // check them verify later
    localStorage.setItem('access_token', access_token || '');
    localStorage.setItem('refresh_token', refresh_token || '');
    navigate('/');
  },[params])

  return (
    <div>Login</div>
  )
}
