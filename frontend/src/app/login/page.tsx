'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { FaKey, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (typeof data?.detail === 'string') {
            return data.detail;
        }

        if (typeof data?.non_field_errors?.[0] === 'string') {
            return data.non_field_errors[0];
        }

        if (typeof data?.username?.[0] === 'string') {
            return data.username[0];
        }

        if (typeof data?.password?.[0] === 'string') {
            return data.password[0];
        }

        if (!error.response) {
            return 'Cannot connect to the server. Please try again.';
        }
    }

    return 'Login failed. Please check your credentials.';
}

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);


    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await login(username, password);
            router.push('/dashboard');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className='h-screen grid md:grid-cols-2'>
            
            <div className='bg-hero-bg w-full flex flex-col justify-center items-center gap-y-6'>

                <div className='flex flex-col items-center gap-y-3'>

                    <img src='/logo.svg' alt='Finance Tracker Logo' className='w-20' />

                    <h1 className='text-gray-400 text-4xl font-bold text-center'>Welcome back</h1>

                    <p className='text-gray-400 text-center'>Sign in to your finance tracker.</p>

                </div>

                <form onSubmit={handleSubmit} className='flex flex-col items-center gap-y-6'>

                    <div className='w-100 md:w-90 lg:w-100 border-b border-gray-400 flex items-center gap-x-2 transition focus-within:border-hero-fg'>

                        <FaUser className='text-hero-fg' />

                        <input
                            name='username'
                            autoComplete='username'
                            required
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            className='w-full text-white py-2 placeholder:text-gray-400'
                            placeholder='Username'
                        />

                    </div>

                    <div className='w-100 md:w-90 lg:w-100 border-b border-gray-400 flex items-center gap-x-2 transition focus-within:border-hero-fg'>

                        <FaKey className='text-hero-fg' />

                        <input
                            name='password'
                            type={isPasswordVisible ? 'text' : 'password'}
                            autoComplete='current-password'
                            required
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            className='w-full text-white py-2 placeholder:text-gray-400'
                            placeholder='Password'
                        />

                        <button
                            type='button'
                            onClick={() => setIsPasswordVisible((prev) => !prev)}
                            className='text-hero-fg'
                        >
                            
                            { isPasswordVisible ? <FaEyeSlash /> : <FaEye /> }
                        
                        </button>


                    </div>

                    {error && (
                        <p
                            role='alert'
                            className='rounded-lg bg-red-50 p-3 text-sm text-red-700'
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type='submit'
                        disabled={submitting}
                        className='w-fit bg-purple-900 border-b-4 border-purple-600 text-white px-4 py-2.5 rounded-lg transition
                        disabled:opacity-50 disabled:select-none disabled:pointer-events-none'
                    >
                        {submitting ? 'Signing in...' : 'Sign in'}
                    </button>

                </form>

                <p className='text-gray-400 text-center'>
                    Don&apos;t have an account?{' '}
                    <Link
                        href='/register'
                        className='underline transition hover:text-white'
                    >
                        Create one
                    </Link>
                </p>
                
            </div>

            <div className='hero-pattern hidden md:block' />

        </main>
    );
}
