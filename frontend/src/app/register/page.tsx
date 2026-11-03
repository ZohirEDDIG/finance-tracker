'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { FaUser, FaEnvelope, FaKey, FaEyeSlash, FaEye } from 'react-icons/fa';

type FieldErrors = Record<string, string[]>;

function parseErrors(error: unknown): FieldErrors {
    if (!axios.isAxiosError(error)) {
        return { general: ['Registration failed. Please try again.'] };
    }

    const data = error.response?.data;

    if (!data) {
        return {
            general: ['Cannot connect to the server. Please try again.'],
        };
    }

    const result: FieldErrors = {};

    if (typeof data === 'object' && data !== null) {
        for (const [field, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                result[field] = [value];
            } else if (Array.isArray(value)) {
                result[field] = value.map(String);
            } else {
                result[field] = ['Invalid value.'];
            }
        }
    }

    return Object.keys(result).length
        ? result
        : { general: ['Registration failed. Please check your details.'] };
}

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrors({});
        setSubmitting(true);

        try {
            await register(username, email, password);
            router.push('/login');
        } catch (error) {
            setErrors(parseErrors(error));
        } finally {
            setSubmitting(false);
        }
    }

    function fieldError(field: string) {
        return errors[field]?.join(' ');
    }

    const inputClass =
        'w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

    return (
        <main className='h-screen grid md:grid-cols-2'>

            <div className='bg-hero-bg w-full flex flex-col justify-center items-center gap-y-6'>
                
                <div className='flex flex-col items-center gap-y-3'>

                    <img src='/logo.svg' alt='Finance Tracker Logo' className='w-20' />

                    <h1 className='text-gray-400 text-4xl font-bold text-center'>Create an account</h1>
                
                    <p className='text-gray-400 text-center'>Register to start tracking your finances.</p>

                </div>

                <form onSubmit={handleSubmit} className='flex flex-col items-center gap-y-6'>

                    <div className='w-100 md:w-90 lg:w-100  flex flex-col gap-y-2'>

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

                        {fieldError('username') && (
                            <p className='mt-1 text-sm text-red-600'>
                                {fieldError('username')}
                            </p>
                        )}

                    </div>



                    <div className='w-100 md:w-90 lg:w-100  flex flex-col gap-y-2'>

                        <div className='w-100 md:w-90 lg:w-100 border-b border-gray-400 flex items-center gap-x-2 transition focus-within:border-hero-fg'>

                            <FaEnvelope className='text-hero-fg' />

                            <input
                                name='email'
                                type='email'
                                autoComplete='email'
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className='w-full text-white py-2 placeholder:text-gray-400'
                                placeholder='Email'
                            />

                        </div>

                        {fieldError('email') && (
                            <p className='mt-1 text-sm text-red-600'>
                                {fieldError('email')}
                            </p>
                        )}

                    </div>


                    <div className='w-100 md:w-90 lg:w-100  flex flex-col gap-y-2'>

                        <div className='w-100 md:w-90 lg:w-100 border-b border-gray-400 flex items-center gap-x-2 transition focus-within:border-hero-fg'>

                            <FaKey className='text-hero-fg' />

                            <input
                                id='password'
                                type='password'
                                autoComplete='new-password'
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

                        {fieldError('password') && (
                            <p className='mt-1 text-sm text-red-600'>
                                {fieldError('password')}
                            </p>
                        )}

                    </div>


                    {errors.non_field_errors && (
                        <p role='alert' className='text-sm text-red-600'>
                            {errors.non_field_errors.join(' ')}
                        </p>
                    )}

                    {errors.general && (
                        <p role='alert' className='text-sm text-red-600'>
                            {errors.general.join(' ')}
                        </p>
                    )}

                    <button
                        type='submit'
                        disabled={submitting}
                        className='w-fit bg-purple-900 border-b-4 border-purple-600 text-white px-4 py-2.5 rounded-lg transition
                        disabled:opacity-50 disabled:select-none disabled:pointer-events-none'
                    >
                        {submitting ? 'Creating account...' : 'Register'}
                    </button>
                    
                </form>

                <p className='text-gray-400 text-center'>
                    Already registered?{' '}
                    <Link
                        href='/login'
                        className='underline transition hover:text-white'
                    >
                        Sign in
                    </Link>
                </p>
            </div>

            <div className='hero-pattern hidden md:block' />

        </main>
    );
}
