import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom"
import React, { useState, useEffect } from 'react';
import Alert from '../components/Alert';
import login from '../api/Login';

export default function Login() {
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const formlogin = (event) => {
        login(event).then(data => {
            if (data.success) return navigate('/dashboard');
            if (data.error) setMessage(data.error);
        });
    }

    return (
        <div class="w-full min-h-screen bg-gray-50 flex flex-col sm:justify-center items-center pt-6 sm:pt-0">
            <div class="w-full sm:max-w-md p-5 mx-auto">
                <h2 class="mb-12 text-center text-5xl font-extrabold">Log in</h2>
                <Alert message={message} />
                <br></br>
                <form onSubmit={formlogin}>
                    <div class="mb-4">
                        <label class="block mb-1" for="email">Email-Address</label>
                        <input id="email" type="text" name="email" class="py-2 px-3 border border-gray-300 focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md shadow-sm disabled:bg-gray-100 mt-1 block w-full" />
                    </div>
                    <div class="mb-4">
                        <label class="block mb-1" for="password">Password</label>
                        <input id="password" type="password" name="password" class="py-2 px-3 border border-gray-300 focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md shadow-sm disabled:bg-gray-100 mt-1 block w-full" />
                    </div>
                    <div class="mt-6 flex items-center justify-between">
                        <Link to="/forgotpassword" class="text-sm"> Forgot your password? </Link>
                    </div>
                    <div class="mt-6">
                        <button class="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold capitalize text-white hover:bg-red-700 active:bg-red-700 focus:outline-none focus:border-red-700 focus:ring focus:ring-red-200 disabled:opacity-25 transition">Log in</button>
                    </div>
                    <div class="mt-6 text-center">
                        <Link to="/signup" class="underline">Sign up</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}